"use client"

// This file re-exports the client-side utilities from Auth0.
// It acts as a workaround for module resolution issues in some
// sandboxed environments that may not correctly handle package subpaths.
export * from "@auth0/nextjs-auth0/client"
