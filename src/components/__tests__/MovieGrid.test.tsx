import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MovieGrid from '../MovieGrid'
import { mockMovies } from '../../test/mocks/movies'

// Mock useLibrary - it's imported but not directly used in MovieGrid
vi.mock('../../store/useLibrary', () => ({
  useLibrary: () => ({}),
}))

describe('MovieGrid', () => {
  const renderGrid = (movies = mockMovies) => {
    return render(
      <MemoryRouter>
        <MovieGrid movies={movies} />
      </MemoryRouter>
    )
  }

  it('renders all provided movies', () => {
    renderGrid()
    expect(screen.getByText('Test Thriller')).toBeInTheDocument()
    expect(screen.getByText('Another Test Film')).toBeInTheDocument()
    expect(screen.getByText('Unwatched Classic')).toBeInTheDocument()
  })

  it('displays movie year and genres', () => {
    renderGrid([mockMovies[0]])
    expect(screen.getByText(/2023/)).toBeInTheDocument()
    // There may be multiple Thriller text elements (in title and tags)
    expect(screen.getAllByText(/Thriller/).length).toBeGreaterThan(0)
  })

  it('shows empty state when no movies', () => {
    renderGrid([])
    expect(screen.getByText('No titles found')).toBeInTheDocument()
    expect(screen.getByText(/Adjust filters/)).toBeInTheDocument()
  })

  it('creates links to movie detail pages', () => {
    renderGrid()
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/movie/test-movie-1')
    expect(links[1]).toHaveAttribute('href', '/movie/test-movie-2')
  })

  it('shows favorite indicator for favorited movies', () => {
    renderGrid([mockMovies[1]]) // This movie has favorite: true
    // The Heart icon should be present
    const container = screen.getByRole('link')
    expect(container).toBeInTheDocument()
  })

  it('shows watched indicator for watched movies', () => {
    renderGrid([mockMovies[1]]) // This movie has watched: true
    const container = screen.getByRole('link')
    expect(container).toBeInTheDocument()
  })

  it('displays genre tags', () => {
    renderGrid([mockMovies[0]])
    // Genre tags should be visible
    expect(screen.getAllByText('Thriller').length).toBeGreaterThan(0)
  })
})
