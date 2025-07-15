"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, LayoutDashboard, LogOut, User } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function TopNavigation() {
  const pathname = usePathname()
  const { user, isLoading } = useCurrentUser()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">Form 137 Portal</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isLoading && <Skeleton className="h-8 w-24 rounded-md" />}
            {!isLoading && user && (
              <>
                <div className="hidden md:flex items-center space-x-1">
                  <Link href="/">
                    <Button
                      variant={isActive("/") ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                  <Link href="/request">
                    <Button
                      variant={isActive("/request") ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>New Request</span>
                    </Button>
                  </Link>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.picture || ""} alt={user.name || ""} />
                        <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/auth/logout" className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!isLoading && !user && (
              <Button asChild>
                <a href="/api/auth/login">Log in</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
