"use client";

import { ReactNode } from "react";

export interface ColumnSpec<T> {
  header: string;
  accessor: (item: T) => ReactNode;
  mobileLabel?: string;
  isPrimary?: boolean;
}

interface ResponsiveTableProps<T> {
  items: T[];
  columns: ColumnSpec<T>[];
  actions?: (item: T) => ReactNode;
  emptyMessage?: string;
}

export function ResponsiveTable<T extends { id: string | number }>({
  items,
  columns,
  actions,
  emptyMessage = "No items found.",
}: ResponsiveTableProps<T>) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-white select-none">
        <p className="text-sm text-slate-400 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  const primaryCol = columns.find((col) => col.isPrimary) || columns[0];
  const secondaryCols = columns.filter((col) => col !== primaryCol);

  return (
    <div className="w-full">
      {/* Mobile Stacked Card View (hidden on md+) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-slate-200 bg-white rounded-2xl p-5 space-y-4 shadow-sm"
          >
            {/* Primary Header/Title */}
            <div className="border-b border-slate-100 pb-3 flex justify-between items-start gap-4">
              <div className="text-sm font-bold text-slate-900 leading-tight">
                {primaryCol.accessor(item)}
              </div>
            </div>

            {/* Secondary Metadata Fields */}
            <div className="grid grid-cols-1 gap-2 text-xs">
              {secondaryCols.map((col, idx) => (
                <div key={idx} className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[0.65rem]">
                    {col.mobileLabel || col.header}:
                  </span>
                  <span className="text-slate-700 font-bold text-right">
                    {col.accessor(item)}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions Footer */}
            {actions && (
              <div className="border-t border-slate-100 pt-3 flex justify-end gap-2">
                {actions(item)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Grid Table View (hidden on mobile/sm) */}
      <div className="hidden md:block overflow-hidden border border-slate-200 bg-white rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem] select-none"
                  >
                    {col.header}
                  </th>
                ))}
                {actions && (
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem] text-right select-none">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  {columns.map((col, idx) => (
                    <td
                      key={idx}
                      className={`px-6 py-4.5 text-slate-700 font-bold ${
                        col.isPrimary ? "text-slate-900 font-extrabold" : ""
                      }`}
                    >
                      {col.accessor(item)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex justify-end gap-2.5">{actions(item)}</div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
