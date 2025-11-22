import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Register from '@/pages/Register'
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

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders registration form with all required fields', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty form submission', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    const registerButton = screen.getByRole('button', { name: /register/i })
    fireEvent.click(registerButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      expect(screen.getByText(/role is required/i)).toBeInTheDocument()
    })
  })

  it('validates password confirmation', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const registerButton = screen.getByRole('button', { name: /register/i })

    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } })
    fireEvent.click(registerButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const registerButton = screen.getByRole('button', { name: /register/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(registerButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('validates password strength', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/password/i)
    const registerButton = screen.getByRole('button', { name: /register/i })

    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.click(registerButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('handles successful registration', async () => {
    const mockRegister = vi.fn()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      register: mockRegister,
    })

    mockAxios.get.mockResolvedValueOnce({ data: {} }) // CSRF cookie
    mockAxios.post.mockResolvedValueOnce({
      data: {
        user: { id: 1, name: 'New User', email: 'newuser@example.com', role: 'team' },
      },
    })

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const roleSelect = screen.getByLabelText(/role/i)
    const registerButton = screen.getByRole('button', { name: /register/i })

    fireEvent.change(nameInput, { target: { value: 'New User' } })
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.change(roleSelect, { target: { value: 'team' } })
    fireEvent.click(registerButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'team',
      })
    })
  })

  it('handles registration errors', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      register: vi.fn().mockRejectedValueOnce(new Error('Email already exists')),
    })

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const roleSelect = screen.getByLabelText(/role/i)
    const registerButton = screen.getByRole('button', { name: /register/i })

    fireEvent.change(nameInput, { target: { value: 'New User' } })
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.change(roleSelect, { target: { value: 'team' } })
    fireEvent.click(registerButton)

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during registration', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })

    render(
      <TestWrapper>
        <Register />
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
        <Register />
      </TestWrapper>
    )

    // Should redirect to dashboard (this would be tested with router testing)
    expect(screen.queryByText(/register/i)).not.toBeInTheDocument()
  })

  it('has all role options in select', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    const roleSelect = screen.getByLabelText(/role/i)
    expect(roleSelect).toBeInTheDocument()

    // Check for role options
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Project Manager')).toBeInTheDocument()
    expect(screen.getByText('Team Member')).toBeInTheDocument()
    expect(screen.getByText('Client')).toBeInTheDocument()
  })

  it('has link to login page', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
  })

  it('toggles password visibility for both password fields', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const toggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i })

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')

    // Toggle first password field
    fireEvent.click(toggleButtons[0])
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')

    // Toggle second password field
    fireEvent.click(toggleButtons[1])
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(confirmPasswordInput).toHaveAttribute('type', 'text')
  })
})
