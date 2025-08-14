import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
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
    env: {
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
    },
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config)
      
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        table(message) {
          console.table(message)
          return null
        },
        // Task to verify API connectivity
        checkApiHealth() {
          return new Promise((resolve) => {
            const https = require('https')
            const url = config.env.API_BASE_URL + '/health'
            
            https.get(url, (res) => {
              resolve({ status: res.statusCode, message: 'API is reachable' })
            }).on('error', (err) => {
              resolve({ status: 0, message: err.message })
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