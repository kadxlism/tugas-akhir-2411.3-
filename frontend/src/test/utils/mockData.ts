import { User } from '@/types/auth'

// Mock user data for different roles
export const mockUsers: Record<string, User> = {
  admin: {
    id: 1,
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
    is_admin: true,
  },
  pm: {
    id: 2,
    name: 'PM User',
    email: 'pm@test.com',
    role: 'pm',
    is_admin: false,
  },
  team: {
    id: 3,
    name: 'Team User',
    email: 'team@test.com',
    role: 'team',
    is_admin: false,
  },
  client: {
    id: 4,
    name: 'Client User',
    email: 'client@test.com',
    role: 'client',
    is_admin: false,
  },
}

// Mock project data
export const mockProjects = [
  {
    id: 1,
    name: 'E-commerce Website',
    client_id: 4,
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-06-01',
    description: 'A comprehensive e-commerce platform',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  {
    id: 2,
    name: 'Mobile App Development',
    client_id: 4,
    status: 'in_progress',
    start_date: '2024-02-01',
    end_date: '2024-08-01',
    description: 'Cross-platform mobile application',
    created_at: '2024-02-01T00:00:00.000000Z',
    updated_at: '2024-02-01T00:00:00.000000Z',
  },
  {
    id: 3,
    name: 'Data Analytics Dashboard',
    client_id: 4,
    status: 'completed',
    start_date: '2024-01-15',
    end_date: '2024-03-15',
    description: 'Real-time analytics dashboard',
    created_at: '2024-01-15T00:00:00.000000Z',
    updated_at: '2024-03-15T00:00:00.000000Z',
  },
]

// Mock task data
export const mockTasks = [
  {
    id: 1,
    project_id: 1,
    assigned_to: 3,
    title: 'Project Planning',
    description: 'Define project requirements and create detailed plan',
    status: 'done',
    priority: 'high',
    due_date: '2024-01-15',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  {
    id: 2,
    project_id: 1,
    assigned_to: 3,
    title: 'Database Design',
    description: 'Design and implement database schema',
    status: 'done',
    priority: 'high',
    due_date: '2024-01-20',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  {
    id: 3,
    project_id: 1,
    assigned_to: 3,
    title: 'Frontend Development',
    description: 'Develop user interface components',
    status: 'in_progress',
    priority: 'medium',
    due_date: '2024-02-15',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  {
    id: 4,
    project_id: 1,
    assigned_to: 3,
    title: 'Backend API',
    description: 'Implement REST API endpoints',
    status: 'in_progress',
    priority: 'medium',
    due_date: '2024-02-20',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  {
    id: 5,
    project_id: 1,
    assigned_to: 3,
    title: 'Testing',
    description: 'Perform comprehensive testing',
    status: 'todo',
    priority: 'high',
    due_date: '2024-03-01',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  {
    id: 6,
    project_id: 1,
    assigned_to: 3,
    title: 'Deployment',
    description: 'Deploy application to production',
    status: 'todo',
    priority: 'medium',
    due_date: '2024-03-15',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
]

// Mock client data
export const mockClients = [
  {
    id: 4,
    name: 'Client User',
    email: 'client@test.com',
    role: 'client',
    company: 'Acme Corp',
    phone: '+1-555-0123',
    address: '123 Main St, City, State 12345',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  {
    id: 5,
    name: 'Another Client',
    email: 'another@client.com',
    role: 'client',
    company: 'Beta Inc',
    phone: '+1-555-0456',
    address: '456 Oak Ave, City, State 67890',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
]

// Mock dashboard statistics
export const mockDashboardStats = {
  admin: {
    totalUsers: 25,
    activeProjects: 10,
    pendingTasks: 15,
    totalClients: 8,
    completedProjects: 6,
    inProgressTasks: 8,
    completedTasks: 12,
    overdueTasks: 3,
  },
  pm: {
    totalUsers: 0, // PM can't see user count
    activeProjects: 5,
    pendingTasks: 8,
    totalClients: 0, // PM can't see client count
    completedProjects: 2,
    inProgressTasks: 5,
    completedTasks: 6,
    overdueTasks: 1,
  },
  team: {
    totalUsers: 0,
    activeProjects: 3,
    pendingTasks: 3,
    totalClients: 0,
    completedProjects: 1,
    inProgressTasks: 2,
    completedTasks: 4,
    overdueTasks: 0,
  },
  client: {
    totalUsers: 0,
    activeProjects: 2,
    pendingTasks: 2,
    totalClients: 0,
    completedProjects: 1,
    inProgressTasks: 1,
    completedTasks: 2,
    overdueTasks: 0,
  },
}

// Mock chart data
export const mockChartData = {
  taskStatus: {
    labels: ['Todo', 'In Progress', 'Review', 'Done'],
    datasets: [{
      data: [15, 8, 5, 12],
      backgroundColor: ['#3B82F6', '#F59E0B', '#EF4444', '#10B981'],
    }]
  },
  userRoles: {
    labels: ['Admin', 'PM', 'Team', 'Client'],
    datasets: [{
      data: [2, 3, 8, 5],
      backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'],
    }]
  },
  projectProgress: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Progress',
      data: [20, 35, 50, 75],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    }]
  },
}

// Mock API responses
export const mockApiResponses = {
  login: {
    user: mockUsers.admin,
    token: 'mock-jwt-token',
  },
  register: {
    user: mockUsers.team,
  },
  users: Object.values(mockUsers),
  projects: mockProjects,
  tasks: mockTasks,
  clients: mockClients,
  dashboardStats: mockDashboardStats.admin,
  chartData: mockChartData,
}

// Mock error responses
export const mockErrorResponses = {
  unauthorized: {
    message: 'Unauthorized',
    status: 401,
  },
  forbidden: {
    message: 'Forbidden',
    status: 403,
  },
  notFound: {
    message: 'Not Found',
    status: 404,
  },
  validationError: {
    message: 'The given data was invalid.',
    errors: {
      name: ['The name field is required.'],
      email: ['The email field is required.'],
      password: ['The password field is required.'],
    },
    status: 422,
  },
  serverError: {
    message: 'Internal Server Error',
    status: 500,
  },
}

// Mock form data
export const mockFormData = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    password_confirmation: 'password123',
    role: 'team',
  },
  project: {
    name: 'Test Project',
    client_id: 4,
    status: 'active',
    description: 'Test project description',
    start_date: '2024-01-01',
    end_date: '2024-06-01',
  },
  task: {
    title: 'Test Task',
    description: 'Test task description',
    assigned_to: 3,
    status: 'todo',
    priority: 'medium',
    due_date: '2024-12-31',
  },
}

// Mock navigation items
export const mockNavigationItems = {
  admin: [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Clients', href: '/clients', icon: 'clients' },
    { name: 'Projects', href: '/projects', icon: 'projects' },
    { name: 'Tasks', href: '/tasks', icon: 'tasks' },
    { name: 'Timeline', href: '/timeline', icon: 'timeline' },
    { name: 'Time Tracker', href: '/time-tracker', icon: 'time' },
    { name: 'Assign Users', href: '/assign', icon: 'assign' },
    { name: 'User Management', href: '/admin/users', icon: 'users' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ],
  pm: [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ],
  team: [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ],
  client: [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ],
}

// Mock permissions
export const mockPermissions = {
  admin: {
    canViewUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewAllProjects: true,
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: true,
    canViewAllTasks: true,
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: true,
    canViewClients: true,
    canCreateClients: true,
    canEditClients: true,
    canDeleteClients: true,
  },
  pm: {
    canViewUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllProjects: true,
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canViewAllTasks: true,
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: true,
    canViewClients: false,
    canCreateClients: false,
    canEditClients: false,
    canDeleteClients: false,
  },
  team: {
    canViewUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllProjects: false,
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewAllTasks: false,
    canCreateTasks: false,
    canEditTasks: true,
    canDeleteTasks: false,
    canViewClients: false,
    canCreateClients: false,
    canEditClients: false,
    canDeleteClients: false,
  },
  client: {
    canViewUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllProjects: false,
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewAllTasks: false,
    canCreateTasks: false,
    canEditTasks: false,
    canDeleteTasks: false,
    canViewClients: false,
    canCreateClients: false,
    canEditClients: false,
    canDeleteClients: false,
  },
}

// Helper functions
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

export const createMockClient = (overrides = {}) => ({
  id: 1,
  name: 'Test Client',
  email: 'client@test.com',
  role: 'client',
  company: 'Test Company',
  phone: '+1-555-0123',
  address: '123 Test St, Test City, TS 12345',
  created_at: '2024-01-01T00:00:00.000000Z',
  updated_at: '2024-01-01T00:00:00.000000Z',
  ...overrides,
})
