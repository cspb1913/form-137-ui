#!/bin/bash

# Auth0 Password Grant Debugging Script
# This script tests various aspects of the password grant flow

# Configuration
AUTH0_DOMAIN="jasoncalalang.auth0.com"
CLIENT_ID="qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC"
USERNAME="jason@cspb.edu.ph"
PASSWORD="2025@CSPB"

echo "🔍 Auth0 Password Grant Debugging"
echo "=================================="
echo "Domain: $AUTH0_DOMAIN"
echo "Client ID: $CLIENT_ID"
echo "Username: $USERNAME"
echo ""

# Test 1: Basic Password Grant
echo "📝 Test 1: Basic Password Grant Request"
echo "----------------------------------------"
response1=$(curl -s -X POST "https://$AUTH0_DOMAIN/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=$USERNAME&password=$PASSWORD&client_id=$CLIENT_ID")

echo "Response: $response1"
echo ""

# Test 2: Password Grant with Scope
echo "📝 Test 2: Password Grant with Scope"
echo "-------------------------------------"
response2=$(curl -s -X POST "https://$AUTH0_DOMAIN/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=$USERNAME&password=$PASSWORD&client_id=$CLIENT_ID&scope=openid profile email")

echo "Response: $response2"
echo ""

# Test 3: Check if client supports password grant
echo "📝 Test 3: Application Configuration Check"
echo "------------------------------------------"
echo "To manually verify:"
echo "1. Go to https://manage.auth0.com/dashboard"
echo "2. Navigate to Applications > Your App > Settings"
echo "3. Check 'Application Type' - should NOT be 'Single Page Application'"
echo "4. Scroll to 'Advanced Settings > Grant Types'"
echo "5. Ensure 'Password' is checked"
echo ""

# Test 4: Tenant-level grant types
echo "📝 Test 4: Tenant-Level Configuration Check"
echo "--------------------------------------------"
echo "To manually verify:"
echo "1. Go to https://manage.auth0.com/dashboard"
echo "2. Navigate to Settings > Advanced"
echo "3. Check 'Grant Types' section"
echo "4. Ensure 'Password' is enabled at tenant level"
echo ""

# Test 5: Database connection check
echo "📝 Test 5: Database Connection Check"
echo "------------------------------------"
echo "To manually verify:"
echo "1. Go to Authentication > Database > Username-Password-Authentication"
echo "2. Click on the connection name"
echo "3. Go to 'Applications' tab"
echo "4. Ensure your application '$CLIENT_ID' is enabled"
echo ""

# Test 6: Alternative authentication test (if you have client secret)
echo "📝 Test 6: Client Credentials Test (if client secret available)"
echo "---------------------------------------------------------------"
echo "If you have a client secret, test with:"
echo "curl -X POST 'https://$AUTH0_DOMAIN/oauth/token' \\"
echo "  -H 'Content-Type: application/x-www-form-urlencoded' \\"
echo "  -d 'grant_type=client_credentials&client_id=$CLIENT_ID&client_secret=YOUR_SECRET&audience=https://$AUTH0_DOMAIN/api/v2/'"
echo ""

# Test 7: Check for common error patterns
echo "📝 Test 7: Error Analysis"
echo "-------------------------"
if echo "$response1" | grep -q "access_denied"; then
    echo "❌ ACCESS DENIED detected. Common causes:"
    echo "   - Tenant-level password grant not enabled"
    echo "   - Application type is Single Page Application"
    echo "   - Database connection not linked to application"
    echo "   - User account issues (blocked, unverified, etc.)"
elif echo "$response1" | grep -q "invalid_grant"; then
    echo "❌ INVALID GRANT detected. Common causes:"
    echo "   - Incorrect username/password"
    echo "   - Password grant not enabled for this application"
elif echo "$response1" | grep -q "unauthorized_client"; then
    echo "❌ UNAUTHORIZED CLIENT detected. Common causes:"
    echo "   - Client not configured for password grant"
    echo "   - Application type incompatible with password grant"
else
    echo "✅ Response received. Check above for details."
fi
echo ""

echo "🔧 Next Steps Based on Error:"
echo "=============================="
echo "1. If 'access_denied': Check tenant-level password grant settings"
echo "2. If 'unauthorized_client': Verify application grant type configuration" 
echo "3. If 'invalid_grant': Verify username/password and user status"
echo "4. If successful but unexpected: Check token contents and scopes"