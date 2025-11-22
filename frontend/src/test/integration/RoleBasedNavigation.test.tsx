import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import AppRoutes from '@/AppRoutes'
import { AuthContext } from '@/contexts/AuthContext'
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

// Mock useAuth hook
const mockUseAuth = vi.fn()

vi.mock('@/contexts/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

const TestWrapper = ({ 
  children, 
  user = null, 
  loading = false,
  initialEntries = ['/']
}: { 
  children: React.ReactNode
  user?: any
  loading?: boolean
  initialEntries?: string[]
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    <AuthContext.Provider value={{
      user,
      setUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  </MemoryRouter>
)

describe('Role-Based Navigation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Admin Navigation', () => {
    it('allows admin to access all admin pages', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      const adminRoutes = [
        '/admin/users',
        '/clients',
        '/tasks',
        '/timeline',
      ]

      adminRoutes.forEach(route => {
        const { unmount } = render(
          <TestWrapper user={mockUsers.admin} initialEntries={[route]}>
            <AppRoutes />
          </TestWrapper>
        )

        // Should not show unauthorized page
        expect(screen.queryByText(/unauthorized/i)).not.toBeInTheDocument()
        unmount()
      })
    })

    it('shows admin navigation items in layout', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      render(
        <TestWrapper user={mockUsers.admin} initialEntries={['/dashboard']}>
          <AppRoutes />
        </TestWrapper>
      )

      expect(screen.getByText(/clients/i)).toBeInTheDocument()
      expect(screen.getByText(/tasks/i)).toBeInTheDocument()
      expect(screen.getByText(/timeline/i)).toBeInTheDocument()
      expect(screen.getByText(/user management/i)).toBeInTheDocument()
    })
  })

  describe('PM Navigation', () => {
    it('allows PM to access dashboard but not admin pages', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.pm,
        loading: false,
      })

      // Dashboard should be accessible
      render(
        <TestWrapper user={mockUsers.pm} initialEntries={['/dashboard']}>
          <AppRoutes />
        </TestWrapper>
      )

      expect(screen.queryByText(/unauthorized/i)).not.toBeInTheDocument()

      // Admin pages should redirect to unauthorized
      const { rerender } = render(
        <TestWrapper user={mockUsers.pm} initialEntries={['/admin/users']}>
          <AppRoutes />
        </TestWrapper>
      )

      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
    })

    it('hides admin navigation items for PM', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.pm,
        loading: false,
      })

      render(
        <TestWrapper user={mockUsers.pm} initialEntries={['/dashboard']}>
          <AppRoutes />
        </TestWrapper>
      )

      expect(screen.queryByText(/clients/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/user management/i)).not.toBeInTheDocument()
    })
  })

  describe('Team Navigation', () => {
    it('allows team member to access dashboard but not admin pages', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.team,
        loading: false,
      })

      // Dashboard should be accessible
      render(
        <TestWrapper user={mockUsers.team} initialEntries={['/dashboard']}>
          <AppRoutes />
        </TestWrapper>
      )

      expect(screen.queryByText(/unauthorized/i)).not.toBeInTheDocument()

      // Admin pages should redirect to unauthorized
      render(
        <TestWrapper user={mockUsers.team} initialEntries={['/admin/users']}>
          <AppRoutes />
        </TestWrapper>
      )

      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
    })

    it('hides admin navigation items for team member', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.team,
        loading: false,
      })

      render(
        <TestWrapper user={mockUsers.team} initialEntries={['/dashboard']}>
          <AppRoutes />
        </TestWrapper>
      )

      expect(screen.queryByText(/clients/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/user management/i)).not.toBeInTheDocument()
    })
  })

  describe('Client Navigation', () => {
    it('allows client to access dashboard but not admin pages', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.client,
        loading: false,
      })

      // Dashboard should be accessible
      render(
        <TestWrapper user={mockUsers.client} initialEntries={['/dashboard']}>
          <AppRoutes />
        </TestWrapper>
      )

      expect(screen.queryByText(/unauthorized/i)).not.toBeInTheDocument()

      // Admin pages should redirect to unauthorized
      render(
        <TestWrapper user={mockUsers.client} initialEntries={['/admin/users']}>
          <AppRoutes />
        </TestWrapper>
      )

      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
    })

    it('hides admin navigation items for client', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.client,
        loading: false,
      })

      render(
        <TestWrapper user={mockUsers.client} initialEntries={['/dashboard']}>
          <AppRoutes />
        </TestWrapper>
      )

      expect(screen.queryByText(/clients/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/user management/i)).not.toBeInTheDocument()
    })
  })

  describe('Unauthenticated Navigation', () => {
    it('redirects unauthenticated users to login', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      })

      render(
        <TestWrapper user={null} initialEntries={['/dashboard']}>
          <AppRoutes />
        </TestWrapper>
      )

      expect(screen.getByText(/login/i)).toBeInTheDocument()
    })

    it('allows access to public pages when unauthenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      })

      const publicRoutes = ['/login', '/register', '/unauthorized']

      publicRoutes.forEach(route => {
        const { unmount } = render(
          <TestWrapper user={null} initialEntries={[route]}>
            <AppRoutes />
          </TestWrapper>
        )

        // Should not redirect to login
        expect(screen.queryByText(/login/i)).not.toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading when checking authentication', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      })

      render(
        <TestWrapper user={null} loading={true} initialEntries={['/dashboard']}>
          <AppRoutes />
        </TestWrapper>
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })

  describe('Route Protection', () => {
    it('protects admin routes with RequireAdmin', () => {
      const adminRoutes = [
        '/admin/users',
        '/clients',
        '/tasks',
        '/timeline',
      ]

      adminRoutes.forEach(route => {
        // Test with non-admin user
        mockUseAuth.mockReturnValue({
          user: mockUsers.team,
          loading: false,
        })

        const { unmount } = render(
          <TestWrapper user={mockUsers.team} initialEntries={[route]}>
            <AppRoutes />
          </TestWrapper>
        )

        expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
        unmount()
      })
    })

    it('protects all routes with RequireAuth', () => {
      const protectedRoutes = [
        '/dashboard',
        '/settings',
      ]

      protectedRoutes.forEach(route => {
        // Test with unauthenticated user
        mockUseAuth.mockReturnValue({
          user: null,
          loading: false,
        })

        const { unmount } = render(
          <TestWrapper user={null} initialEntries={[route]}>
            <AppRoutes />
          </TestWrapper>
        )

        expect(screen.getByText(/login/i)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Navigation Links', () => {
    it('navigates between pages correctly for admin', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      render(
        <TestWrapper user={mockUsers.admin} initialEntries={['/dashboard']}>
          <AppRoutes />
        </TestWrapper>
      )

      // Click on clients link
      const clientsLink = screen.getByRole('link', { name: /clients/i })
      fireEvent.click(clientsLink)

      expect(screen.getByText(/clients/i)).toBeInTheDocument()
    })

    it('navigates between pages correctly for team member', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.team,
        loading: false,
      })

      render(
        <TestWrapper user={mockUsers.team} initialEntries={['/dashboard']}>
          <AppRoutes />
        </TestWrapper>
      )

      // Click on settings link
      const settingsLink = screen.getByRole('link', { name: /settings/i })
      fireEvent.click(settingsLink)

      expect(screen.getByText(/settings/i)).toBeInTheDocument()
    })
  })
})
