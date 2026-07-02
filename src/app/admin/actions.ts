"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserByEmail, verifyPassword, getUserById, createAdminUser, countAdmins } from "@/lib/users";
import { createSessionToken, readSession, ADMIN_COOKIE } from "@/lib/admin-auth";
import { canEditContent, canManageUsers, Role, User } from "@/lib/roles";
import { db } from "@/db/client";

// Get currently logged-in user from request session cookies
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const uid = await readSession(token);
  if (!uid) return null;

  return getUserById(uid);
}

// Authentication guards
export async function requireUser(): Promise<User> {
  const u = await getCurrentUser();
  if (!u) redirect("/admin/login");
  return u;
}

export async function requireEditor(): Promise<User> {
  const u = await requireUser();
  if (!canEditContent(u.role)) {
    throw new Error("Forbidden: Content modification rights required.");
  }
  return u;
}

export async function requireAdmin(): Promise<User> {
  const u = await requireUser();
  if (!canManageUsers(u.role)) {
    throw new Error("Forbidden: User management rights required.");
  }
  return u;
}

// Login action
export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return { error: "Invalid email or password credentials." };
  }

  const valid = verifyPassword(password, user.password_hash);
  if (!valid) {
    return { error: "Invalid email or password credentials." };
  }

  // Set session cookie
  const token = await createSessionToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 86400, // 7 days
  });

  redirect("/admin");
}

// Logout action
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// CREATE User
export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as Role;

  if (!email || !password || !role) {
    return { error: "Email, password, and role are required." };
  }

  try {
    const existing = await getUserByEmail(email);
    if (existing) {
      return { error: `User with email '${email}' already exists.` };
    }

    await createAdminUser(email, name, password, role);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Create user error:", error);
    return { error: "Failed to create user account." };
  }
}

// DELETE User
export async function deleteUserAction(id: number) {
  const currentUser = await requireAdmin();

  if (currentUser.id === id) {
    throw new Error("Conflict: You cannot delete your own account.");
  }

  try {
    const targetUser = await getUserById(id);
    if (!targetUser) {
      return { error: "User not found." };
    }

    if (targetUser.role === "admin") {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return { error: "Forbidden: You cannot delete the last Administrator account." };
      }
    }

    await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [id],
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "Failed to delete user account." };
  }
}

// UPDATE User Role
export async function updateUserRoleAction(id: number, role: Role) {
  await requireAdmin();

  try {
    const targetUser = await getUserById(id);
    if (!targetUser) {
      return { error: "User not found." };
    }

    if (targetUser.role === "admin" && role !== "admin") {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return { error: "Forbidden: You cannot demote the last Administrator." };
      }
    }

    await db.execute({
      sql: "UPDATE users SET role = ? WHERE id = ?",
      args: [role, id],
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Update user role error:", error);
    return { error: "Failed to update user role." };
  }
}

// DELETE Booking (Editor/Admin only)
export async function deleteBookingAction(id: number) {
  await requireEditor();

  try {
    await db.execute({
      sql: "DELETE FROM bookings WHERE id = ?",
      args: [id],
    });
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error) {
    console.error("Delete booking error:", error);
    return { error: "Failed to delete booking." };
  }
}

// DELETE Lead (Editor/Admin only)
export async function deleteLeadAction(id: number) {
  await requireEditor();

  try {
    await db.execute({
      sql: "DELETE FROM leads WHERE id = ?",
      args: [id],
    });
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error) {
    console.error("Delete lead error:", error);
    return { error: "Failed to delete lead." };
  }
}
