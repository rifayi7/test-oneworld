"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserByEmail, verifyPassword, getUserById, createAdminUser, countAdmins } from "@/lib/users";
import { createSessionToken, readSession, ADMIN_COOKIE } from "@/lib/admin-auth";
import { canEditContent, canManageUsers, Role, User } from "@/lib/roles";
import { db } from "@/db/client";
import fs from "fs/promises";
import path from "path";
import { optimizeImage } from "@/lib/optimize-image";
import { uploadToR2, deleteFromR2, buildKey, safeSegment, r2Configured, keyFromUrl } from "@/lib/r2";

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

// CREATE Service
export async function createServiceAction(formData: FormData) {
  await requireEditor();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const desc = String(formData.get("desc") ?? "").trim();
  let price = String(formData.get("price") ?? "").trim();
  let mrpPrice = String(formData.get("mrp_price") ?? "").trim();
  let offerPrice = String(formData.get("offer_price") ?? "").trim();
  const sort = Number(formData.get("sort") ?? 0);

  if (!name || !category || !desc || !price) {
    return { error: "Name, category, description, and price are required." };
  }

  // Ensure offerPrice has a value; fallback to standard price if not provided
  if (!offerPrice) {
    offerPrice = price;
  } else {
    price = offerPrice;
  }

  // Prepend Rupee symbol if not present
  if (!price.startsWith("₹")) {
    price = `₹${price}`;
  }
  if (mrpPrice && !mrpPrice.startsWith("₹")) {
    mrpPrice = `₹${mrpPrice}`;
  }
  if (offerPrice && !offerPrice.startsWith("₹")) {
    offerPrice = `₹${offerPrice}`;
  }

  const mrpPriceVal = mrpPrice || null;
  const offerPriceVal = offerPrice || null;

  const imageFile = formData.get("imageFile") as File | null;
  let img = String(formData.get("img") ?? "").trim() || "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/home-services.webp";

  if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
    try {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      if (r2Configured()) {
        const optimized = await optimizeImage(buffer, {
          maxWidth: 1400,
          format: "webp",
          targetBytes: 150 * 1024,
        });
        const originalName = path.parse(imageFile.name).name;
        const cleanName = safeSegment(originalName, "service");
        const uniqueName = `${cleanName}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
        const key = buildKey("services", uniqueName);
        img = await uploadToR2(key, optimized.data, optimized.contentType);
      } else {
        const optimized = await optimizeImage(buffer, {
          maxWidth: 1400,
          format: "webp",
          targetBytes: 150 * 1024,
        });
        const originalName = path.parse(imageFile.name).name;
        const cleanName = safeSegment(originalName, "service");
        const uniqueName = `${cleanName}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
        
        const uploadDir = path.join(process.cwd(), "public", "services", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });
        
        const filePath = path.join(uploadDir, uniqueName);
        await fs.writeFile(filePath, optimized.data);
        img = `/services/uploads/${uniqueName}`;
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      return { error: "Failed to upload image file." };
    }
  }

  try {
    await db.execute({
      sql: "INSERT INTO services (name, category, desc, price, mrp_price, offer_price, img, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [name, category, desc, price, mrpPriceVal, offerPriceVal, img, sort],
    });
    revalidatePath("/");
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Create service error:", error);
    return { error: "Failed to create service." };
  }
}

export async function updateServiceAction(id: number, formData: FormData) {
  await requireEditor();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const desc = String(formData.get("desc") ?? "").trim();
  let price = String(formData.get("price") ?? "").trim();
  let mrpPrice = String(formData.get("mrp_price") ?? "").trim();
  let offerPrice = String(formData.get("offer_price") ?? "").trim();
  const sort = Number(formData.get("sort") ?? 0);

  if (!name || !category || !desc || !price) {
    return { error: "Name, category, description, and price are required." };
  }

  // Ensure offerPrice has a value; fallback to standard price if not provided
  if (!offerPrice) {
    offerPrice = price;
  } else {
    price = offerPrice;
  }

  // Prepend Rupee symbol if not present
  if (!price.startsWith("₹")) {
    price = `₹${price}`;
  }
  if (mrpPrice && !mrpPrice.startsWith("₹")) {
    mrpPrice = `₹${mrpPrice}`;
  }
  if (offerPrice && !offerPrice.startsWith("₹")) {
    offerPrice = `₹${offerPrice}`;
  }

  const mrpPriceVal = mrpPrice || null;
  const offerPriceVal = offerPrice || null;

  const imageFile = formData.get("imageFile") as File | null;
  let img = String(formData.get("img") ?? "").trim() || "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/home-services.webp";

  if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
    try {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      if (r2Configured()) {
        const optimized = await optimizeImage(buffer, {
          maxWidth: 1400,
          format: "webp",
          targetBytes: 150 * 1024,
        });
        const originalName = path.parse(imageFile.name).name;
        const cleanName = safeSegment(originalName, "service");
        const uniqueName = `${cleanName}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
        const key = buildKey("services", uniqueName);
        img = await uploadToR2(key, optimized.data, optimized.contentType);
      } else {
        const optimized = await optimizeImage(buffer, {
          maxWidth: 1400,
          format: "webp",
          targetBytes: 150 * 1024,
        });
        const originalName = path.parse(imageFile.name).name;
        const cleanName = safeSegment(originalName, "service");
        const uniqueName = `${cleanName}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
        
        const uploadDir = path.join(process.cwd(), "public", "services", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });
        
        const filePath = path.join(uploadDir, uniqueName);
        await fs.writeFile(filePath, optimized.data);
        img = `/services/uploads/${uniqueName}`;
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      return { error: "Failed to upload image file." };
    }
  }

  try {
    await db.execute({
      sql: "UPDATE services SET name = ?, category = ?, desc = ?, price = ?, mrp_price = ?, offer_price = ?, img = ?, sort = ? WHERE id = ?",
      args: [name, category, desc, price, mrpPriceVal, offerPriceVal, img, sort, id],
    });
    revalidatePath("/");
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Update service error:", error);
    return { error: "Failed to update service." };
  }
}

// DELETE Service
export async function deleteServiceAction(id: number) {
  await requireEditor();

  try {
    // Get image URL first to clean up R2
    const res = await db.execute({
      sql: "SELECT img FROM services WHERE id = ?",
      args: [id],
    });
    const imgUrl = res.rows[0]?.img ? String(res.rows[0].img) : null;

    await db.execute({
      sql: "DELETE FROM services WHERE id = ?",
      args: [id],
    });

    if (imgUrl && r2Configured()) {
      const key = keyFromUrl(imgUrl);
      if (key) {
        // Only delete from R2 if it's not one of our standard presets to avoid deleting shared presets
        const isPreset = key.includes("services/home-services.webp") ||
                        key.includes("services/water-tank.webp") ||
                        key.includes("services/cctv-install.webp") ||
                        key.includes("services/roof-waterproof.webp") ||
                        key.includes("services/grass-trimming.webp");
        if (!isPreset) {
          try {
            await deleteFromR2(key);
          } catch (err) {
            console.error("Failed to delete image from R2:", err);
          }
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Delete service error:", error);
    return { error: "Failed to delete service." };
  }
}
