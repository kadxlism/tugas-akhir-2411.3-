import { http, HttpResponse } from 'msw'

// Mock data
const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  {
    id: 2,
    name: 'Project Manager',
    email: 'pm@test.com',
    role: 'pm',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  {
    id: 3,
    name: 'Team Member',
    email: 'team@test.com',
    role: 'team',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  {
    id: 4,
    name: 'Client User',
    email: 'client@test.com',
    role: 'client',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
]

const mockProjects = [
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
    name: 'Mobile App',
    client_id: 4,
    status: 'in_progress',
    start_date: '2024-02-01',
    end_date: '2024-08-01',
    description: 'Cross-platform mobile application',
    created_at: '2024-02-01T00:00:00.000000Z',
    updated_at: '2024-02-01T00:00:00.000000Z',
  },
]

const mockTasks = [
  {
    id: 1,
    project_id: 1,
    assigned_to: 3,
    title: 'Project Planning',
    description: 'Define project requirements',
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
    description: 'Design database schema',
    status: 'in_progress',
    priority: 'medium',
    due_date: '2024-02-01',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
]

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', ({ request }) => {
    const body = request.json()
    return HttpResponse.json({
      user: mockUsers[0], // Return admin user
      token: 'mock-jwt-token',
    })
  }),

  http.post('/api/auth/register', ({ request }) => {
    const body = request.json()
    return HttpResponse.json({
      user: {
        id: 5,
        name: 'New User',
        email: 'newuser@test.com',
        role: 'team',
        created_at: '2024-01-01T00:00:00.000000Z',
        updated_at: '2024-01-01T00:00:00.000000Z',
      },
    }, { status: 201 })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    }
    return HttpResponse.json({ user: mockUsers[0] })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out' })
  }),

  // Admin user management endpoints
  http.get('/admin/users', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    }
    return HttpResponse.json(mockUsers)
  }),

  http.post('/admin/users', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    }
    const body = request.json()
    return HttpResponse.json({
      id: 5,
      name: 'New User',
      email: 'newuser@test.com',
      role: 'team',
      created_at: '2024-01-01T00:00:00.000000Z',
      updated_at: '2024-01-01T00:00:00.000000Z',
    }, { status: 201 })
  }),

  http.put('/admin/users/:id', ({ request, params }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    }
    const body = request.json()
    return HttpResponse.json({
      id: params.id,
      name: 'Updated User',
      email: 'updated@test.com',
      role: 'team',
      created_at: '2024-01-01T00:00:00.000000Z',
      updated_at: '2024-01-01T00:00:00.000000Z',
    })
  }),

  http.delete('/admin/users/:id', ({ request, params }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    }
    return HttpResponse.json({ message: 'User deleted' })
  }),

  // Project endpoints
  http.get('/api/projects', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    }
    return HttpResponse.json(mockProjects)
  }),

  http.post('/api/projects', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    }
    const body = request.json()
    return HttpResponse.json({
      id: 3,
      name: 'New Project',
      client_id: 4,
      status: 'active',
      created_at: '2024-01-01T00:00:00.000000Z',
      updated_at: '2024-01-01T00:00:00.000000Z',
    }, { status: 201 })
  }),

  // Task endpoints
  http.get('/api/projects/:id/tasks', ({ request, params }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    }
    return HttpResponse.json(mockTasks)
  }),

  http.post('/api/projects/:id/tasks', ({ request, params }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    }
    const body = request.json()
    return HttpResponse.json({
      id: 3,
      project_id: params.id,
      assigned_to: 3,
      title: 'New Task',
      description: 'Task description',
      status: 'todo',
      priority: 'medium',
      created_at: '2024-01-01T00:00:00.000000Z',
      updated_at: '2024-01-01T00:00:00.000000Z',
    }, { status: 201 })
  }),
]
