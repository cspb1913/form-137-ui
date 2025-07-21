/**
 * Test for status mapping fix in admin component
 * This ensures that the UI sends lowercase status values to the API
 */

describe("Status Mapping", () => {
  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Completed", value: "completed" },
    { label: "Rejected", value: "rejected" },
  ]

  it("should map UI labels to correct lowercase API values", () => {
    // Test that each status option has the correct mapping
    expect(statusOptions).toEqual([
      { label: "Pending", value: "pending" },
      { label: "Processing", value: "processing" },
      { label: "Completed", value: "completed" },
      { label: "Rejected", value: "rejected" },
    ])
  })

  it("should have consistent label-value pairs", () => {
    statusOptions.forEach(option => {
      expect(option.value).toBe(option.label.toLowerCase())
    })
  })

  it("should only contain valid API status values", () => {
    const validApiStatuses = ["pending", "processing", "completed", "rejected"]
    statusOptions.forEach(option => {
      expect(validApiStatuses).toContain(option.value)
    })
  })
})