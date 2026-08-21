import type { FaqType } from "@/shared/types/faq";

export const FAQ_TYPE_VALUES = ["FAQ", "TUTORIAL", "ABOUT_US"] as const;

export const FAQ_TYPE_OPTIONS: Array<{ label: string; value: FaqType; emptyText: string }> = [
  { label: "FAQ", value: "FAQ", emptyText: "Không có FAQ nào" },
  { label: "Tutorial", value: "TUTORIAL", emptyText: "Không có hướng dẫn nào" },
  { label: "About Us", value: "ABOUT_US", emptyText: "Không có nội dung About Us nào" },
];

export const DEFAULT_FAQ_TYPE: FaqType = "FAQ";

export function isFaqType(value: string | null | undefined): value is FaqType {
  return FAQ_TYPE_OPTIONS.some((option) => option.value === value);
}

export function getFaqTypeLabel(type: FaqType) {
  return FAQ_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function getFaqTypeEmptyText(type: FaqType) {
  return FAQ_TYPE_OPTIONS.find((option) => option.value === type)?.emptyText ?? "Không có FAQ nào";
}
