"use client"

import { jest } from "@jest/globals"
import "@testing-library/jest-dom"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ""
  },
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
