"use server";

import { db } from "@/db/client";
import { headers } from "next/headers";

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

  // Get network and device metadata from headers
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "Unknown Browser";
  const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0].trim() || headersList.get("x-real-ip") || "127.0.0.1";
  
  let deviceType = "Desktop";
  if (/mobile/i.test(userAgent)) {
    deviceType = "Mobile";
  } else if (/tablet|ipad/i.test(userAgent)) {
    deviceType = "Tablet";
  }

  try {
    // ALWAYS parameterized query to prevent SQL injection
    await db.execute({
      sql: "INSERT INTO leads (name, phone, email, ip_address, user_agent, device_type) VALUES (?, ?, ?, ?, ?, ?)",
      args: [name, phone, email, ipAddress, userAgent, deviceType],
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
