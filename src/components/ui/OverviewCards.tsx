'use client';

import type { ReactNode } from 'react';

/**
 * Card shell for the study-overview info cards shown above the workspace tabs
 * (study setup on the left, order status on the right).
 */
export function OverviewCard({
  children,
  footer,
  className = '',
}: {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="flex-1 px-5 py-4">{children}</div>
      {footer && (
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-2.5">
          {footer}
        </div>
      )}
    </div>
  );
}

/** Label/value row with left-aligned value column, matching the production overview card. */
export function OverviewDetailRow({
  label,
  value,
  action,
}: {
  label: string;
  value: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-baseline gap-3 py-1.5">
      <span className="text-sm text-gray-500">{label}:</span>
      <span className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-gray-900">
        {value}
        {action}
      </span>
    </div>
  );
}
