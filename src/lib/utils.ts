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


