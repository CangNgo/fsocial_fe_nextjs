import { create } from "zustand";
import { AccountResponse } from "../types/profile";

export type User = AccountResponse;

interface OwnerAccountState {
  user: AccountResponse;
  setUser: (props: Partial<AccountResponse> | Record<string, unknown>) => void;
  cleanOwnerAccountStore: () => void;
  clearUser: () => void;
}

export const ownerAccountStore = create<OwnerAccountState>()((set) => ({
  user: {},
  setUser: (props) => set((state) => ({ user: { ...state.user, ...(props as Partial<AccountResponse>) } })),
  cleanOwnerAccountStore: () => set({ user: {} }),
  clearUser: () => set({ user: {} }),
}));
