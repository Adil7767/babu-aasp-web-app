'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAGE_SIZES = [10, 20, 50];

export function DataTable({
  columns,
  data = [],
  searchPlaceholder = 'Search...',
  searchKeys = [],
  initialSort = null,
  stickyHeader = true,
  emptyMessage = 'No data yet.',
  pagination = true,
  defaultPageSize = 10,
  renderActions,
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(initialSort || { key: null, dir: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const filtered = useMemo(() => {
    if (!search.trim() || searchKeys.length === 0) return data;
    const q = search.trim().toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = key.split('.').reduce((o, k) => o?.[k], row);
        return String(val ?? '').toLowerCase().includes(q);
      })
    );
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = sort.key.split('.').reduce((o, k) => o?.[k], a);
      const bVal = sort.key.split('.').reduce((o, k) => o?.[k], b);
      const cmp = aVal == null && bVal == null ? 0 : String(aVal ?? '').localeCompare(String(bVal ?? ''), undefined, { numeric: true });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageData = pagination ? sorted.slice(start, start + pageSize) : sorted;

  const toggleSort = (key) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="space-y-4">
      {(searchKeys.length > 0 || searchPlaceholder) && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 rounded-xl"
          />
        </div>
      )}

      <div className={cn("rounded-xl border border-border overflow-hidden bg-card", stickyHeader && "max-h-[calc(100vh-12rem)] overflow-auto")}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(
                    "h-11 px-4 text-left align-middle font-semibold text-muted-foreground bg-muted/50 whitespace-nowrap",
                    stickyHeader && "sticky top-0 z-10 bg-muted/95 backdrop-panel shadow-[0_1px_0_0_var(--border)]"
                  )}
                >
                  {col.sortable !== false ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.id)}
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      {col.label}
                      {sort.key === col.id ? (
                        sort.dir === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
              {renderActions && <TableHead className="w-[120px] text-right sticky top-0 z-10 bg-muted/95 backdrop-panel h-11 px-4">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (renderActions ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((row, idx) => (
                <TableRow key={row.id ?? idx} className="border-b border-border">
                  {columns.map((col) => (
                    <TableCell key={col.id} className="px-4 py-3 align-middle">
                      {col.render ? col.render(row[col.id], row) : (
                        <span className={col.className}>{String(row[col.id] ?? '—')}</span>
                      )}
                    </TableCell>
                  ))}
                  {renderActions && (
                    <TableCell className="px-4 py-3 text-right align-middle">
                      {renderActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>
              {start + 1}-{Math.min(start + pageSize, total)} of {total}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm font-medium min-w-[4rem] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
