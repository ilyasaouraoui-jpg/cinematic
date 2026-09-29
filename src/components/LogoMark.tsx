export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#0E1A33" />
      <path
        d="M12 49 Q26 41 40 48 Q50 53 58 48 L58 54 Q50 59 40 54 Q26 47 12 55 Z"
        fill="#D3B578"
      />
      <circle cx="17" cy="51.5" r="1.4" fill="#0E1A33" />
      <circle cx="27" cy="48.8" r="1.4" fill="#0E1A33" />
      <circle cx="37" cy="50.8" r="1.4" fill="#0E1A33" />
      <circle cx="47" cy="53" r="1.4" fill="#0E1A33" />
      <path d="M35 19 L56 11 L56 43 L35 35 Z" fill="#D3B578" />
      <rect
        x="13"
        y="15"
        width="22"
        height="20"
        rx="3"
        fill="none"
        stroke="#F7F3EA"
        strokeWidth="3"
      />
      <circle
        cx="35"
        cy="27"
        r="5"
        fill="#0E1A33"
        stroke="#F7F3EA"
        strokeWidth="2"
      />
    </svg>
  );
}
