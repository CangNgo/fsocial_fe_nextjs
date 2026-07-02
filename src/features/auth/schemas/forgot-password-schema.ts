import { z } from "zod";
import { regexEmail, regexPassword } from "@/shared/config/regex";

export const forgotPasswordStep1Schema = z.object({
  email: z.string().min(1, "Email không được để trống").regex(regexEmail, "Email không hợp lệ"),
});

export const forgotPasswordStep2Schema = z
  .object({
    password: z
      .string()
      .min(1, "Mật khẩu không được để trống")
      .regex(regexPassword, "Mật khẩu từ 8-20 kí tự, bao gồm cả chữ và số"),
    rePassword: z
      .string()
      .min(1, "Mật khẩu nhập lại không được để trống")
      .regex(regexPassword, "Mật khẩu từ 8-20 kí tự, bao gồm cả chữ và số"),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["rePassword"],
  });
