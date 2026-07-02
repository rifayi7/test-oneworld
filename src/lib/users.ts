import "server-only";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "@/db/client";
import { Role, User } from "./roles";

export { ROLES, canEditContent, canManageUsers, getRoleLabel } from "./roles";
export type { Role, User } from "./roles";

// Hash password with scrypt and random salt
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// Constant-time compare scrypt hash verification
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    const testHash = scryptSync(password, salt, 64);
    const targetHash = Buffer.from(hash, "hex");
    return timingSafeEqual(testHash, targetHash);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

// Find user by email
export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const res = await db.execute({
    sql: "SELECT id, email, name, password_hash, role, created_at FROM users WHERE email = ? LIMIT 1",
    args: [normalizedEmail],
  });

  if (res.rows.length === 0) return null;
  const row = res.rows[0];

  return {
    id: Number(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    password_hash: String(row.password_hash),
    role: row.role as Role,
    created_at: String(row.created_at),
  };
}

// Find user by ID
export async function getUserById(id: number): Promise<User | null> {
  const res = await db.execute({
    sql: "SELECT id, email, name, role, created_at FROM users WHERE id = ? LIMIT 1",
    args: [id],
  });

  if (res.rows.length === 0) return null;
  const row = res.rows[0];

  return {
    id: Number(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    role: row.role as Role,
    created_at: String(row.created_at),
  };
}

// List all users
export async function listAllUsers(): Promise<User[]> {
  const res = await db.execute({
    sql: "SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC",
    args: [],
  });

  return res.rows.map((row) => ({
    id: Number(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    role: row.role as Role,
    created_at: String(row.created_at),
  }));
}

// Create new user
export async function createAdminUser(
  email: string,
  name: string | null,
  passwordPlain: string,
  role: Role
): Promise<User> {
  const normalizedEmail = email.toLowerCase().trim();
  const passHash = hashPassword(passwordPlain);

  const res = await db.execute({
    sql: "INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)",
    args: [normalizedEmail, name, passHash, role],
  });

  const newId = Number(res.lastInsertRowid ?? 0);

  return {
    id: newId,
    email: normalizedEmail,
    name,
    role,
    created_at: new Date().toISOString(),
  };
}

// Count total administrator role users
export async function countAdmins(): Promise<number> {
  const res = await db.execute({
    sql: "SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'",
    args: [],
  });
  if (res.rows.length === 0) return 0;
  return Number(res.rows[0].cnt);
}
