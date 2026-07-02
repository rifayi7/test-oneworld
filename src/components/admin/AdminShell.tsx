"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, canManageUsers } from "@/lib/roles";
import { logoutAction } from "@/app/admin/actions";
import { AnimatePresence } from "motion/react";
import { LayoutDashboard, CalendarCheck, FileSpreadsheet, Users, LogOut, Globe, Menu, X } from "lucide-react";

interface AdminShellProps {
  children: ReactNode;
  user: User;
}

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Esc key closure for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const navLinks = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { label: "Leads", href: "/admin/leads", icon: FileSpreadsheet },
  ];

  const adminOnlyLinks = [
    { label: "Users & Roles", href: "/admin/users", icon: Users },
  ];

  const renderNavLinks = (onClickClose = false) => {
    const links = [...navLinks];
    if (canManageUsers(user.role)) {
      links.push(...adminOnlyLinks);
    }

    return (
      <nav className="space-y-1.5 flex-grow" aria-label="Admin Navigation">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => {
                if (onClickClose) setDrawerOpen(false);
              }}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2.2]" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    );
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans">
      
      {/* 1. Desktop Sidebar (hidden on md/sm screens) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 flex-shrink-0">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 pb-8 select-none">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            C
          </span>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black tracking-tight text-blue-900">
              Clean World
            </span>
            <span className="text-[0.5rem] font-extrabold tracking-[0.2em] text-green-500 uppercase mt-0.5">
              Control Panel
            </span>
          </div>
        </div>

        {/* Navigation list */}
        {renderNavLinks()}

        {/* Sidebar Footer details */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-xs select-none">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
            <div className="leading-tight">
              <span className="block text-[0.7rem] font-black text-slate-800 truncate max-w-[130px]">
                {user.name || user.email}
              </span>
              <span className="inline-block bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[0.55rem] px-1.5 py-0.5 rounded-md mt-0.5">
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-red-500 hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[2.2]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Mobile Drawer (slide-in sidebar) */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Sidebar Box */}
            <div className="relative flex flex-col w-64 bg-white p-6 h-full shadow-2xl z-10 transition-transform duration-300">
              {/* Close Button */}
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="absolute top-5 right-5 p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Brand Logo */}
              <div className="flex items-center gap-2.5 pb-8 select-none">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                  C
                </span>
                <div className="flex flex-col leading-none">
                  <span className="text-sm font-black tracking-tight text-blue-900">
                    Clean World
                  </span>
                  <span className="text-[0.5rem] font-extrabold tracking-[0.2em] text-green-500 uppercase mt-0.5">
                    Control Panel
                  </span>
                </div>
              </div>

              {/* Navigation links */}
              {renderNavLinks(true)}

              {/* Sidebar Footer details */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-xs">
                    {user.email.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="leading-tight">
                    <span className="block text-[0.7rem] font-black text-slate-800 truncate max-w-[130px]">
                      {user.name || user.email}
                    </span>
                    <span className="inline-block bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[0.55rem] px-1.5 py-0.5 rounded-md mt-0.5">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-red-500 hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 stroke-[2.2]" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Main Dashboard Content Column */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Top Header navbar */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-black text-slate-900 font-display">
              {pathname === "/admin" && "Dashboard Overview"}
              {pathname === "/admin/bookings" && "Booking Reservations"}
              {pathname === "/admin/leads" && "Contact Leads"}
              {pathname === "/admin/users" && "Users & Roles"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
            >
              <Globe className="w-3.5 h-3.5" />
              View Site
            </Link>
            <span className="hidden sm:inline w-px h-5 bg-slate-200" />
            <div className="text-xs font-bold text-slate-400">
              Logged in as: <span className="text-slate-700 font-extrabold">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-grow p-6 overflow-y-auto max-w-full">
          {children}
        </main>

      </div>
    </div>
  );
}
