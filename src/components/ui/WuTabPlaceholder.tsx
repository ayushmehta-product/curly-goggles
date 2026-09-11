/** Marker for navigation-only WuTab panels. CSS hides these so they cannot overlay page content. */
export function WuTabPlaceholder({ label }: { label: string }) {
  return (
    <span data-qp-tab-placeholder className="sr-only">
      {label} selected
    </span>
  );
}
