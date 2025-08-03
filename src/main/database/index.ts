import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "./schema";
import { app } from "electron";
export { schema };

export function getDbPath() {
  const basePath = app && app.isPackaged
    ? path.join(process.resourcesPath, "db")
    : path.join(process.cwd(), "db");

  fs.mkdirSync(basePath, { recursive: true });
  return path.join(basePath, "prod.db");
}

const dbPath = getDbPath();
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });