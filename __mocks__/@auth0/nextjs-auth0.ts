export const useUser = jest.fn(() => ({ user: { name: 'Test User' } }))
export const getAccessToken = jest.fn(async () => 'mock-token')
export const withPageAuthRequired = (fn: any) => fn
export const handleLogin = jest.fn()
export const handleCallback = jest.fn()
export const handleLogout = jest.fn()
export const handleProfile = jest.fn()
