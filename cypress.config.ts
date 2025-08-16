import { defineConfig } from 'cypress'

/**
 * Get spec pattern based on environment mode
 * In dev mode, we run a subset of tests optimized for development workflow
 * In production mode, we run the full test suite
 */
function getSpecPattern() {
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || process.env.CYPRESS_DEV_MODE === 'true'
  
  if (isDevMode) {
    return [
      'cypress/e2e/dev/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/e2e/basic-smoke.cy.ts',
      'cypress/e2e/app-functionality.cy.ts'
    ]
  }
  
  return 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'
}

/**
 * Get environment-specific configuration
 */
function getEnvironmentConfig() {
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || process.env.CYPRESS_DEV_MODE === 'true'
  
  const baseConfig = {
    // API Configuration
    API_BASE_URL: 'https://f137-api.jason-test1-2d3fb824a69ea5c326974e87bbe5c52a-0000.jp-tok.containers.appdomain.cloud',
    
    // Auth0 Test Credentials (to be set via environment variables or cypress.env.json)
    AUTH0_DOMAIN: '',
    AUTH0_CLIENT_ID: '',
    AUTH0_CLIENT_SECRET: '',
    AUTH0_AUDIENCE: '',
    AUTH0_SCOPE: 'openid profile email',
    
    // Test User Credentials
    AUTH0_ADMIN_USERNAME: '',
    AUTH0_ADMIN_PASSWORD: '',
    AUTH0_REQUESTER_USERNAME: '',
    AUTH0_REQUESTER_PASSWORD: '',
    
    // Test Configuration
    COVERAGE: true,
    SKIP_AUTH0_TESTS: false,
  }
  
  if (isDevMode) {
    return {
      ...baseConfig,
      // Development-specific overrides
      API_BASE_URL: 'http://localhost:8080/api',
      COVERAGE: false,  // Disable coverage in dev mode for speed
      SKIP_AUTH0_TESTS: true,  // Skip real Auth0 tests in dev mode
      SKIP_SLOW_TESTS: true,   // Skip time-consuming tests
      DEV_MODE: true,
      NEXT_PUBLIC_DEV_MODE: 'true',
      ENABLE_DEV_SHORTCUTS: true,
    }
  }
  
  return baseConfig
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: getSpecPattern(),
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    env: getEnvironmentConfig(),
    setupNodeEvents(on, config) {
      const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || process.env.CYPRESS_DEV_MODE === 'true'
      
      require('@cypress/code-coverage/task')(on, config)
      
      on('task', {
        log(message) {
          const prefix = isDevMode ? '[DEV MODE]' : '[PROD MODE]'
          console.log(`${prefix} ${message}`)
          return null
        },
        table(message) {
          console.table(message)
          return null
        },
        // Task to verify API connectivity
        checkApiHealth() {
          return new Promise((resolve) => {
            const http = require('http')
            const https = require('https')
            const url = config.env.API_BASE_URL + '/api/health/liveness'
            
            // Use http for localhost, https for external URLs
            const client = url.startsWith('https://') ? https : http
            
            client.get(url, (res) => {
              resolve({ status: res.statusCode, message: 'API is reachable' })
            }).on('error', (err) => {
              resolve({ status: 0, message: err.message })
            })
          })
        },
        // Task to verify local API connectivity (for dev mode)
        checkLocalApiHealth() {
          return new Promise((resolve) => {
            const http = require('http')
            const url = 'http://localhost:8080/api/health/liveness'
            
            const req = http.get(url, (res) => {
              let data = ''
              res.on('data', chunk => data += chunk)
              res.on('end', () => {
                resolve({ 
                  status: res.statusCode, 
                  message: 'Local API is reachable',
                  data: data
                })
              })
            })
            
            req.on('error', (err) => {
              resolve({ 
                status: 0, 
                message: `Local API connection failed: ${err.message}`,
                error: err.code
              })
            })
            
            req.setTimeout(5000, () => {
              req.destroy()
              resolve({ 
                status: 0, 
                message: 'Local API connection timeout'
              })
            })
          })
        },
      })
      
      // Set environment variables from system environment if available
      config.env.API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || config.env.API_BASE_URL
      config.env.AUTH0_DOMAIN = process.env.AUTH0_ISSUER_BASE_URL || config.env.AUTH0_DOMAIN
      config.env.AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || config.env.AUTH0_CLIENT_ID
      config.env.AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || config.env.AUTH0_AUDIENCE
      
      return config
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
})