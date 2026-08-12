import { AppTable } from './AppTable';
import type { ColDef } from './AppTable';
import type { ReportResult } from '../../types/report';

interface DynamicResultsTableProps {
  result: ReportResult;
  loading?: boolean;
}

function formatCell(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export function DynamicResultsTable({ result, loading }: DynamicResultsTableProps) {
  const rows = result.rows.map((cells, idx) => ({ idx, cells }));

  const columns: ColDef<(typeof rows)[number]>[] = result.columns.map((header, i) => ({
    key: String(i),
    header,
    render: (row) => formatCell(row.cells[i]),
  }));

  return (
    <AppTable
      columns={columns}
      rows={rows}
      loading={loading}
      getRowKey={(row) => row.idx}
      emptyMessage="No data for these filters."
    />
  );
}
