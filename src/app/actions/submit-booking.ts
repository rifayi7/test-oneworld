"use server";

import { db } from "@/db/client";
import { headers } from "next/headers";
import { BookingSchema } from "@/lib/booking-schema";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";

async function verifyRecaptcha(token: string, action: string) {
  // If the secret key is missing, or is the google test secret key, or if running in local development mode, bypass the check
  if (
    !process.env.RECAPTCHA_SECRET_KEY ||
    process.env.RECAPTCHA_SECRET_KEY === "6LeIxAcTAAAAAGG-vFI1TnFTxWfnysA5a6597I5J" ||
    process.env.NODE_ENV === "development"
  ) {
    console.warn("reCAPTCHA check bypassed for local development/testing.");
    return 1.0;
  }
  
  try {
    const r = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY!,
        response: token,
      }),
    });
    const d = await r.json();
    if (!d.success || d.action !== action) {
      console.error("reCAPTCHA validation failed:", d);
      return null;
    }
    return d.score as number; // 0.0 - 1.0
  } catch (err) {
    console.error("reCAPTCHA connection error:", err);
    return null;
  }
}

export async function submitBooking(formData: FormData) {
  // Extract inputs
  const rawInput = {
    service: String(formData.get("service") ?? "").trim(),
    bookingDate: String(formData.get("bookingDate") ?? "").trim(),
    timeSlot: String(formData.get("timeSlot") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim() || null,
    company: String(formData.get("company") ?? "").trim(), // Honeypot
    token: String(formData.get("token") ?? "").trim(),
  };

  // Run Zod validation
  const parsed = BookingSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Please check the form.";
    return { ok: false, error: errorMsg };
  }
  
  const data = parsed.data;
  if (data.company) {
    return { ok: true }; // Drop honeypot submission silently
  }

  // Verify reCAPTCHA token
  const score = await verifyRecaptcha(data.token, "submit");
  if (score === null || score < 0.5) {
    return { ok: false, error: "Could not verify you're human. Please try again." };
  }

  // Validate and format phone to E.164 using libphonenumber-js
  // Since they serve Kerala, India by default, we can parse it assuming IN if no dial code is provided
  let formattedPhone = data.phone;
  try {
    const phoneInputToParse = data.phone.startsWith("+") ? data.phone : `+91${data.phone}`;
    if (!isValidPhoneNumber(phoneInputToParse)) {
      return { ok: false, error: "Please enter a valid 10-digit phone number." };
    }
    const parsedPhone = parsePhoneNumber(phoneInputToParse);
    formattedPhone = parsedPhone.number; // E.164 format
  } catch (err) {
    return { ok: false, error: "Please enter a valid phone number." };
  }

  // Extra metadata
  const latitude = String(formData.get("latitude") ?? "").trim() || null;
  const longitude = String(formData.get("longitude") ?? "").trim() || null;

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
    const result = await db.execute({
      sql: `INSERT INTO bookings (
        service, booking_date, time_slot, name, phone, email, location, notes, 
        latitude, longitude, ip_address, user_agent, device_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.service, data.bookingDate, data.timeSlot, data.name, formattedPhone, data.email, data.location, data.notes || null,
        latitude, longitude, ipAddress, userAgent, deviceType
      ],
    });

    const insertedId = Number(result.lastInsertRowid ?? 0);

    return {
      ok: true,
      data: {
        id: insertedId,
        name: data.name,
        service: data.service,
      },
    };
  } catch (error) {
    console.error("Database error during slot booking:", error);
    return {
      ok: false,
      error: "Failed to save booking. Please try again.",
    };
  }
}
