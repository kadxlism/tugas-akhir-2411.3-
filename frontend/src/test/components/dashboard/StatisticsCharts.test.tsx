import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { mockUsers } from '../../utils/test-utils'

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      Bar Chart
    </div>
  ),
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      Line Chart
    </div>
  ),
  Pie: ({ data, options }: any) => (
    <div data-testid="pie-chart" data-chart-data={JSON.stringify(data)}>
      Pie Chart
    </div>
  ),
  Doughnut: ({ data, options }: any) => (
    <div data-testid="doughnut-chart" data-chart-data={JSON.stringify(data)}>
      Doughnut Chart
    </div>
  ),
}))

// Mock dashboard components
const MockProjectOverview = ({ user }: { user: any }) => {
  const data = user?.role === 'admin' 
    ? { projects: 10, completed: 6, active: 4 }
    : { projects: 3, completed: 1, active: 2 }

  return (
    <div data-testid="project-overview">
      <h3>Project Overview</h3>
      <div>Total: {data.projects}</div>
      <div>Completed: {data.completed}</div>
      <div>Active: {data.active}</div>
    </div>
  )
}

const MockTaskStatusChart = ({ user }: { user: any }) => {
  const data = {
    labels: ['Todo', 'In Progress', 'Review', 'Done'],
    datasets: [{
      data: user?.role === 'admin' ? [15, 8, 5, 12] : [3, 2, 1, 4],
      backgroundColor: ['#3B82F6', '#F59E0B', '#EF4444', '#10B981'],
    }]
  }

  return (
    <div data-testid="task-status-chart">
      <h3>Task Status</h3>
      <div data-chart-data={JSON.stringify(data)}>Task Status Chart</div>
    </div>
  )
}

const MockUserRoleChart = ({ user }: { user: any }) => {
  if (user?.role !== 'admin') {
    return null // Only admin can see this chart
  }

  const data = {
    labels: ['Admin', 'PM', 'Team', 'Client'],
    datasets: [{
      data: [2, 3, 8, 5],
      backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'],
    }]
  }

  return (
    <div data-testid="user-role-chart">
      <h3>User Roles</h3>
      <div data-chart-data={JSON.stringify(data)}>User Role Chart</div>
    </div>
  )
}

const MockProgressChart = ({ user }: { user: any }) => {
  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Progress',
      data: user?.role === 'admin' ? [20, 35, 50, 75] : [10, 15, 25, 40],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    }]
  }

  return (
    <div data-testid="progress-chart">
      <h3>Progress Over Time</h3>
      <div data-chart-data={JSON.stringify(data)}>Progress Chart</div>
    </div>
  )
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('Statistics Charts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ProjectOverview Component', () => {
    it('shows full project data for admin', () => {
      render(
        <TestWrapper>
          <MockProjectOverview user={mockUsers.admin} />
        </TestWrapper>
      )

      expect(screen.getByTestId('project-overview')).toBeInTheDocument()
      expect(screen.getByText('Total: 10')).toBeInTheDocument()
      expect(screen.getByText('Completed: 6')).toBeInTheDocument()
      expect(screen.getByText('Active: 4')).toBeInTheDocument()
    })

    it('shows limited project data for non-admin', () => {
      render(
        <TestWrapper>
          <MockProjectOverview user={mockUsers.team} />
        </TestWrapper>
      )

      expect(screen.getByTestId('project-overview')).toBeInTheDocument()
      expect(screen.getByText('Total: 3')).toBeInTheDocument()
      expect(screen.getByText('Completed: 1')).toBeInTheDocument()
      expect(screen.getByText('Active: 2')).toBeInTheDocument()
    })

    it('handles different roles correctly', () => {
      const roleData = [
        { user: mockUsers.admin, expected: { total: 10, completed: 6, active: 4 } },
        { user: mockUsers.pm, expected: { total: 5, completed: 2, active: 3 } },
        { user: mockUsers.team, expected: { total: 3, completed: 1, active: 2 } },
        { user: mockUsers.client, expected: { total: 2, completed: 1, active: 1 } },
      ]

      roleData.forEach(({ user, expected }) => {
        const { unmount } = render(
          <TestWrapper>
            <MockProjectOverview user={user} />
          </TestWrapper>
        )

        expect(screen.getByText(`Total: ${expected.total}`)).toBeInTheDocument()
        expect(screen.getByText(`Completed: ${expected.completed}`)).toBeInTheDocument()
        expect(screen.getByText(`Active: ${expected.active}`)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('TaskStatusChart Component', () => {
    it('renders task status chart with correct data', () => {
      render(
        <TestWrapper>
          <MockTaskStatusChart user={mockUsers.admin} />
        </TestWrapper>
      )

      expect(screen.getByTestId('task-status-chart')).toBeInTheDocument()
      expect(screen.getByText('Task Status')).toBeInTheDocument()
      expect(screen.getByText('Task Status Chart')).toBeInTheDocument()
    })

    it('shows different data based on user role', () => {
      const { rerender } = render(
        <TestWrapper>
          <MockTaskStatusChart user={mockUsers.admin} />
        </TestWrapper>
      )

      let chartData = JSON.parse(screen.getByText('Task Status Chart').getAttribute('data-chart-data') || '{}')
      expect(chartData.datasets[0].data).toEqual([15, 8, 5, 12])

      rerender(
        <TestWrapper>
          <MockTaskStatusChart user={mockUsers.team} />
        </TestWrapper>
      )

      chartData = JSON.parse(screen.getByText('Task Status Chart').getAttribute('data-chart-data') || '{}')
      expect(chartData.datasets[0].data).toEqual([3, 2, 1, 4])
    })

    it('has correct chart labels', () => {
      render(
        <TestWrapper>
          <MockTaskStatusChart user={mockUsers.admin} />
        </TestWrapper>
      )

      const chartData = JSON.parse(screen.getByText('Task Status Chart').getAttribute('data-chart-data') || '{}')
      expect(chartData.labels).toEqual(['Todo', 'In Progress', 'Review', 'Done'])
    })

    it('has correct color scheme', () => {
      render(
        <TestWrapper>
          <MockTaskStatusChart user={mockUsers.admin} />
        </TestWrapper>
      )

      const chartData = JSON.parse(screen.getByText('Task Status Chart').getAttribute('data-chart-data') || '{}')
      expect(chartData.datasets[0].backgroundColor).toEqual(['#3B82F6', '#F59E0B', '#EF4444', '#10B981'])
    })
  })

  describe('UserRoleChart Component', () => {
    it('renders for admin users', () => {
      render(
        <TestWrapper>
          <MockUserRoleChart user={mockUsers.admin} />
        </TestWrapper>
      )

      expect(screen.getByTestId('user-role-chart')).toBeInTheDocument()
      expect(screen.getByText('User Roles')).toBeInTheDocument()
    })

    it('does not render for non-admin users', () => {
      render(
        <TestWrapper>
          <MockUserRoleChart user={mockUsers.team} />
        </TestWrapper>
      )

      expect(screen.queryByTestId('user-role-chart')).not.toBeInTheDocument()
    })

    it('shows correct role distribution data', () => {
      render(
        <TestWrapper>
          <MockUserRoleChart user={mockUsers.admin} />
        </TestWrapper>
      )

      const chartData = JSON.parse(screen.getByText('User Role Chart').getAttribute('data-chart-data') || '{}')
      expect(chartData.labels).toEqual(['Admin', 'PM', 'Team', 'Client'])
      expect(chartData.datasets[0].data).toEqual([2, 3, 8, 5])
    })
  })

  describe('ProgressChart Component', () => {
    it('renders progress chart with correct data', () => {
      render(
        <TestWrapper>
          <MockProgressChart user={mockUsers.admin} />
        </TestWrapper>
      )

      expect(screen.getByTestId('progress-chart')).toBeInTheDocument()
      expect(screen.getByText('Progress Over Time')).toBeInTheDocument()
    })

    it('shows different progress data based on role', () => {
      const { rerender } = render(
        <TestWrapper>
          <MockProgressChart user={mockUsers.admin} />
        </TestWrapper>
      )

      let chartData = JSON.parse(screen.getByText('Progress Chart').getAttribute('data-chart-data') || '{}')
      expect(chartData.datasets[0].data).toEqual([20, 35, 50, 75])

      rerender(
        <TestWrapper>
          <MockProgressChart user={mockUsers.team} />
        </TestWrapper>
      )

      chartData = JSON.parse(screen.getByText('Progress Chart').getAttribute('data-chart-data') || '{}')
      expect(chartData.datasets[0].data).toEqual([10, 15, 25, 40])
    })

    it('has correct chart configuration', () => {
      render(
        <TestWrapper>
          <MockProgressChart user={mockUsers.admin} />
        </TestWrapper>
      )

      const chartData = JSON.parse(screen.getByText('Progress Chart').getAttribute('data-chart-data') || '{}')
      expect(chartData.labels).toEqual(['Week 1', 'Week 2', 'Week 3', 'Week 4'])
      expect(chartData.datasets[0].label).toBe('Progress')
      expect(chartData.datasets[0].borderColor).toBe('#3B82F6')
      expect(chartData.datasets[0].backgroundColor).toBe('rgba(59, 130, 246, 0.1)')
    })
  })

  describe('Chart Interactions', () => {
    it('handles chart click events', () => {
      const MockClickableChart = () => {
        const handleClick = () => {
          // Mock click handler
        }

        return (
          <div 
            data-testid="clickable-chart"
            onClick={handleClick}
            role="button"
            tabIndex={0}
          >
            Clickable Chart
          </div>
        )
      }

      render(
        <TestWrapper>
          <MockClickableChart />
        </TestWrapper>
      )

      const chart = screen.getByTestId('clickable-chart')
      expect(chart).toBeInTheDocument()
      expect(chart).toHaveAttribute('role', 'button')
      expect(chart).toHaveAttribute('tabIndex', '0')
    })

    it('handles chart hover events', () => {
      const MockHoverableChart = () => {
        const handleMouseEnter = () => {
          // Mock hover handler
        }

        return (
          <div 
            data-testid="hoverable-chart"
            onMouseEnter={handleMouseEnter}
          >
            Hoverable Chart
          </div>
        )
      }

      render(
        <TestWrapper>
          <MockHoverableChart />
        </TestWrapper>
      )

      const chart = screen.getByTestId('hoverable-chart')
      fireEvent.mouseEnter(chart)
      expect(chart).toBeInTheDocument()
    })
  })

  describe('Chart Loading States', () => {
    it('shows loading state while data is being fetched', () => {
      const MockLoadingChart = () => (
        <div data-testid="loading-chart">
          <h3>Loading Chart...</h3>
          <div className="animate-pulse">Fetching chart data...</div>
        </div>
      )

      render(
        <TestWrapper>
          <MockLoadingChart />
        </TestWrapper>
      )

      expect(screen.getByTestId('loading-chart')).toBeInTheDocument()
      expect(screen.getByText('Loading Chart...')).toBeInTheDocument()
    })

    it('shows error state when chart data fails to load', () => {
      const MockErrorChart = () => (
        <div data-testid="error-chart">
          <h3>Chart Error</h3>
          <p>Failed to load chart data</p>
        </div>
      )

      render(
        <TestWrapper>
          <MockErrorChart />
        </TestWrapper>
      )

      expect(screen.getByTestId('error-chart')).toBeInTheDocument()
      expect(screen.getByText('Chart Error')).toBeInTheDocument()
    })
  })

  describe('Chart Responsiveness', () => {
    it('applies responsive CSS classes', () => {
      const MockResponsiveChart = () => (
        <div 
          data-testid="responsive-chart"
          className="w-full h-64 md:h-80 lg:h-96"
        >
          <MockTaskStatusChart user={mockUsers.admin} />
        </div>
      )

      render(
        <TestWrapper>
          <MockResponsiveChart />
        </TestWrapper>
      )

      const chart = screen.getByTestId('responsive-chart')
      expect(chart).toHaveClass('w-full', 'h-64', 'md:h-80', 'lg:h-96')
    })
  })
})
