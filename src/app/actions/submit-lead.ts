"use server";

import { db } from "@/db/client";

export interface SubmitLeadResponse {
  ok: boolean;
  error?: string;
  data?: {
    name: string;
    phone: string;
  };
}

export async function submitLead(formData: FormData): Promise<SubmitLeadResponse> {
  // Honeypot field - bots will fill this, humans won't
  const company = formData.get("company");
  if (company && String(company).trim() !== "") {
    // Silently ignore bot submissions
    return { ok: true };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;

  // Server-side validation
  if (!name) {
    return { ok: false, error: "Please enter your name." };
  }

  // Simple E.164 phone pattern check: minimum 7 digits, digits and optional leading +
  const phonePattern = /^\+?[0-9\s\-()]{7,}$/;
  if (!phone || !phonePattern.test(phone)) {
    return { ok: false, error: "Please enter a valid phone number (minimum 7 digits)." };
  }

  try {
    // ALWAYS parameterized query to prevent SQL injection
    await db.execute({
      sql: "INSERT INTO leads (name, phone, email) VALUES (?, ?, ?)",
      args: [name, phone, email],
    });

    return {
      ok: true,
      data: { name, phone },
    };
  } catch (error) {
    console.error("Database error during lead submission:", error);
    return {
      ok: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
