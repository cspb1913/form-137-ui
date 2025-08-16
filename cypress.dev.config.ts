import { defineConfig } from 'cypress'

/**
 * Cypress configuration specifically for development mode
 * This configuration is optimized for development testing scenarios
 * where authentication is mocked and API endpoints may be local
 */
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    // Dev mode focuses on development-specific tests and basic functionality
    specPattern: [
      'cypress/e2e/dev/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/e2e/basic-smoke.cy.ts',
      'cypress/e2e/app-functionality.cy.ts'
    ],
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,  // Shorter timeouts for faster dev feedback
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 20000,
    retries: {
      runMode: 1,  // Fewer retries in dev mode for faster feedback
      openMode: 0,
    },
    env: {
      // Development-specific API Configuration
      API_BASE_URL: 'http://localhost:8080/api',
      
      // Dev mode flags
      DEV_MODE: true,
      NEXT_PUBLIC_DEV_MODE: 'true',
      
      // Simplified Auth0 configuration for dev mode
      AUTH0_DOMAIN: 'jasoncalalang.auth0.com',
      AUTH0_CLIENT_ID: 'dev-client-id',
      AUTH0_CLIENT_SECRET: 'dev-client-secret',
      AUTH0_AUDIENCE: 'https://form137.cspb.edu.ph/api',
      AUTH0_SCOPE: 'openid profile email',
      
      // Development test users (simplified)
      AUTH0_DEV_USER_EMAIL: 'dev@example.com',
      AUTH0_DEV_USER_NAME: 'Development User',
      AUTH0_DEV_USER_ROLE: 'Requester',
      
      // Test Configuration optimized for development
      COVERAGE: false,  // Disable coverage in dev mode for speed
      SKIP_AUTH0_TESTS: true,  // Skip real Auth0 tests in dev mode
      SKIP_SLOW_TESTS: true,   // Skip time-consuming tests
      ENABLE_DEV_SHORTCUTS: true,  // Enable development testing shortcuts
    },
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config)
      
      on('task', {
        log(message) {
          console.log(`[DEV MODE] ${message}`)
          return null
        },
        table(message) {
          console.table(message)
          return null
        },
        // Task to verify local API connectivity
        checkLocalApiHealth() {
          return new Promise((resolve) => {
            const http = require('http')
            const url = 'http://localhost:8080/api/health/liveness'
            
            http.get(url, (res) => {
              resolve({ 
                status: res.statusCode, 
                message: `Local API is reachable (${res.statusCode})` 
              })
            }).on('error', (err) => {
              resolve({ 
                status: 0, 
                message: `Local API unreachable: ${err.message}` 
              })
            })
          })
        },
      })
      
      // Development-specific environment setup
      config.env.API_BASE_URL = 'http://localhost:8080/api'
      config.env.NODE_ENV = 'development'
      config.env.CYPRESS_RUNNING = true
      
      // Force dev mode settings
      config.env.DEV_MODE = true
      config.env.NEXT_PUBLIC_DEV_MODE = 'true'
      
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