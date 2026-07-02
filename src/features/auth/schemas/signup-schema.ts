import { z } from "zod";
import { regexEmail, regexName, regexPassword } from "@/shared/config/regex";

export const signupStep1Schema = z.object({
  firstName: z
    .string()
    .min(1, "Tên không được để trống")
    .regex(regexName, "Tên tối đa 13 kí tự, không chứa số và ký tự đặc biệt"),
  lastName: z
    .string()
    .min(1, "Họ không được để trống")
    .regex(regexName, "Họ tối đa 13 kí tự, không chứa số và ký tự đặc biệt"),
  day: z.string(),
  month: z.string(),
  year: z.string(),
  gender: z.string(),
});

export const signupStep2Schema = z
  .object({
    username: z.string().min(1, "Tên đăng nhập không được để trống"),
    email: z.string().min(1, "Email không được để trống").regex(regexEmail, "Email không hợp lệ"),
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
