// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
export const HomeNavIcon = ({ compareVar }) => (
  <svg className="h-[26px]" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <path
      className={`stroke-primary-text ${compareVar ? "fill-primary-text" : ""}`}
      d="M2.56091 14.0377C2.14985 11.1809 1.94432 9.75249 2.52982 8.5312C3.11532 7.3099 4.36154 6.56754 6.85399 5.0828L8.35423 4.18911C10.6176 2.84082 11.7493 2.16667 12.9998 2.16667C14.2503 2.16667 15.3821 2.84082 17.6454 4.18911L19.1457 5.0828C21.6381 6.56754 22.8844 7.3099 23.4698 8.5312C24.0554 9.75249 23.8498 11.1809 23.4387 14.0377L23.1368 16.1365C22.6087 19.8063 22.3447 21.6411 21.0717 22.7372C19.7987 23.8333 17.9318 23.8333 14.1981 23.8333H11.8016C8.06782 23.8333 6.20093 23.8333 4.92795 22.7372C3.65496 21.6411 3.39094 19.8063 2.86291 16.1365L2.56091 14.0377Z"
      strokeWidth="1.5"
    />
    <path
      className={`${compareVar ? "stroke-secondary-text" : "stroke-primary-text"}`}
      d="M13 16.25V19.5"
      strokeWidth="1.5"
    />
  </svg>
);
