interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  if (!showText) {
    // Icon only version
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg
          viewBox="0 0 160 140"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <g transform="translate(0,10)">
            {/* Left page */}
            <path
              d="M0 20 Q40 0 80 20 V120 Q40 100 0 120 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            {/* Right page */}
            <path
              d="M80 20 Q120 0 160 20 V120 Q120 100 80 120 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            {/* Book spine */}
            <line
              x1="80"
              y1="20"
              x2="80"
              y2="120"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Extraction lines */}
            <line x1="20" y1="50" x2="60" y2="50" stroke="currentColor" strokeWidth="2"/>
            <line x1="20" y1="70" x2="60" y2="70" stroke="currentColor" strokeWidth="2"/>
            <line x1="100" y1="50" x2="140" y2="50" stroke="currentColor" strokeWidth="2"/>
            <line x1="100" y1="70" x2="140" y2="70" stroke="currentColor" strokeWidth="2"/>
          </g>
        </svg>
      </div>
    );
  }

  // Full logo with text
  return (
    <div className={className}>
      <svg
        viewBox="0 0 540 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Book emblem */}
        <g transform="translate(40,30)">
          {/* Left page */}
          <path
            d="M0 20 Q40 0 80 20 V120 Q40 100 0 120 Z"
            fill="none"
            stroke="#DC143C"
            strokeWidth="3"
          />
          {/* Right page */}
          <path
            d="M80 20 Q120 0 160 20 V120 Q120 100 80 120 Z"
            fill="none"
            stroke="#DC143C"
            strokeWidth="3"
          />
          {/* Book spine */}
          <line
            x1="80"
            y1="20"
            x2="80"
            y2="120"
            stroke="#DC143C"
            strokeWidth="2"
          />
          {/* Extraction lines */}
          <line x1="20" y1="50" x2="60" y2="50" stroke="#DC143C" strokeWidth="2"/>
          <line x1="20" y1="70" x2="60" y2="70" stroke="#DC143C" strokeWidth="2"/>
          <line x1="100" y1="50" x2="140" y2="50" stroke="#DC143C" strokeWidth="2"/>
          <line x1="100" y1="70" x2="140" y2="70" stroke="#DC143C" strokeWidth="2"/>
        </g>
        {/* Brand name */}
        <text
          x="240"
          y="110"
          fontSize="72"
          fontWeight="600"
          fontFamily="Playfair Display, Georgia, Times New Roman, serif"
          fill="#DC143C"
          letterSpacing="1.5"
        >
          Qlyra
        </text>
        {/* Tagline (Turkish) */}
        <text
          x="240"
          y="145"
          fontSize="16"
          fontFamily="Inter, Segoe UI, Arial, sans-serif"
          fill="#DC143C"
          letterSpacing="3"
        >
          BİLGİ · ÇIKARILDI
        </text>
      </svg>
    </div>
  );
};
