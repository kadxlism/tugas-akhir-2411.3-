import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RequireAdmin from '@/components/requireAdmin'
import { AuthContext } from '@/contexts/AuthContext'

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

describe('RequireAdmin', () => {
  it('renders children when user is admin', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' },
      loading: false,
    })

    render(
      <TestWrapper>
        <RequireAdmin>
          <div>Admin Content</div>
        </RequireAdmin>
      </TestWrapper>
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <RequireAdmin>
          <div>Admin Content</div>
        </RequireAdmin>
      </TestWrapper>
    )

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    // Should redirect to login (this would be tested with router testing)
  })

  it('redirects to unauthorized when user is not admin', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'User', email: 'user@test.com', role: 'team' },
      loading: false,
    })

    render(
      <TestWrapper>
        <RequireAdmin>
          <div>Admin Content</div>
        </RequireAdmin>
      </TestWrapper>
    )

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    // Should redirect to unauthorized page
  })

  it('shows loading when checking access', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })

    render(
      <TestWrapper>
        <RequireAdmin>
          <div>Admin Content</div>
        </RequireAdmin>
      </TestWrapper>
    )

    expect(screen.getByText('Checking access...')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('allows access for users with is_admin flag', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        id: 1, 
        name: 'Admin', 
        email: 'admin@test.com', 
        role: 'user',
        is_admin: true 
      },
      loading: false,
    })

    render(
      <TestWrapper>
        <RequireAdmin>
          <div>Admin Content</div>
        </RequireAdmin>
      </TestWrapper>
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('allows access for users with is_admin string "1"', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        id: 1, 
        name: 'Admin', 
        email: 'admin@test.com', 
        role: 'user',
        is_admin: "1" 
      },
      loading: false,
    })

    render(
      <TestWrapper>
        <RequireAdmin>
          <div>Admin Content</div>
        </RequireAdmin>
      </TestWrapper>
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('allows access for users with is_admin string "true"', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        id: 1, 
        name: 'Admin', 
        email: 'admin@test.com', 
        role: 'user',
        is_admin: "true" 
      },
      loading: false,
    })

    render(
      <TestWrapper>
        <RequireAdmin>
          <div>Admin Content</div>
        </RequireAdmin>
      </TestWrapper>
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })
})
