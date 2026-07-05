interface BellProps {
  active?: boolean;
}

export const Bell = ({ active = false }: BellProps) => (
  <svg className="md:size-[28px] size-6" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <path
      className={`${active && "fill-primary-text"} stroke-primary-text`}
      d="M7.02161 9.83425C6.9321 6.35857 9.63221 3.25 13.1091 3.25C16.51 3.25 19.1273 6.22131 18.9953 9.61966C18.9721 10.2155 18.9583 10.8082 18.9583 11.375C18.9583 14.9296 22.75 19.5 22.75 19.5H3.25C3.25 19.5 7.04167 15.9454 7.04167 11.375C7.04167 10.8466 7.03442 10.3316 7.02161 9.83425Z"
      strokeWidth="1.6"
    />
    <path
      className={`stroke-primary-text`}
      d="M10.8335 22.75C11.3628 23.4143 12.1373 23.8333 13.0002 23.8333C13.863 23.8333 14.6375 23.4143 15.1668 22.75"
      strokeWidth="1.6"
    />
  </svg>
);
