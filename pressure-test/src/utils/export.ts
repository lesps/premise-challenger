import type { Proposition, ExportOptions } from '../types';

export function generateExport(
  propositions: Proposition[],
  options?: ExportOptions
): { blob: Blob; filename: string } {
  const filtered =
    options?.filterStatus && options.filterStatus !== 'all'
      ? propositions.filter((p) => p.status === options.filterStatus)
      : propositions;

  const data = { propositions: filtered };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });

  const date = new Date().toISOString().slice(0, 10);
  const filename = `propositions-${date}.json`;

  return { blob, filename };
}

export function downloadExport(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
