"use client"

import useSWR from "swr"

// Define a fetcher function that can be used by SWR
const fetcher = async (url: string) => {
  const res = await fetch(url)

  // If the status code is not in the 200-299 range,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    // Attach extra info to the error object.
    try {
      ;(error as any).info = await res.json()
    } catch (e) {
      // Ignore if response is not json
    }
    ;(error as any).status = res.status
    throw error
  }

  return res.json()
}

export function useCurrentUser() {
  const { data, error, isLoading } = useSWR("/api/auth/me", fetcher, {
    shouldRetryOnError: false, // Optional: prevent retrying on auth errors
  })

  return {
    user: data?.user,
    isLoading,
    isError: error,
  }
}
