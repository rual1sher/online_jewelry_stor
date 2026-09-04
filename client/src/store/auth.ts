import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthenticatedUser } from '@/api/types'

interface AuthState {
  token: string | null
  user: AuthenticatedUser | null
  setSession: (token: string, user: AuthenticatedUser) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    { name: 'jewelry-auth' },
  ),
)
