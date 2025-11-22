 import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Unauthorized from '@/pages/Unauthorized'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('Unauthorized Page', () => {
  it('renders unauthorized message', () => {
    render(
      <TestWrapper>
        <Unauthorized />
      </TestWrapper>
    )

    expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
    expect(screen.getByText(/you do not have permission to access this page/i)).toBeInTheDocument()
  })

  it('shows back to dashboard button', () => {
    render(
      <TestWrapper>
        <Unauthorized />
      </TestWrapper>
    )

    expect(screen.getByRole('link', { name: /back to dashboard/i })).toBeInTheDocument()
  })

  it('shows contact admin message', () => {
    render(
      <TestWrapper>
        <Unauthorized />
      </TestWrapper>
    )

    expect(screen.getByText(/contact your administrator/i)).toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    render(
      <TestWrapper>
        <Unauthorized />
      </TestWrapper>
    )

    const container = screen.getByTestId('unauthorized-page')
    expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center')
  })

  it('displays error icon', () => {
    render(
      <TestWrapper>
        <Unauthorized />
      </TestWrapper>
    )

    expect(screen.getByTestId('error-icon')).toBeInTheDocument()
  })

  it('has proper heading hierarchy', () => {
    render(
      <TestWrapper>
        <Unauthorized />
      </TestWrapper>
    )

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(/unauthorized/i)
  })

  it('provides helpful information for different roles', () => {
    render(
      <TestWrapper>
        <Unauthorized />
      </TestWrapper>
    )

    expect(screen.getByText(/if you believe this is an error/i)).toBeInTheDocument()
    expect(screen.getByText(/please contact your system administrator/i)).toBeInTheDocument()
  })

  it('has accessible navigation', () => {
    render(
      <TestWrapper>
        <Unauthorized />
      </TestWrapper>
    )

    const backButton = screen.getByRole('link', { name: /back to dashboard/i })
    expect(backButton).toHaveAttribute('href', '/dashboard')
  })
})
