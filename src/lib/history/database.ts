import * as vscode from "vscode";
import initSqlJs, { Database as SqlJsDatabase, SqlValue } from "sql.js";
import * as fs from "fs";
import * as path from "path";

let db: SqlJsDatabase | null = null;
let dbPath: string = "";

export interface UnlockLog {
  id: number;
  timestamp: string;
  workspace: string;
  reason: string;
}

export async function initDatabase(
  context: vscode.ExtensionContext,
): Promise<void> {
  const wasmPath = path.join(context.extensionPath, "dist", "sql-wasm.wasm");
  console.log("[grass-toucher] WASM path:", wasmPath);
  const SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });

  const storageDir = context.globalStorageUri.fsPath;
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  dbPath = path.join(storageDir, "lockdown.db");
  console.log("[grass-toucher] DB path:", dbPath);

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS unlock_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      reason TEXT NOT NULL
    )
  `);
  try {
    db.run("ALTER TABLE unlock_logs ADD COLUMN workspace TEXT NOT NULL DEFAULT ''");
  } catch {
    // column already exists
  }
  saveDb();
}

export function saveUnlockReason(reason: string): number {
  if (!db) {
    throw new Error("Database not initialized");
  }
  const timestamp = new Date().toISOString();
  const workspace =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";
  const stmt = db.prepare(
    "INSERT INTO unlock_logs (timestamp, workspace, reason) VALUES (?, ?, ?)",
  );
  stmt.run([timestamp, workspace, reason]);
  stmt.free();
  saveDb();
  return db.exec("SELECT last_insert_rowid()")[0].values[0][0] as number;
}

export function getAllUnlockReasons(): UnlockLog[] {
  if (!db) {
    throw new Error("Database not initialized");
  }
  const results = db.exec(
    "SELECT id, timestamp, workspace, reason FROM unlock_logs ORDER BY id DESC",
  );
  if (results.length === 0) {
    return [];
  }
  return results[0].values.map((row: SqlValue[]) => ({
    id: row[0] as number,
    timestamp: row[1] as string,
    workspace: row[2] as string,
    reason: row[3] as string,
  }));
}

function saveDb(): void {
  if (db && dbPath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

export function closeDatabase(): void {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}
