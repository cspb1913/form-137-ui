/// <reference types="cypress" />

describe('Role-Based Routing and Access Control', () => {
  beforeEach(() => {
    // Clear browser state
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.clearAllSessionStorage()
    
    // Setup Form 137 specific interceptors
    cy.setupForm137Interceptors()
  })

  describe('Admin Role Access Control', () => {
    beforeEach(() => {
      // Mock admin user session
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-admin.json' }).as('getAdminUser')
      cy.mockUserSession({
        sub: 'auth0|admin-test-123',
        email: 'admin@form137.edu',
        name: 'Test Admin User',
        roles: ['Admin'],
        nickname: 'testadmin',
        picture: 'https://gravatar.com/avatar/admin.jpg'
      })
    })

    it('should redirect admin users to admin dashboard from home page', () => {
      cy.visit('/')
      cy.wait('@getAdminUser')

      // Admin should be automatically redirected to admin dashboard
      cy.url().should('include', '/admin')
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
      cy.get('[data-cy="user-profile"]').should('contain.text', 'Test Admin User')
    })

    it('should allow admin access to admin-specific routes', () => {
      const adminRoutes = ['/admin', '/admin/requests', '/admin/dashboard']
      
      adminRoutes.forEach(route => {
        cy.visit(route)
        cy.wait('@getAdminUser')
        
        // Should successfully access admin route
        cy.url().should('include', route)
        cy.get('[data-cy="admin-dashboard"], [data-cy="admin-content"]').should('be.visible')
        cy.get('[data-cy="unauthorized-message"]').should('not.exist')
      })
    })

    it('should allow admin to view all requests', () => {
      cy.mockApiResponses('sample')
      
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      // Should see admin dashboard with all requests
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
      cy.get('[data-cy="all-requests-list"]').should('be.visible')
      
      // Should see admin-specific functionality
      cy.get('[data-cy="admin-actions"]').should('be.visible')
      cy.get('[data-cy="status-update-controls"]').should('exist')
    })

    it('should allow admin to access individual request details', () => {
      const testRequestId = 'req-001'
      
      cy.visit(`/admin/${testRequestId}`)
      cy.wait(['@getAdminUser', '@getRequestDetails'])
      
      // Should see detailed request view with admin controls
      cy.get('[data-cy="request-detail"]').should('be.visible')
      cy.get('[data-cy="admin-controls"]').should('be.visible')
      cy.get('[data-cy="status-update-section"]').should('be.visible')
    })

    it('should show admin-specific navigation options', () => {
      cy.visit('/admin')
      cy.wait('@getAdminUser')
      
      // Check for admin navigation elements
      cy.get('[data-cy="top-navigation"]').should('be.visible')
      cy.get('[data-cy="admin-nav-links"]').should('be.visible')
      
      // Should have links to admin-specific sections
      cy.get('[data-cy="nav-all-requests"]').should('be.visible')
      cy.get('[data-cy="nav-dashboard"]').should('be.visible')
    })
  })

  describe('Requester Role Access Control', () => {
    beforeEach(() => {
      // Mock requester user session
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
      cy.mockUserSession({
        sub: 'auth0|requester-test-456',
        email: 'student@university.edu',
        name: 'Test Student User',
        roles: ['Requester'],
        nickname: 'teststudent',
        picture: 'https://gravatar.com/avatar/student.jpg'
      })
    })

    it('should allow requester access to home page with dashboard', () => {
      cy.mockApiResponses('sample')
      
      cy.visit('/')
      cy.wait(['@getRequesterUser', '@getRequests'])
      
      // Should remain on home page and see requester dashboard
      cy.url().should('not.include', '/admin')
      cy.get('[data-cy="dashboard"]').should('be.visible')
      cy.get('[data-cy="user-profile"]').should('contain.text', 'Test Student User')
    })

    it('should block requester access to admin routes', () => {
      const adminRoutes = ['/admin', '/admin/requests', '/admin/dashboard']
      
      adminRoutes.forEach(route => {
        cy.visit(route)
        cy.wait('@getRequesterUser')
        
        // Should be redirected away from admin routes or see unauthorized message
        cy.url().should('satisfy', (url: string) => {
          return !url.includes('/admin') || url.includes('/unauthorized')
        })
        
        // Should either see unauthorized message or be redirected
        cy.get('body').should('satisfy', ($body) => {
          return $body.find('[data-cy="unauthorized-message"]').length > 0 ||
                 $body.find('[data-cy="dashboard"]').length > 0
        })
      })
    })

    it('should allow requester to view their own requests', () => {
      cy.mockApiResponses('sample')
      
      cy.visit('/')
      cy.wait(['@getRequesterUser', '@getRequests'])
      
      // Should see their own requests in dashboard
      cy.get('[data-cy="dashboard"]').should('be.visible')
      cy.get('[data-cy="requests-list"]').should('be.visible')
      
      // Should not see admin-specific functionality
      cy.get('[data-cy="admin-actions"]').should('not.exist')
      cy.get('[data-cy="status-update-controls"]').should('not.exist')
    })

    it('should allow requester to create new requests', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Should access form to create new requests
      cy.get('[data-cy="request-form"]').should('be.visible')
      cy.get('[data-cy="form-137-fields"]').should('be.visible')
    })

    it('should allow requester to view their individual request details', () => {
      const testRequestId = 'req-001'
      
      cy.visit(`/dashboard/request/${testRequestId}`)
      cy.wait(['@getRequesterUser', '@getRequestDetails'])
      
      // Should see request details but without admin controls
      cy.get('[data-cy="request-detail"]').should('be.visible')
      cy.get('[data-cy="admin-controls"]').should('not.exist')
      cy.get('[data-cy="status-update-section"]').should('not.exist')
    })

    it('should show requester-specific navigation options', () => {
      cy.visit('/')
      cy.wait('@getRequesterUser')
      
      // Check for requester navigation elements
      cy.get('[data-cy="top-navigation"]').should('be.visible')
      
      // Should have links appropriate for requesters
      cy.get('[data-cy="nav-dashboard"]').should('be.visible')
      cy.get('[data-cy="nav-new-request"]').should('be.visible')
      
      // Should not have admin-specific navigation
      cy.get('[data-cy="admin-nav-links"]').should('not.exist')
      cy.get('[data-cy="nav-all-requests"]').should('not.exist')
    })
  })

  describe('No Roles/Unauthorized Users', () => {
    beforeEach(() => {
      // Mock user with no roles
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-no-roles.json' }).as('getUserNoRoles')
      cy.mockUserSession({
        sub: 'auth0|no-roles-test-789',
        email: 'noroles@university.edu',
        name: 'No Roles User',
        roles: [],
        nickname: 'noroles'
      })
    })

    it('should redirect users with no roles to unauthorized page', () => {
      cy.visit('/')
      cy.wait('@getUserNoRoles')
      
      // Should be redirected to unauthorized page
      cy.url().should('include', '/unauthorized')
      cy.get('[data-cy="unauthorized-message"]').should('be.visible')
      cy.get('[data-cy="unauthorized-message"]').should('contain.text', 'access')
    })

    it('should block access to all protected routes for users with no roles', () => {
      const protectedRoutes = ['/', '/admin', '/dashboard', '/request']
      
      protectedRoutes.forEach(route => {
        cy.visit(route)
        cy.wait('@getUserNoRoles')
        
        // Should redirect to unauthorized or show unauthorized message
        cy.get('[data-cy="unauthorized-message"], [data-cy="login-prompt"]').should('be.visible')
      })
    })

    it('should provide appropriate error messaging for unauthorized access', () => {
      cy.visit('/')
      cy.wait('@getUserNoRoles')
      
      cy.get('[data-cy="unauthorized-message"]').should('be.visible')
      cy.get('[data-cy="unauthorized-message"]').should('contain.text', 'authorized')
      
      // Should provide contact or help information
      cy.get('[data-cy="help-contact"]').should('be.visible')
    })
  })

  describe('Role Switching and Session Management', () => {
    it('should handle role changes during active session', () => {
      // Start as requester
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
      cy.mockUserSession({
        sub: 'auth0|role-switch-test',
        email: 'roleswitch@test.edu',
        name: 'Role Switch User',
        roles: ['Requester']
      })
      
      cy.visit('/')
      cy.wait('@getRequesterUser')
      cy.get('[data-cy="dashboard"]').should('be.visible')
      
      // Simulate role change to admin (this would happen after user role update in Auth0)
      cy.intercept('GET', '/api/auth/me', {
        sub: 'auth0|role-switch-test',
        email: 'roleswitch@test.edu',
        name: 'Role Switch User',
        roles: ['Admin']
      }).as('getUpdatedAdminUser')
      
      // Refresh to trigger role check
      cy.reload()
      cy.wait('@getUpdatedAdminUser')
      
      // Should now be redirected to admin dashboard
      cy.url().should('include', '/admin')
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
    })

    it('should handle multiple roles appropriately', () => {
      // User with both Admin and Requester roles
      cy.intercept('GET', '/api/auth/me', {
        sub: 'auth0|multi-role-test',
        email: 'multirole@test.edu',
        name: 'Multi Role User',
        roles: ['Admin', 'Requester']
      }).as('getMultiRoleUser')
      
      cy.mockUserSession({
        sub: 'auth0|multi-role-test',
        email: 'multirole@test.edu',
        name: 'Multi Role User',
        roles: ['Admin', 'Requester']
      })
      
      cy.visit('/')
      cy.wait('@getMultiRoleUser')
      
      // With multiple roles, admin should take precedence
      cy.url().should('include', '/admin')
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
    })
  })

  describe('Route Protection Edge Cases', () => {
    it('should handle malformed role data gracefully', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: {
          sub: 'auth0|malformed-roles',
          email: 'malformed@test.edu',
          name: 'Malformed User',
          roles: null // Malformed roles
        }
      }).as('getMalformedUser')
      
      cy.visit('/')
      cy.wait('@getMalformedUser')
      
      // Should handle gracefully - redirect to unauthorized or error page
      cy.url().should('satisfy', (url: string) => {
        return url.includes('/unauthorized') || url === Cypress.config().baseUrl + '/'
      })
    })

    it('should handle API errors during role verification', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getRoleVerificationError')
      
      cy.visit('/')
      cy.wait('@getRoleVerificationError')
      
      // Should show error state or fallback
      cy.get('[data-cy="error-message"], [data-cy="login-prompt"], [data-cy="loading"]').should('exist')
    })

    it('should respect middleware protection on direct route access', () => {
      // Test accessing admin routes directly without proper authentication
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('getUnauthenticatedUser')
      
      cy.visit('/admin')
      cy.wait('@getUnauthenticatedUser')
      
      // Should be redirected or blocked
      cy.url().should('not.include', '/admin')
      cy.get('[data-cy="admin-dashboard"]').should('not.exist')
    })

    it('should handle slow authentication responses during navigation', () => {
      cy.intercept('GET', '/api/auth/me', (req) => {
        req.reply((res) => {
          res.delay(3000) // 3 second delay
          res.send({ fixture: 'user-admin.json' })
        })
      }).as('getSlowAuthUser')
      
      cy.visit('/admin')
      
      // Should show loading state during slow auth
      cy.get('[data-cy="loading"], .animate-spin').should('be.visible')
      
      // Eventually should load admin content
      cy.wait('@getSlowAuthUser')
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
      cy.get('[data-cy="loading"], .animate-spin').should('not.exist')
    })
  })

  describe('Navigation and URL Handling', () => {
    it('should maintain proper URL state during role-based redirects', () => {
      // Admin user visiting home should redirect to /admin
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-admin.json' }).as('getAdminUser')
      cy.mockUserSession({
        sub: 'auth0|url-test-admin',
        email: 'urladmin@test.edu',
        name: 'URL Test Admin',
        roles: ['Admin']
      })
      
      cy.visit('/')
      cy.wait('@getAdminUser')
      
      cy.url().should('include', '/admin')
      
      // Browser navigation should work correctly
      cy.go('back')
      cy.url().should('include', '/admin') // Should redirect again
    })

    it('should handle deep linking to specific pages based on roles', () => {
      // Admin trying to access a specific admin page
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-admin.json' }).as('getAdminUser')
      cy.mockUserSession({
        sub: 'auth0|deeplink-admin',
        email: 'deeplink@test.edu',
        name: 'Deeplink Admin',
        roles: ['Admin']
      })
      
      const specificAdminRoute = '/admin/F137-2024-001'
      cy.visit(specificAdminRoute)
      cy.wait(['@getAdminUser', '@getRequestDetails'])
      
      // Should access the specific page directly
      cy.url().should('include', specificAdminRoute)
      cy.get('[data-cy="request-detail"]').should('be.visible')
    })
  })
})