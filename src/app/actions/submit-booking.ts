"use server";

import { db } from "@/db/client";

export interface SubmitBookingResponse {
  ok: boolean;
  error?: string;
  data?: {
    id: number;
    name: string;
    service: string;
  };
}

export async function submitBooking(formData: FormData): Promise<SubmitBookingResponse> {
  // Honeypot check
  const company = formData.get("company");
  if (company && String(company).trim() !== "") {
    return { ok: true };
  }

  const service = String(formData.get("service") ?? "").trim();
  const bookingDate = String(formData.get("bookingDate") ?? "").trim();
  const timeSlot = String(formData.get("timeSlot") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  // Validation checks
  if (!service) return { ok: false, error: "Please select a service." };
  if (!bookingDate) return { ok: false, error: "Please select a date." };
  if (!timeSlot) return { ok: false, error: "Please select a preferred time slot." };
  if (!name) return { ok: false, error: "Please enter your name." };
  if (!location) return { ok: false, error: "Please enter your location." };

  const phonePattern = /^\+?[0-9\s\-()]{7,}$/;
  if (!phone || !phonePattern.test(phone)) {
    return { ok: false, error: "Please enter a valid phone number (minimum 7 digits)." };
  }

  try {
    const result = await db.execute({
      sql: "INSERT INTO bookings (service, booking_date, time_slot, name, phone, location, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [service, bookingDate, timeSlot, name, phone, location, notes],
    });

    const insertedId = Number(result.lastInsertRowid ?? 0);

    return {
      ok: true,
      data: {
        id: insertedId,
        name,
        service,
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
