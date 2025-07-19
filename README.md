# form 137

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jcalalang-3839s-projects/v0-form-137)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/hBk6LNSrz4E)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/jcalalang-3839s-projects/v0-form-137](https://vercel.com/jcalalang-3839s-projects/v0-form-137)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/hBk6LNSrz4E](https://v0.dev/chat/projects/hBk6LNSrz4E)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Local development

Use [pnpm](https://pnpm.io/) to manage dependencies and run scripts:

\`\`\`bash
pnpm install
pnpm dev
pnpm test:pact
\`\`\`

### Auth0 configuration

The sign-in flow relies on Auth0. Copy `.env.example` to `.env.local` and set your credentials:

\`\`\`bash
cp .env.example .env.local
# edit .env.local
\`\`\`

Required variables:
- `AUTH0_SECRET`
- `AUTH0_BASE_URL`
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_AUDIENCE`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_PROFILE_ROUTE`
- `NEXT_PUBLIC_AUTH0_AUDIENCE`

## Pact contracts

Generated contracts for the frontend reside in the `pacts/` directory. These
describe the consumer expectations for both the dashboard API and the form 137
submission API.
