import { detectBot, trackFormSubmission, trackSuspiciousActivity } from "@/lib/botid"
import { jest } from "@jest/globals"

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Mock sessionStorage for testing
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
})

// Mock navigator
Object.defineProperty(window, "navigator", {
  value: {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
})

describe("BotID Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue("[]")
    sessionStorageMock.getItem.mockReturnValue("test-session-id")
  })

  describe("detectBot", () => {
    it("should detect bot correctly with suspicious user agent", async () => {
      const result = await detectBot("Googlebot/2.1", "66.249.66.1")

      expect(result.isBot).toBe(true)
      expect(result.botType).toBe("crawler")
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it("should not detect normal user agent as bot", async () => {
      const result = await detectBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "192.168.1.1")

      expect(result.isBot).toBe(false)
      expect(result.confidence).toBeLessThan(0.5)
    })

    it("should handle detection errors gracefully", async () => {
      // Test with undefined user agent
      const result = await detectBot(undefined, undefined)

      expect(result.isBot).toBeDefined()
      expect(result.confidence).toBeGreaterThanOrEqual(0)
    })
  })

  describe("trackFormSubmission", () => {
    it("should track form submission with bot detection data", async () => {
      const formData = {
        learnerReferenceNumber: "123456789012",
        relationshipToLearner: "Self",
        deliveryMethod: "Pick-up",
        validId: new File(["test"], "test.pdf"),
      }

      const detectionResult = {
        isBot: false,
        botType: null,
        confidence: 0.1,
      }

      await trackFormSubmission(formData, detectionResult)

      expect(localStorageMock.setItem).toHaveBeenCalledWith("botid_logs", expect.stringContaining("form_submission"))
    })
  })

  describe("trackSuspiciousActivity", () => {
    it("should track suspicious activity", async () => {
      await trackSuspiciousActivity("rapid_form_filling", {
        field: "firstName",
        speed: "very_fast",
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "botid_logs",
        expect.stringContaining("suspicious_activity"),
      )
    })

    it("should handle tracking errors gracefully", async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage error")
      })

      // Should not throw error
      await expect(trackSuspiciousActivity("test", {})).resolves.toBeUndefined()
    })
  })
})
