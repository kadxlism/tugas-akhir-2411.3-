import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { mockUsers } from '../utils/test-utils'

// Mock axios
const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
}

vi.mock('@/services/axios', () => ({
  default: mockAxios,
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    })

    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true) // Initially loading
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.register).toBe('function')
    expect(typeof result.current.logout).toBe('function')
    expect(typeof result.current.setUser).toBe('function')
  })

  it('fetches user on mount when token exists', async () => {
    const token = 'mock-jwt-token'
    localStorage.setItem('auth_token', token)

    mockAxios.get.mockResolvedValueOnce({
      data: { user: mockUsers.admin },
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    })

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    expect(result.current.user).toEqual(mockUsers.admin)
    expect(result.current.loading).toBe(false)
  })

  it('handles login successfully', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: {} }) // CSRF cookie
    mockAxios.post.mockResolvedValueOnce({
      data: {
        user: mockUsers.admin,
        token: 'mock-jwt-token',
      },
    })
    mockAxios.get.mockResolvedValueOnce({
      data: { user: mockUsers.admin },
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    })

    await act(async () => {
      await result.current.login('admin@test.com', 'password123', true)
    })

    expect(result.current.user).toEqual(mockUsers.admin)
    expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token')
  })

  it('handles login with session storage when remember me is false', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: {} }) // CSRF cookie
    mockAxios.post.mockResolvedValueOnce({
      data: {
        user: mockUsers.admin,
        token: 'mock-jwt-token',
      },
    })
    mockAxios.get.mockResolvedValueOnce({
      data: { user: mockUsers.admin },
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    })

    await act(async () => {
      await result.current.login('admin@test.com', 'password123', false)
    })

    expect(result.current.user).toEqual(mockUsers.admin)
    expect(sessionStorage.getItem('auth_token')).toBe('mock-jwt-token')
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('handles login errors', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: {} }) // CSRF cookie
    mockAxios.post.mockRejectedValueOnce(new Error('Invalid credentials'))

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    })

    await act(async () => {
      try {
        await result.current.login('admin@test.com', 'wrongpassword', false)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Invalid credentials')
      }
    })

    expect(result.current.user).toBeNull()
  })

  it('handles register successfully', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: {} }) // CSRF cookie
    mockAxios.post.mockResolvedValueOnce({
      data: { user: mockUsers.team },
    })
    mockAxios.get.mockResolvedValueOnce({
      data: { user: mockUsers.team },
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    })

    const registerData = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      password_confirmation: 'password123',
      role: 'team',
    }

    await act(async () => {
      await result.current.register(registerData)
    })

    expect(result.current.user).toEqual(mockUsers.team)
  })

  it('handles register errors', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: {} }) // CSRF cookie
    mockAxios.post.mockRejectedValueOnce(new Error('Email already exists'))

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    })

    const registerData = {
      name: 'New User',
      email: 'existing@example.com',
      password: 'password123',
      password_confirmation: 'password123',
      role: 'team',
    }

    await act(async () => {
      try {
        await result.current.register(registerData)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Email already exists')
      }
    })

    expect(result.current.user).toBeNull()
  })

  it('handles logout successfully', async () => {
    // Set up initial authenticated state
    const token = 'mock-jwt-token'
    localStorage.setItem('auth_token', token)

    mockAxios.get.mockResolvedValueOnce({
      data: { user: mockUsers.admin },
    })
    mockAxios.post.mockResolvedValueOnce({
      data: { message: 'Logged out' },
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    })

    // Wait for initial user fetch
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    expect(result.current.user).toEqual(mockUsers.admin)

    // Logout
    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('handles logout errors gracefully', async () => {
    const token = 'mock-jwt-token'
    localStorage.setItem('auth_token', token)

    mockAxios.get.mockResolvedValueOnce({
      data: { user: mockUsers.admin },
    })
    mockAxios.post.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    })

    // Wait for initial user fetch
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Logout should still clear local state even if API fails
    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('clears invalid token on fetch error', async () => {
    const token = 'invalid-token'
    localStorage.setItem('auth_token', token)

    mockAxios.get.mockRejectedValueOnce(new Error('Invalid token'))

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('sets user manually with setUser', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    })

    act(() => {
      result.current.setUser(mockUsers.admin)
    })

    expect(result.current.user).toEqual(mockUsers.admin)
  })

  it('handles timeout during user fetch', async () => {
    const token = 'mock-jwt-token'
    localStorage.setItem('auth_token', token)

    // Mock a timeout
    mockAxios.get.mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 100)
      )
    )

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('handles different user roles correctly', async () => {
    const roles = ['admin', 'pm', 'team', 'client'] as const

    for (const role of roles) {
      const user = mockUsers[role]
      const token = 'mock-jwt-token'
      localStorage.setItem('auth_token', token)

      mockAxios.get.mockResolvedValueOnce({
        data: { user },
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.user).toEqual(user)
      expect(result.current.user?.role).toBe(role)

      // Clean up for next iteration
      localStorage.clear()
      vi.clearAllMocks()
    }
  })
})
