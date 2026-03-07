'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/** Stat card row (e.g. 4 cards) */
export function StatsCardsSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-l-4 border-l-muted">
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Table with N rows and M cols */
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row} className="border-b border-border last:border-0">
              {Array.from({ length: cols }).map((_, col) => (
                <td key={col} className="px-4 py-3">
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Single card block (e.g. chart area) */
export function CardSkeleton({ lines = 3 }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-lg" />
        {lines > 1 && (
          <div className="mt-4 space-y-2">
            {Array.from({ length: lines - 1 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** List of card rows (e.g. complaints list) */
export function CardListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Dashboard-style: one stat, chart, list */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-9 w-28" />
        </CardContent>
      </Card>
      <CardSkeleton />
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <CardListSkeleton count={3} />
      </div>
    </div>
  );
}

/** Admin overview: title, stats, charts, quick links */
export function AdminOverviewSkeleton() {
  return (
    <div>
      <Skeleton className="h-7 w-48 mb-6" />
      <StatsCardsSkeleton count={4} />
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-24 w-full sm:w-64 rounded-xl" />
        <Skeleton className="h-24 w-full sm:w-64 rounded-xl" />
      </div>
    </div>
  );
}

/** Complaints page: link + list */
export function ComplaintsPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48 rounded-lg" />
      <CardListSkeleton count={4} />
    </div>
  );
}

/** Super admin: stats + table */
export function SuperAdminSkeleton() {
  return (
    <div>
      <Skeleton className="h-7 w-56 mb-6" />
      <StatsCardsSkeleton count={4} />
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}

/** Profile page: avatar + form cards */
export function ProfilePageSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-6">
            <Skeleton className="h-24 w-24 rounded-full shrink-0" />
            <div className="space-y-4 flex-1">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-36" />
        </CardContent>
      </Card>
    </div>
  );
}
