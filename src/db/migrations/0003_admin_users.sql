-- Migration 0003_admin_users: Create admin users table
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
