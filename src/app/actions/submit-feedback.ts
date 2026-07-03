"use server";

import { db } from "@/db/client";

export interface SubmitFeedbackResponse {
  ok: boolean;
  error?: string;
}

export async function submitFeedback(formData: FormData): Promise<SubmitFeedbackResponse> {
  const company = formData.get("company");
  if (company && String(company).trim() !== "") {
    return { ok: true };
  }

  const name = String(formData.get("name") ?? "").trim();
  const rating = parseInt(String(formData.get("rating") ?? "5"));
  const quote = String(formData.get("quote") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || null;
  const service = String(formData.get("service") ?? "").trim() || null;

  if (!name) return { ok: false, error: "Please enter your name." };
  if (!quote) return { ok: false, error: "Please write a feedback description." };
  if (rating < 1 || rating > 5) return { ok: false, error: "Rating must be between 1 and 5 stars." };

  try {
    await db.execute({
      sql: "INSERT INTO feedbacks (name, rating, quote, location, service, approved) VALUES (?, ?, ?, ?, ?, 1)",
      args: [name, rating, quote, location, service],
    });
    return { ok: true };
  } catch (error) {
    console.error("Database error during feedback submission:", error);
    return { ok: false, error: "Failed to submit feedback. Please try again." };
  }
}
