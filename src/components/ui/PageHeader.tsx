interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-4">
      <div className="qp-title-bar mb-4">
        <h1 className="qp-heading-03 min-w-0 truncate">{title}</h1>
        {action && <div className="qp-title-bar-toolbar shrink-0">{action}</div>}
      </div>
      {description && <p className="text-sm text-ink-muted">{description}</p>}
    </div>
  );
}
