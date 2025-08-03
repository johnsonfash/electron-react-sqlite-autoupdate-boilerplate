// prisma/schema.ts
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  role: text("role").default("USER"),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s','now'))`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s','now'))`),
});

export const printers = sqliteTable("printers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  isDefault: integer("isDefault", { mode: "boolean" }).default(false),
  userId: text("userId").notNull(),
});

export const invoiceTemplates = sqliteTable("invoice_templates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  content: text("content").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s','now'))`),
});
