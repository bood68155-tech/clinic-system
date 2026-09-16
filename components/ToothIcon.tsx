export default function ToothIcon({ className = "h-6 w-6", variant = "tooth" }: { className?: string; variant?: "tooth" | "smile" | "sparkle" | "shield" | "check" | "plus" }) {
  const color = "currentColor";
  switch (variant) {
    case "smile":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
          <path d="M4 13a8 8 0 0 1 16 0" />
          <path d="M6 13c0 4 2.5 6 6 6s6-2 6-6" />
          <path d="M9 9.5c.6-.4 1.4-.4 1.8 0" strokeLinecap="round" />
          <path d="M13.2 9.5c.6-.4 1.4-.4 1.8 0" strokeLinecap="round" />
        </svg>
      );
    case "sparkle":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" className={className}>
          <path d="M12 3l1.8 4.8L18 9.6l-4.2 1.8L12 16l-1.8-4.6L6 9.6l4.2-1.8L12 3z" strokeLinejoin="round" />
          <path d="M18.5 14.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4z" strokeLinejoin="round" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" className={className}>
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" strokeLinejoin="round" />
          <path d="M9 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" className={className}>
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" className={className}>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" className={className}>
          <path
            d="M12 3.5c-1.5-1-3.6-.8-4.8.8-2 2.7-3 6-2 9.3.8 2.7.6 6 .6 6s2 .3 3.2-1c.7-.8 1.4-1.2 3-1.2s2.3.4 3 1.2c1.2 1.3 3.2 1 3.2 1s-.2-3.3.6-6c1-3.3 0-6.6-2-9.3C15.6 2.7 13.5 2.5 12 3.5z"
            strokeLinejoin="round"
          />
          <path d="M9.2 7.6c1-.5 2.4-.1 2.8 1" strokeLinecap="round" />
        </svg>
      );
  }
}