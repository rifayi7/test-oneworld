-- Migration 0002_bookings: Create bookings table for slot bookings
CREATE TABLE IF NOT EXISTS bookings (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  service      TEXT NOT NULL,
  booking_date TEXT NOT NULL,
  time_slot    TEXT NOT NULL,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  location     TEXT NOT NULL,
  notes        TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
