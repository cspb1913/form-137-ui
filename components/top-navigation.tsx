"use client"

import Link from "next/link"
import { useUser } from "@auth0/nextjs-auth0/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

export function TopNavigation() {
  const { user, error, isLoading } = useUser()

  if (isLoading) {
    return (
      <header className="flex h-16 w-full items-center justify-between bg-white px-4 md:px-6 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2" prefetch={false}>
            <Image src="/placeholder-logo.svg" alt="Form 137 Logo" width={32} height={32} />
            <span className="text-lg font-semibold">Form 137</span>
          </Link>
        </div>
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      </header>
    )
  }

  return (
    <header className="flex h-16 w-full items-center justify-between bg-white px-4 shadow-sm md:px-6 dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Image src="/placeholder-logo.svg" alt="Form 137 Logo" width={32} height={32} />
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Form 137</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            prefetch={false}
          >
            Dashboard
          </Link>
          <Link
            href="/request"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            prefetch={false}
          >
            New Request
          </Link>
        </nav>
      </div>
      <div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarImage src={user.picture ?? "/placeholder-user.jpg"} alt={user.name ?? "User"} />
                <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/api/auth/logout">Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link href="/api/auth/login">Login</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
