import { db } from "@/db/client";
import { requireUser } from "@/app/admin/actions";
import { BookingsManager, BookingRow } from "@/components/admin/BookingsManager";

export default async function AdminBookingsPage() {
  await requireUser();

  // Fetch all slot bookings with full payment and user metadata columns
  const res = await db.execute({
    sql: `SELECT id, service, booking_date, time_slot, name, phone, email, location, notes, created_at,
                 total_price, advance_paid, balance_due, payment_status, payment_link,
                 latitude, longitude, ip_address, user_agent, device_type
           FROM bookings ORDER BY created_at DESC`,
    args: [],
  });

  const bookings: BookingRow[] = res.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : null,
    location: String(row.location),
    service: String(row.service),
    booking_date: String(row.booking_date),
    time_slot: String(row.time_slot),
    notes: row.notes ? String(row.notes) : null,
    created_at: String(row.created_at),
    total_price: Number(row.total_price ?? 0),
    advance_paid: Number(row.advance_paid ?? 0),
    balance_due: Number(row.balance_due ?? 0),
    payment_status: String(row.payment_status ?? "Pending"),
    payment_link: row.payment_link ? String(row.payment_link) : null,
    latitude: row.latitude ? String(row.latitude) : null,
    longitude: row.longitude ? String(row.longitude) : null,
    ip_address: row.ip_address ? String(row.ip_address) : null,
    user_agent: row.user_agent ? String(row.user_agent) : null,
    device_type: row.device_type ? String(row.device_type) : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center select-none text-left">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-display">
            Bookings Log & Payments
          </h2>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Manage slot reservations, track collections, copy payment links, and inspect customer coordinates & network info.
          </p>
        </div>
      </div>

      <BookingsManager initialBookings={bookings} />
    </div>
  );
}
