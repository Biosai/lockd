"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: "h-7 w-7", text: "text-lg" },
    md: { icon: "h-9 w-9", text: "text-xl" },
    lg: { icon: "h-12 w-12", text: "text-2xl" },
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Lockd Logo - Stylized padlock with "L" shape */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-primary",
          sizes[size].icon
        )}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[60%] w-[60%]"
        >
          {/* Lock shackle */}
          <path
            d="M10 14V10C10 6.68629 12.6863 4 16 4C19.3137 4 22 6.68629 22 10V14"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-primary-foreground"
          />
          {/* Lock body */}
          <rect
            x="7"
            y="14"
            width="18"
            height="14"
            rx="3"
            fill="currentColor"
            className="text-primary-foreground"
          />
          {/* Keyhole */}
          <circle cx="16" cy="20" r="2" className="fill-primary" />
          <rect x="15" y="20" width="2" height="4" rx="1" className="fill-primary" />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight", sizes[size].text)}>
          Lockd
        </span>
      )}
    </div>
  );
}

// Alternative minimal logo variant
export function LogoMinimal({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
    >
      {/* Background */}
      <rect width="32" height="32" rx="8" className="fill-primary" />
      {/* Lock shackle */}
      <path
        d="M10 14V10C10 6.68629 12.6863 4 16 4C19.3137 4 22 6.68629 22 10V14"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Lock body */}
      <rect x="8" y="13" width="16" height="13" rx="2.5" fill="white" />
      {/* Keyhole */}
      <circle cx="16" cy="18.5" r="2" className="fill-primary" />
      <rect x="15" y="18.5" width="2" height="4" rx="1" className="fill-primary" />
    </svg>
  );
}

