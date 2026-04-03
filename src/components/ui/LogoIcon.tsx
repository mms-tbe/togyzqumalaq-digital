"use client";

/**
 * Togyzqumalaq logo icon — Шаңырақ with 9 қумалақ (3x3).
 * Based on the official Togyzqumalaq branding.
 */
export function LogoIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Шаңырақ outer ring with ornamental bumps */}
      <circle cx="24" cy="24" r="21" stroke="currentColor" stroke-width="2.5" fill="none" />
      <circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="1" fill="none" opacity="0.4" />

      {/* Шаңырақ ornamental knots (8 points) */}
      <circle cx="24" cy="3" r="2" fill="currentColor" />
      <circle cx="24" cy="45" r="2" fill="currentColor" />
      <circle cx="3" cy="24" r="2" fill="currentColor" />
      <circle cx="45" cy="24" r="2" fill="currentColor" />
      <circle cx="9.2" cy="9.2" r="1.6" fill="currentColor" />
      <circle cx="38.8" cy="9.2" r="1.6" fill="currentColor" />
      <circle cx="9.2" cy="38.8" r="1.6" fill="currentColor" />
      <circle cx="38.8" cy="38.8" r="1.6" fill="currentColor" />

      {/* Cross beams */}
      <line x1="24" y1="5" x2="24" y2="43" stroke="currentColor" strokeWidth="1.3" />
      <line x1="5" y1="24" x2="43" y2="24" stroke="currentColor" strokeWidth="1.3" />
      <line x1="10.5" y1="10.5" x2="37.5" y2="37.5" stroke="currentColor" strokeWidth="0.8" />
      <line x1="37.5" y1="10.5" x2="10.5" y2="37.5" stroke="currentColor" strokeWidth="0.8" />

      {/* Inner circle */}
      <circle cx="24" cy="24" r="11" fill="currentColor" />

      {/* 9 қумалақ — 3x3 grid (white on dark) */}
      <circle cx="18.5" cy="18.5" r="2.6" fill="white" />
      <circle cx="24" cy="18.5" r="2.6" fill="white" />
      <circle cx="29.5" cy="18.5" r="2.6" fill="white" />
      <circle cx="18.5" cy="24" r="2.6" fill="white" />
      <circle cx="24" cy="24" r="2.6" fill="white" />
      <circle cx="29.5" cy="24" r="2.6" fill="white" />
      <circle cx="18.5" cy="29.5" r="2.6" fill="white" />
      <circle cx="24" cy="29.5" r="2.6" fill="white" />
      <circle cx="29.5" cy="29.5" r="2.6" fill="white" />
    </svg>
  );
}
