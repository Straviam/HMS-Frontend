import { create } from "zustand";
import { persist } from "zustand/middleware";
import decodeJwt, { type JwtPayload } from "@/lib/jwt";

interface AuthState {
  token: string | null,
  user: JwtPayload | null,
  setLogin: (token: string) => void,
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setLogin: (token) => {
        const decodedUser = decodeJwt(token);
        set({ token, user: decodedUser })
      },
      logout: () => {
        set({ token: null, user: null })
      }
    }),
    {
      name: "auth-storage", // Key used for localStorage
    }
  )
);

