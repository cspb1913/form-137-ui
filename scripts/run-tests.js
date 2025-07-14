const { execSync } = require("child_process")

console.log("🧪 Running Form 137 Test Suite...\n")

try {
  // Run tests with coverage
  execSync("pnpm exec jest --coverage --watchAll=false", {
    stdio: "inherit",
    cwd: process.cwd(),
  })

  console.log("\n✅ All tests passed successfully!")
  console.log("📊 Coverage report generated in coverage/ directory")
} catch (error) {
  console.error("\n❌ Some tests failed")
  process.exit(1)
}
