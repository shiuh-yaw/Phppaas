/**
 * OMS CSV Export Utility
 * ======================
 * Generates and downloads CSV files from tabular data.
 * Used across all OMS pages for data export functionality.
 */

export interface CsvColumn<T> {
  key: keyof T | string;
  label: string;
  format?: (value: any, row: T) => string;
}

/**
 * Download data as a CSV file.
 * @param filename - Output filename (without extension)
 * @param columns - Column definitions with label, key, and optional formatter
 * @param data - Array of row objects
 */
export function downloadCSV<T extends Record<string, any>>(
  filename: string,
  columns: CsvColumn<T>[],
  data: T[]
): void {
  const escape = (val: any): string => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map(c => escape(c.label)).join(",");
  const rows = data.map(row =>
    columns
      .map(c => {
        const raw = typeof c.key === "string" ? row[c.key] : row[c.key as keyof T];
        const formatted = c.format ? c.format(raw, row) : raw;
        return escape(formatted);
      })
      .join(",")
  );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format Philippine Peso amounts
 */
export function formatPHP(amount: number): string {
  return `PHP ${amount.toLocaleString("en-PH")}`;
}

/**
 * Format percentage
 */
export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}
