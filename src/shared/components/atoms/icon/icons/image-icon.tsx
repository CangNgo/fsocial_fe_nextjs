import type { SVGProps } from "react";

type ImageIconProps = SVGProps<SVGSVGElement>;

export const ImageIcon = ({ width = 24, height = 24, ...props }: ImageIconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    {...props}
    aria-hidden="true"
  >
    <rect
      className="fill-[url(#primary-gradient)]"
      width="100%"
      height="100%"
      x="0"
      y="0"
      rx="5"
      ry="5"
      strokeWidth={0}
    />
    <circle cx="7" cy="9" r="2" className="stroke-txtWhite" />
    <path
      className="stroke-txtWhite"
      d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L5 21"
      strokeWidth={2}
    />
    <defs>
      <linearGradient id="primary-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--primary-gradient-start)" />
        <stop offset="100%" stopColor="var(--primary-gradient-end)" />
      </linearGradient>
    </defs>
  </svg>
);
