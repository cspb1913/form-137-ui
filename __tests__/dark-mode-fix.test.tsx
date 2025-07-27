import { render } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

// Mock next-themes to check our configuration
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, defaultTheme, enableSystem }: any) => {
    // Verify the theme provider is configured correctly
    expect(defaultTheme).toBe('light')
    expect(enableSystem).toBeUndefined() // Should not be set
    return <div data-testid="theme-provider">{children}</div>
  },
  useTheme: () => ({ theme: 'light' })
}))

// Test to ensure dark mode is disabled
describe('Dark Mode Prevention', () => {
  test('theme provider is configured for light mode only', () => {
    const TestComponent = () => <div data-testid="test">Test Content</div>
    
    // This test will pass only if ThemeProvider receives defaultTheme="light" 
    // and does NOT receive enableSystem prop
    render(
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <TestComponent />
      </ThemeProvider>
    )
  })

  test('HTML element should not have dark class applied by default', () => {
    const TestComponent = () => <div>Test</div>
    
    render(
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <TestComponent />
      </ThemeProvider>
    )

    // Check that HTML element doesn't have dark class by default
    const htmlElement = document.documentElement
    expect(htmlElement.classList.contains('dark')).toBe(false)
  })
})