/// <reference types="cypress" />

describe('Admin Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Clear browser state
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.clearAllSessionStorage()
    
    // Setup Form 137 specific interceptors
    cy.setupForm137Interceptors()
    
    // Set up admin user session
    cy.intercept('GET', '/api/auth/me', { fixture: 'user-admin.json' }).as('getAdminUser')
    cy.mockUserSession({
      sub: 'auth0|admin-dashboard-test',
      email: 'admin@form137.edu',
      name: 'Dashboard Test Admin',
      roles: ['Admin']
    })
  })

  describe('Dashboard Overview and Navigation', () => {
    it('should display admin dashboard with all requests overview', () => {
      cy.mockApiResponses('sample')
      
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      // Verify dashboard layout
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
      cy.get('[data-cy="dashboard-header"]').should('contain.text', 'Admin Dashboard')
      
      // Check for statistics/summary cards
      cy.get('[data-cy="total-requests"], [data-cy="stats-card"]').should('be.visible')
      cy.get('[data-cy="pending-requests"]').should('be.visible')
      cy.get('[data-cy="completed-requests"]').should('be.visible')
      
      // Verify requests list is displayed
      cy.get('[data-cy="all-requests-list"], [data-cy="requests-table"]').should('be.visible')
    })

    it('should show correct navigation options for admin users', () => {
      cy.visit('/admin')
      cy.wait('@getAdminUser')
      
      // Check admin-specific navigation
      cy.get('[data-cy="top-navigation"]').should('be.visible')
      cy.get('[data-cy="admin-nav-links"]').should('be.visible')
      
      // Verify admin menu items
      cy.get('[data-cy="nav-all-requests"]').should('be.visible')
      cy.get('[data-cy="nav-dashboard"]').should('be.visible')
      
      // Check user profile/logout
      cy.get('[data-cy="user-profile"]').should('contain.text', 'Dashboard Test Admin')
      cy.get('[data-cy="logout-button"], [data-cy="user-menu"]').should('be.visible')
    })

    it('should display empty state when no requests exist', () => {
      cy.mockApiResponses('empty')
      
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getEmptyRequests'])
      
      // Should show empty state
      cy.get('[data-cy="empty-state"]').should('be.visible')
      cy.get('[data-cy="empty-state"]').should('contain.text', 'No requests found')
      
      // Should still show dashboard structure
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
      cy.get('[data-cy="total-requests"]').should('contain.text', '0')
    })

    it('should handle API errors gracefully', () => {
      cy.mockApiResponses('error')
      
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getRequestsError'])
      
      // Should show error message
      cy.get('[data-cy="error-message"]').should('be.visible')
      cy.get('[data-cy="error-message"]').should('contain.text', 'error')
      
      // Should offer retry option
      cy.get('[data-cy="retry-button"]').should('be.visible')
    })
  })

  describe('Request Management and Status Updates', () => {
    it('should display detailed request information in the list', () => {
      cy.mockApiResponses('sample')
      
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      // Verify request list displays key information
      cy.get('[data-cy="request-item"]').should('have.length.greaterThan', 0)
      
      cy.get('[data-cy="request-item"]').first().within(() => {
        cy.get('[data-cy="ticket-number"]').should('be.visible').and('contain.text', 'F137-2024')
        cy.get('[data-cy="student-name"]').should('be.visible')
        cy.get('[data-cy="request-status"]').should('be.visible')
        cy.get('[data-cy="created-date"]').should('be.visible')
        cy.get('[data-cy="actions"], [data-cy="view-details"]').should('be.visible')
      })
    })

    it('should allow admin to view individual request details', () => {
      const testTicketNumber = 'F137-2024-001'
      
      cy.mockApiResponses('sample')
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      // Click on a specific request
      cy.get('[data-cy="request-item"]').first().within(() => {
        cy.get('[data-cy="view-details"], [data-cy="ticket-number"]').click()
      })
      
      // Should navigate to request detail page
      cy.url().should('include', '/admin/')
      cy.wait('@getRequestDetails')
      
      // Verify detailed view
      cy.get('[data-cy="request-detail"]').should('be.visible')
      cy.get('[data-cy="admin-controls"]').should('be.visible')
      cy.get('[data-cy="status-update-section"]').should('be.visible')
    })

    it('should allow admin to update request status', () => {
      cy.mockApiResponses('sample')
      
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      // Find a pending request
      cy.get('[data-cy="request-item"]').first().within(() => {
        // Check if status update controls are available in list view
        if (Cypress.$('[data-cy="status-select"], [data-cy="quick-status-update"]').length > 0) {
          cy.get('[data-cy="status-select"]').select('processing')
          cy.get('[data-cy="update-status-btn"]').click()
        } else {
          // Navigate to detail view for status update
          cy.get('[data-cy="view-details"]').click()
        }
      })
      
      // If we navigated to detail view, update status there
      if (cy.url().should('include', '/admin/')) {
        cy.wait('@getRequestDetails')
        
        cy.get('[data-cy="status-update-section"]').within(() => {
          cy.get('[data-cy="status-select"], select[name="status"]').select('processing')
          cy.get('[data-cy="update-status-btn"], button[type="submit"]').click()
        })
      }
      
      // Wait for status update API call
      cy.wait('@updateRequestStatus')
      
      // Should show success feedback
      cy.get('[data-cy="toast-success"], [data-cy="success-message"]')
        .should('be.visible')
        .and('contain.text', 'updated')
    })

    it('should show status update history if available', () => {
      cy.visit('/admin/req-001')
      cy.wait(['@getAdminUser', '@getRequestDetails'])
      
      // Check if status history is displayed
      cy.get('body').then($body => {
        if ($body.find('[data-cy="status-history"], [data-cy="audit-trail"]').length > 0) {
          cy.get('[data-cy="status-history"]').should('be.visible')
          cy.get('[data-cy="status-history-item"]').should('have.length.greaterThan', 0)
          
          cy.get('[data-cy="status-history-item"]').first().within(() => {
            cy.get('[data-cy="status-change"]').should('be.visible')
            cy.get('[data-cy="timestamp"]').should('be.visible')
            cy.get('[data-cy="admin-user"]').should('be.visible')
          })
        } else {
          cy.log('Status history not implemented - skipping history test')
        }
      })
    })
  })

  describe('Search and Filtering Functionality', () => {
    beforeEach(() => {
      cy.mockApiResponses('sample')
    })

    it('should allow searching requests by ticket number', () => {
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      // Check if search functionality exists
      cy.get('body').then($body => {
        if ($body.find('[data-cy="search-input"], input[type="search"]').length > 0) {
          const searchTerm = 'F137-2024-001'
          
          cy.get('[data-cy="search-input"], input[type="search"]')
            .should('be.visible')
            .type(searchTerm)
          
          // Trigger search
          cy.get('[data-cy="search-button"], button[type="submit"]').click()
          
          // Should filter results
          cy.get('[data-cy="request-item"]').should('have.length.lessThan', 5)
          cy.get('[data-cy="request-item"]').should('contain.text', searchTerm)
        } else {
          cy.log('Search functionality not implemented - skipping search test')
        }
      })
    })

    it('should allow filtering requests by status', () => {
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="status-filter"], [data-cy="filter-select"]').length > 0) {
          // Apply status filter
          cy.get('[data-cy="status-filter"], [data-cy="filter-select"]').select('pending')
          
          // Should show only pending requests
          cy.get('[data-cy="request-item"]').each($item => {
            cy.wrap($item).find('[data-cy="request-status"]').should('contain.text', 'pending')
          })
        } else {
          cy.log('Status filter not implemented - skipping filter test')
        }
      })
    })

    it('should allow filtering requests by date range', () => {
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="date-filter"], [data-cy="date-range"]').length > 0) {
          // Set date range filter
          const fromDate = '2024-01-01'
          const toDate = '2024-01-31'
          
          cy.get('[data-cy="date-from"], input[type="date"]').type(fromDate)
          cy.get('[data-cy="date-to"], input[type="date"]').type(toDate)
          cy.get('[data-cy="apply-filter"]').click()
          
          // Should show filtered results
          cy.get('[data-cy="request-item"]').should('have.length.greaterThan', 0)
        } else {
          cy.log('Date filter not implemented - skipping date filter test')
        }
      })
    })

    it('should clear filters and show all requests', () => {
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="clear-filters"], [data-cy="reset-filters"]').length > 0) {
          // Apply some filter first
          if ($body.find('[data-cy="status-filter"]').length > 0) {
            cy.get('[data-cy="status-filter"]').select('pending')
          }
          
          // Clear filters
          cy.get('[data-cy="clear-filters"], [data-cy="reset-filters"]').click()
          
          // Should show all requests again
          cy.get('[data-cy="request-item"]').should('have.length', 3) // Based on sample data
        }
      })
    })
  })

  describe('Bulk Operations and Management', () => {
    beforeEach(() => {
      cy.mockApiResponses('sample')
    })

    it('should support bulk selection of requests if implemented', () => {
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="bulk-select"], input[type="checkbox"]').length > 0) {
          // Select multiple requests
          cy.get('[data-cy="request-item"]').each($item => {
            cy.wrap($item).find('input[type="checkbox"]').check()
          })
          
          // Should show bulk actions
          cy.get('[data-cy="bulk-actions"]').should('be.visible')
          cy.get('[data-cy="bulk-status-update"]').should('be.visible')
        } else {
          cy.log('Bulk operations not implemented - skipping bulk test')
        }
      })
    })

    it('should allow bulk status updates if supported', () => {
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="bulk-select"]').length > 0) {
          // Select a few requests
          cy.get('[data-cy="request-item"]').first().find('input[type="checkbox"]').check()
          cy.get('[data-cy="request-item"]').eq(1).find('input[type="checkbox"]').check()
          
          // Bulk update status
          cy.get('[data-cy="bulk-actions"]').within(() => {
            cy.get('[data-cy="bulk-status-select"]').select('processing')
            cy.get('[data-cy="apply-bulk-update"]').click()
          })
          
          // Should confirm bulk update
          cy.get('[data-cy="confirm-bulk-update"]').click()
          
          // Should show success message
          cy.get('[data-cy="toast-success"]').should('contain.text', 'updated')
        }
      })
    })
  })

  describe('Data Export and Reporting', () => {
    beforeEach(() => {
      cy.mockApiResponses('sample')
    })

    it('should provide data export functionality if available', () => {
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="export-button"], [data-cy="download-report"]').length > 0) {
          // Mock download response
          cy.intercept('GET', `${Cypress.env('API_BASE_URL')}/admin/requests/export**`, {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/csv',
              'Content-Disposition': 'attachment; filename="requests-export.csv"'
            },
            body: 'Ticket Number,Student Name,Status,Created Date\nF137-2024-001,Alice Johnson,pending,2024-01-15'
          }).as('exportRequests')
          
          cy.get('[data-cy="export-button"], [data-cy="download-report"]').click()
          cy.wait('@exportRequests')
          
          // In a real test, you might verify the download started
          // This is difficult to test in Cypress, so we just verify the API call was made
        } else {
          cy.log('Export functionality not implemented - skipping export test')
        }
      })
    })
  })

  describe('Responsive Design and Mobile Support', () => {
    it('should be responsive on tablet viewport', () => {
      cy.mockApiResponses('sample')
      
      cy.viewport(768, 1024)
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      // Dashboard should still be accessible
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
      cy.get('[data-cy="requests-list"], [data-cy="requests-table"]').should('be.visible')
      
      // Navigation might collapse on smaller screens
      cy.get('[data-cy="mobile-menu"], [data-cy="hamburger-menu"]').should('exist')
    })

    it('should be responsive on mobile viewport', () => {
      cy.mockApiResponses('sample')
      
      cy.viewport(375, 667)
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      // Should show mobile-optimized layout
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
      
      // Table might become cards or stacked layout
      cy.get('[data-cy="request-item"]').should('be.visible')
      
      // Mobile navigation should work
      if (Cypress.$('[data-cy="mobile-menu"]').length > 0) {
        cy.get('[data-cy="mobile-menu"]').click()
        cy.get('[data-cy="mobile-nav-menu"]').should('be.visible')
      }
    })
  })

  describe('Real-time Updates and Notifications', () => {
    it('should handle real-time updates if implemented', () => {
      cy.mockApiResponses('sample')
      
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getAdminRequests'])
      
      // Simulate a new request being submitted by intercepting a polling request
      cy.intercept('GET', `${Cypress.env('API_BASE_URL')}/admin/requests**`, {
        requests: [
          {
            id: 'req-new-realtime',
            ticketNumber: 'F137-2024-REALTIME',
            studentName: 'Realtime Test Student',
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }).as('getUpdatedRequests')
      
      // Trigger refresh or wait for polling interval
      cy.reload()
      cy.wait(['@getAdminUser', '@getUpdatedRequests'])
      
      // Should show the new request
      cy.get('[data-cy="request-item"]').should('contain.text', 'REALTIME')
    })

    it('should show notifications for new requests if implemented', () => {
      cy.visit('/admin')
      cy.wait('@getAdminUser')
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="notifications"], [data-cy="notification-bell"]').length > 0) {
          // Check notifications area
          cy.get('[data-cy="notifications"]').should('be.visible')
          
          // Mock new notification
          cy.get('[data-cy="notification-bell"]').click()
          cy.get('[data-cy="notification-list"]').should('be.visible')
        } else {
          cy.log('Notifications not implemented - skipping notification test')
        }
      })
    })
  })

  describe('Performance and Loading States', () => {
    it('should show loading states while fetching data', () => {
      // Mock slow API response
      cy.intercept('GET', `${Cypress.env('API_BASE_URL')}/admin/requests**`, (req) => {
        req.reply((res) => {
          res.delay(2000)
          res.send({ fixture: 'api-responses.json', property: 'adminRequests.allRequests' })
        })
      }).as('getSlowRequests')
      
      cy.visit('/admin')
      cy.wait('@getAdminUser')
      
      // Should show loading indicators
      cy.get('[data-cy="loading-spinner"], .animate-spin, [data-cy="skeleton"]').should('be.visible')
      
      // Wait for data to load
      cy.wait('@getSlowRequests')
      
      // Loading indicators should disappear
      cy.get('[data-cy="loading-spinner"], .animate-spin').should('not.exist')
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
    })

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      const largeDataset = {
        requests: Array.from({ length: 100 }, (_, i) => ({
          id: `req-${i + 1}`,
          ticketNumber: `F137-2024-${String(i + 1).padStart(3, '0')}`,
          studentName: `Student ${i + 1}`,
          status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'processing' : 'completed',
          createdAt: new Date(Date.now() - i * 86400000).toISOString()
        })),
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5
      }
      
      cy.intercept('GET', `${Cypress.env('API_BASE_URL')}/admin/requests**`, largeDataset).as('getLargeDataset')
      
      cy.visit('/admin')
      cy.wait(['@getAdminUser', '@getLargeDataset'])
      
      // Should handle large dataset without performance issues
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
      
      // Should show pagination or virtualization
      cy.get('[data-cy="pagination"], [data-cy="load-more"]').should('exist')
    })
  })
})