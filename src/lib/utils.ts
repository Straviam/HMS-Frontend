import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getApiOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // for cookie httpOnly
} as const;

export const postApiOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // for cookie httpOnly
} as const;

export const patchApiOptions = {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // for cookie httpOnly
} as const;

// TODO: Make these Generic

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4040/api/v1";


