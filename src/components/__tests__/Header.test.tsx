import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from '../Header'

// Mock the useLibrary hook
vi.mock('../../store/useLibrary', () => ({
  useLibrary: (selector: (state: any) => any) => {
    const mockState = {
      movies: [
        { id: '1', watched: true },
        { id: '2', watched: false },
        { id: '3', watched: true },
      ],
    }
    return selector(mockState)
  },
}))

describe('Header', () => {
  const renderHeader = (initialPath = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Header />
      </MemoryRouter>
    )
  }

  it('displays the app title', () => {
    renderHeader()
    expect(screen.getByText('Cinematic Watchlist')).toBeInTheDocument()
    expect(screen.getByText('Nightwatch')).toBeInTheDocument()
  })

  it('shows watched progress count', () => {
    renderHeader()
    expect(screen.getByText('2 / 3 watched')).toBeInTheDocument()
  })

  it('renders title as link to home', () => {
    renderHeader()
    const links = screen.getAllByRole('link')
    const homeLink = links.find(link => link.getAttribute('href') === '/')
    expect(homeLink).toBeInTheDocument()
  })

  it('shows home button when not on home page', () => {
    renderHeader('/movie/test-id')
    const homeButton = screen.getByRole('link', { name: /go home/i })
    expect(homeButton).toBeInTheDocument()
    expect(homeButton).toHaveAttribute('href', '/')
  })

  it('hides home button when on home page', () => {
    renderHeader('/')
    const homeButton = screen.queryByRole('link', { name: /go home/i })
    expect(homeButton).not.toBeInTheDocument()
  })
})
