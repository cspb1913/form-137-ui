# Development Mode - Quick Start

This project includes a comprehensive development mode that bypasses Auth0 authentication for faster local development.

## 🚀 Quick Setup

### Automatic Setup (Recommended)
```bash
./scripts/setup-dev-mode.sh
```

### Manual Setup
1. Copy environment template:
   ```bash
   cp .env.development.example .env.local
   ```

2. Enable development mode in `.env.local`:
   ```env
   NEXT_PUBLIC_DEV_MODE=true
   ```

3. Start applications:
   ```bash
   # Backend (no auth)
   cd ../form137-api
   ./gradlew bootRun --args='--spring.profiles.active=dev'
   
   # Frontend
   npm run dev
   ```

## ✨ Development Features

- **🔓 No Authentication Required**: Instantly access all features without Auth0 login
- **👤 User Role Simulation**: Switch between Admin, Requester, and Student roles
- **🎛️ Live Profile Switching**: Change user profiles without restarting
- **🔧 Visual Development Indicators**: Clear UI indicators when in dev mode
- **🛡️ Production Safety**: Cannot accidentally deploy in dev mode

## 🎯 User Profiles

| Profile | Role | Permissions |
|---------|------|-------------|
| **Admin** | Admin | Full access to all features |
| **Requester** | Requester | Submit and view own requests |
| **Student** | Requester | Submit and view own requests |

## 🔄 Switching Modes

### Development Mode → Production Mode
1. Set `NEXT_PUBLIC_DEV_MODE=false` in `.env.local`
2. Add real Auth0 credentials
3. Restart both applications

### Production Mode → Development Mode  
1. Set `NEXT_PUBLIC_DEV_MODE=true` in `.env.local`
2. Restart applications

## 📖 Full Documentation

For complete setup instructions, troubleshooting, and advanced configuration:
- **[Development Setup Guide](docs/DEVELOPMENT_SETUP.md)**

## ⚠️ Important Notes

- **Development mode is for local development only**
- **Never deploy with `NEXT_PUBLIC_DEV_MODE=true`**
- **Mock tokens are not cryptographically secure**
- **Always test with real Auth0 before production deployment**

## 🛠️ Backend Profiles

| Profile | Use Case | Auth |
|---------|----------|------|
| `dev` | Development (no auth) | Disabled |
| `dev-with-mock-auth` | Testing auth flows | Mock JWT |
| `prod` | Production | Real Auth0 |

## 📞 Need Help?

- Check the console for development mode indicators
- Ensure both frontend and backend are in the same mode
- See [troubleshooting guide](docs/DEVELOPMENT_SETUP.md#troubleshooting) for common issues