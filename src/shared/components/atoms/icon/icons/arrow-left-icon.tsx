interface ArrowLeftIconProps {
  className?: string;
}

export const ArrowLeftIcon = ({ className }: ArrowLeftIconProps) => (
  <svg className={`w-7 ${className}`} viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path
      className="fill-primary-text"
      d="M5.33057 13.2055C4.89111 13.6449 4.89111 14.3586 5.33057 14.7981L9.83057 19.2981C10.27 19.7375 10.9837 19.7375 11.4231 19.2981C11.8626 18.8586 11.8626 18.1449 11.4231 17.7055L8.84268 15.125H21.8751C22.4974 15.125 23.0001 14.6223 23.0001 14C23.0001 13.3777 22.4974 12.875 21.8751 12.875H8.84268L11.4231 10.2945C11.8626 9.85509 11.8626 9.14142 11.4231 8.70197C10.9837 8.26251 10.27 8.26251 9.83057 8.70197L5.33057 13.202V13.2055Z"
    />
  </svg>
);
