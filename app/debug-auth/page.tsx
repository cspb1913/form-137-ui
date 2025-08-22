"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiResult, setApiResult] = useState<any>(null)
  const [isTestingApi, setIsTestingApi] = useState(false)

  // Check auth status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me/', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const testApiCall = async () => {
    setIsTestingApi(true)
    try {
      const response = await fetch('/api/dashboard/requests', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: response.ok ? await response.json() : await response.text()
      }
      setApiResult(result)
    } catch (error) {
      setApiResult({ error: error.message })
    } finally {
      setIsTestingApi(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Auth Debug Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}
            </div>
            {user && (
              <div className="space-y-2">
                <div><strong>Name:</strong> {user.name}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Roles:</strong> {JSON.stringify(user.roles)}</div>
                <div><strong>Full User:</strong></div>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={testApiCall} 
              disabled={isTestingApi}
              className="w-full"
            >
              {isTestingApi ? 'Testing API...' : 'Test API Call to /api/dashboard/requests'}
            </Button>
            
            {apiResult && (
              <div>
                <h3 className="font-semibold mb-2">API Result:</h3>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(apiResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
