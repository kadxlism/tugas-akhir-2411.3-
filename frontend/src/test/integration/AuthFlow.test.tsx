import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'

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

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('allows user to login with valid credentials', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
    }

    mockAxios.get.mockResolvedValueOnce({ data: {} }) // CSRF cookie
    mockAxios.post.mockResolvedValueOnce({
      data: {
        user: mockUser,
        token: 'mock-token',
      },
    })
    mockAxios.get.mockResolvedValueOnce({
      data: { user: mockUser },
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
      expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('allows user to register with valid data', async () => {
    const mockUser = {
      id: 1,
      name: 'New User',
      email: 'newuser@example.com',
      role: 'team',
    }

    mockAxios.get.mockResolvedValueOnce({ data: {} }) // CSRF cookie
    mockAxios.post.mockResolvedValueOnce({
      data: { user: mockUser },
    })
    mockAxios.get.mockResolvedValueOnce({
      data: { user: mockUser },
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
      expect(mockAxios.post).toHaveBeenCalledWith('/auth/register', {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'team',
      })
    })
  })

  it('shows validation errors for invalid registration data', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: {} }) // CSRF cookie
    mockAxios.post.mockRejectedValueOnce({
      response: {
        status: 422,
        data: {
          errors: {
            name: ['The name field is required.'],
            email: ['The email field is required.'],
            password: ['The password field is required.'],
          },
        },
      },
    })

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    const registerButton = screen.getByRole('button', { name: /register/i })
    fireEvent.click(registerButton)

    await waitFor(() => {
      expect(screen.getByText(/name field is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email field is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password field is required/i)).toBeInTheDocument()
    })
  })

  it('redirects authenticated user away from login page', () => {
    // Mock authenticated state
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token')
    mockAxios.get.mockResolvedValueOnce({
      data: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin',
        },
      },
    })

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    // Should redirect to dashboard (this would be tested with router testing)
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument()
  })

  it('shows loading state during authentication', () => {
    // Mock loading state
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token')
    mockAxios.get.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('handles authentication errors gracefully', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: {} }) // CSRF cookie
    mockAxios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: 'Invalid credentials' },
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
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
