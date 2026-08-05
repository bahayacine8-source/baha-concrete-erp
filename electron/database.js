import Database from "better-sqlite3";

const db = new Database("factory.db");

db.exec(`

CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    name TEXT,
    email TEXT,
    role TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,

    company_id TEXT NOT NULL,

    name TEXT NOT NULL,

    unit TEXT NOT NULL,

    current_quantity REAL DEFAULT 0,

    minimum_quantity REAL DEFAULT 0,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT
);


CREATE TABLE IF NOT EXISTS stock_moves (

    id TEXT PRIMARY KEY,

    material_id TEXT NOT NULL,

    move_type TEXT NOT NULL,

    quantity REAL NOT NULL,

    reference_type TEXT,

    reference_id TEXT,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP

);


CREATE TABLE IF NOT EXISTS sales (

    id TEXT PRIMARY KEY,

    company_id TEXT NOT NULL,

    customer_id TEXT NOT NULL,

    invoice_number TEXT,

    total_amount REAL DEFAULT 0,

    paid_amount REAL DEFAULT 0,

    remaining_amount REAL DEFAULT 0,

    status TEXT DEFAULT 'pending',

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT

);


CREATE TABLE IF NOT EXISTS production_orders (

    id TEXT PRIMARY KEY,

    company_id TEXT NOT NULL,

    customer_id TEXT,

    concrete_grade TEXT,

    quantity REAL DEFAULT 0,

    mixer TEXT,

    driver TEXT,

    truck TEXT,

    status TEXT DEFAULT 'pending',

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

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

CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL,
    data TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

`);

export default db;