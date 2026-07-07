interface LoadingIconProps {
  stroke?: string;
  size?: string;
}

export const LoadingIcon = ({ stroke = "stroke-txtWhite", size = "size-6" }: LoadingIconProps) => (
  <svg
    className={`${size}`}
    preserveAspectRatio="xMidYMid"
    style={{
      shapeRendering: "auto",
    }}
    viewBox="0 0 100 100"
    aria-hidden="true"
  >
    <circle
      className={stroke}
      cx={50}
      cy={50}
      r={32}
      fill="none"
      stroke="#fe718d"
      strokeDasharray="50.26548245743669 50.26548245743669"
      strokeLinecap="round"
      strokeWidth={8}
    >
      <animateTransform
        attributeName="transform"
        dur="1s"
        keyTimes="0;1"
        repeatCount="indefinite"
        type="rotate"
        values="0 50 50;360 50 50"
      />
    </circle>
  </svg>
);
