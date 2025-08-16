#!/bin/bash
# Test script for Auth0 Client Credentials authentication in Cypress
# Usage: ./test-client-credentials.sh [test-file]

set -e

echo "🚀 Testing Auth0 Client Credentials Authentication in Cypress"
echo "=============================================================="

# Check if services are running
echo "📋 Checking services..."

# Check if Spring Boot API is running
if curl -s "http://localhost:8080/api/health/liveness" > /dev/null; then
    echo "✅ Spring Boot API is running on port 8080"
else
    echo "❌ Spring Boot API is not running. Please start with: ./gradlew bootRunDev"
    exit 1
fi

# Check if Next.js frontend is running
if curl -s "http://localhost:3000" > /dev/null; then
    echo "✅ Next.js frontend is running on port 3000"
else
    echo "❌ Next.js frontend is not running. Please start with: pnpm dev"
    exit 1
fi

# Test Auth0 client credentials authentication
echo "🔐 Testing Auth0 client credentials..."
AUTH_RESPONSE=$(curl -s --request POST \
  --url https://jasoncalalang.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id":"qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC",
    "client_secret":"OSUSqi319Jj3ek80o0Rv7ILqriTaTUcZqS2vwtJDQ_-OlgpT1RiRBx8iAWJfahlN",
    "audience":"https://form137.cspb.edu.ph/api",
    "grant_type":"client_credentials"
  }')

if echo "$AUTH_RESPONSE" | grep -q "access_token"; then
    echo "✅ Auth0 client credentials authentication successful"
    # Extract and display token info
    ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    EXPIRES_IN=$(echo "$AUTH_RESPONSE" | grep -o '"expires_in":[0-9]*' | cut -d':' -f2)
    echo "📝 Token expires in: ${EXPIRES_IN} seconds"
else
    echo "❌ Auth0 client credentials authentication failed"
    echo "Response: $AUTH_RESPONSE"
    exit 1
fi

# Test API access with token
echo "🔍 Testing API access with client credentials token..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8080/api/health/liveness")

if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ API access successful with client credentials token"
else
    echo "❌ API access failed. HTTP status: $API_RESPONSE"
    exit 1
fi

echo ""
echo "🧪 Running Cypress tests..."
echo "=========================="

# Determine which test to run
if [ -n "$1" ]; then
    TEST_SPEC="cypress/e2e/$1"
    echo "📁 Running specific test: $TEST_SPEC"
else
    TEST_SPEC="cypress/e2e/api/form-137-api-client-credentials.cy.ts"
    echo "📁 Running default client credentials test"
fi

# Set environment variables for the test
export CYPRESS_AUTH_METHOD="client_credentials"
export NODE_ENV="test"

# Run Cypress test
echo "🏃 Executing Cypress test..."
if npx cypress run --spec "$TEST_SPEC" --browser electron; then
    echo ""
    echo "✅ All tests passed successfully!"
    echo ""
    echo "📊 Test Results Summary:"
    echo "- Auth0 client credentials: ✅ Working"
    echo "- API authentication: ✅ Working"  
    echo "- Cypress integration: ✅ Working"
    echo ""
    echo "🎉 Your Auth0 client credentials setup is ready for E2E testing!"
else
    echo ""
    echo "❌ Some tests failed. Check the output above for details."
    echo ""
    echo "💡 Troubleshooting tips:"
    echo "- Verify Auth0 domain and credentials are correct"
    echo "- Ensure Spring Boot API is configured for JWT validation"
    echo "- Check that the audience matches your API identifier"
    echo "- Confirm CORS is properly configured"
    exit 1
fi

# Optional: Run integration test if successful
if [ -z "$1" ]; then
    echo ""
    read -p "🤔 Would you like to run the integration test as well? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Running integration test..."
        npx cypress run --spec "cypress/e2e/workflows/form-137-client-credentials-integration.cy.ts" --browser electron
    fi
fi

echo ""
echo "🎯 Next steps:"
echo "- Use 'cy.auth0ClientCredentials()' for API testing"
echo "- Use 'cy.authenticatedRequest()' for authenticated API calls"
echo "- Use 'cy.createForm137Request()' to set up test data"
echo "- Run tests with: npx cypress run --spec 'cypress/e2e/api/*'"
echo ""
echo "📖 Documentation: /cypress/README.md"