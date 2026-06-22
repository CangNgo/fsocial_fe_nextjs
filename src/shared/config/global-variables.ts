export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Fsocial";

export const dayOptions: Record<number, number> = Array.from(
  { length: 31 },
  (_, index) => index + 1,
).reduce<Record<number, number>>((acc, num) => {
  acc[num] = num;
  return acc;
}, {});

export const monthOptions: Record<number, number> = Array.from(
  { length: 12 },
  (_, index) => index + 1,
).reduce<Record<number, number>>((acc, num) => {
  acc[num] = num;
  return acc;
}, {});

export const yearOptions: Record<number, number> = Array.from(
  { length: new Date().getFullYear() - 16 - 1970 + 1 },
  (_, index) => 1970 + index,
).reduce<Record<number, number>>((acc, num) => {
  acc[num] = num;
  return acc;
}, {});

export const WS_URL = `${process.env.NEXT_PUBLIC_WS_PROTOCOL}://${process.env.NEXT_PUBLIC_WS_HOST}/ws`;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
} as const;

export const IMAGE_CONSTRAINTS = {
  MAX_SIZE_MB: 5,
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
} as const;
