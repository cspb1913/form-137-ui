#!/bin/bash

# Enhanced Cypress Test Execution Script
# Runs comprehensive Auth0 authentication and Form 137 workflow tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate environment
validate_environment() {
    print_status "Validating test environment..."
    
    # Check if Node.js is installed
    if ! command_exists node; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if pnpm is installed
    if ! command_exists pnpm; then
        print_error "pnpm is not installed"
        exit 1
    fi
    
    # Check if Cypress is installed
    if ! command_exists cypress; then
        print_warning "Cypress CLI not found globally, will use local version"
    fi
    
    # Validate required environment variables
    if [ -f "cypress.env.json" ]; then
        print_success "cypress.env.json found"
    else
        print_warning "cypress.env.json not found, using default configuration"
    fi
    
    # Check if API is accessible
    if [ -n "$API_BASE_URL" ]; then
        print_status "Testing API connectivity..."
        if curl -s -f "${API_BASE_URL}/health/liveness" > /dev/null 2>&1; then
            print_success "API is accessible"
        else
            print_warning "API may not be accessible at ${API_BASE_URL}"
        fi
    fi
    
    print_success "Environment validation completed"
}

# Function to run specific test category
run_test_category() {
    local category=$1
    local spec_pattern=$2
    local description=$3
    
    print_status "Running $description..."
    
    if npx cypress run --spec "$spec_pattern" --reporter json --reporter-options "reportDir=cypress/results,reportFilename=${category}-results.json"; then
        print_success "$description completed successfully"
        return 0
    else
        print_error "$description failed"
        return 1
    fi
}

# Function to generate test report
generate_report() {
    print_status "Generating comprehensive test report..."
    
    cat > cypress/results/test-summary.md << EOF
# Enhanced Cypress Test Results Summary

Generated on: $(date)

## Test Categories Executed

### 1. Auth0 Security Tests
- **File**: \`auth0-security-comprehensive.cy.ts\`
- **Purpose**: Comprehensive Auth0 security validation including JWT token security, RBAC testing, and API security
- **Status**: $([ -f "cypress/results/security-results.json" ] && echo "✅ Completed" || echo "❌ Failed")

### 2. Role-Based Access Control Tests
- **File**: \`role-based-routing.cy.ts\`
- **Purpose**: Enhanced RBAC validation, privilege escalation prevention, and session integrity
- **Status**: $([ -f "cypress/results/rbac-results.json" ] && echo "✅ Completed" || echo "❌ Failed")

### 3. API Integration Tests
- **File**: \`enhanced-api-integration.cy.ts\`
- **Purpose**: JWT token integration with Spring Boot, API security, and performance testing
- **Status**: $([ -f "cypress/results/api-results.json" ] && echo "✅ Completed" || echo "❌ Failed")

### 4. Form 137 Lifecycle Tests
- **File**: \`comprehensive-form137-lifecycle.cy.ts\`
- **Purpose**: Complete workflow testing from request creation to completion with cross-role integration
- **Status**: $([ -f "cypress/results/lifecycle-results.json" ] && echo "✅ Completed" || echo "❌ Failed")

### 5. Authentication Tests
- **File**: \`authentication.cy.ts\`
- **Purpose**: Core authentication flows, session management, and error handling
- **Status**: $([ -f "cypress/results/auth-results.json" ] && echo "✅ Completed" || echo "❌ Failed")

## Configuration

- **Auth0 Domain**: ${AUTH0_DOMAIN:-"jasoncalalang.auth0.com"}
- **API Base URL**: ${API_BASE_URL:-"http://localhost:8080/api"}
- **Test Environment**: ${NODE_ENV:-"test"}

## Next Steps

1. Review individual test results in the \`cypress/results/\` directory
2. Check any failed tests and review error logs
3. Verify Auth0 configuration if authentication tests failed
4. Ensure API connectivity if integration tests failed

EOF

    print_success "Test report generated: cypress/results/test-summary.md"
}

# Main execution function
main() {
    local test_type=${1:-"all"}
    local test_mode=${2:-"auto"}
    local failed_tests=0
    
    # Determine if we're in dev mode
    local is_dev_mode=false
    if [ "$test_mode" = "dev" ] || [ "$NEXT_PUBLIC_DEV_MODE" = "true" ] || [ "$CYPRESS_DEV_MODE" = "true" ]; then
        is_dev_mode=true
        export NEXT_PUBLIC_DEV_MODE=true
        export CYPRESS_DEV_MODE=true
    elif [ "$test_mode" = "prod" ]; then
        is_dev_mode=false
        export NEXT_PUBLIC_DEV_MODE=false
        export CYPRESS_DEV_MODE=false
    elif [ "$test_mode" = "auto" ]; then
        # Auto-detect based on environment
        if [ -f ".env.local" ] && grep -q "NEXT_PUBLIC_DEV_MODE=true" .env.local; then
            is_dev_mode=true
            export NEXT_PUBLIC_DEV_MODE=true
            export CYPRESS_DEV_MODE=true
        fi
    fi
    
    local mode_text="PRODUCTION"
    if [ "$is_dev_mode" = true ]; then
        mode_text="DEVELOPMENT"
    fi
    
    print_status "Starting Enhanced Cypress Test Suite"
    print_status "Test Type: $test_type"
    print_status "Test Mode: $mode_text"
    
    # Create results directory
    mkdir -p cypress/results
    
    # Validate environment
    validate_environment
    
    case $test_type in
        "security")
            if [ "$is_dev_mode" = true ]; then
                print_warning "Skipping security tests in development mode"
            else
                run_test_category "security" "cypress/e2e/security/auth0-security-comprehensive.cy.ts" "Auth0 Security Tests" || ((failed_tests++))
            fi
            ;;
        "rbac")
            if [ "$is_dev_mode" = true ]; then
                print_warning "Skipping RBAC tests in development mode"
            else
                run_test_category "rbac" "cypress/e2e/auth/role-based-routing.cy.ts" "Role-Based Access Control Tests" || ((failed_tests++))
            fi
            ;;
        "api")
            if [ "$is_dev_mode" = true ]; then
                run_test_category "dev-api" "cypress/e2e/dev/dev-api-testing.cy.ts" "Development API Testing" || ((failed_tests++))
            else
                run_test_category "api" "cypress/e2e/api/enhanced-api-integration.cy.ts" "Enhanced API Integration Tests" || ((failed_tests++))
            fi
            ;;
        "lifecycle")
            if [ "$is_dev_mode" = true ]; then
                print_warning "Skipping lifecycle tests in development mode (use smoke tests instead)"
            else
                run_test_category "lifecycle" "cypress/e2e/workflows/comprehensive-form137-lifecycle.cy.ts" "Form 137 Lifecycle Tests" || ((failed_tests++))
            fi
            ;;
        "auth")
            if [ "$is_dev_mode" = true ]; then
                run_test_category "dev-auth" "cypress/e2e/dev/dev-auth-simulation.cy.ts" "Development Authentication Simulation" || ((failed_tests++))
            else
                run_test_category "auth" "cypress/e2e/auth/authentication.cy.ts" "Authentication Tests" || ((failed_tests++))
            fi
            ;;
        "dev")
            if [ "$is_dev_mode" = true ]; then
                run_test_category "dev-functionality" "cypress/e2e/dev/dev-mode-functionality.cy.ts" "Development Mode Functionality" || ((failed_tests++))
                run_test_category "dev-auth" "cypress/e2e/dev/dev-auth-simulation.cy.ts" "Development Authentication Simulation" || ((failed_tests++))
                run_test_category "dev-api" "cypress/e2e/dev/dev-api-testing.cy.ts" "Development API Testing" || ((failed_tests++))
            else
                print_error "Dev tests can only run in development mode. Set test_mode to 'dev' or NEXT_PUBLIC_DEV_MODE=true"
                ((failed_tests++))
            fi
            ;;
        "smoke")
            run_test_category "smoke" "cypress/e2e/basic-smoke.cy.ts" "Basic Smoke Tests" || ((failed_tests++))
            ;;
        "all")
            if [ "$is_dev_mode" = true ]; then
                print_status "Running all development test categories..."
                
                # Run Development Mode Functionality Tests
                run_test_category "dev-functionality" "cypress/e2e/dev/dev-mode-functionality.cy.ts" "Development Mode Functionality" || ((failed_tests++))
                
                # Run Development Authentication Simulation
                run_test_category "dev-auth" "cypress/e2e/dev/dev-auth-simulation.cy.ts" "Development Authentication Simulation" || ((failed_tests++))
                
                # Run Development API Testing
                run_test_category "dev-api" "cypress/e2e/dev/dev-api-testing.cy.ts" "Development API Testing" || ((failed_tests++))
                
                # Run Basic Smoke Tests
                run_test_category "smoke" "cypress/e2e/basic-smoke.cy.ts" "Basic Smoke Tests" || ((failed_tests++))
                
                # Run App Functionality Tests
                run_test_category "app-functionality" "cypress/e2e/app-functionality.cy.ts" "App Functionality Tests" || ((failed_tests++))
            else
                print_status "Running all production test categories..."
                
                # Run Auth0 Security Tests
                run_test_category "security" "cypress/e2e/security/auth0-security-comprehensive.cy.ts" "Auth0 Security Tests" || ((failed_tests++))
                
                # Run Role-Based Access Control Tests
                run_test_category "rbac" "cypress/e2e/auth/role-based-routing.cy.ts" "Role-Based Access Control Tests" || ((failed_tests++))
                
                # Run API Integration Tests
                run_test_category "api" "cypress/e2e/api/enhanced-api-integration.cy.ts" "Enhanced API Integration Tests" || ((failed_tests++))
                
                # Run Form 137 Lifecycle Tests
                run_test_category "lifecycle" "cypress/e2e/workflows/comprehensive-form137-lifecycle.cy.ts" "Form 137 Lifecycle Tests" || ((failed_tests++))
                
                # Run Authentication Tests
                run_test_category "auth" "cypress/e2e/auth/authentication.cy.ts" "Authentication Tests" || ((failed_tests++))
            fi
            ;;
        *)
            print_error "Unknown test type: $test_type"
            print_status "Available test types: security, rbac, api, lifecycle, auth, dev, smoke, all"
            print_status "Usage: $0 [test_type] [mode]"
            print_status "Modes: auto (default), dev, prod"
            exit 1
            ;;
    esac
    
    # Generate report
    generate_report
    
    # Summary
    if [ $failed_tests -eq 0 ]; then
        print_success "All test categories completed successfully!"
        exit 0
    else
        print_error "$failed_tests test category(ies) failed"
        print_status "Check individual test results in cypress/results/ for details"
        exit 1
    fi
}

# Help function
show_help() {
    cat << EOF
Enhanced Cypress Test Runner for Form 137 Portal

USAGE:
    $0 [test_type] [mode]

TEST TYPES:
    security    - Run Auth0 security and JWT validation tests (prod mode only)
    rbac        - Run role-based access control tests (prod mode only)
    api         - Run API integration tests (dev: local API, prod: full API)
    lifecycle   - Run complete Form 137 lifecycle tests (prod mode only)
    auth        - Run authentication tests (dev: mock auth, prod: real Auth0)
    dev         - Run development-specific tests (dev mode only)
    smoke       - Run basic smoke tests (both modes)
    all         - Run all test categories appropriate for the mode (default)

MODES:
    auto        - Auto-detect based on environment variables (default)
    dev         - Force development mode (mocked auth, local API)
    prod        - Force production mode (real Auth0, full test suite)

EXAMPLES:
    $0                   # Run all tests (auto-detect mode)
    $0 all dev          # Run all development tests
    $0 all prod         # Run all production tests
    $0 security prod    # Run only security tests in production mode
    $0 dev dev          # Run only development-specific tests
    $0 smoke auto       # Run smoke tests (works in both modes)

ENVIRONMENT VARIABLES:
    AUTH0_DOMAIN              - Auth0 domain (default: jasoncalalang.auth0.com)
    AUTH0_CLIENT_ID           - Auth0 client ID
    AUTH0_CLIENT_SECRET       - Auth0 client secret
    AUTH0_AUDIENCE            - Auth0 API audience
    API_BASE_URL              - API base URL (default: http://localhost:8080/api)
    AUTH0_ADMIN_USERNAME      - Admin user for testing
    AUTH0_ADMIN_PASSWORD      - Admin password for testing
    AUTH0_REQUESTER_USERNAME  - Requester user for testing
    AUTH0_REQUESTER_PASSWORD  - Requester password for testing

CONFIGURATION:
    Configuration should be set in cypress.env.json or environment variables.
    See cypress/README.md for detailed configuration instructions.

EOF
}

# Check for help flag
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Run main function with up to 2 parameters
main "${1:-all}" "${2:-auto}"