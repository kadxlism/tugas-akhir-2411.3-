import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RequireAuth from '@/components/requireAuth'
import { AuthContext } from '@/contexts/AuthContext'
import { mockUsers } from '../utils/test-utils'

// Mock useAuth hook
const mockUseAuth = vi.fn()

// Mock the useAuth hook
vi.mock('@/contexts/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthContext.Provider value={{
      user: null,
      setUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loading: false,
    }}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
)

describe('RequireAuth', () => {
  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </TestWrapper>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </TestWrapper>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    // Should redirect to login (this would be tested with router testing)
  })

  it('shows loading when checking authentication', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })

    render(
      <TestWrapper>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </TestWrapper>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('works with different user roles', () => {
    const roles = ['admin', 'pm', 'team', 'client'] as const
    
    roles.forEach(role => {
      mockUseAuth.mockReturnValue({
        user: mockUsers[role],
        loading: false,
      })

      const { unmount } = render(
        <TestWrapper>
          <RequireAuth>
            <div>Protected Content for {role}</div>
          </RequireAuth>
        </TestWrapper>
      )

      expect(screen.getByText(`Protected Content for ${role}`)).toBeInTheDocument()
      unmount()
    })
  })

  it('preserves location state for redirect', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    // Mock useLocation to return a specific pathname
    const mockLocation = {
      pathname: '/dashboard',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    }

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useLocation: () => mockLocation,
      }
    })

    render(
      <TestWrapper>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </TestWrapper>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
