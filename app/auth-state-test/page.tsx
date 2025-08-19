"use client"

import { useUser } from '@auth0/nextjs-auth0'
import { useEffect, useState } from 'react'

export default function AuthStateTest() {
  const { user, isLoading, error } = useUser()
  const [mountTime, setMountTime] = useState<number>(0)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    setMountTime(Date.now())
  }, [])

  useEffect(() => {
    const log = `[${((Date.now() - mountTime) / 1000).toFixed(1)}s] user: ${!!user}, loading: ${isLoading}, email: ${user?.email || 'none'}`
    console.log(log)
    setLogs(prev => [...prev.slice(-10), log]) // Keep last 10 logs
  }, [user, isLoading, mountTime])

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Auth State Test - Error</h1>
        <div className="bg-red-100 p-4 rounded">
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth State Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Current State</h2>
        <div className="bg-gray-100 p-4 rounded">
          <div>User: {user ? '✅ Present' : '❌ Null'}</div>
          <div>Loading: {isLoading ? '🔄 True' : '✅ False'}</div>
          <div>Email: {user?.email || 'Not available'}</div>
          <div>Time since mount: {((Date.now() - mountTime) / 1000).toFixed(1)}s</div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">State Change Log</h2>
        <div className="bg-gray-50 p-4 rounded text-sm font-mono">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Manual Check</h2>
        <button
          onClick={() => {
            fetch('/api/auth/me')
              .then(res => res.json())
              .then(data => {
                console.log('Manual API check:', data)
                alert(`Manual check: ${data.email || 'Not authenticated'}`)
              })
              .catch(err => {
                console.error('Manual API error:', err)
                alert('Manual check failed')
              })
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Check /api/auth/me
        </button>
      </div>

      {!user && !isLoading && (
        <div className="mb-4">
          <a 
            href="/api/auth/login" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Login
          </a>
        </div>
      )}
    </div>
  )
}