import db from "../database.js";

export function runMigrations() {

  db.exec(`

  CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      commercial_reg TEXT,
      tax_number TEXT,
      created_at TEXT,
      updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,

      firebase_uid TEXT,

      name TEXT NOT NULL,
      email TEXT NOT NULL,

      role TEXT NOT NULL,

      is_active INTEGER DEFAULT 1,

      created_at TEXT,
      updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,

      company_id TEXT NOT NULL,

      name TEXT NOT NULL,

      phone TEXT,

      address TEXT,

      balance REAL DEFAULT 0,

      created_at TEXT,
      updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,

      company_id TEXT NOT NULL,

      name TEXT NOT NULL,

      unit TEXT NOT NULL,

      current_quantity REAL DEFAULT 0,

      minimum_quantity REAL DEFAULT 0,

      created_at TEXT,
      updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS stock_moves (
      id TEXT PRIMARY KEY,

      material_id TEXT NOT NULL,

      move_type TEXT NOT NULL,

      quantity REAL NOT NULL,

      reference_type TEXT,

      reference_id TEXT,

      created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,

      company_id TEXT NOT NULL,

      customer_id TEXT NOT NULL,

      invoice_number TEXT,

      total_amount REAL,

      paid_amount REAL,

      remaining_amount REAL,

      status TEXT,

      created_at TEXT,
      updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS production_orders (
      id TEXT PRIMARY KEY,

      company_id TEXT NOT NULL,

      customer_id TEXT,

      concrete_grade TEXT,

      quantity REAL,

      mixer TEXT,

      driver TEXT,

      truck TEXT,

      status TEXT,

      created_at TEXT,
      updated_at TEXT
  );

 CREATE TABLE IF NOT EXISTS concrete_recipes (

    id TEXT PRIMARY KEY,

    company_id TEXT NOT NULL,

    name TEXT NOT NULL,

    concrete_grade TEXT NOT NULL,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT

);



CREATE TABLE IF NOT EXISTS recipe_items (

    id TEXT PRIMARY KEY,

    recipe_id TEXT NOT NULL,

    material_id TEXT NOT NULL,

    quantity REAL NOT NULL,

    unit TEXT NOT NULL,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP

);

  `);

  console.log("SQLite migrations completed.");
}