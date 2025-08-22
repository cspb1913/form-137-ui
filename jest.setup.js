"use client"

import { jest } from "@jest/globals"
import "@testing-library/jest-dom"

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock Auth0 module to avoid ESM issues in tests
jest.mock("@auth0/nextjs-auth0")
jest.mock("@/components/botid-provider", () => ({
  BotIDProvider: ({ children }) => children,
  useBotID: () => ({
    isBot: false,
    botType: null,
    confidence: 0,
    isLoading: false,
    trackActivity: jest.fn(),
  }),
}))
// Note: No hooks mocked - architecture uses pure API calls

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => ""),
}))

// Mock file reading
global.FileReader = class {
  readAsDataURL = jest.fn()
  readAsText = jest.fn()
  readAsArrayBuffer = jest.fn()
  addEventListener = jest.fn()
  removeEventListener = jest.fn()
}

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mocked-url")
global.URL.revokeObjectURL = jest.fn()

// Provide a minimal fetch implementation using cross-fetch
// @ts-ignore
const fetchModule = require("cross-fetch")
// @ts-ignore
global.fetch = fetchModule.fetch
// @ts-ignore
global.Headers = fetchModule.Headers
// @ts-ignore
global.Request = fetchModule.Request
// @ts-ignore
global.Response = fetchModule.Response

// Mock canvas APIs used in botid.ts
if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: jest.fn(() => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: [] })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => []),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      transform: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn(),
    })),
  })
}
