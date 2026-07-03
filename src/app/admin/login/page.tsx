"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { ShieldAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative font-sans text-slate-800 antialiased selection:bg-[#EAF1FF]">
      
      {/* Background ambient glowing circles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-primary-500/5 blur-[120px]" /> {/* unslop-ignore — ambient ellipse is circular by definition */}
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8 select-none">
        
        {/* Brand logo */}
        <div className="flex flex-col items-center space-y-4">
          <Link href="/" className="hover:opacity-90 transition">
            <Image src="https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/brand/logo-mark.webp" alt="CleanWorld logo" width={215} height={170} className="h-11 w-auto" />
          </Link>
          <div className="text-center leading-none">
            <span className="text-xl font-black tracking-tight text-neutral-900">
              Clean World Solutions
            </span>
            <span className="block text-[0.6rem] font-extrabold tracking-[0.25em] text-green-500 uppercase mt-1">
              Admin Login Portal
            </span>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-slate-200 rounded-card p-8 shadow-xl">
          
          <form action={formAction} className="space-y-6">
            
            {state?.error && (
              <div className="p-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl flex gap-2.5 items-start">
                <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 stroke-[2.2]" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={pending}
                  placeholder="admin@cleanworld.solutions"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 transition disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  disabled={pending}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 transition disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600/50 text-white rounded-xl text-xs font-black shadow-md shadow-primary-600/10 transition cursor-pointer"
            >
              {pending ? "Signing in..." : "Secure Sign In"}
            </button>

          </form>

        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-primary-600 transition"
          >
            ← Back to Public Site
          </Link>
        </div>

      </div>
    </div>
  );
}
