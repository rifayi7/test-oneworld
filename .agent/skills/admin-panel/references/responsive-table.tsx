import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  /** Marks the column shown as the card title on mobile (rendered prominently, no label). */
  primary?: boolean;
  className?: string;
}

/**
 * Renders a real <table> on md+ screens and a stacked card list on mobile —
 * no horizontal scrolling. Cells/actions are passed by the (client) parent so
 * interactivity lives there; this component is purely presentational.
 */
export function ResponsiveTable<T>({
  columns,
  rows,
  rowKey,
  actions,
  empty = "Nothing here yet.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  actions?: (row: T) => ReactNode;
  empty?: ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-premium border border-border bg-surface px-5 py-12 text-center text-mist text-sm">
        {empty}
      </div>
    );
  }

  const primary = columns.find((c) => c.primary);
  const rest = columns.filter((c) => !c.primary);

  return (
    <>
      {/* Desktop / tablet table (carded) */}
      <div className="hidden md:block rounded-premium border border-border bg-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-mist border-b border-border">
              {columns.map((c) => (
                <th key={c.header} className={`font-medium px-3 py-2.5 ${c.align === "right" ? "text-right" : ""}`}>
                  {c.header}
                </th>
              ))}
              {actions && <th className="font-medium px-3 py-2.5 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-border last:border-0 hover:bg-bone/5">
                {columns.map((c) => (
                  <td key={c.header} className={`px-3 py-3 ${c.align === "right" ? "text-right" : ""} ${c.className ?? ""}`}>
                    {c.cell(row)}
                  </td>
                ))}
                {actions && <td className="px-3 py-3 text-right whitespace-nowrap">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <ul className="md:hidden flex flex-col gap-3">
        {rows.map((row) => (
          <li key={rowKey(row)} className="rounded-premium border border-border bg-surface p-4 flex flex-col gap-3">
            {primary && (
              <div className="font-display text-bone text-base leading-snug">{primary.cell(row)}</div>
            )}
            <dl className="flex flex-col gap-2">
              {rest.map((c) => (
                <div key={c.header} className="flex items-start justify-between gap-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-mist shrink-0 pt-0.5">{c.header}</dt>
                  <dd className="text-bone text-sm text-right min-w-0 break-words">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
            {actions && (
              <div className="flex items-center justify-end gap-5 pt-3 border-t border-border">
                {actions(row)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
