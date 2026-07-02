import { db } from "@/db/client";
import { requireUser } from "@/app/admin/actions";
import { canEditContent } from "@/lib/roles";
import { ResponsiveTable, ColumnSpec } from "@/components/admin/ResponsiveTable";
import { DeleteLeadBtn } from "@/components/admin/DeleteLeadBtn";

interface LeadRow {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
}

export default async function AdminLeadsPage() {
  const user = await requireUser();
  const editable = canEditContent(user.role);

  // Fetch all leads
  const res = await db.execute({
    sql: "SELECT id, name, phone, email, created_at FROM leads ORDER BY created_at DESC",
    args: [],
  });

  const leads = res.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : null,
    created_at: String(row.created_at),
  }));

  const columns: ColumnSpec<LeadRow>[] = [
    {
      header: "Lead Name",
      accessor: (l) => l.name,
      isPrimary: true,
    },
    {
      header: "Phone",
      accessor: (l) => (
        <a href={`tel:${l.phone}`} className="text-blue-600 hover:underline">
          {l.phone}
        </a>
      ),
    },
    {
      header: "Email Address",
      accessor: (l) => l.email || <span className="text-slate-300 font-medium">None</span>,
      mobileLabel: "Email",
    },
    {
      header: "Submitted",
      accessor: (l) => new Date(l.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-display">
            Quick Leads Log
          </h2>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Real-time list of all quick lead submissions captured via contact buttons.
          </p>
        </div>
      </div>

      <ResponsiveTable
        items={leads}
        columns={columns}
        actions={editable ? (l) => <DeleteLeadBtn id={l.id} /> : undefined}
        emptyMessage="No contact leads found."
      />
    </div>
  );
}
