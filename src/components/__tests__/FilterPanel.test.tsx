import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterPanel from '../FilterPanel'

const mockSetFilters = vi.fn()

// Mock the useLibrary hook
vi.mock('../../store/useLibrary', () => ({
  useLibrary: () => ({
    filters: {
      search: '',
      genres: [],
      watched: 'all',
      favoritesOnly: false,
      withPosterOnly: false,
      withReviewOnly: false,
      yearRange: [1990, 2024],
      view: 'list',
      sort: 'recentAdded',
    },
    setFilters: mockSetFilters,
    movies: [
      { id: '1', genres: ['Thriller', 'Horror'] },
      { id: '2', genres: ['Mystery', 'Thriller'] },
      { id: '3', genres: ['Crime', 'Drama'] },
    ],
  }),
}))

describe('FilterPanel', () => {
  beforeEach(() => {
    mockSetFilters.mockClear()
  })

  const renderPanel = () => {
    return render(<FilterPanel total={10} minYear={1990} maxYear={2024} />)
  }

  it('displays total film count', () => {
    renderPanel()
    expect(screen.getByText('10 films')).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderPanel()
    const input = screen.getByPlaceholderText(/Search titles/i)
    expect(input).toBeInTheDocument()
  })

  it('calls setFilters when search input changes', () => {
    renderPanel()
    const input = screen.getByPlaceholderText(/Search titles/i)
    fireEvent.change(input, { target: { value: 'test search' } })
    expect(mockSetFilters).toHaveBeenCalledWith({ search: 'test search' })
  })

  it('displays unique genres from movies', () => {
    renderPanel()
    expect(screen.getByText('Crime')).toBeInTheDocument()
    expect(screen.getByText('Drama')).toBeInTheDocument()
    expect(screen.getByText('Horror')).toBeInTheDocument()
    expect(screen.getByText('Mystery')).toBeInTheDocument()
    expect(screen.getByText('Thriller')).toBeInTheDocument()
  })

  it('toggles genre filter when genre button clicked', () => {
    renderPanel()
    const thrillerButton = screen.getByText('Thriller')
    fireEvent.click(thrillerButton)
    expect(mockSetFilters).toHaveBeenCalledWith({ genres: ['Thriller'] })
  })

  it('renders grid and list view buttons', () => {
    renderPanel()
    expect(screen.getByRole('button', { name: /grid view/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /list view/i })).toBeInTheDocument()
  })

  it('calls setFilters with grid view when grid button clicked', () => {
    renderPanel()
    const gridButton = screen.getByRole('button', { name: /grid view/i })
    fireEvent.click(gridButton)
    expect(mockSetFilters).toHaveBeenCalledWith({ view: 'grid' })
  })

  it('calls setFilters with list view when list button clicked', () => {
    renderPanel()
    const listButton = screen.getByRole('button', { name: /list view/i })
    fireEvent.click(listButton)
    expect(mockSetFilters).toHaveBeenCalledWith({ view: 'list' })
  })

  it('renders watched/unwatched checkboxes', () => {
    renderPanel()
    expect(screen.getByLabelText('Watched')).toBeInTheDocument()
    expect(screen.getByLabelText('Unwatched')).toBeInTheDocument()
  })

  it('toggles watched filter', () => {
    renderPanel()
    const watchedCheckbox = screen.getByLabelText('Watched')
    fireEvent.click(watchedCheckbox)
    expect(mockSetFilters).toHaveBeenCalledWith({ watched: 'watched' })
  })

  it('toggles favorites filter', () => {
    renderPanel()
    const favoritesCheckbox = screen.getByLabelText('Favorites')
    fireEvent.click(favoritesCheckbox)
    expect(mockSetFilters).toHaveBeenCalledWith({ favoritesOnly: true })
  })

  it('renders sort dropdown with options', () => {
    renderPanel()
    const sortSelect = screen.getByRole('combobox')
    expect(sortSelect).toBeInTheDocument()
    expect(screen.getByText('Recently added')).toBeInTheDocument()
  })

  it('changes sort when dropdown value changes', () => {
    renderPanel()
    const sortSelect = screen.getByRole('combobox')
    fireEvent.change(sortSelect, { target: { value: 'title' } })
    expect(mockSetFilters).toHaveBeenCalledWith({ sort: 'title' })
  })

  it('renders year range sliders', () => {
    renderPanel()
    const sliders = screen.getAllByRole('slider')
    expect(sliders.length).toBe(2)
  })

  it('updates year range when slider changes', () => {
    renderPanel()
    const sliders = screen.getAllByRole('slider')
    fireEvent.change(sliders[0], { target: { value: '2000' } })
    expect(mockSetFilters).toHaveBeenCalledWith({ yearRange: [2000, 2024] })
  })
})
