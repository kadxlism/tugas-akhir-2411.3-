import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
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

describe('Sidebar Component', () => {
  it('renders sidebar with basic navigation', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.team,
      loading: false,
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    expect(screen.getByText('Project Manager')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('shows admin navigation items for admin users', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    expect(screen.getByRole('link', { name: /clients/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tasks/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /timeline/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /time tracker/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /assign users/i })).toBeInTheDocument()
  })

  it('hides admin navigation items for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.team,
      loading: false,
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    expect(screen.queryByRole('link', { name: /clients/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /projects/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /tasks/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /timeline/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /time tracker/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /assign users/i })).not.toBeInTheDocument()
  })

  it('shows different navigation based on user role', () => {
    const roleTests = [
      {
        user: mockUsers.admin,
        shouldShow: ['clients', 'projects', 'tasks', 'timeline', 'time tracker', 'assign users'],
        shouldHide: []
      },
      {
        user: mockUsers.pm,
        shouldShow: ['dashboard', 'settings'],
        shouldHide: ['clients', 'projects', 'tasks', 'timeline', 'time tracker', 'assign users']
      },
      {
        user: mockUsers.team,
        shouldShow: ['dashboard', 'settings'],
        shouldHide: ['clients', 'projects', 'tasks', 'timeline', 'time tracker', 'assign users']
      },
      {
        user: mockUsers.client,
        shouldShow: ['dashboard', 'settings'],
        shouldHide: ['clients', 'projects', 'tasks', 'timeline', 'time tracker', 'assign users']
      }
    ]

    roleTests.forEach(({ user, shouldShow, shouldHide }) => {
      mockUseAuth.mockReturnValue({
        user,
        loading: false,
      })

      const { unmount } = render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      shouldShow.forEach(item => {
        expect(screen.getByRole('link', { name: new RegExp(item, 'i') })).toBeInTheDocument()
      })

      shouldHide.forEach(item => {
        expect(screen.queryByRole('link', { name: new RegExp(item, 'i') })).not.toBeInTheDocument()
      })

      unmount()
    })
  })

  it('highlights active navigation item', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    // Mock useLocation to return dashboard path
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useLocation: () => ({ pathname: '/dashboard' }),
      }
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('handles navigation clicks', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    fireEvent.click(dashboardLink)

    // Link should have correct href
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  })

  it('shows user information in sidebar', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
  })

  it('handles mobile menu toggle', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    expect(menuButton).toBeInTheDocument()

    fireEvent.click(menuButton)
    // Menu should toggle visibility (implementation dependent)
  })

  it('shows loading state when user data is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('handles missing user gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    // Should show basic navigation without user-specific items
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.queryByText(/admin user/i)).not.toBeInTheDocument()
  })

  it('applies correct CSS classes for styling', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    const sidebar = screen.getByRole('navigation')
    expect(sidebar).toHaveClass('bg-white', 'shadow-md')
  })

  it('shows role-specific quick actions', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    // Admin should see quick action buttons
    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument()
  })

  it('hides quick actions for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.team,
      loading: false,
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    expect(screen.queryByRole('button', { name: /add user/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /create project/i })).not.toBeInTheDocument()
  })

  it('handles sidebar collapse/expand', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    )

    const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i })
    expect(collapseButton).toBeInTheDocument()

    fireEvent.click(collapseButton)
    // Sidebar should collapse (implementation dependent)
  })
})
