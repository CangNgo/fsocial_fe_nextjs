import { z } from "zod";
import { regexEmail, regexName, regexPassword } from "@/shared/config/regex";

export const adminProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Tên không được để trống")
      .regex(regexName, "Tên không được chứa số và ký tự đặc biệt"),
    lastName: z
      .string()
      .trim()
      .min(1, "Họ không được để trống")
      .regex(regexName, "Họ không được chứa số và ký tự đặc biệt"),
    day: z.string().min(1, "Ngày sinh không được để trống"),
    month: z.string().min(1, "Tháng sinh không được để trống"),
    year: z.string().min(1, "Năm sinh không được để trống"),
    gender: z.string().min(1, "Giới tính không được để trống"),
    username: z.string().trim().min(1, "Tên đăng nhập không được để trống"),
    email: z
      .string()
      .trim()
      .min(1, "Email không được để trống")
      .regex(regexEmail, "Email không hợp lệ"),
    address: z.string().trim(),
    avatar: z.string(),
    oldPassword: z.string(),
    newPassword: z.string(),
    reNewPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    const hasPasswordInput = Boolean(data.oldPassword || data.newPassword || data.reNewPassword);

    if (!hasPasswordInput) {
      return;
    }

    if (!data.oldPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["oldPassword"],
        message: "Mật khẩu cũ không được để trống",
      });
    }

    if (!data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "Mật khẩu mới không được để trống",
      });
    } else if (!regexPassword.test(data.newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "Mật khẩu từ 8-20 kí tự, bao gồm cả chữ và số",
      });
    }

    if (!data.reNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reNewPassword"],
        message: "Mật khẩu nhập lại không được để trống",
      });
    } else if (data.reNewPassword !== data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reNewPassword"],
        message: "Mật khẩu nhập lại không khớp",
      });
    }
  });

export type AdminProfileFormValues = z.infer<typeof adminProfileSchema>;
