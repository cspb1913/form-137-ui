import useSWR from "swr"
import type { UserWithRoles } from "@/types/user"

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    if (res.status === 401) {
      return null // Not logged in
    }
    throw new Error("An error occurred while fetching the user.")
  }
  const data = await res.json()
  return data.user
}

export function useCurrentUser() {
  const { data, error, isLoading } = useSWR<UserWithRoles | null>("/api/auth/me", fetcher)

  return {
    user: data,
    isLoading,
    isError: error,
  }
}
