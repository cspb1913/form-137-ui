#!/bin/bash

# Auth0 Configuration Verification Script
echo "🔧 Auth0 Configuration Verification"
echo "===================================="
echo ""

# Test with different content types
echo "📝 Testing different request formats..."
echo ""

# Test 1: Standard form-encoded
echo "Test 1: Form-encoded request"
curl -s -X POST "https://jasoncalalang.auth0.com/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=jason@cspb.edu.ph&password=2025@CSPB&client_id=qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC" | jq '.' 2>/dev/null || echo "Response not JSON or jq not available"
echo ""

# Test 2: With audience parameter
echo "Test 2: With audience parameter"
curl -s -X POST "https://jasoncalalang.auth0.com/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=jason@cspb.edu.ph&password=2025@CSPB&client_id=qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC&audience=https://jasoncalalang.auth0.com/api/v2/" | jq '.' 2>/dev/null || echo "Response not JSON"
echo ""

# Test 3: Check if client_secret is required (might be M2M app)
echo "Test 3: Testing if this is a Machine-to-Machine app requiring client_secret"
echo "If your app is M2M, you'll need to use client_credentials grant instead:"
echo ""
echo "curl -X POST 'https://jasoncalalang.auth0.com/oauth/token' \\"
echo "  -H 'Content-Type: application/x-www-form-urlencoded' \\"
echo "  -d 'grant_type=client_credentials&client_id=qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC&client_secret=YOUR_CLIENT_SECRET&audience=https://jasoncalalang.auth0.com/api/v2/'"
echo ""

# Test 4: Test with connection parameter
echo "Test 4: Explicitly specifying database connection"
curl -s -X POST "https://jasoncalalang.auth0.com/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=jason@cspb.edu.ph&password=2025@CSPB&client_id=qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC&connection=Username-Password-Authentication" | jq '.' 2>/dev/null || echo "Response not JSON"
echo ""

echo "🎯 Critical Checklist:"
echo "======================"
echo "1. ✅ User exists and is verified (confirmed from your data)"
echo "2. ❓ Tenant-level password grant enabled (Settings > Advanced > Grant Types)"
echo "3. ❓ Application type is NOT Single Page Application"
echo "4. ❓ Database connection enabled for this application"
echo "5. ❓ Application grant types include 'Password'"
echo ""
echo "🚨 Most Common Fix:"
echo "Go to Settings > Advanced > Grant Types and enable 'Password' at tenant level"