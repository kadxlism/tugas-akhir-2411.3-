import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '@/pages/Login'
import { AuthContext } from '@/contexts/AuthContext'

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

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form with all required fields', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty form submission', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    const loginButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('handles successful login', async () => {
    const mockLogin = vi.fn()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
    })

    mockAxios.get.mockResolvedValueOnce({ data: {} }) // CSRF cookie
    mockAxios.post.mockResolvedValueOnce({
      data: {
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
        token: 'mock-token',
      },
    })

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', false)
    })
  })

  it('handles login errors', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn().mockRejectedValueOnce(new Error('Invalid credentials')),
    })

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during login', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('redirects authenticated users to dashboard', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      loading: false,
    })

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    // Should redirect to dashboard (this would be tested with router testing)
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument()
  })

  it('toggles password visibility', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })

    expect(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('has remember me checkbox', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument()
  })

  it('has link to register page', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })
})
