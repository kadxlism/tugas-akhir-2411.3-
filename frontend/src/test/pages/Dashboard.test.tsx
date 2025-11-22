import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import { AuthContext } from '@/contexts/AuthContext'
import { mockUsers } from '../utils/test-utils'

// Mock useAuth hook
const mockUseAuth = vi.fn()

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

describe('Dashboard Page', () => {
  it('renders dashboard for admin user', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/welcome, admin user/i)).toBeInTheDocument()
  })

  it('renders dashboard for PM user', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.pm,
      loading: false,
    })

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/welcome, pm user/i)).toBeInTheDocument()
  })

  it('renders dashboard for team user', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.team,
      loading: false,
    })

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/welcome, team user/i)).toBeInTheDocument()
  })

  it('renders dashboard for client user', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.client,
      loading: false,
    })

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/welcome, client user/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows different content based on user role', () => {
    // Test admin dashboard
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    const { rerender } = render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/manage users/i)).toBeInTheDocument()
    expect(screen.getByText(/manage projects/i)).toBeInTheDocument()

    // Test team dashboard
    mockUseAuth.mockReturnValue({
      user: mockUsers.team,
      loading: false,
    })

    rerender(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/team dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/my tasks/i)).toBeInTheDocument()
    expect(screen.queryByText(/manage users/i)).not.toBeInTheDocument()
  })

  it('displays user statistics', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/total users/i)).toBeInTheDocument()
    expect(screen.getByText(/active projects/i)).toBeInTheDocument()
    expect(screen.getByText(/pending tasks/i)).toBeInTheDocument()
  })

  it('shows recent activity', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/recent activity/i)).toBeInTheDocument()
  })

  it('displays quick actions based on role', () => {
    // Admin quick actions
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    const { rerender } = render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/add user/i)).toBeInTheDocument()
    expect(screen.getByText(/create project/i)).toBeInTheDocument()

    // Team quick actions
    mockUseAuth.mockReturnValue({
      user: mockUsers.team,
      loading: false,
    })

    rerender(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/view my tasks/i)).toBeInTheDocument()
    expect(screen.getByText(/update status/i)).toBeInTheDocument()
    expect(screen.queryByText(/add user/i)).not.toBeInTheDocument()
  })

  it('handles missing user gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    // Should redirect or show error (depending on implementation)
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument()
  })
})
