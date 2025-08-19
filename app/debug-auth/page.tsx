"use client"

import { useUser, getAccessToken } from "@auth0/nextjs-auth0"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth-mongodb"
import { isAdmin, isRequester, canAccessDashboard } from "@/lib/user-auth-utils"

export default function DebugAuth() {
  const { user, isLoading } = useUser()
  const { user: appUser, isLoading: appLoading } = useAuth()
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkToken = async () => {
    try {
      setError(null)
      console.log("Getting access token with audience:", process.env.NEXT_PUBLIC_AUTH0_AUDIENCE)
      
      const token = await getAccessToken({
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      })
      
      console.log("Got token:", token)
      
      // Decode JWT payload to see what's inside
      const parts = token.split('.')
      const payload = JSON.parse(atob(parts[1]))
      
      setTokenInfo({
        token: token,
        payload: payload,
        isValid: !!token,
        audience: payload.aud,
        scope: payload.scope,
        expires: new Date(payload.exp * 1000).toISOString()
      })
      
      // Test API call
      const response = await fetch('http://localhost:8080/api/dashboard/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      console.log("API Response status:", response.status)
      const data = await response.json()
      console.log("API Response data:", data)
      
      setTokenInfo(prev => ({
        ...prev,
        apiTest: {
          status: response.status,
          data: data
        }
      }))
      
    } catch (err) {
      console.error("Error getting token:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  // Show loading while either Auth0 or MongoDB user data is loading
  if (isLoading || appLoading) {
    return <div>Loading authentication...</div>
  }

  // Check MongoDB user first, fallback to Auth0 user for compatibility
  if (!user && !appUser) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
        <p>Please log in to debug Auth0 tokens and MongoDB user data</p>
        <a href="/api/auth/login" className="text-blue-600 underline">Login</a>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth0 Debug Information</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Raw Auth0 User Info</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">App User (with roles processing)</h2>
        <pre className="bg-blue-50 p-4 rounded overflow-auto">
          {JSON.stringify(appUser, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Role Analysis (MongoDB API)</h2>
        <div className="bg-yellow-50 p-4 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">MongoDB User ID:</h3>
              <code className="text-sm bg-white p-1 rounded">{appUser?.id || 'Not loaded'}</code>
            </div>
            <div>
              <h3 className="font-semibold">Auth0 ID:</h3>
              <code className="text-sm bg-white p-1 rounded">
                {appUser?.auth0Id || 'Not available'}
              </code>
            </div>
            <div>
              <h3 className="font-semibold">MongoDB Roles:</h3>
              <code className="text-sm bg-white p-1 rounded">
                {JSON.stringify(appUser?.roles)}
              </code>
            </div>
            <div>
              <h3 className="font-semibold">Role Checks:</h3>
              <ul className="text-sm">
                <li>isAdmin: {String(isAdmin(appUser))}</li>
                <li>isRequester: {String(isRequester(appUser))}</li>
                <li>canAccessDashboard: {String(canAccessDashboard(appUser))}</li>
                <li>isActive: {String(appUser?.isActive)}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">User Profile:</h3>
              <ul className="text-sm">
                <li>Name: {appUser?.name}</li>
                <li>Email: {appUser?.email}</li>
                <li>First: {appUser?.profile?.firstName}</li>
                <li>Last: {appUser?.profile?.lastName}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Legacy JWT Roles:</h3>
              <code className="text-sm bg-white p-1 rounded">
                {JSON.stringify(user?.[`${process.env.NEXT_PUBLIC_AUTH0_AUDIENCE}/roles`])}
              </code>
              <p className="text-xs text-gray-600 mt-1">
                ⚠️ This should be empty - we now use MongoDB API
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment</h2>
        <pre className="bg-gray-100 p-4 rounded">
{`AUTH0_AUDIENCE: ${process.env.NEXT_PUBLIC_AUTH0_AUDIENCE}
API_URL: ${process.env.NEXT_PUBLIC_FORM137_API_URL}`}
        </pre>
      </div>

      <button 
        onClick={checkToken}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Get Access Token & Test API
      </button>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {tokenInfo && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Token Information</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}