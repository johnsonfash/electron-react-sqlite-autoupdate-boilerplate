const fs = require("fs");
const crypto = require("crypto");
const path = require('path')
const { execSync } = require("child_process");
const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");
const { sql } = require("drizzle-orm");
const { integer, sqliteTable, text } = require("drizzle-orm/sqlite-core");

const dbFolder = path.join(process.cwd(), "database")
const dbFile = "prod.db";

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder);
}

if (!fs.readdirSync(dbFolder).some(f => f === dbFile)) {
  try {
    execSync("npm run prisma", { stdio: "inherit" });
  } catch (error) {
    process.exit(1);
  }
}

// Tables
const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  role: text("role").default("USER"),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s','now'))`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s','now'))`),
});

const printers = sqliteTable("printers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  isDefault: integer("isDefault", { mode: "boolean" }).default(false),
  userId: text("userId").notNull(),
});

const invoiceTemplates = sqliteTable("invoice_templates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  content: text("content").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s','now'))`),
});

const schema = { users, printers, invoiceTemplates };

// Connect DB
const dbPath = path.join(dbFolder, dbFile);

const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

// Utility for random data
function randomName() {
  const names = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona"];
  return names[Math.floor(Math.random() * names.length)];
}
function randomEmail(name) {
  const domains = ["example.com", "test.com", "app.local"];
  return `${name.toLowerCase()}${Math.floor(Math.random() * 100)}@${domains[Math.floor(Math.random() * domains.length)]}`;
}
function randomRole() {
  return Math.random() > 0.7 ? "ADMIN" : "USER";
}

// Seed function
async function seed() {
  console.log("Seeding database...");

  // USERS
  for (let i = 0; i < 5; i++) {
    const name = randomName();
    db.insert(schema.users).values({
      id: crypto.randomUUID(),
      name,
      email: randomEmail(name),
      role: randomRole(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).run();
  }

  const users = db.select().from(schema.users).all();
  console.log(`Seeded ${users.length} users.`);

  // PRINTERS
  users.forEach((u, index) => {
    db.insert(schema.printers).values({
      id: crypto.randomUUID(),
      name: `Printer-${index + 1}`,
      isDefault: index === 0, // first printer default
      userId: u.id,
    }).run();
  });
  console.log(`Seeded printers for each user.`);

  // INVOICE TEMPLATES
  for (let i = 0; i < 3; i++) {
    db.insert(schema.invoiceTemplates).values({
      id: crypto.randomUUID(),
      name: `Template-${i + 1}`,
      content: `<h1>Invoice Template ${i + 1}</h1><p>Generated content</p>`,
      createdAt: new Date(),
    }).run();
  }
  console.log("Seeded invoice templates.");

  console.log("Seeding complete.");
}

seed()
  .then(() => {
    sqlite.close();
    console.log("Database connection closed.");
    process.exit(1);
  })
  .catch((err) => {
    console.error("Error seeding:", err);
    process.exit(1);
  });
