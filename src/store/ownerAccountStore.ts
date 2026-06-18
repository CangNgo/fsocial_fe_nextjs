import { create } from "zustand";

export interface User {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  banner?: string | null;
  role?: "USER" | "ADMIN";
  username?: string;
  email?: string;
  bio?: string;
  address?: string;
  dob?: string;
  gender?: number;
  displayName?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  isPrivate?: boolean;
}

interface OwnerAccountState {
  user: User;
  setUser: (props: Partial<User> | Record<string, unknown>) => void;
  cleanOwnerAccountStore: () => void;
  clearUser: () => void;
}

export const ownerAccountStore = create<OwnerAccountState>()((set) => ({
  user: {},
  setUser: (props) => set((state) => ({ user: { ...state.user, ...(props as Partial<User>) } })),
  cleanOwnerAccountStore: () => set({ user: {} }),
  clearUser: () => set({ user: {} }),
}));
