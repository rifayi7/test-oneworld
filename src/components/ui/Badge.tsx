"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { Wrench, Zap, Brush, Bug, Droplet, WashingMachine, Paintbrush } from "lucide-react";

interface BadgeProps {
  children: ReactNode;
  icon?: "wrench" | "bolt" | "squeegee" | "bug" | "drop" | "wash" | "brush";
  bgColor?: "white" | "blue" | "green" | "gray";
  className?: string;
}

export function Badge({ children, icon, bgColor = "white", className = "" }: BadgeProps) {
  // Simple clean Lucide icons for the badges
  const icons = {
    squeegee: <Brush className="w-4 h-4 text-blue-600 stroke-[2.5]" />,
    bug: <Bug className="w-4 h-4 text-slate-800" />,
    wrench: <Wrench className="w-4 h-4 text-slate-800" />,
    bolt: <Zap className="w-4 h-4 text-blue-600 fill-current" />,
    drop: <Droplet className="w-4 h-4 text-blue-600 stroke-[2.5]" />,
    wash: <WashingMachine className="w-4 h-4 text-slate-800" />,
    brush: <Paintbrush className="w-4 h-4 text-green-700 stroke-[2.5]" />,
  };

  const bgStyles = {
    white: "bg-white border-slate-200/50 shadow-md text-slate-800",
    blue: "bg-white border-blue-100 shadow-md text-blue-900",
    green: "bg-white border-green-100 shadow-md text-green-900",
    gray: "bg-white border-slate-200/40 shadow-md text-slate-700",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`inline-flex items-center gap-2 border px-4.5 py-2.5 rounded-full text-xs font-bold select-none whitespace-nowrap ${bgStyles[bgColor]} ${className}`} // unslop-ignore
    >
      <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
        {icon && icons[icon]}
      </span>
      <span>{children}</span>
    </motion.div>
  );
}
