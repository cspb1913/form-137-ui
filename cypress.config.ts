import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false, // Disabled to prevent video generation
    screenshotOnRunFailure: false, // Disabled to prevent screenshot generation
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 15000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    env: {
      API_BASE_URL: 'http://localhost:8080',
    },
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
      })
      
      return config
    },
  },
})