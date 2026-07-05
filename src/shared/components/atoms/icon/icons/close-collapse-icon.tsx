interface CloseCollapseIconProps {
  className?: string;
}

export const CloseCollapseIcon = ({ className }: CloseCollapseIconProps) => (
  <svg
    className={className}
    width="28"
    height="317"
    viewBox="0 0 28 317"
    fill="none"
    aria-hidden="true"
  >
    <path
      className="fill-background pointer-events-none"
      d="M0.000339508 -1.2239e-06L0.000325652 317C0.000325652 317 1.74999 238.915 11.6667 207.449C21.5833 175.982 28 171.903 28 158.5C28 145.097 21.5833 141.018 11.6667 110.717C1.75 80.4154 0.000339508 -1.2239e-06 0.000339508 -1.2239e-06Z"
    />
    <path
      className="stroke-primary-text pointer-events-none"
      d="M12.4645 152.041L7 159.021L12.4645 166"
      strokeWidth="1.5"
    />
    <path
      className="stroke-primary-text pointer-events-none"
      d="M17.9294 152.041L12.4648 159.021L17.9294 166"
      strokeWidth="1.5"
    />
  </svg>
);
