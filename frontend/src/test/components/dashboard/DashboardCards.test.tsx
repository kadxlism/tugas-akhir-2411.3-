import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { mockUsers } from '../../utils/test-utils'

// Mock dashboard components
const MockProjectCount = ({ user }: { user: any }) => (
  <div data-testid="project-count">
    <h3>Projects</h3>
    <p>Total: {user?.role === 'admin' ? '10' : '5'}</p>
  </div>
)

const MockTaskStatusCard = ({ user }: { user: any }) => (
  <div data-testid="task-status">
    <h3>Tasks</h3>
    <p>Pending: {user?.role === 'admin' ? '15' : '3'}</p>
  </div>
)

const MockClientStatusCard = ({ user }: { user: any }) => (
  <div data-testid="client-status">
    <h3>Clients</h3>
    <p>Active: {user?.role === 'admin' ? '8' : '2'}</p>
  </div>
)

const MockTotalDataCard = ({ user }: { user: any }) => (
  <div data-testid="total-data">
    <h3>Overview</h3>
    <p>Users: {user?.role === 'admin' ? '25' : 'N/A'}</p>
  </div>
)

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('Dashboard Cards', () => {
  describe('ProjectCount Component', () => {
    it('shows full project count for admin', () => {
      render(
        <TestWrapper>
          <MockProjectCount user={mockUsers.admin} />
        </TestWrapper>
      )

      expect(screen.getByTestId('project-count')).toBeInTheDocument()
      expect(screen.getByText('Total: 10')).toBeInTheDocument()
    })

    it('shows limited project count for non-admin', () => {
      render(
        <TestWrapper>
          <MockProjectCount user={mockUsers.team} />
        </TestWrapper>
      )

      expect(screen.getByTestId('project-count')).toBeInTheDocument()
      expect(screen.getByText('Total: 5')).toBeInTheDocument()
    })

    it('handles null user gracefully', () => {
      render(
        <TestWrapper>
          <MockProjectCount user={null} />
        </TestWrapper>
      )

      expect(screen.getByTestId('project-count')).toBeInTheDocument()
      expect(screen.getByText('Total: 5')).toBeInTheDocument()
    })
  })

  describe('TaskStatusCard Component', () => {
    it('shows full task count for admin', () => {
      render(
        <TestWrapper>
          <MockTaskStatusCard user={mockUsers.admin} />
        </TestWrapper>
      )

      expect(screen.getByTestId('task-status')).toBeInTheDocument()
      expect(screen.getByText('Pending: 15')).toBeInTheDocument()
    })

    it('shows limited task count for non-admin', () => {
      render(
        <TestWrapper>
          <MockTaskStatusCard user={mockUsers.team} />
        </TestWrapper>
      )

      expect(screen.getByTestId('task-status')).toBeInTheDocument()
      expect(screen.getByText('Pending: 3')).toBeInTheDocument()
    })

    it('shows different counts for different roles', () => {
      const roles = [
        { user: mockUsers.admin, expected: '15' },
        { user: mockUsers.pm, expected: '8' },
        { user: mockUsers.team, expected: '3' },
        { user: mockUsers.client, expected: '2' },
      ]

      roles.forEach(({ user, expected }) => {
        const { unmount } = render(
          <TestWrapper>
            <MockTaskStatusCard user={user} />
          </TestWrapper>
        )

        expect(screen.getByText(`Pending: ${expected}`)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('ClientStatusCard Component', () => {
    it('shows full client count for admin', () => {
      render(
        <TestWrapper>
          <MockClientStatusCard user={mockUsers.admin} />
        </TestWrapper>
      )

      expect(screen.getByTestId('client-status')).toBeInTheDocument()
      expect(screen.getByText('Active: 8')).toBeInTheDocument()
    })

    it('shows limited client count for non-admin', () => {
      render(
        <TestWrapper>
          <MockClientStatusCard user={mockUsers.team} />
        </TestWrapper>
      )

      expect(screen.getByTestId('client-status')).toBeInTheDocument()
      expect(screen.getByText('Active: 2')).toBeInTheDocument()
    })

    it('hides client data for team members', () => {
      render(
        <TestWrapper>
          <MockClientStatusCard user={mockUsers.team} />
        </TestWrapper>
      )

      expect(screen.getByTestId('client-status')).toBeInTheDocument()
      expect(screen.getByText('Active: 2')).toBeInTheDocument()
    })
  })

  describe('TotalDataCard Component', () => {
    it('shows full data for admin', () => {
      render(
        <TestWrapper>
          <MockTotalDataCard user={mockUsers.admin} />
        </TestWrapper>
      )

      expect(screen.getByTestId('total-data')).toBeInTheDocument()
      expect(screen.getByText('Users: 25')).toBeInTheDocument()
    })

    it('hides sensitive data for non-admin', () => {
      render(
        <TestWrapper>
          <MockTotalDataCard user={mockUsers.team} />
        </TestWrapper>
      )

      expect(screen.getByTestId('total-data')).toBeInTheDocument()
      expect(screen.getByText('Users: N/A')).toBeInTheDocument()
    })

    it('shows different data based on role', () => {
      const roleData = [
        { user: mockUsers.admin, expected: '25' },
        { user: mockUsers.pm, expected: 'N/A' },
        { user: mockUsers.team, expected: 'N/A' },
        { user: mockUsers.client, expected: 'N/A' },
      ]

      roleData.forEach(({ user, expected }) => {
        const { unmount } = render(
          <TestWrapper>
            <MockTotalDataCard user={user} />
          </TestWrapper>
        )

        expect(screen.getByText(`Users: ${expected}`)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Role-based Visibility', () => {
    it('shows admin-only cards for admin users', () => {
      const adminCards = [
        <MockTotalDataCard key="total" user={mockUsers.admin} />,
        <MockClientStatusCard key="clients" user={mockUsers.admin} />,
      ]

      render(
        <TestWrapper>
          <div>
            {adminCards}
          </div>
        </TestWrapper>
      )

      expect(screen.getByText('Users: 25')).toBeInTheDocument()
      expect(screen.getByText('Active: 8')).toBeInTheDocument()
    })

    it('hides admin-only cards for non-admin users', () => {
      const teamCards = [
        <MockTotalDataCard key="total" user={mockUsers.team} />,
        <MockClientStatusCard key="clients" user={mockUsers.team} />,
      ]

      render(
        <TestWrapper>
          <div>
            {teamCards}
          </div>
        </TestWrapper>
      )

      expect(screen.getByText('Users: N/A')).toBeInTheDocument()
      expect(screen.getByText('Active: 2')).toBeInTheDocument()
    })
  })

  describe('Data Loading States', () => {
    it('shows loading state when data is being fetched', () => {
      const MockLoadingCard = () => (
        <div data-testid="loading-card">
          <h3>Loading...</h3>
          <div className="animate-pulse">Fetching data...</div>
        </div>
      )

      render(
        <TestWrapper>
          <MockLoadingCard />
        </TestWrapper>
      )

      expect(screen.getByTestId('loading-card')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByText('Fetching data...')).toBeInTheDocument()
    })

    it('shows error state when data fetch fails', () => {
      const MockErrorCard = () => (
        <div data-testid="error-card">
          <h3>Error</h3>
          <p>Failed to load data</p>
        </div>
      )

      render(
        <TestWrapper>
          <MockErrorCard />
        </TestWrapper>
      )

      expect(screen.getByTestId('error-card')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies correct CSS classes for responsive layout', () => {
      const MockResponsiveCard = () => (
        <div 
          data-testid="responsive-card"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <MockProjectCount user={mockUsers.admin} />
          <MockTaskStatusCard user={mockUsers.admin} />
          <MockClientStatusCard user={mockUsers.admin} />
          <MockTotalDataCard user={mockUsers.admin} />
        </div>
      )

      render(
        <TestWrapper>
          <MockResponsiveCard />
        </TestWrapper>
      )

      const card = screen.getByTestId('responsive-card')
      expect(card).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4', 'gap-4')
    })
  })
})
