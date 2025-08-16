"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { DEV_USER_PROFILES } from "@/lib/dev-jwt-generator"

/**
 * Development User Profile Selector
 * This component allows developers to quickly switch between different user roles
 * during development for testing purposes.
 * 
 * Only shows when NEXT_PUBLIC_DEV_MODE=true
 */
export function DevUserSelector() {
  const { user, logout } = useAuth()
  const [selectedProfile, setSelectedProfile] = useState<keyof typeof DEV_USER_PROFILES>("admin")
  
  // Only show in development mode
  const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"
  if (!isDevelopmentMode) {
    return null
  }

  const switchProfile = (profileName: keyof typeof DEV_USER_PROFILES) => {
    const profile = DEV_USER_PROFILES[profileName]
    
    // Update environment variables dynamically (client-side only)
    if (typeof window !== "undefined") {
      // Store in localStorage for persistence across page reloads
      localStorage.setItem("dev-user-email", profile.email)
      localStorage.setItem("dev-user-name", profile.name)
      localStorage.setItem("dev-user-role", profile.role)
      
      // Reload the page to apply new profile
      window.location.reload()
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 border-orange-500 bg-orange-50 shadow-lg z-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
          🔧 Development Mode
          <Badge variant="outline" className="text-xs">DEV</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {user && (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Current User:</span> {user.name}
            </div>
            <div className="text-sm">
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div className="text-sm">
              <span className="font-medium">Role:</span> 
              <Badge variant="secondary" className="ml-2">
                {user.roles?.[0] || "No Role"}
              </Badge>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Switch Profile:</label>
          <Select value={selectedProfile} onValueChange={setSelectedProfile}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Admin</Badge>
                  <span>Admin User</span>
                </div>
              </SelectItem>
              <SelectItem value="requester">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Requester</Badge>
                  <span>Requester User</span>
                </div>
              </SelectItem>
              <SelectItem value="student">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Student</Badge>
                  <span>Student User</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => switchProfile(selectedProfile)}
            className="flex-1"
          >
            Switch Profile
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={logout}
            className="flex-1"
          >
            Logout
          </Button>
        </div>

        <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
          <strong>Dev Mode:</strong> Authentication is bypassed. Set NEXT_PUBLIC_DEV_MODE=false for production Auth0.
        </div>
      </CardContent>
    </Card>
  )
}