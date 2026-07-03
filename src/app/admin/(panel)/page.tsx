import { db } from "@/db/client";
import { requireUser } from "@/app/admin/actions";
import { CalendarCheck, FileSpreadsheet, Users, UserCheck, Globe } from "lucide-react";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const user = await requireUser();

  // Run statistics queries in parallel
  const [bookingsRes, leadsRes, usersRes] = await Promise.all([
    db.execute("SELECT COUNT(*) as count FROM bookings"),
    db.execute("SELECT COUNT(*) as count FROM leads"),
    db.execute("SELECT COUNT(*) as count FROM users"),
  ]);

  const stats = {
    bookings: Number(bookingsRes.rows[0]?.count ?? 0),
    leads: Number(leadsRes.rows[0]?.count ?? 0),
    users: Number(usersRes.rows[0]?.count ?? 0),
  };

  return (
    <div className="space-y-8 select-none">
      {/* Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-card p-8 shadow-sm text-left space-y-2">
        <h2 className="text-xl font-black text-slate-900 font-display">
          Welcome back, {user.name || user.email}!
        </h2>
        <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
          You are signed in as an <span className="text-primary-600 font-extrabold">{user.role}</span>. Use the sidebar menu to view bookings, leads, or manage users and access settings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Bookings Card */}
        <Link
          href="/admin/bookings"
          className="bg-white border border-slate-200 rounded-card p-6 shadow-sm hover:border-primary-200 hover:shadow-md transition text-left flex gap-5 items-center"
        >
          <span className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-6 h-6 stroke-[2.2]" />
          </span>
          <div>
            <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Total Bookings
            </span>
            <span className="block text-2xl font-black text-slate-900 mt-1 leading-none">
              {stats.bookings}
            </span>
          </div>
        </Link>

        {/* Leads Card */}
        <Link
          href="/admin/leads"
          className="bg-white border border-slate-200 rounded-card p-6 shadow-sm hover:border-primary-200 hover:shadow-md transition text-left flex gap-5 items-center"
        >
          <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
          </span>
          <div>
            <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Total Leads
            </span>
            <span className="block text-2xl font-black text-slate-900 mt-1 leading-none">
              {stats.leads}
            </span>
          </div>
        </Link>

        {/* Users Card */}
        <Link
          href="/admin/users"
          className="bg-white border border-slate-200 rounded-card p-6 shadow-sm hover:border-primary-200 hover:shadow-md transition text-left flex gap-5 items-center"
        >
          <span className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </span>
          <div>
            <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Staff Accounts
            </span>
            <span className="block text-2xl font-black text-slate-900 mt-1 leading-none">
              {stats.users}
            </span>
          </div>
        </Link>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Account Info Details */}
        <div className="bg-white border border-slate-200 rounded-card p-8 shadow-sm text-left h-full">
          <h3 className="text-sm font-black text-slate-900 font-display pb-4 border-b border-slate-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary-600 stroke-[2.5]" />
            Active Session Details
          </h3>
          
          <div className="pt-6 grid grid-cols-1 gap-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">Name:</span>
              <span className="text-slate-800">{user.name || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">Email Address:</span>
              <span className="text-slate-800">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">Access Level:</span>
              <span className="text-primary-600 font-extrabold uppercase tracking-wider">{user.role}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">Created At:</span>
              <span className="text-slate-800">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Domain & Gateway Details (₹) */}
        <div className="bg-white border border-slate-200 rounded-card p-8 shadow-sm text-left h-full">
          <h3 className="text-sm font-black text-slate-900 font-display pb-4 border-b border-slate-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary-600 stroke-[2.5]" />
            Domain & Gateway Details (₹)
          </h3>
          
          <div className="pt-6 grid grid-cols-1 gap-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">Host Domain:</span>
              <span className="text-slate-800">cleanworldsolutions.in</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">Annual Renewal:</span>
              <span className="text-primary-600 font-bold">₹850 / year</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">Payment Gateway:</span>
              <span className="text-slate-800">Razorpay API Integration</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">Transaction Fee:</span>
              <span className="text-slate-800">2% per transaction</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

