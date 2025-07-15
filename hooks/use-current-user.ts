"use client"

import { useUser } from '@auth0/nextjs-auth0'

export function useCurrentUser() {
  const { user, error, isLoading } = useUser()

  return {
    user: user ?? undefined,
    isLoading,
    isError: Boolean(error),
  }
}
