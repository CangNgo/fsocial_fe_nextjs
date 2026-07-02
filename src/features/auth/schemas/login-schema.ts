import { z } from "zod";

export const loginSchema = z.object({
  loginName: z.string().min(1, "Tên đăng nhập/email không được để trống"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
