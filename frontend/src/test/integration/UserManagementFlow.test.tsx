import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/contexts/AuthContext'
import UserList from '@/pages/users/UserList'
import { mockUsers } from '../utils/test-utils'

// Mock axios
const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
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
  loading = false 
}: { 
  children: React.ReactNode
  user?: any
  loading?: boolean 
}) => (
  <MemoryRouter initialEntries={['/admin/users']}>
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

describe('User Management Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAxios.get.mockResolvedValueOnce({
      data: Object.values(mockUsers),
    })
  })

  describe('Admin User Management', () => {
    it('allows admin to view user list', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      render(
        <TestWrapper user={mockUsers.admin}>
          <UserList />
        </TestWrapper>
      )

      expect(screen.getByText(/user management/i)).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
        expect(screen.getByText('PM User')).toBeInTheDocument()
        expect(screen.getByText('Team User')).toBeInTheDocument()
        expect(screen.getByText('Client User')).toBeInTheDocument()
      })
    })

    it('allows admin to create new user', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      mockAxios.post.mockResolvedValueOnce({
        data: {
          id: 5,
          name: 'New User',
          email: 'newuser@example.com',
          role: 'team',
        },
      })

      render(
        <TestWrapper user={mockUsers.admin}>
          <UserList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
      })

      const addButton = screen.getByRole('button', { name: /add user/i })
      fireEvent.click(addButton)

      expect(screen.getByText(/create user/i)).toBeInTheDocument()

      // Fill form
      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const roleSelect = screen.getByLabelText(/role/i)

      fireEvent.change(nameInput, { target: { value: 'New User' } })
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(roleSelect, { target: { value: 'team' } })

      const submitButton = screen.getByRole('button', { name: /create/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith('/admin/users', {
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'team',
        })
      })
    })

    it('allows admin to edit existing user', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      mockAxios.put.mockResolvedValueOnce({
        data: {
          id: 1,
          name: 'Updated Admin User',
          email: 'updated@test.com',
          role: 'admin',
        },
      })

      render(
        <TestWrapper user={mockUsers.admin}>
          <UserList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
      })

      const editButton = screen.getAllByRole('button', { name: /edit/i })[0]
      fireEvent.click(editButton)

      expect(screen.getByText(/edit user/i)).toBeInTheDocument()

      // Update form
      const nameInput = screen.getByDisplayValue('Admin User')
      fireEvent.change(nameInput, { target: { value: 'Updated Admin User' } })

      const submitButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAxios.put).toHaveBeenCalledWith('/admin/users/1', {
          name: 'Updated Admin User',
          email: 'admin@test.com',
          role: 'admin',
        })
      })
    })

    it('allows admin to delete user', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      mockAxios.delete.mockResolvedValueOnce({
        data: { message: 'User deleted successfully' },
      })

      render(
        <TestWrapper user={mockUsers.admin}>
          <UserList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
      })

      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0]
      fireEvent.click(deleteButton)

      expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument()

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockAxios.delete).toHaveBeenCalledWith('/admin/users/1')
      })
    })

    it('filters users by role', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      render(
        <TestWrapper user={mockUsers.admin}>
          <UserList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
      })

      const roleFilter = screen.getByLabelText(/filter by role/i)
      fireEvent.change(roleFilter, { target: { value: 'admin' } })

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
        expect(screen.queryByText('PM User')).not.toBeInTheDocument()
      })
    })

    it('searches users by name or email', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      render(
        <TestWrapper user={mockUsers.admin}>
          <UserList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/search users/i)
      fireEvent.change(searchInput, { target: { value: 'admin' } })

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
        expect(screen.queryByText('PM User')).not.toBeInTheDocument()
      })
    })
  })

  describe('Non-Admin Access Control', () => {
    it('prevents PM from accessing user management', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.pm,
        loading: false,
      })

      render(
        <TestWrapper user={mockUsers.pm}>
          <UserList />
        </TestWrapper>
      )

      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
    })

    it('prevents team member from accessing user management', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.team,
        loading: false,
      })

      render(
        <TestWrapper user={mockUsers.team}>
          <UserList />
        </TestWrapper>
      )

      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
    })

    it('prevents client from accessing user management', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.client,
        loading: false,
      })

      render(
        <TestWrapper user={mockUsers.client}>
          <UserList />
        </TestWrapper>
      )

      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      mockAxios.get.mockRejectedValueOnce(new Error('Failed to fetch users'))

      render(
        <TestWrapper user={mockUsers.admin}>
          <UserList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/failed to load users/i)).toBeInTheDocument()
      })
    })

    it('handles create user errors', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      mockAxios.post.mockRejectedValueOnce(new Error('Email already exists'))

      render(
        <TestWrapper user={mockUsers.admin}>
          <UserList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
      })

      const addButton = screen.getByRole('button', { name: /add user/i })
      fireEvent.click(addButton)

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const roleSelect = screen.getByLabelText(/role/i)

      fireEvent.change(nameInput, { target: { value: 'New User' } })
      fireEvent.change(emailInput, { target: { value: 'existing@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(roleSelect, { target: { value: 'team' } })

      const submitButton = screen.getByRole('button', { name: /create/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
      })
    })

    it('handles update user errors', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      mockAxios.put.mockRejectedValueOnce(new Error('Update failed'))

      render(
        <TestWrapper user={mockUsers.admin}>
          <UserList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
      })

      const editButton = screen.getAllByRole('button', { name: /edit/i })[0]
      fireEvent.click(editButton)

      const nameInput = screen.getByDisplayValue('Admin User')
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } })

      const submitButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/update failed/i)).toBeInTheDocument()
      })
    })

    it('handles delete user errors', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      mockAxios.delete.mockRejectedValueOnce(new Error('Delete failed'))

      render(
        <TestWrapper user={mockUsers.admin}>
          <UserList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
      })

      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0]
      fireEvent.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/delete failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading state while fetching users', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      // Mock delayed response
      mockAxios.get.mockImplementation(() => new Promise(() => {}))

      render(
        <TestWrapper user={mockUsers.admin}>
          <UserList />
        </TestWrapper>
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('shows loading state during user creation', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.admin,
        loading: false,
      })

      // Mock delayed create response
      mockAxios.post.mockImplementation(() => new Promise(() => {}))

      render(
        <TestWrapper user={mockUsers.admin}>
          <UserList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
      })

      const addButton = screen.getByRole('button', { name: /add user/i })
      fireEvent.click(addButton)

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const roleSelect = screen.getByLabelText(/role/i)

      fireEvent.change(nameInput, { target: { value: 'New User' } })
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(roleSelect, { target: { value: 'team' } })

      const submitButton = screen.getByRole('button', { name: /create/i })
      fireEvent.click(submitButton)

      expect(screen.getByText(/creating/i)).toBeInTheDocument()
    })
  })
})
