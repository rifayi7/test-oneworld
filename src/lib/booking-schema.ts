import { z } from "zod";

export const BookingSchema = z.object({
  service: z.string().trim().min(1, "Service is required"),
  bookingDate: z.string().trim().min(1, "Booking date is required"),
  timeSlot: z.string().trim().min(1, "Preferred time slot is required"),
  name: z.string().trim().min(1, "Full name is required").max(120),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email address").max(200),
  location: z.string().trim().min(1, "Address and location details are required"),
  notes: z.string().max(2000).optional().nullable(),
  company: z.string().optional(), // Honeypot
  token: z.string().min(1, "Security validation is required"),
});

export type BookingInput = z.infer<typeof BookingSchema>;
