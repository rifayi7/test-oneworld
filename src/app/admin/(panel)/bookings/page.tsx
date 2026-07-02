import { db } from "@/db/client";
import { requireUser } from "@/app/admin/actions";
import { canEditContent } from "@/lib/roles";
import { ResponsiveTable, ColumnSpec } from "@/components/admin/ResponsiveTable";
import { DeleteBookingBtn } from "@/components/admin/DeleteBookingBtn";

interface BookingRow {
  id: number;
  name: string;
  phone: string;
  location: string;
  service: string;
  booking_date: string;
  time_slot: string;
  notes: string | null;
  created_at: string;
}

export default async function AdminBookingsPage() {
  const user = await requireUser();
  const editable = canEditContent(user.role);

  // Fetch all slot bookings
  const res = await db.execute({
    sql: "SELECT id, service, booking_date, time_slot, name, phone, location, notes, created_at FROM bookings ORDER BY created_at DESC",
    args: [],
  });

  const bookings = res.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    phone: String(row.phone),
    location: String(row.location),
    service: String(row.service),
    booking_date: String(row.booking_date),
    time_slot: String(row.time_slot),
    notes: row.notes ? String(row.notes) : null,
    created_at: String(row.created_at),
  }));

  const columns: ColumnSpec<BookingRow>[] = [
    {
      header: "Client Name",
      accessor: (b) => b.name,
      isPrimary: true,
    },
    {
      header: "Phone",
      accessor: (b) => (
        <a href={`tel:${b.phone}`} className="text-blue-600 hover:underline">
          {b.phone}
        </a>
      ),
    },
    {
      header: "Service Details",
      accessor: (b) => (
        <div className="leading-tight">
          <span className="block text-slate-800 font-extrabold">{b.service}</span>
          <span className="block text-[0.65rem] text-slate-400 mt-0.5">
            {b.booking_date} • {b.time_slot}
          </span>
        </div>
      ),
      mobileLabel: "Service",
    },
    {
      header: "District",
      accessor: (b) => `${b.location} District`,
      mobileLabel: "Location",
    },
    {
      header: "Notes",
      accessor: (b) => b.notes || <span className="text-slate-300 font-medium">None</span>,
    },
    {
      header: "Submitted",
      accessor: (b) => new Date(b.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-display">
            Bookings Log
          </h2>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Real-time list of all reservation slots submitted by customers on the landing page.
          </p>
        </div>
      </div>

      <ResponsiveTable
        items={bookings}
        columns={columns}
        actions={editable ? (b) => <DeleteBookingBtn id={b.id} /> : undefined}
        emptyMessage="No slot booking reservations found."
      />
    </div>
  );
}
