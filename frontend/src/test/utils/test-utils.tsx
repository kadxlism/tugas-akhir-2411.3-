import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthContext } from '@/contexts/AuthContext'
import { User } from '@/types/auth'

// Mock user data for different roles
export const mockUsers = {
  admin: {
    id: 1,
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin' as const,
    is_admin: true,
  },
  pm: {
    id: 2,
    name: 'PM User',
    email: 'pm@test.com',
    role: 'pm' as const,
    is_admin: false,
  },
  team: {
    id: 3,
    name: 'Team User',
    email: 'team@test.com',
    role: 'team' as const,
    is_admin: false,
  },
  client: {
    id: 4,
    name: 'Client User',
    email: 'client@test.com',
    role: 'client' as const,
    is_admin: false,
  },
}

// Mock auth context values
export const mockAuthContext = {
  user: null,
  setUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  loading: false,
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null
  loading?: boolean
  initialEntries?: string[]
}

const AllTheProviders = ({ 
  children, 
  user = null, 
  loading = false 
}: { 
  children: React.ReactNode
  user?: User | null
  loading?: boolean 
}) => {
  const authValue = {
    ...mockAuthContext,
    user,
    loading,
  }

  return (
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, loading, ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders user={user} loading={loading}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Helper functions for common test scenarios
export const renderWithAuth = (ui: ReactElement, user: User | null = null) => {
  return customRender(ui, { user })
}

export const renderWithRole = (ui: ReactElement, role: keyof typeof mockUsers) => {
  return customRender(ui, { user: mockUsers[role] })
}

export const renderWithLoading = (ui: ReactElement) => {
  return customRender(ui, { loading: true })
}

export const renderUnauthenticated = (ui: ReactElement) => {
  return customRender(ui, { user: null })
}

// Mock data generators
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'team',
  is_admin: false,
  ...overrides,
})

export const createMockProject = (overrides = {}) => ({
  id: 1,
  name: 'Test Project',
  client_id: 1,
  status: 'active',
  description: 'Test project description',
  start_date: '2024-01-01',
  end_date: '2024-06-01',
  created_at: '2024-01-01T00:00:00.000000Z',
  updated_at: '2024-01-01T00:00:00.000000Z',
  ...overrides,
})

export const createMockTask = (overrides = {}) => ({
  id: 1,
  project_id: 1,
  assigned_to: 1,
  title: 'Test Task',
  description: 'Test task description',
  status: 'todo',
  priority: 'medium',
  due_date: '2024-12-31',
  created_at: '2024-01-01T00:00:00.000000Z',
  updated_at: '2024-01-01T00:00:00.000000Z',
  ...overrides,
})

// Mock API responses
export const mockApiResponses = {
  login: {
    user: mockUsers.admin,
    token: 'mock-jwt-token',
  },
  users: [mockUsers.admin, mockUsers.pm, mockUsers.team, mockUsers.client],
  projects: [createMockProject()],
  tasks: [createMockTask()],
}

// Test assertions helpers
export const expectToBeInDocument = (text: string) => {
  expect(screen.getByText(text)).toBeInTheDocument()
}

export const expectNotToBeInDocument = (text: string) => {
  expect(screen.queryByText(text)).not.toBeInTheDocument()
}

export const expectToHaveRole = (element: HTMLElement, role: string) => {
  expect(element).toHaveAttribute('role', role)
}

export const expectToHaveClass = (element: HTMLElement, className: string) => {
  expect(element).toHaveClass(className)
}

// Mock router functions
export const mockNavigate = vi.fn()
export const mockUseNavigate = () => mockNavigate

export const mockUseLocation = (pathname = '/') => ({
  pathname,
  search: '',
  hash: '',
  state: null,
  key: 'default',
})

// Mock router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: mockUseNavigate,
    useLocation: () => mockUseLocation(),
  }
})
