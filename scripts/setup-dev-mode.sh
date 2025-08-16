#!/bin/bash

# Development Mode Setup Script
# This script helps set up the Form 137 application for local development

set -e

echo "🔧 Form 137 Development Mode Setup"
echo "=================================="

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "📄 Found existing .env.local file"
    read -p "Do you want to backup and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.local .env.local.backup
        echo "✅ Backed up existing .env.local to .env.local.backup"
    else
        echo "ℹ️  Using existing .env.local file"
        exit 0
    fi
fi

# Copy example file if it doesn't exist
if [ ! -f ".env.local" ]; then
    if [ -f ".env.development.example" ]; then
        cp .env.development.example .env.local
        echo "✅ Created .env.local from .env.development.example"
    else
        echo "❌ .env.development.example not found"
        exit 1
    fi
fi

# Prompt for development mode configuration
echo ""
echo "🔧 Development Mode Configuration"
echo "--------------------------------"

read -p "Enable development mode (bypass Auth0)? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    DEV_MODE="false"
    echo "🔐 Development mode disabled - will use real Auth0"
else
    DEV_MODE="true"
    echo "🔧 Development mode enabled - Auth0 will be bypassed"
    
    # Configure development user
    echo ""
    echo "👤 Development User Configuration"
    echo "--------------------------------"
    
    read -p "User name (default: Development User): " DEV_NAME
    DEV_NAME=${DEV_NAME:-"Development User"}
    
    read -p "User email (default: dev@example.com): " DEV_EMAIL
    DEV_EMAIL=${DEV_EMAIL:-"dev@example.com"}
    
    echo "Select user role:"
    echo "1) Admin (full access)"
    echo "2) Requester (submit and view own requests)"
    read -p "Choice (1-2, default: 1): " -n 1 -r
    echo
    case $REPLY in
        2) DEV_ROLE="Requester" ;;
        *) DEV_ROLE="Admin" ;;
    esac
    
    echo "✅ User configured: $DEV_NAME ($DEV_EMAIL) as $DEV_ROLE"
fi

# Update .env.local file
echo ""
echo "📝 Updating .env.local file..."

# Use sed to update the file (cross-platform approach)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/^NEXT_PUBLIC_DEV_MODE=.*/NEXT_PUBLIC_DEV_MODE=$DEV_MODE/" .env.local
    if [ "$DEV_MODE" = "true" ]; then
        sed -i '' "s/^NEXT_PUBLIC_DEV_USER_EMAIL=.*/NEXT_PUBLIC_DEV_USER_EMAIL=$DEV_EMAIL/" .env.local
        sed -i '' "s/^NEXT_PUBLIC_DEV_USER_NAME=.*/NEXT_PUBLIC_DEV_USER_NAME=$DEV_NAME/" .env.local
        sed -i '' "s/^NEXT_PUBLIC_DEV_USER_ROLE=.*/NEXT_PUBLIC_DEV_USER_ROLE=$DEV_ROLE/" .env.local
    fi
else
    # Linux
    sed -i "s/^NEXT_PUBLIC_DEV_MODE=.*/NEXT_PUBLIC_DEV_MODE=$DEV_MODE/" .env.local
    if [ "$DEV_MODE" = "true" ]; then
        sed -i "s/^NEXT_PUBLIC_DEV_USER_EMAIL=.*/NEXT_PUBLIC_DEV_USER_EMAIL=$DEV_EMAIL/" .env.local
        sed -i "s/^NEXT_PUBLIC_DEV_USER_NAME=.*/NEXT_PUBLIC_DEV_USER_NAME=$DEV_NAME/" .env.local
        sed -i "s/^NEXT_PUBLIC_DEV_USER_ROLE=.*/NEXT_PUBLIC_DEV_USER_ROLE=$DEV_ROLE/" .env.local
    fi
fi

echo "✅ Environment configuration updated"

# Provide next steps
echo ""
echo "🚀 Next Steps"
echo "============"

if [ "$DEV_MODE" = "true" ]; then
    echo "1. Start the backend in development mode:"
    echo "   cd ../form137-api"
    echo "   ./gradlew bootRun --args='--spring.profiles.active=dev'"
    echo ""
    echo "2. Start the frontend:"
    echo "   npm run dev"
    echo ""
    echo "3. Open http://localhost:3000"
    echo "   - You'll be automatically logged in as $DEV_NAME"
    echo "   - Use the development user selector (bottom-right) to switch roles"
    echo "   - Look for the orange development mode indicator"
else
    echo "1. Configure real Auth0 credentials in .env.local"
    echo "2. Start the backend in production mode:"
    echo "   cd ../form137-api"
    echo "   ./gradlew bootRun --args='--spring.profiles.active=prod'"
    echo ""
    echo "3. Start the frontend:"
    echo "   npm run dev"
    echo ""
    echo "4. Open http://localhost:3000 and log in with Auth0"
fi

echo ""
echo "📚 For more information, see docs/DEVELOPMENT_SETUP.md"
echo ""
echo "✨ Setup complete! Happy coding!"