import { RunResult } from "better-sqlite3";
import {
  InferInsertModel,
  InferSelectModel,
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  lte,
  ne,
  sql
} from "drizzle-orm";
import { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import { db, schema } from "./index";

type WhereOperator<T> = {
  eq?: T;
  ne?: T;
  gt?: T;
  gte?: T;
  lt?: T;
  lte?: T;
  in?: T[];
};

type WhereCondition<T> = {
  [K in keyof T]?: T[K] | WhereOperator<T[K]>;
};

type OrderBy<T> = {
  [K in keyof T]?: "asc" | "desc";
};

type IncludeOptions<T> = {
  [K in keyof T]?: true | FindOptions<any>;
};

type FindOptions<T> = {
  where?: WhereCondition<T>;
  select?: Partial<Record<keyof T, boolean>>;
  orderBy?: OrderBy<T>;
  take?: number;
  skip?: number;
  include?: IncludeOptions<T>; // <-- NEW
};

type CreateOptions<T extends AnySQLiteTable> = { data: InferInsertModel<T> };
type UpdateOptions<T extends AnySQLiteTable> = {
  where: WhereCondition<InferSelectModel<T>>;
  data: Partial<InferInsertModel<T>>;
};
type DeleteOptions<T> = { where: WhereCondition<T> };

function buildWhere<T extends AnySQLiteTable>(
  table: T,
  where?: WhereCondition<InferSelectModel<T>>
) {
  if (!where) return undefined;
  const conditions = Object.entries(where).map(([key, value]) => {
    const col = (table as any)[key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const ops = value as WhereOperator<any>;
      const subConds = [];
      if (ops.eq !== undefined) subConds.push(eq(col, ops.eq));
      if (ops.ne !== undefined) subConds.push(ne(col, ops.ne));
      if (ops.gt !== undefined) subConds.push(gt(col, ops.gt));
      if (ops.gte !== undefined) subConds.push(gte(col, ops.gte));
      if (ops.lt !== undefined) subConds.push(lt(col, ops.lt));
      if (ops.lte !== undefined) subConds.push(lte(col, ops.lte));
      if (ops.in !== undefined) subConds.push(inArray(col, ops.in));
      return and(...subConds);
    }
    return eq(col, value);
  });
  return and(...conditions);
}

function buildSelect<T extends AnySQLiteTable>(
  table: T,
  select?: Partial<Record<keyof InferSelectModel<T>, boolean>>
) {
  const columns = table as any;
  const fields: Record<string, any> = {};

  if (select && Object.keys(select).length > 0) {
    // Explicitly selected fields
    for (const key in select) {
      if (select[key] && columns[key]) {
        fields[key] = columns[key];
      }
    }
  } else {
    // No select provided → fallback to all columns
    for (const key of Object.keys(columns)) {
      if (typeof columns[key] !== "function") {
        fields[key] = columns[key];
      }
    }
  }

  return fields;
}


function buildOrderBy<T extends AnySQLiteTable>(
  table: T,
  orderBy?: OrderBy<InferSelectModel<T>>
) {
  if (!orderBy) return undefined;
  const orders: any[] = [];
  for (const key in orderBy) {
    const direction = orderBy[key];
    orders.push(direction === "desc" ? desc((table as any)[key]) : asc((table as any)[key]));
  }
  return orders;
}

// --- NEW: Build include joins ---
function buildInclude(table: AnySQLiteTable, include?: IncludeOptions<any>) {
  if (!include) return { joins: [], fields: {} };

  const joins: any[] = [];
  const fields: Record<string, any> = {};

  function isFindOptions(val: any): val is FindOptions<any> {
    return typeof val === "object" && val !== null;
  }

  for (const relKey in include) {
    const includeValue = include[relKey];
    if (!includeValue) continue;

    const relation = (table as any).relations?.[relKey];
    if (!relation) {
      console.warn(`Relation '${relKey}' not found on table '${(table as any)._?.name}'`);
      continue;
    }

    const relatedTable = relation.referencedTable;

    // Subquery builder
    let subSelectFields = relatedTable._.columns;
    let subWhere, subOrderBy, subTake, subSkip, subNestedInclude;

    if (isFindOptions(includeValue)) {
      subSelectFields = buildSelect(relatedTable, includeValue.select) || relatedTable._.columns;
      subWhere = buildWhere(relatedTable, includeValue.where);
      subOrderBy = buildOrderBy(relatedTable, includeValue.orderBy);
      subTake = includeValue.take;
      subSkip = includeValue.skip;
      subNestedInclude = includeValue.include;
    }

    let subQuery: any = db.select(subSelectFields).from(relatedTable);

    if (subWhere) subQuery = subQuery.where(subWhere);
    if (subOrderBy && subOrderBy.length > 0) subQuery = subQuery.orderBy(...subOrderBy);
    if (subTake !== undefined) subQuery = subQuery.limit(subTake);
    if (subSkip !== undefined && "offset" in subQuery) subQuery = subQuery.offset(subSkip);

    subQuery = subQuery.as(relKey);

    joins.push({
      table: subQuery,
      on: eq(
        (table as any)[relation.fields[0].name],
        (subQuery as any)[relation.references[0].name]
      ),
    });

    // Namespace fields for included table
    fields[relKey] = Object.fromEntries(
      Object.keys(subSelectFields).map((col) => [`${relKey}_${col}`, (subQuery as any)[col]])
    );
  }

  return { joins, fields };
}


function createModelClient<T extends AnySQLiteTable>(table: T) {
  type Row = InferSelectModel<T>;

  return {
    async findFirst(opts: FindOptions<Row>): Promise<Row | undefined> {
      const { joins, fields: includeFields } = buildInclude(table, opts.include);

      let query: any = db
        .select({
          ...buildSelect(table, opts.select),
          ...includeFields,
        })
        .from(table);

      joins.forEach((j) => (query = query.leftJoin(j.table, j.on)));

      query = query
        .where(buildWhere(table, opts.where))
        .orderBy(...(buildOrderBy(table, opts.orderBy) ?? []))
        .limit(1);

      return query.get() as Row | undefined;
    },

    async findMany(opts: FindOptions<Row> = {}): Promise<Row[]> {
      const { joins, fields: includeFields } = buildInclude(table, opts.include);

      const selectedFields = buildSelect(table, opts.select);
      const baseFields =
        selectedFields && Object.keys(selectedFields).length > 0
          ? selectedFields
          : table._?.columns; // fallback to all columns

      let q: any = db
        .select({
          ...baseFields,
          ...includeFields,
        })
        .from(table);

      // Apply joins
      joins.forEach((j) => (q = q.leftJoin(j.table, j.on)));

      // Filters, ordering, pagination
      q = q
        .where(buildWhere(table, opts.where))
        .orderBy(...(buildOrderBy(table, opts.orderBy) ?? []));

      if (opts.take !== undefined) q = q.limit(opts.take);
      if (opts.skip !== undefined && "offset" in q) q = q.offset(opts.skip);

      return q.all() as Row[];
    },


    async create(opts: CreateOptions<T>): Promise<Row> {
      return db.insert(table).values(opts.data as any).returning().get() as Row;
    },

    async update(opts: UpdateOptions<T>): Promise<Row> {
      return db
        .update(table)
        .set(opts.data as any)
        .where(buildWhere(table, opts.where))
        .returning()
        .get() as Row;
    },

    async updateMany(opts: { where?: WhereCondition<Row>; data: Partial<InferInsertModel<T>> }): Promise<RunResult> {
      if (!opts.where) {
        console.warn(`updateMany called without where on table ${table._.name}`);
      }

      return db
        .update(table)
        .set(opts.data as any)
        .where(buildWhere(table, opts.where))
        .run();
    },

    async upsert(opts: {
      where: WhereCondition<Row>;
      update: Partial<InferInsertModel<T>>;
      create: InferInsertModel<T>;
    }): Promise<Row> {
      if (!opts.where || Object.keys(opts.where).length === 0) {
        throw new Error("Upsert requires a valid 'where' condition");
      }

      const whereCond = buildWhere(table, opts.where);

      const existing = await db
        .select()
        .from(table)
        .where(whereCond)
        .get();

      if (existing) {
        return db
          .update(table)
          .set(opts.update as any)
          .where(whereCond)
          .returning()
          .get() as Row;
      }

      return db
        .insert(table)
        .values(opts.create as any)
        .returning()
        .get() as Row;
    },

    async delete(opts: DeleteOptions<Row>): Promise<RunResult> {
      return db.delete(table).where(buildWhere(table, opts.where)).run();
    },

    async deleteMany(opts: { where?: WhereCondition<Row> }): Promise<RunResult> {
      if (!opts.where) {
        console.warn(`deleteMany called without where on table ${table._.name}`);
      }
      return db
        .delete(table)
        .where(buildWhere(table, opts.where))
        .run();
    },


    async count(opts: { where?: WhereCondition<Row> }): Promise<number> {
      const result = db
        .select({ count: sql<number>`count(*)` })
        .from(table)
        .where(buildWhere(table, opts.where))
        .get();
      return result?.count ?? 0;
    },
  };
}

function buildDbClient<T extends Record<string, AnySQLiteTable>>(schema: T) {
  const client = {} as {
    [K in keyof T]: ReturnType<typeof createModelClient<T[K]>>;
  };
  for (const key in schema) {
    const typedKey = key as keyof T;
    client[typedKey] = createModelClient(schema[typedKey]);
  }
  return client;
}

export const dbClient = buildDbClient(schema);

async function seed() {
  const userData = Array.from({ length: 10 }, (_, i) => ({
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i === 0 ? "ADMIN" : "USER",
  }));
  const insertedUsers = await db.insert(schema.users).values(userData).returning();

  const printerData = Array.from({ length: 10 }, (_, i) => ({
    name: `Printer ${i + 1}`,
    isDefault: i === 0,
    userId: insertedUsers[Math.floor(Math.random() * insertedUsers.length)].id,
  }));
  await db.insert(schema.printers).values(printerData);

  const templateData = Array.from({ length: 10 }, (_, i) => ({
    name: `Template ${i + 1}`,
    content: `<h1>Invoice Template ${i + 1}</h1><p>Content for template ${i + 1}</p>`,
    userId: insertedUsers[Math.floor(Math.random() * insertedUsers.length)].id,
  }));
  await db.insert(schema.invoiceTemplates).values(templateData);
}

export { db, schema, seed }