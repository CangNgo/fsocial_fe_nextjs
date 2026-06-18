export interface User {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
}
