import { db } from "@/db/client";
import { requireUser } from "@/app/admin/actions";
import { canEditContent } from "@/lib/roles";
import { ResponsiveTable, ColumnSpec } from "@/components/admin/ResponsiveTable";
import { DeleteLeadBtn } from "@/components/admin/DeleteLeadBtn";
import { Globe, Laptop, Smartphone, Tablet } from "lucide-react";

interface LeadRow {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
}

export default async function AdminLeadsPage() {
  const user = await requireUser();
  const editable = canEditContent(user.role);

  // Fetch all leads with network IP/device logs
  const res = await db.execute({
    sql: "SELECT id, name, phone, email, created_at, ip_address, user_agent, device_type FROM leads ORDER BY created_at DESC",
    args: [],
  });

  const leads = res.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : null,
    created_at: String(row.created_at),
    ip_address: row.ip_address ? String(row.ip_address) : null,
    user_agent: row.user_agent ? String(row.user_agent) : null,
    device_type: row.device_type ? String(row.device_type) : null,
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
        <a href={`tel:${l.phone}`} className="text-primary-600 hover:underline">
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
      header: "Visitor Info",
      accessor: (l) => (
        <div className="leading-tight text-[10px] text-slate-400 font-semibold space-y-0.5">
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-300" />
            <span>IP: {l.ip_address || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            {l.device_type === "Mobile" ? (
              <Smartphone className="w-3 h-3 text-slate-300" />
            ) : l.device_type === "Tablet" ? (
              <Tablet className="w-3 h-3 text-slate-300" />
            ) : (
              <Laptop className="w-3 h-3 text-slate-300" />
            )}
            <span className="truncate max-w-[120px]" title={l.user_agent || "Desktop"}>
              {l.device_type || "Desktop"} ({l.user_agent?.split(" ")[0] || "Agent"})
            </span>
          </div>
        </div>
      ),
      mobileLabel: "Metadata",
    },
    {
      header: "Submitted",
      accessor: (l) => new Date(l.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center select-none text-left">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-display">
            Quick Leads Log
          </h2>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Real-time list of all quick lead submissions captured, along with visitor access details.
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
