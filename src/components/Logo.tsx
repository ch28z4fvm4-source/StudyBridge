interface LogoProps {
  showText?: boolean;
  className?: string;
}

export default function Logo({ showText = true, className = "" }: LogoProps) {
  return (
    <span className={`logo-lockup ${className}`.trim()}>
      <svg
        className="logo-mark-svg"
        width="38"
        height="38"
        viewBox="0 0 44 44"
        fill="none"
        aria-hidden="true"
      >
        {/* open book — foundation */}
        <path
          d="M6 34C6 34 14 30 22 30C30 30 38 34 38 34"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="logo-book"
        />
        <path
          d="M22 30V38"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="logo-book-spine"
        />
        <path
          d="M10 32L22 29L34 32"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* bridge cables */}
        <path
          d="M9 24C9 24 15 13 22 13C29 13 35 24 35 24"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          className="logo-arch"
        />
        <path
          d="M11 24H33"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="logo-deck"
        />

        {/* students at each end */}
        <circle cx="11" cy="20.5" r="3.25" className="logo-node logo-node-left" />
        <circle cx="33" cy="20.5" r="3.25" className="logo-node logo-node-right" />

        {/* little handshake dot in the middle — community */}
        <circle cx="22" cy="21.5" r="1.75" className="logo-node-center" />
      </svg>

      {showText && (
        <span className="logo-wordmark" aria-label="joinstudybridge.academy">
          <span className="logo-word-study">study</span>
          <span className="logo-word-bridge">bridge</span>
          <span className="logo-word-tld">.com</span>
        </span>
      )}
    </span>
  );
}
