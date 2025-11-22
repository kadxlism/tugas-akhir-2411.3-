import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '@/components/Layout'
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

describe('Layout', () => {
  it('renders sidebar with basic navigation', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'User', email: 'user@test.com', role: 'team' },
      logout: vi.fn(),
    })

    render(
      <TestWrapper>
        <Layout>
          <div>Main Content</div>
        </Layout>
      </TestWrapper>
    )

    expect(screen.getByText('Project Manager')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
  })

  it('shows admin navigation links for admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' },
      logout: vi.fn(),
    })

    render(
      <TestWrapper>
        <Layout>
          <div>Main Content</div>
        </Layout>
      </TestWrapper>
    )

    expect(screen.getByText('Clients')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Timeline')).toBeInTheDocument()
    expect(screen.getByText('Time Tracker')).toBeInTheDocument()
    expect(screen.getByText('Assign Users')).toBeInTheDocument()
  })

  it('hides admin navigation links for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'User', email: 'user@test.com', role: 'team' },
      logout: vi.fn(),
    })

    render(
      <TestWrapper>
        <Layout>
          <div>Main Content</div>
        </Layout>
      </TestWrapper>
    )

    expect(screen.queryByText('Clients')).not.toBeInTheDocument()
    expect(screen.queryByText('Projects')).not.toBeInTheDocument()
    expect(screen.queryByText('Tasks')).not.toBeInTheDocument()
    expect(screen.queryByText('Timeline')).not.toBeInTheDocument()
    expect(screen.queryByText('Time Tracker')).not.toBeInTheDocument()
    expect(screen.queryByText('Assign Users')).not.toBeInTheDocument()
  })

  it('shows user information in navbar', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'John Doe', email: 'john@test.com', role: 'admin' },
      logout: vi.fn(),
    })

    render(
      <TestWrapper>
        <Layout>
          <div>Main Content</div>
        </Layout>
      </TestWrapper>
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@test.com')).toBeInTheDocument()
  })

  it('calls logout when logout button is clicked', async () => {
    const mockLogout = vi.fn()
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'User', email: 'user@test.com', role: 'team' },
      logout: mockLogout,
    })

    render(
      <TestWrapper>
        <Layout>
          <div>Main Content</div>
        </Layout>
      </TestWrapper>
    )

    const logoutButton = screen.getByText('Logout')
    logoutButton.click()

    expect(mockLogout).toHaveBeenCalled()
  })

  it('renders children content in main area', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'User', email: 'user@test.com', role: 'team' },
      logout: vi.fn(),
    })

    render(
      <TestWrapper>
        <Layout>
          <div data-testid="main-content">Dashboard Content</div>
        </Layout>
      </TestWrapper>
    )

    expect(screen.getByTestId('main-content')).toBeInTheDocument()
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
  })
})
