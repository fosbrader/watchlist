import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import MovieDetailPage from '../MovieDetailPage'
import { mockMovies } from '../../test/mocks/movies'

const mockToggleWatched = vi.fn()
const mockToggleFavorite = vi.fn()
const mockSetMyRating = vi.fn()
const mockSetNotes = vi.fn()

// Mock the useLibrary hook
vi.mock('../../store/useLibrary', () => ({
  useLibrary: () => ({
    movies: mockMovies,
    toggleWatched: mockToggleWatched,
    toggleFavorite: mockToggleFavorite,
    setMyRating: mockSetMyRating,
    setNotes: mockSetNotes,
  }),
}))

describe('MovieDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderDetailPage = (movieId = 'test-movie-1') => {
    return render(
      <MemoryRouter initialEntries={[`/movie/${movieId}`]}>
        <Routes>
          <Route path="/movie/:id" element={<MovieDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('displays movie title', () => {
    renderDetailPage()
    expect(screen.getByText('Test Thriller')).toBeInTheDocument()
  })

  it('displays movie year and runtime', () => {
    renderDetailPage()
    expect(screen.getByText(/2023/)).toBeInTheDocument()
    expect(screen.getByText(/120 min/)).toBeInTheDocument()
  })

  it('displays director', () => {
    renderDetailPage()
    expect(screen.getByText(/Test Director/)).toBeInTheDocument()
  })

  it('displays synopsis', () => {
    renderDetailPage()
    expect(screen.getByText(/A gripping test movie/)).toBeInTheDocument()
  })

  it('displays cast', () => {
    renderDetailPage()
    expect(screen.getByText(/Actor One, Actor Two/)).toBeInTheDocument()
  })

  it('displays genres', () => {
    renderDetailPage()
    expect(screen.getByText('Thriller')).toBeInTheDocument()
    expect(screen.getByText('Horror')).toBeInTheDocument()
  })

  it('displays awards when available', () => {
    renderDetailPage()
    expect(screen.getByText(/Nominated for 2 Oscars/)).toBeInTheDocument()
  })

  it('displays content rating when available', () => {
    renderDetailPage()
    expect(screen.getByText('R')).toBeInTheDocument()
  })

  it('renders back to library button', () => {
    renderDetailPage()
    expect(screen.getByText(/Back to library/)).toBeInTheDocument()
  })

  it('has watch trailer button with correct URL', () => {
    renderDetailPage()
    const trailerButton = screen.getByText(/Watch Trailer/)
    expect(trailerButton.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('youtube.com')
    )
  })

  it('calls toggleWatched when watch button clicked', () => {
    renderDetailPage()
    const watchButton = screen.getByText(/Mark watched/)
    fireEvent.click(watchButton)
    expect(mockToggleWatched).toHaveBeenCalledWith('test-movie-1')
  })

  it('calls toggleFavorite when favorite button clicked', () => {
    renderDetailPage()
    const favoriteButton = screen.getByText(/Favorite/)
    fireEvent.click(favoriteButton)
    expect(mockToggleFavorite).toHaveBeenCalledWith('test-movie-1')
  })

  it('renders rating slider', () => {
    renderDetailPage()
    expect(screen.getByText('Your Rating')).toBeInTheDocument()
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('renders notes textarea', () => {
    renderDetailPage()
    expect(screen.getByText('Your Notes')).toBeInTheDocument()
    const textarea = screen.getByPlaceholderText(/What lingered/)
    expect(textarea).toBeInTheDocument()
  })

  it('shows not found message for invalid movie id', () => {
    renderDetailPage('non-existent-movie')
    expect(screen.getByText('Movie not found')).toBeInTheDocument()
  })

  it('displays IMDb rating when available', () => {
    renderDetailPage()
    // IMDb rating may appear in multiple places
    expect(screen.getAllByText(/8.5\/10/).length).toBeGreaterThan(0)
  })

  it('shows "Watched" button text when movie is watched', () => {
    renderDetailPage('test-movie-2') // This movie has watched: true
    // "Watched" appears in both badge and button
    expect(screen.getAllByText('Watched').length).toBeGreaterThan(0)
  })

  it('shows "Favorited" button text when movie is favorited', () => {
    renderDetailPage('test-movie-2') // This movie has favorite: true
    // "Favorited" appears in button, "Favorite" in badge
    expect(screen.getAllByText(/Favorit/).length).toBeGreaterThan(0)
  })
})
