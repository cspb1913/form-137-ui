/**
 * Complete Example: Secure Auth0 Token Integration
 * 
 * This example demonstrates the complete secure integration between
 * Next.js frontend and Spring Boot backend using Auth0 tokens.
 * 
 * Security Features Demonstrated:
 * - Secure token retrieval and validation
 * - Automatic token refresh and caching
 * - Comprehensive error handling
 * - Input sanitization and XSS prevention
 * - Rate limiting and request validation
 * - Security monitoring and reporting
 */

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import { userAPI, type User } from '@/services/user-api'
import { secureApiClient } from '@/lib/secure-api-client'
import { useSecurityValidation } from '@/lib/security-validator'

export default function SecureAuth0IntegrationExample() {
  const { user: auth0User, isLoading: auth0Loading, error: auth0Error } = useUser()
  const { validateSystem, generateReport } = useSecurityValidation()
  
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [securityReport, setSecurityReport] = useState<string>('')

  /**
   * Example 1: Get current user with secure token handling
   */
  const handleGetCurrentUser = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔐 Fetching current user with secure Auth0 integration...')
      
      // The secure API client handles:
      // - Token retrieval from Auth0
      // - Token validation and caching  
      // - Automatic retry with exponential backoff
      // - Rate limiting and request validation
      // - Comprehensive error handling
      const user = await userAPI.getCurrentUser()
      
      setUserData(user)
      console.log('✅ User data retrieved securely:', user)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user data'
      setError(errorMessage)
      console.error('❌ Secure API call failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Example 2: Manual API call with security validation
   */
  const handleSecureApiCall = async (endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(`🔐 Making secure ${method} request to ${endpoint}`)

      let response
      switch (method) {
        case 'GET':
          response = await secureApiClient.get(endpoint)
          break
        case 'POST':
          response = await secureApiClient.post(endpoint, data)
          break
        default:
          throw new Error(`Unsupported HTTP method: ${method}`)
      }

      console.log('✅ Secure API response:', response)
      return response

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'API call failed'
      setError(errorMessage)
      console.error('❌ Secure API call failed:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Example 3: Update user with input sanitization
   */
  const handleUpdateUser = async (updateData: any) => {
    if (!userData) return

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔐 Updating user with input sanitization...')

      // The secure API client automatically sanitizes input data
      const updatedUser = await userAPI.updateUser(userData.auth0Id, updateData)
      
      setUserData(updatedUser)
      console.log('✅ User updated securely:', updatedUser)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      setError(errorMessage)
      console.error('❌ User update failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Example 4: Generate security validation report
   */
  const handleGenerateSecurityReport = () => {
    console.log('🔍 Generating security validation report...')
    const report = generateReport()
    setSecurityReport(report)
    console.log('✅ Security report generated:', report)
  }

  /**
   * Example 5: Validate system security on mount
   */
  useEffect(() => {
    const validation = validateSystem()
    if (!validation.isValid) {
      console.warn('⚠️ Security issues detected:', validation)
    } else {
      console.log('✅ System security validation passed')
    }
  }, [validateSystem])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">
          🔐 Secure Auth0 Integration Example
        </h1>
        <p className="text-blue-700">
          This example demonstrates secure Auth0 token exchange between Next.js frontend 
          and Spring Boot backend with comprehensive security measures.
        </p>
      </div>

      {/* Auth0 Status */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Auth0 Authentication Status</h2>
        
        {auth0Loading && (
          <div className="text-blue-600">Loading Auth0 session...</div>
        )}
        
        {auth0Error && (
          <div className="text-red-600">Auth0 Error: {auth0Error.message}</div>
        )}
        
        {auth0User && (
          <div className="space-y-2">
            <div className="text-green-600">✅ Authenticated as: {auth0User.email}</div>
            <div className="text-sm text-gray-600">Sub: {auth0User.sub}</div>
            <div className="text-sm text-gray-600">
              Last Updated: {auth0User.updated_at}
            </div>
          </div>
        )}
        
        {!auth0Loading && !auth0User && (
          <div className="text-yellow-600">
            Not authenticated - please log in to test secure integration
          </div>
        )}
      </div>

      {/* Secure API Examples */}
      {auth0User && (
        <div className="space-y-4">
          {/* Example 1: Get Current User */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">
              Example 1: Get Current User (Secure)
            </h3>
            <p className="text-gray-600 mb-3">
              Demonstrates secure token retrieval, validation, and API call with automatic retries.
            </p>
            
            <button
              onClick={handleGetCurrentUser}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Get Current User'}
            </button>

            {userData && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <h4 className="font-medium text-green-800">User Data Retrieved:</h4>
                <pre className="text-sm text-green-700 mt-1 overflow-auto">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Example 2: Manual API Calls */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">
              Example 2: Manual Secure API Calls
            </h3>
            <p className="text-gray-600 mb-3">
              Examples of direct secure API calls with different HTTP methods.
            </p>

            <div className="space-x-2">
              <button
                onClick={() => handleSecureApiCall('/api/users/me')}
                disabled={isLoading}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                GET /api/users/me
              </button>
              
              <button
                onClick={() => handleSecureApiCall('/api/users')}
                disabled={isLoading}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
              >
                GET /api/users (Admin)
              </button>
            </div>
          </div>

          {/* Example 3: Update with Sanitization */}
          {userData && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">
                Example 3: Update User (with Input Sanitization)
              </h3>
              <p className="text-gray-600 mb-3">
                Demonstrates secure user updates with automatic input sanitization.
              </p>

              <button
                onClick={() => handleUpdateUser({
                  name: userData.name + ' (Updated)',
                  profile: {
                    firstName: userData.profile.firstName,
                    lastName: userData.profile.lastName + ' (Updated)'
                  }
                })}
                disabled={isLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Update User Profile
              </button>
            </div>
          )}
        </div>
      )}

      {/* Security Validation */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">
          Security Validation Report
        </h3>
        <p className="text-gray-600 mb-3">
          Generate a comprehensive security validation report for the current system.
        </p>

        <button
          onClick={handleGenerateSecurityReport}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Generate Security Report
        </button>

        {securityReport && (
          <div className="mt-3">
            <h4 className="font-medium mb-2">Security Report:</h4>
            <pre className="text-sm bg-gray-100 p-3 rounded border overflow-auto whitespace-pre-wrap">
              {securityReport}
            </pre>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Documentation Links */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Security Implementation Details</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Frontend Security:</strong>
            <ul className="list-disc list-inside ml-4 text-gray-600">
              <li>Secure token caching with expiration</li>
              <li>Automatic token refresh</li>
              <li>Rate limiting and retry logic</li>
              <li>Input sanitization and XSS prevention</li>
              <li>Request/response validation</li>
            </ul>
          </div>
          <div>
            <strong>Backend Security:</strong>
            <ul className="list-disc list-inside ml-4 text-gray-600">
              <li>JWT signature validation</li>
              <li>Audience and issuer verification</li>
              <li>Timestamp and expiry validation</li>
              <li>CORS with explicit origins</li>
              <li>Security headers (HSTS, CSP, etc.)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Security Best Practices Implemented:
 * 
 * 1. **Defense in Depth**: Multiple layers of security validation
 * 2. **Zero Trust**: Every request is validated regardless of source
 * 3. **Least Privilege**: Fine-grained permissions and scopes
 * 4. **Secure by Default**: All endpoints require authentication unless explicitly public
 * 5. **Input Validation**: All user input is sanitized and validated
 * 6. **Token Security**: Proper JWT validation with audience, issuer, and signature checks
 * 7. **Transport Security**: HTTPS enforcement and security headers
 * 8. **Rate Limiting**: Protection against abuse and DoS attacks
 * 9. **Error Handling**: Secure error messages that don't expose sensitive data
 * 10. **Audit Logging**: Comprehensive logging for security monitoring
 */