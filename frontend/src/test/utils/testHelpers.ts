import { render, RenderOptions, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { ReactElement } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { User } from '@/types/auth'
import { mockUsers } from './mockData'

// Mock axios
export const mockAxios = {
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

// Mock useAuth hook
export const mockUseAuth = vi.fn()

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

// Mock axios
vi.mock('@/services/axios', () => ({
  default: mockAxios,
}))

// Mock useAuth hook
vi.mock('@/contexts/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null
  loading?: boolean
  initialEntries?: string[]
}

const AllTheProviders = ({ 
  children, 
  user = null, 
  loading = false,
  initialEntries = ['/']
}: { 
  children: React.ReactNode
  user?: User | null
  loading?: boolean
  initialEntries?: string[]
}) => {
  const authValue = {
    user,
    setUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    loading,
  }

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, loading, initialEntries, ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders user={user} loading={loading} initialEntries={initialEntries}>
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

// Form testing helpers
export const fillForm = (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    const input = screen.getByLabelText(new RegExp(field, 'i'))
    fireEvent.change(input, { target: { value } })
  })
}

export const submitForm = (buttonText: string = 'Submit') => {
  const submitButton = screen.getByRole('button', { name: new RegExp(buttonText, 'i') })
  fireEvent.click(submitButton)
}

export const expectFormError = (errorMessage: string) => {
  expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
}

// API testing helpers
export const mockApiSuccess = (endpoint: string, data: any) => {
  mockAxios.get.mockResolvedValueOnce({ data })
  mockAxios.post.mockResolvedValueOnce({ data })
  mockAxios.put.mockResolvedValueOnce({ data })
  mockAxios.delete.mockResolvedValueOnce({ data })
}

export const mockApiError = (endpoint: string, error: Error) => {
  mockAxios.get.mockRejectedValueOnce(error)
  mockAxios.post.mockRejectedValueOnce(error)
  mockAxios.put.mockRejectedValueOnce(error)
  mockAxios.delete.mockRejectedValueOnce(error)
}

export const expectApiCall = (method: 'get' | 'post' | 'put' | 'delete', endpoint: string) => {
  expect(mockAxios[method]).toHaveBeenCalledWith(endpoint)
}

export const expectApiCallWithData = (method: 'post' | 'put', endpoint: string, data: any) => {
  expect(mockAxios[method]).toHaveBeenCalledWith(endpoint, data)
}

// Navigation testing helpers
export const expectNavigation = (path: string) => {
  expect(mockNavigate).toHaveBeenCalledWith(path)
}

export const expectNoNavigation = () => {
  expect(mockNavigate).not.toHaveBeenCalled()
}

// Role testing helpers
export const testRoleAccess = (component: ReactElement, role: keyof typeof mockUsers, shouldHaveAccess: boolean) => {
  const { unmount } = renderWithRole(component, role)
  
  if (shouldHaveAccess) {
    expect(screen.queryByText(/unauthorized/i)).not.toBeInTheDocument()
  } else {
    expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
  }
  
  unmount()
}

export const testAllRoles = (component: ReactElement, adminOnly: boolean = false) => {
  const roles = ['admin', 'pm', 'team', 'client'] as const
  
  roles.forEach(role => {
    const shouldHaveAccess = adminOnly ? role === 'admin' : true
    testRoleAccess(component, role, shouldHaveAccess)
  })
}

// Loading state helpers
export const expectLoadingState = () => {
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
}

export const expectNoLoadingState = () => {
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
}

// Error state helpers
export const expectErrorState = (errorMessage: string) => {
  expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
}

export const expectNoErrorState = () => {
  expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
}

// Table testing helpers
export const expectTableRow = (rowText: string) => {
  expect(screen.getByText(rowText)).toBeInTheDocument()
}

export const expectTableHeader = (headerText: string) => {
  expect(screen.getByRole('columnheader', { name: new RegExp(headerText, 'i') })).toBeInTheDocument()
}

export const clickTableAction = (actionText: string, rowIndex: number = 0) => {
  const actionButtons = screen.getAllByRole('button', { name: new RegExp(actionText, 'i') })
  fireEvent.click(actionButtons[rowIndex])
}

// Modal testing helpers
export const expectModalOpen = (modalTitle: string) => {
  expect(screen.getByText(new RegExp(modalTitle, 'i'))).toBeInTheDocument()
}

export const expectModalClosed = (modalTitle: string) => {
  expect(screen.queryByText(new RegExp(modalTitle, 'i'))).not.toBeInTheDocument()
}

export const closeModal = (buttonText: string = 'Close') => {
  const closeButton = screen.getByRole('button', { name: new RegExp(buttonText, 'i') })
  fireEvent.click(closeButton)
}

// Search and filter helpers
export const searchFor = (searchTerm: string) => {
  const searchInput = screen.getByPlaceholderText(/search/i)
  fireEvent.change(searchInput, { target: { value: searchTerm } })
}

export const filterBy = (filterLabel: string, value: string) => {
  const filterSelect = screen.getByLabelText(new RegExp(filterLabel, 'i'))
  fireEvent.change(filterSelect, { target: { value } })
}

// Wait helpers
export const waitForApiCall = async (method: 'get' | 'post' | 'put' | 'delete') => {
  await waitFor(() => {
    expect(mockAxios[method]).toHaveBeenCalled()
  })
}

export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
}

export const waitForError = async (errorMessage: string) => {
  await waitFor(() => {
    expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
  })
}

// Cleanup helpers
export const cleanupMocks = () => {
  vi.clearAllMocks()
  mockAxios.get.mockClear()
  mockAxios.post.mockClear()
  mockAxios.put.mockClear()
  mockAxios.delete.mockClear()
  mockNavigate.mockClear()
}

// Setup helpers
export const setupMockUser = (role: keyof typeof mockUsers) => {
  mockUseAuth.mockReturnValue({
    user: mockUsers[role],
    loading: false,
  })
}

export const setupMockLoading = () => {
  mockUseAuth.mockReturnValue({
    user: null,
    loading: true,
  })
}

export const setupMockUnauthenticated = () => {
  mockUseAuth.mockReturnValue({
    user: null,
    loading: false,
  })
}

// Test data generators
export const generateMockUsers = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `User ${index + 1}`,
    email: `user${index + 1}@test.com`,
    role: 'team' as const,
    is_admin: false,
  }))
}

export const generateMockProjects = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Project ${index + 1}`,
    client_id: 1,
    status: 'active' as const,
    description: `Description for project ${index + 1}`,
    start_date: '2024-01-01',
    end_date: '2024-06-01',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  }))
}

export const generateMockTasks = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    project_id: 1,
    assigned_to: 1,
    title: `Task ${index + 1}`,
    description: `Description for task ${index + 1}`,
    status: 'todo' as const,
    priority: 'medium' as const,
    due_date: '2024-12-31',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  }))
}
