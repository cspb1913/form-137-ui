/**
 * Form 137 Integration Tests - Client Credentials + UI Testing
 * 
 * This test suite demonstrates how to combine client credentials for API setup
 * with UI testing for end-to-end workflow validation
 */

describe('Form 137 Integration - Client Credentials + UI', () => {
  let testRequestData: any;
  let createdTicketNumber: string;

  before(() => {
    // Setup test data using API (client credentials)
    cy.createForm137Request({
      studentId: 'INTEGRATION-TEST-' + Date.now(),
      requestPurpose: 'Transfer to another school',
      urgencyLevel: 'REGULAR',
      additionalNotes: 'Integration test - created via API, tested via UI'
    }).then((response) => {
      testRequestData = response.body;
      createdTicketNumber = response.body.ticketNumber;
      cy.log(`Test request created: ${createdTicketNumber}`);
    });
  });

  describe('Admin Dashboard Integration', () => {
    beforeEach(() => {
      // Set up user session for UI testing
      cy.auth0LoginAndSetSession({
        username: Cypress.env('AUTH0_ADMIN_USERNAME'),
        password: Cypress.env('AUTH0_ADMIN_PASSWORD')
      });
    });

    it('should display API-created request in admin dashboard', () => {
      cy.visit('/admin');
      
      // Wait for the page to load and verify authentication
      cy.contains('Admin Dashboard').should('be.visible');
      
      // Search for our test request
      cy.get('[data-testid="search-input"]', { timeout: 10000 })
        .should('be.visible')
        .type(createdTicketNumber);
      
      // Verify the request appears in the list
      cy.get('[data-testid="request-list"]')
        .should('contain', createdTicketNumber)
        .should('contain', testRequestData.studentId);
    });

    it('should allow status updates via UI that reflect in API', () => {
      cy.visit(`/admin/${createdTicketNumber}`);
      
      // Update status via UI
      cy.get('[data-testid="status-select"]', { timeout: 10000 })
        .should('be.visible')
        .select('IN_PROGRESS');
      
      cy.get('[data-testid="status-notes"]')
        .type('Updated via UI integration test');
      
      cy.get('[data-testid="update-status-btn"]')
        .click();
      
      // Verify success message
      cy.get('[data-testid="success-message"]', { timeout: 5000 })
        .should('be.visible')
        .should('contain', 'Status updated successfully');
      
      // Verify via API that the change persisted
      cy.authenticatedRequest({
        method: 'GET',
        url: `${Cypress.env('API_BASE_URL')}/form137/requests/${createdTicketNumber}`
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal('IN_PROGRESS');
        expect(response.body.statusHistory).to.have.length.greaterThan(1);
      });
    });
  });

  describe('Student Dashboard Integration', () => {
    beforeEach(() => {
      // Set up student user session
      cy.auth0LoginAndSetSession({
        username: Cypress.env('AUTH0_REQUESTER_USERNAME'),
        password: Cypress.env('AUTH0_REQUESTER_PASSWORD')
      });
    });

    it('should create request via UI and verify via API', () => {
      cy.visit('/request');
      
      const newRequestData = {
        studentId: 'UI-TEST-' + Date.now(),
        purpose: 'Employment application',
        urgency: 'URGENT'
      };
      
      // Fill out the form
      cy.get('[data-testid="student-id-input"]', { timeout: 10000 })
        .should('be.visible')
        .type(newRequestData.studentId);
      
      cy.get('[data-testid="purpose-select"]')
        .select(newRequestData.purpose);
      
      cy.get('[data-testid="urgency-select"]')
        .select(newRequestData.urgency);
      
      cy.get('[data-testid="submit-request-btn"]')
        .click();
      
      // Verify success page
      cy.url().should('include', '/success');
      cy.get('[data-testid="ticket-number"]', { timeout: 10000 })
        .should('be.visible')
        .invoke('text')
        .then((ticketNumber) => {
          // Verify the request was created in the backend
          cy.authenticatedRequest({
            method: 'GET',
            url: `${Cypress.env('API_BASE_URL')}/form137/requests/${ticketNumber}`
          }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.studentId).to.equal(newRequestData.studentId);
            expect(response.body.status).to.equal('PENDING');
          });
        });
    });

    it('should display request status updates in real-time', () => {
      // First, update status via API
      cy.updateForm137Status(createdTicketNumber, 'READY_FOR_PICKUP', 'Document ready - API update')
        .then(() => {
          // Visit dashboard to see the update
          cy.visit('/dashboard');
          
          // Search for our request
          cy.get('[data-testid="my-requests"]', { timeout: 10000 })
            .should('be.visible')
            .should('contain', createdTicketNumber);
          
          // Click on the request to view details
          cy.get(`[data-testid="request-${createdTicketNumber}"]`)
            .click();
          
          // Verify status is updated
          cy.get('[data-testid="request-status"]')
            .should('contain', 'Ready for Pickup');
          
          cy.get('[data-testid="status-history"]')
            .should('contain', 'Document ready - API update');
        });
    });
  });

  describe('Cross-Browser Data Consistency', () => {
    it('should maintain data consistency between API and UI operations', () => {
      // Step 1: Create request via API
      cy.createForm137Request({
        studentId: 'CONSISTENCY-TEST-' + Date.now(),
        requestPurpose: 'Graduate school application',
        urgencyLevel: 'URGENT'
      }).then((apiResponse) => {
        const apiTicket = apiResponse.body.ticketNumber;
        
        // Step 2: View in UI (admin)
        cy.auth0LoginAndSetSession({
          username: Cypress.env('AUTH0_ADMIN_USERNAME'),
          password: Cypress.env('AUTH0_ADMIN_PASSWORD')
        });
        
        cy.visit(`/admin/${apiTicket}`);
        
        // Verify UI shows correct data
        cy.get('[data-testid="ticket-number"]', { timeout: 10000 })
          .should('contain', apiTicket);
        
        cy.get('[data-testid="student-id"]')
          .should('contain', apiResponse.body.studentId);
        
        // Step 3: Update via UI
        cy.get('[data-testid="status-select"]')
          .select('IN_PROGRESS');
        
        cy.get('[data-testid="update-status-btn"]')
          .click();
        
        // Step 4: Verify via API
        cy.authenticatedRequest({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}/form137/requests/${apiTicket}`
        }).then((verifyResponse) => {
          expect(verifyResponse.body.status).to.equal('IN_PROGRESS');
          expect(verifyResponse.body.ticketNumber).to.equal(apiTicket);
        });
      });
    });
  });

  describe('Performance Integration Tests', () => {
    it('should handle bulk operations efficiently', () => {
      const bulkRequests = [];
      
      // Create 3 requests via API
      for (let i = 0; i < 3; i++) {
        bulkRequests.push(
          cy.createForm137Request({
            studentId: `BULK-TEST-${i}-${Date.now()}`,
            requestPurpose: 'Bulk testing',
            urgencyLevel: 'REGULAR'
          })
        );
      }
      
      // Wait for all requests to complete
      cy.wrap(Promise.all(bulkRequests)).then((responses) => {
        expect(responses).to.have.length(3);
        responses.forEach((response) => {
          expect(response.status).to.equal(201);
        });
        
        // Verify all appear in UI
        cy.auth0LoginAndSetSession({
          username: Cypress.env('AUTH0_ADMIN_USERNAME'),
          password: Cypress.env('AUTH0_ADMIN_PASSWORD')
        });
        
        cy.visit('/admin');
        
        responses.forEach((response) => {
          cy.get('[data-testid="request-list"]')
            .should('contain', response.body.ticketNumber);
        });
      });
    });
  });

  after(() => {
    // Cleanup: Update test request status to indicate test completion
    if (createdTicketNumber) {
      cy.updateForm137Status(
        createdTicketNumber, 
        'COMPLETED', 
        'Integration test completed - safe to delete'
      );
    }
    
    cy.clearTokenCache();
  });
});