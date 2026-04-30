import { create } from "zustand";
import decodeJwt, { type JwtPayload } from "@/lib/jwt";

interface AuthState {
  token: string | null,
  user: JwtPayload | null,
  setLogin: (token: string) => void,
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,

  setLogin: (token) => {
    const decodedUser = decodeJwt(token);
    set({ token, user: decodedUser })
  },
  logout: () => {
    set({ token: null, user: null })
  }
}));
