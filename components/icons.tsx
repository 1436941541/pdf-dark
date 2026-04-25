// Inline Lucide-style stroke icons. No extra dependency.
// Stroke width 1.5, 14×14, uses currentColor.

type IconProps = { className?: string };

const baseProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconLock({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function IconPalette({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.5 0 1-.5 1-1 0-1-.5-1.5-.5-2 0-.5.5-1 1-1H15a4 4 0 0 0 4-4 9 9 0 0 0-7-12z" />
    </svg>
  );
}

export function IconDownload({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

export function IconSmartphone({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}
