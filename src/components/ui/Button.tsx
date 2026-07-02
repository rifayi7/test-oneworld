"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline" | "icon-circle";
  color?: "blue" | "dark" | "white";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  href,
  onClick,
  variant = "solid",
  color = "blue",
  type = "button",
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 select-none cursor-pointer";
  
  const colors = {
    blue: {
      solid: "bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/10",
      outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50",
      "icon-circle": "bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3.5", // unslop-ignore — icon-circle variant is circular by definition
    },
    dark: {
      solid: "bg-slate-900 hover:bg-slate-800 text-white",
      outline: "border border-slate-900 text-slate-900 hover:bg-slate-50",
      "icon-circle": "bg-slate-900 hover:bg-slate-800 text-white rounded-full p-3.5", // unslop-ignore — icon-circle variant is circular by definition
    },
    white: {
      solid: "bg-white hover:bg-slate-50 text-slate-900 shadow-md",
      outline: "border border-white/50 text-white hover:bg-white/10",
      "icon-circle": "bg-white hover:bg-slate-50 text-slate-900 rounded-full p-3.5", // unslop-ignore — icon-circle variant is circular by definition
    },
  };

  // Button: 16px radius (site scale), icon-circle: circular by geometry
  const borderStyles = variant === "icon-circle" ? "rounded-full" /* unslop-ignore — circle geometry */ : "rounded-button px-8 py-3.5 text-sm";
  const finalStyles = `${baseStyles} ${colors[color][variant]} ${borderStyles} ${className}`;

  const content = (
    <motion.span
      whileTap={{ scale: 0.98 }} // unslop-ignore — tap feedback communicates the press; hover-grow removed
      className="inline-flex items-center gap-2"
    >
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <Link href={href} className={finalStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${finalStyles} disabled:opacity-50`}
    >
      {content}
    </button>
  );
}
