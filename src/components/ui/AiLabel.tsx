interface AiLabelProps {
  children: React.ReactNode;
  className?: string;
}

/** QuestionPro AI label: shimmering text with the sparkle to the right, matching text color. */
export function AiLabel({ children, className }: AiLabelProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ''}`}>
      <span className="qp-shimmer">{children}</span>
      <span className="qp-ai-sparkle" aria-hidden>
        ◆
      </span>
    </span>
  );
}
