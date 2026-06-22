import { create } from "zustand";

interface AdminUser {
  firstName: string;
  lastName: string;
  day: number;
  month: string;
  year: number;
  gender: number;
  username: string;
  email: string;
  avatar: string;
}

interface AdminStore {
  user: Partial<AdminUser>;
  setUser: (props: Partial<AdminUser>) => void;
  resetUser: () => void;
}

export const adminStore = create<AdminStore>()((set) => ({
  user: {},
  setUser: (props) => set((state) => ({ user: { ...state.user, ...props } })),
  resetUser: () => set({ user: {} }),
}));
