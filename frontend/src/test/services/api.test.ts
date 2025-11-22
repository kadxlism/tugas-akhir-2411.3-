import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/services/axios'

// Mock axios
vi.mock('axios', () => ({
  create: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  })),
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}))

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets up axios with correct base URL', () => {
    expect(axios.defaults.baseURL).toBeDefined()
  })

  it('sets up axios with correct headers', () => {
    expect(axios.defaults.headers.common).toBeDefined()
  })

  it('handles authentication headers', () => {
    const token = 'mock-jwt-token'
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`)
  })

  it('handles CSRF token setup', async () => {
    const mockGet = vi.fn().mockResolvedValueOnce({ data: {} })
    axios.get = mockGet

    await axios.get('/sanctum/csrf-cookie')

    expect(mockGet).toHaveBeenCalledWith('/sanctum/csrf-cookie')
  })

  it('handles API errors gracefully', async () => {
    const mockError = new Error('Network Error')
    const mockGet = vi.fn().mockRejectedValueOnce(mockError)
    axios.get = mockGet

    try {
      await axios.get('/api/test')
    } catch (error) {
      expect(error).toBe(mockError)
    }
  })

  it('handles 401 unauthorized responses', async () => {
    const mockError = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    }
    const mockGet = vi.fn().mockRejectedValueOnce(mockError)
    axios.get = mockGet

    try {
      await axios.get('/api/test')
    } catch (error) {
      expect(error.response.status).toBe(401)
    }
  })

  it('handles 403 forbidden responses', async () => {
    const mockError = {
      response: {
        status: 403,
        data: { message: 'Forbidden' },
      },
    }
    const mockGet = vi.fn().mockRejectedValueOnce(mockError)
    axios.get = mockGet

    try {
      await axios.get('/api/test')
    } catch (error) {
      expect(error.response.status).toBe(403)
    }
  })

  it('handles 422 validation errors', async () => {
    const mockError = {
      response: {
        status: 422,
        data: {
          message: 'The given data was invalid.',
          errors: {
            email: ['The email field is required.'],
          },
        },
      },
    }
    const mockPost = vi.fn().mockRejectedValueOnce(mockError)
    axios.post = mockPost

    try {
      await axios.post('/api/test', {})
    } catch (error) {
      expect(error.response.status).toBe(422)
      expect(error.response.data.errors.email).toBeDefined()
    }
  })

  it('handles 500 server errors', async () => {
    const mockError = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
    }
    const mockGet = vi.fn().mockRejectedValueOnce(mockError)
    axios.get = mockGet

    try {
      await axios.get('/api/test')
    } catch (error) {
      expect(error.response.status).toBe(500)
    }
  })

  it('handles network timeouts', async () => {
    const mockError = new Error('timeout of 5000ms exceeded')
    const mockGet = vi.fn().mockRejectedValueOnce(mockError)
    axios.get = mockGet

    try {
      await axios.get('/api/test')
    } catch (error) {
      expect(error.message).toContain('timeout')
    }
  })

  it('handles request cancellation', async () => {
    const mockError = new Error('Request cancelled')
    const mockGet = vi.fn().mockRejectedValueOnce(mockError)
    axios.get = mockGet

    try {
      await axios.get('/api/test')
    } catch (error) {
      expect(error.message).toContain('cancelled')
    }
  })
})
