/// <reference types="cypress" />

// Custom types for our commands
interface LoginOptions {
  username?: string
  password?: string
  role?: 'admin' | 'requester'
  failOnStatusCode?: boolean
}

interface UserFixture {
  sub: string
  email: string
  name: string
  roles: string[]
  nickname?: string
  picture?: string
}

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login programmatically using Auth0 credentials
       * @param options Login options including role-based credentials
       */
      loginByAuth0(options?: LoginOptions): Chainable<void>
      
      /**
       * Login as admin user
       */
      loginAsAdmin(): Chainable<void>
      
      /**
       * Login as requester user
       */
      loginAsRequester(): Chainable<void>
      
      /**
       * Logout the current user
       */
      logoutUser(): Chainable<void>
      
      /**
       * Mock authenticated user session
       * @param userFixture User data to mock
       */
      mockUserSession(userFixture?: UserFixture): Chainable<void>
      
      /**
       * Wait for Auth0 authentication to complete
       */
      waitForAuth0(): Chainable<void>
      
      /**
       * Check if user has specific role
       * @param role Role to check for
       */
      checkUserRole(role: 'admin' | 'requester'): Chainable<void>
      
      /**
       * Visit a protected route and handle authentication
       * @param url URL to visit
       * @param role Required role for the route
       */
      visitProtected(url: string, role?: 'admin' | 'requester'): Chainable<void>
      
      /**
       * Fill and submit Form 137 request
       * @param formData Form data to fill
       */
      submitForm137(formData?: Record<string, any>): Chainable<void>
      
      /**
       * Wait for API request to complete
       * @param alias Intercept alias to wait for
       * @param timeout Optional timeout in milliseconds
       */
      waitForApiResponse(alias: string, timeout?: number): Chainable<void>
    }
  }
}

/**
 * Login programmatically using Auth0 API
 * This command bypasses the Auth0 login UI and directly authenticates via API
 */
Cypress.Commands.add('loginByAuth0', (options: LoginOptions = {}) => {
  const {
    username = options.role === 'admin' 
      ? Cypress.env('AUTH0_ADMIN_USERNAME') 
      : Cypress.env('AUTH0_REQUESTER_USERNAME'),
    password = options.role === 'admin'
      ? Cypress.env('AUTH0_ADMIN_PASSWORD')
      : Cypress.env('AUTH0_REQUESTER_PASSWORD'),
    failOnStatusCode = true
  } = options

  // Skip Auth0 tests if configured to do so
  if (Cypress.env('SKIP_AUTH0_TESTS') === true) {
    cy.log('Skipping Auth0 login - using mock session instead')
    const mockUser = options.role === 'admin' 
      ? { sub: 'auth0|mock-admin', email: 'admin@test.com', name: 'Mock Admin', roles: ['Admin'] }
      : { sub: 'auth0|mock-requester', email: 'requester@test.com', name: 'Mock Requester', roles: ['Requester'] }
    cy.mockUserSession(mockUser)
    return
  }

  // Validate required environment variables
  if (!username || !password) {
    throw new Error(`Auth0 credentials not found. Please set AUTH0_${options.role?.toUpperCase()}_USERNAME and AUTH0_${options.role?.toUpperCase()}_PASSWORD environment variables.`)
  }

  cy.log(`Logging in as ${options.role || 'user'}: ${username}`)

  // Use cy.session for efficient authentication caching
  cy.session([username, password, options.role], () => {
    // Step 1: Visit login page
    cy.visit('/api/auth/login')
    
    // Step 2: Handle Auth0 Universal Login
    cy.origin(Cypress.env('AUTH0_DOMAIN') || 'https://auth0.com', { args: { username, password } }, ({ username, password }) => {
      // Wait for Auth0 login form to load
      cy.get('input[name="username"], input[name="email"], input[type="email"]', { timeout: 15000 })
        .should('be.visible')
        .clear()
        .type(username)
      
      cy.get('input[name="password"], input[type="password"]')
        .should('be.visible')
        .clear()
        .type(password, { log: false })
      
      // Submit the login form
      cy.get('button[type="submit"], button[name="submit"], .auth0-lock-submit')
        .should('be.visible')
        .and('not.be.disabled')
        .click()
    })
    
    // Step 3: Wait for redirect back to application
    cy.url().should('not.include', 'auth0.com')
    cy.url().should('include', Cypress.config().baseUrl)
    
    // Step 4: Ensure authentication is complete
    cy.waitForAuth0()
  }, {
    validate() {
      // Verify the session is still valid by checking for user data
      cy.request({
        url: '/api/auth/me',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('sub')
        
        // Validate role if specified
        if (options.role) {
          const expectedRole = options.role === 'admin' ? 'Admin' : 'Requester'
          expect(response.body.roles).to.include(expectedRole)
        }
      })
    }
  })
})

/**
 * Login as admin user
 */
Cypress.Commands.add('loginAsAdmin', () => {
  cy.loginByAuth0({ role: 'admin' })
})

/**
 * Login as requester user
 */
Cypress.Commands.add('loginAsRequester', () => {
  cy.loginByAuth0({ role: 'requester' })
})

/**
 * Logout the current user
 */
Cypress.Commands.add('logoutUser', () => {
  cy.log('Logging out user')
  cy.visit('/api/auth/logout')
  cy.url().should('not.include', '/admin')
  cy.url().should('not.include', '/dashboard')
})

/**
 * Mock authenticated user session for testing without actual Auth0 login
 */
Cypress.Commands.add('mockUserSession', (userFixture: UserFixture = {
  sub: 'auth0|mock-user-id',
  email: 'test@example.com',
  name: 'Test User',
  roles: ['Requester'],
  nickname: 'testuser',
  picture: 'https://example.com/avatar.jpg'
}) => {
  cy.log('Mocking user session')
  
  // Mock the /api/auth/me endpoint
  cy.intercept('GET', '/api/auth/me', {
    statusCode: 200,
    body: userFixture
  }).as('getMockUser')
  
  // Set up localStorage items that might be needed
  cy.window().then((win) => {
    win.localStorage.setItem('auth0.is.authenticated', 'true')
    win.localStorage.setItem('auth0.user', JSON.stringify(userFixture))
  })
})

/**
 * Wait for Auth0 authentication to complete
 */
Cypress.Commands.add('waitForAuth0', () => {
  // Wait for Auth0 SDK to be ready and user to be loaded
  cy.window().its('localStorage').should('exist')
  
  // Wait for the user API call to complete
  cy.intercept('GET', '/api/auth/me').as('getUser')
  cy.wait('@getUser', { timeout: 10000 })
  
  // Ensure no loading states are present
  cy.get('[data-cy="loading"]').should('not.exist')
  cy.get('.animate-spin').should('not.exist')
})

/**
 * Check if user has specific role
 */
Cypress.Commands.add('checkUserRole', (role: 'admin' | 'requester') => {
  cy.request('/api/auth/me').then((response) => {
    expect(response.status).to.equal(200)
    expect(response.body).to.have.property('roles')
    
    const expectedRole = role === 'admin' ? 'Admin' : 'Requester'
    expect(response.body.roles).to.include(expectedRole)
  })
})

/**
 * Visit a protected route and handle authentication
 */
Cypress.Commands.add('visitProtected', (url: string, role?: 'admin' | 'requester') => {
  if (role) {
    cy.loginByAuth0({ role })
  }
  
  cy.visit(url)
  cy.waitForAuth0()
})

/**
 * Fill and submit Form 137 request
 */
Cypress.Commands.add('submitForm137', (formData = {}) => {
  const defaultFormData = {
    studentName: 'John Doe',
    studentId: '2024-12345',
    graduationYear: '2024',
    program: 'Computer Science',
    purpose: 'Employment',
    contactEmail: 'john.doe@example.com',
    contactPhone: '+1234567890',
    ...formData
  }
  
  cy.log('Filling Form 137 request')
  
  // Fill out the form fields
  cy.get('[data-cy="student-name"]').should('be.visible').type(defaultFormData.studentName)
  cy.get('[data-cy="student-id"]').should('be.visible').type(defaultFormData.studentId)
  cy.get('[data-cy="graduation-year"]').should('be.visible').type(defaultFormData.graduationYear)
  cy.get('[data-cy="program"]').should('be.visible').type(defaultFormData.program)
  cy.get('[data-cy="purpose"]').should('be.visible').type(defaultFormData.purpose)
  cy.get('[data-cy="contact-email"]').should('be.visible').type(defaultFormData.contactEmail)
  cy.get('[data-cy="contact-phone"]').should('be.visible').type(defaultFormData.contactPhone)
  
  // Submit the form
  cy.get('[data-cy="submit-button"]').should('be.visible').click()
})

/**
 * Wait for API request to complete with better error handling
 */
Cypress.Commands.add('waitForApiResponse', (alias: string, timeout = 10000) => {
  cy.wait(`@${alias}`, { timeout }).then((interception) => {
    expect(interception.response?.statusCode).to.be.within(200, 299)
  })
})

// Additional utility commands for common testing patterns

/**
 * Check if element is visible and contains text
 */
Cypress.Commands.add('shouldBeVisibleAndContain', { prevSubject: 'element' }, (subject, text: string) => {
  cy.wrap(subject).should('be.visible').and('contain.text', text)
})

/**
 * Check navigation state and URL
 */
Cypress.Commands.add('shouldBeOnPage', (path: string) => {
  cy.url().should('include', path)
  cy.get('[data-cy="page-content"], main, [role="main"]').should('be.visible')
})

/**
 * Handle toast notifications
 */
Cypress.Commands.add('checkToast', (message: string, type: 'success' | 'error' = 'success') => {
  cy.get(`[data-cy="toast-${type}"], [data-sonner-toast][data-type="${type}"], .toast`)
    .should('be.visible')
    .and('contain.text', message)
})

// Enhanced API testing commands
declare global {
  namespace Cypress {
    interface Chainable {
      shouldBeVisibleAndContain(text: string): Chainable<Element>
      shouldBeOnPage(path: string): Chainable<void>
      checkToast(message: string, type?: 'success' | 'error'): Chainable<void>
      
      /**
       * Make authenticated API request using current session
       */
      authenticatedRequest(method: string, url: string, body?: any): Chainable<Response<any>>
      
      /**
       * Test API endpoint with various scenarios
       */
      testApiEndpoint(endpoint: string, scenarios?: ApiTestScenario[]): Chainable<void>
      
      /**
       * Setup API interceptors for Form 137 testing
       */
      setupForm137Interceptors(): Chainable<void>
      
      /**
       * Mock API responses with realistic data
       */
      mockApiResponses(responseType: 'empty' | 'sample' | 'error'): Chainable<void>
      
      /**
       * Verify dashboard data loading and display
       */
      verifyDashboardData(): Chainable<void>
      
      /**
       * Fill out form with realistic test data
       */
      fillForm137WithTestData(overrides?: Partial<Form137Data>): Chainable<void>
    }
  }
}

interface ApiTestScenario {
  name: string
  statusCode: number
  response?: any
  delay?: number
}

interface Form137Data {
  studentName: string
  studentId: string
  graduationYear: string
  program: string
  purpose: string
  contactEmail: string
  contactPhone: string
}

/**
 * Make authenticated API request using current session
 */
Cypress.Commands.add('authenticatedRequest', (method: string, url: string, body?: any) => {
  return cy.request({
    method,
    url: url.startsWith('http') ? url : `${Cypress.env('API_BASE_URL')}${url}`,
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    auth: {
      bearer: 'mock-token' // In real implementation, this would be extracted from session
    }
  })
})

/**
 * Test API endpoint with various scenarios
 */
Cypress.Commands.add('testApiEndpoint', (endpoint: string, scenarios: ApiTestScenario[] = []) => {
  const defaultScenarios: ApiTestScenario[] = [
    { name: 'success', statusCode: 200, response: { success: true } },
    { name: 'not found', statusCode: 404, response: { error: 'Not found' } },
    { name: 'server error', statusCode: 500, response: { error: 'Internal server error' } },
    { name: 'slow response', statusCode: 200, response: { success: true }, delay: 2000 }
  ]
  
  const testScenarios = scenarios.length > 0 ? scenarios : defaultScenarios
  
  testScenarios.forEach(scenario => {
    cy.log(`Testing ${endpoint} - ${scenario.name}`)
    
    cy.intercept('*', `${Cypress.env('API_BASE_URL')}${endpoint}`, (req) => {
      if (scenario.delay) {
        req.reply((res) => {
          res.delay(scenario.delay!)
          res.send({ statusCode: scenario.statusCode, body: scenario.response })
        })
      } else {
        req.reply({ statusCode: scenario.statusCode, body: scenario.response })
      }
    }).as(`api-${scenario.name.replace(/\s+/g, '-')}`)
  })
})

/**
 * Setup API interceptors specifically for Form 137 testing
 */
Cypress.Commands.add('setupForm137Interceptors', () => {
  const apiBase = Cypress.env('API_BASE_URL')
  
  // Dashboard/requests endpoints
  cy.intercept('GET', `${apiBase}/requests**`, { fixture: 'api-responses.json', property: 'dashboard.sampleRequests' }).as('getRequests')
  cy.intercept('GET', `${apiBase}/requests/mine**`, { fixture: 'api-responses.json', property: 'dashboard.sampleRequests' }).as('getMyRequests')
  cy.intercept('GET', `${apiBase}/admin/requests**`, { fixture: 'api-responses.json', property: 'adminRequests.allRequests' }).as('getAdminRequests')
  
  // Request creation
  cy.intercept('POST', `${apiBase}/requests`, { fixture: 'api-responses.json', property: 'requestSubmission.success' }).as('createRequest')
  
  // Status updates (admin only)
  cy.intercept('PUT', `${apiBase}/requests/*/status`, { fixture: 'api-responses.json', property: 'statusUpdate.success' }).as('updateRequestStatus')
  
  // Individual request details
  cy.intercept('GET', `${apiBase}/requests/*`, (req) => {
    const requestId = req.url.split('/').pop()
    req.reply({
      id: requestId,
      ticketNumber: `F137-2024-${requestId?.toUpperCase()}`,
      studentName: 'Test Student',
      studentId: '2024-12345',
      program: 'Computer Science',
      status: 'pending',
      contactEmail: 'test@university.edu',
      contactPhone: '+1234567890',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }).as('getRequestDetails')
})

/**
 * Mock API responses with different data sets
 */
Cypress.Commands.add('mockApiResponses', (responseType: 'empty' | 'sample' | 'error') => {
  const apiBase = Cypress.env('API_BASE_URL')
  
  switch (responseType) {
    case 'empty':
      cy.intercept('GET', `${apiBase}/requests**`, { fixture: 'api-responses.json', property: 'dashboard.emptyRequests' }).as('getEmptyRequests')
      break
    case 'sample':
      cy.intercept('GET', `${apiBase}/requests**`, { fixture: 'api-responses.json', property: 'dashboard.sampleRequests' }).as('getSampleRequests')
      break
    case 'error':
      cy.intercept('GET', `${apiBase}/requests**`, { statusCode: 500, body: { error: 'Server Error' } }).as('getRequestsError')
      break
  }
})

/**
 * Verify dashboard data loading and display
 */
Cypress.Commands.add('verifyDashboardData', () => {
  // Wait for API calls to complete
  cy.wait('@getRequests', { timeout: 10000 })
  
  // Verify dashboard elements are visible
  cy.get('[data-cy="dashboard"]').should('be.visible')
  cy.get('[data-cy="requests-list"]').should('be.visible')
  
  // Check for loading states are gone
  cy.get('[data-cy="loading-spinner"]').should('not.exist')
  cy.get('.animate-spin').should('not.exist')
  
  // Verify data is displayed (either empty state or actual data)
  cy.get('[data-cy="requests-list"]').within(() => {
    cy.get('[data-cy="request-item"], [data-cy="empty-state"]').should('exist')
  })
})

/**
 * Fill out Form 137 with comprehensive test data
 */
Cypress.Commands.add('fillForm137WithTestData', (overrides: Partial<Form137Data> = {}) => {
  const testData: Form137Data = {
    studentName: 'John Doe Student',
    studentId: '2024-12345',
    graduationYear: '2024',
    program: 'Bachelor of Science in Computer Science',
    purpose: 'Employment Requirements',
    contactEmail: 'john.doe@university.edu',
    contactPhone: '+639123456789',
    ...overrides
  }
  
  cy.log('Filling Form 137 with test data', testData)
  
  // Fill basic information
  cy.get('[data-cy="student-name"], input[name="studentName"]').should('be.visible').clear().type(testData.studentName)
  cy.get('[data-cy="student-id"], input[name="studentId"]').should('be.visible').clear().type(testData.studentId)
  cy.get('[data-cy="graduation-year"], input[name="graduationYear"], select[name="graduationYear"]').should('be.visible').clear().type(testData.graduationYear)
  cy.get('[data-cy="program"], input[name="program"], select[name="program"]').should('be.visible').clear().type(testData.program)
  cy.get('[data-cy="purpose"], input[name="purpose"], textarea[name="purpose"]').should('be.visible').clear().type(testData.purpose)
  
  // Fill contact information
  cy.get('[data-cy="contact-email"], input[name="contactEmail"], input[type="email"]').should('be.visible').clear().type(testData.contactEmail)
  cy.get('[data-cy="contact-phone"], input[name="contactPhone"], input[type="tel"]').should('be.visible').clear().type(testData.contactPhone)
  
  // Verify all fields are filled
  cy.get('[data-cy="submit-button"], button[type="submit"]').should('be.visible').and('not.be.disabled')
})