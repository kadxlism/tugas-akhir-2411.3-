import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import UserList from '@/pages/users/UserList'
import { AuthContext } from '@/contexts/AuthContext'
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

describe('UserList Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAxios.get.mockResolvedValueOnce({
      data: Object.values(mockUsers),
    })
  })

  it('renders user list for admin user', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <UserList />
      </TestWrapper>
    )

    expect(screen.getByText(/user management/i)).toBeInTheDocument()
    expect(screen.getByText(/add user/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
      expect(screen.getByText('PM User')).toBeInTheDocument()
      expect(screen.getByText('Team User')).toBeInTheDocument()
      expect(screen.getByText('Client User')).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching users', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    // Mock a delayed response
    mockAxios.get.mockImplementation(() => new Promise(() => {}))

    render(
      <TestWrapper>
        <UserList />
      </TestWrapper>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays user information correctly', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <UserList />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('admin@test.com')).toBeInTheDocument()
      expect(screen.getByText('pm@test.com')).toBeInTheDocument()
      expect(screen.getByText('team@test.com')).toBeInTheDocument()
      expect(screen.getByText('client@test.com')).toBeInTheDocument()
    })
  })

  it('shows role badges for each user', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <UserList />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('PM')).toBeInTheDocument()
      expect(screen.getByText('Team')).toBeInTheDocument()
      expect(screen.getByText('Client')).toBeInTheDocument()
    })
  })

  it('has edit and delete buttons for each user', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <UserList />
      </TestWrapper>
    )

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      
      expect(editButtons).toHaveLength(4) // One for each user
      expect(deleteButtons).toHaveLength(4) // One for each user
    })
  })

  it('opens edit modal when edit button is clicked', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <UserList />
      </TestWrapper>
    )

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0])
    })

    expect(screen.getByText(/edit user/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument()
    expect(screen.getByDisplayValue('admin@test.com')).toBeInTheDocument()
  })

  it('opens delete confirmation when delete button is clicked', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    render(
      <TestWrapper>
        <UserList />
      </TestWrapper>
    )

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      fireEvent.click(deleteButtons[0])
    })

    expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument()
    expect(screen.getByText(/are you sure you want to delete this user/i)).toBeInTheDocument()
  })

  it('deletes user when confirmed', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    mockAxios.delete.mockResolvedValueOnce({
      data: { message: 'User deleted successfully' },
    })

    render(
      <TestWrapper>
        <UserList />
      </TestWrapper>
    )

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      fireEvent.click(deleteButtons[0])
    })

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
      <TestWrapper>
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
      <TestWrapper>
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

  it('shows error message when API fails', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    mockAxios.get.mockRejectedValueOnce(new Error('Failed to fetch users'))

    render(
      <TestWrapper>
        <UserList />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument()
    })
  })

  it('prevents non-admin users from accessing', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.team,
      loading: false,
    })

    render(
      <TestWrapper>
        <UserList />
      </TestWrapper>
    )

    // Should redirect to unauthorized page
    expect(screen.queryByText(/user management/i)).not.toBeInTheDocument()
  })

  it('has pagination controls', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.admin,
      loading: false,
    })

    // Mock paginated response
    mockAxios.get.mockResolvedValueOnce({
      data: {
        data: Object.values(mockUsers),
        current_page: 1,
        last_page: 2,
        per_page: 10,
        total: 20,
      },
    })

    render(
      <TestWrapper>
        <UserList />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })
  })
})
