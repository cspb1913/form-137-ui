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
