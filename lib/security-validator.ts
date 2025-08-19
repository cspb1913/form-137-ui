/**
 * Comprehensive Security Validation Service for Auth0 Integration
 * 
 * This service implements OWASP security standards and Auth0 best practices:
 * - Token validation and security checks
 * - Request/response sanitization  
 * - Environment security validation
 * - Compliance with OAuth 2.0 Security Best Current Practices
 * - HTTPS enforcement and security headers validation
 */

export interface SecurityValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  recommendations: string[]
}

export interface TokenSecurityInfo {
  hasProperStructure: boolean
  estimatedExpiry: number | null
  algorithmSupported: boolean
  hasAudience: boolean
  hasIssuer: boolean
}

export class SecurityValidator {
  private static instance: SecurityValidator
  private readonly requiredEnvironmentVars = [
    'AUTH0_SECRET',
    'AUTH0_BASE_URL',
    'AUTH0_ISSUER_BASE_URL',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
    'NEXT_PUBLIC_AUTH0_AUDIENCE'
  ]

  private constructor() {}

  static getInstance(): SecurityValidator {
    if (!SecurityValidator.instance) {
      SecurityValidator.instance = new SecurityValidator()
    }
    return SecurityValidator.instance
  }

  /**
   * Validate overall system security configuration
   */
  validateSystemSecurity(): SecurityValidationResult {
    const result: SecurityValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      recommendations: []
    }

    // Check HTTPS enforcement
    this.validateHTTPSConfiguration(result)

    // Check environment variables
    this.validateEnvironmentSecurity(result)

    // Check Auth0 configuration
    this.validateAuth0Configuration(result)

    // Check CORS configuration
    this.validateCORSConfiguration(result)

    // Check CSP headers
    this.validateCSPHeaders(result)

    // Determine overall validity
    result.isValid = result.errors.length === 0

    return result
  }

  /**
   * Validate HTTPS and transport security
   */
  private validateHTTPSConfiguration(result: SecurityValidationResult): void {
    const baseUrl = process.env.AUTH0_BASE_URL
    const apiUrl = process.env.NEXT_PUBLIC_FORM137_API_URL

    if (typeof window !== 'undefined') {
      // Client-side checks
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        result.errors.push('HTTPS not enforced in production environment')
      }

      // Check for mixed content
      if (window.location.protocol === 'https:' && apiUrl?.startsWith('http://')) {
        result.warnings.push('Mixed content detected: HTTPS frontend calling HTTP API')
      }
    }

    if (baseUrl && !baseUrl.startsWith('https://') && !baseUrl.includes('localhost')) {
      result.errors.push('Auth0 Base URL must use HTTPS in production')
    }

    result.recommendations.push('Ensure TLS 1.2+ is enforced on all endpoints')
  }

  /**
   * Validate environment variable security
   */
  private validateEnvironmentSecurity(result: SecurityValidationResult): void {
    for (const envVar of this.requiredEnvironmentVars) {
      if (!process.env[envVar]) {
        result.errors.push(`Missing required environment variable: ${envVar}`)
      }
    }

    // Check for insecure defaults
    const auth0Secret = process.env.AUTH0_SECRET
    if (auth0Secret && auth0Secret.length < 32) {
      result.warnings.push('AUTH0_SECRET should be at least 32 characters long')
    }

    // Check for development mode in production
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      result.errors.push('Development mode is enabled in production environment')
    }

    result.recommendations.push('Rotate Auth0 client secrets regularly')
    result.recommendations.push('Use environment-specific configurations')
  }

  /**
   * Validate Auth0 specific configuration
   */
  private validateAuth0Configuration(result: SecurityValidationResult): void {
    const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
    const issuer = process.env.AUTH0_ISSUER_BASE_URL
    const clientId = process.env.AUTH0_CLIENT_ID

    if (audience && !audience.startsWith('https://')) {
      result.warnings.push('Auth0 audience should use HTTPS URL')
    }

    if (issuer && !issuer.startsWith('https://')) {
      result.errors.push('Auth0 issuer must use HTTPS URL')
    }

    if (clientId && clientId.length < 20) {
      result.warnings.push('Auth0 Client ID appears to be invalid or too short')
    }

    result.recommendations.push('Enable MFA for sensitive operations')
    result.recommendations.push('Use Auth0 Actions for custom security policies')
    result.recommendations.push('Implement role-based access control (RBAC)')
  }

  /**
   * Validate CORS configuration
   */
  private validateCORSConfiguration(result: SecurityValidationResult): void {
    const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS

    if (allowedOrigins && allowedOrigins.includes('*')) {
      result.errors.push('Wildcard CORS origins detected - this is a security risk')
    }

    if (allowedOrigins && allowedOrigins.includes('localhost')) {
      if (process.env.NODE_ENV === 'production') {
        result.warnings.push('Localhost allowed in CORS origins in production')
      }
    }

    result.recommendations.push('Use explicit origin lists for CORS')
    result.recommendations.push('Implement preflight request validation')
  }

  /**
   * Validate Content Security Policy headers
   */
  private validateCSPHeaders(result: SecurityValidationResult): void {
    if (typeof window !== 'undefined') {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      if (!meta) {
        result.warnings.push('No Content Security Policy detected')
        result.recommendations.push('Implement CSP headers to prevent XSS attacks')
      }
    }

    result.recommendations.push('Use strict CSP policies with nonce or hash for inline scripts')
  }

  /**
   * Validate JWT token structure and security properties
   */
  validateTokenSecurity(token: string): TokenSecurityInfo {
    const info: TokenSecurityInfo = {
      hasProperStructure: false,
      estimatedExpiry: null,
      algorithmSupported: false,
      hasAudience: false,
      hasIssuer: false
    }

    try {
      // Basic structure validation
      const parts = token.split('.')
      if (parts.length !== 3) {
        return info
      }

      info.hasProperStructure = true

      // Validate each part is properly base64 encoded
      if (!parts.every(part => this.isValidBase64(part))) {
        info.hasProperStructure = false
        return info
      }

      // Parse header (without verification for security)
      try {
        const headerDecoded = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'))
        const header = JSON.parse(headerDecoded)
        
        // Check algorithm
        info.algorithmSupported = ['RS256', 'RS384', 'RS512'].includes(header.alg)
        
      } catch (e) {
        // Header parsing failed
      }

      // Parse payload (without verification for security)
      try {
        const payloadDecoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        const payload = JSON.parse(payloadDecoded)
        
        // Check for required claims
        info.hasAudience = !!payload.aud
        info.hasIssuer = !!payload.iss
        
        // Estimate expiry
        if (payload.exp) {
          info.estimatedExpiry = payload.exp * 1000 // Convert to milliseconds
        }
        
      } catch (e) {
        // Payload parsing failed
      }

    } catch (error) {
      // Token validation failed
    }

    return info
  }

  /**
   * Validate request data for XSS and injection attacks
   */
  sanitizeAndValidateInput(data: any): { sanitized: any; warnings: string[] } {
    const warnings: string[] = []
    const sanitized = this.deepSanitize(data, warnings)
    
    return { sanitized, warnings }
  }

  /**
   * Deep sanitization of object data
   */
  private deepSanitize(obj: any, warnings: string[]): any {
    if (obj === null || obj === undefined) {
      return obj
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj, warnings)
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitize(item, warnings))
    }

    if (typeof obj === 'object') {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(obj)) {
        const cleanKey = this.sanitizeString(key, warnings)
        sanitized[cleanKey] = this.deepSanitize(value, warnings)
      }
      return sanitized
    }

    return obj
  }

  /**
   * Sanitize string input
   */
  private sanitizeString(str: string, warnings: string[]): string {
    let sanitized = str

    // Check for potential XSS
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(str)) {
      warnings.push('Script tag detected and removed from input')
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    }

    // Check for javascript: protocol
    if (/javascript:/gi.test(str)) {
      warnings.push('JavaScript protocol detected and removed from input')
      sanitized = sanitized.replace(/javascript:/gi, '')
    }

    // Check for event handlers
    if (/on\w+\s*=/gi.test(str)) {
      warnings.push('Event handler attributes detected and removed from input')
      sanitized = sanitized.replace(/on\w+\s*=/gi, '')
    }

    // Check for SQL injection patterns
    if (/(union\s+select|drop\s+table|delete\s+from)/gi.test(str)) {
      warnings.push('Potential SQL injection pattern detected')
    }

    return sanitized
  }

  /**
   * Check if string is valid base64
   */
  private isValidBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str
    } catch (err) {
      return false
    }
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): string {
    const validation = this.validateSystemSecurity()
    
    let report = '# Auth0 Security Validation Report\n\n'
    report += `**Overall Status**: ${validation.isValid ? '✅ SECURE' : '❌ ISSUES FOUND'}\n\n`
    
    if (validation.errors.length > 0) {
      report += '## 🚨 Critical Issues\n'
      validation.errors.forEach(error => report += `- ${error}\n`)
      report += '\n'
    }
    
    if (validation.warnings.length > 0) {
      report += '## ⚠️ Warnings\n'
      validation.warnings.forEach(warning => report += `- ${warning}\n`)
      report += '\n'
    }
    
    if (validation.recommendations.length > 0) {
      report += '## 💡 Security Recommendations\n'
      validation.recommendations.forEach(rec => report += `- ${rec}\n`)
      report += '\n'
    }
    
    report += '---\n'
    report += `Generated at: ${new Date().toISOString()}\n`
    
    return report
  }
}

// Export singleton instance
export const securityValidator = SecurityValidator.getInstance()

/**
 * Utility hook for React components
 */
export function useSecurityValidation() {
  return {
    validateSystem: () => securityValidator.validateSystemSecurity(),
    validateToken: (token: string) => securityValidator.validateTokenSecurity(token),
    sanitizeInput: (data: any) => securityValidator.sanitizeAndValidateInput(data),
    generateReport: () => securityValidator.generateSecurityReport()
  }
}