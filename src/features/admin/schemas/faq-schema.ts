import { z } from "zod";
import { FAQ_TYPE_VALUES } from "../config/faq-config";

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function hasMeaningfulFaqContent(value: string) {
  return stripHtml(value).length > 0;
}

export const faqSchema = z.object({
  name: z.string().trim().min(1, "Tên không được để trống"),
  description: z.string().optional(),
  content: z.string().refine(hasMeaningfulFaqContent, "Nội dung không được để trống"),
  type: z.enum(FAQ_TYPE_VALUES),
  attachmentId: z.string().optional().nullable(),
});

export type FaqFormValues = z.infer<typeof faqSchema>;
