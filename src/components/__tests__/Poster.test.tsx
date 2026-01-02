import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Poster from '../Poster'

describe('Poster', () => {
  it('renders image with provided src', () => {
    render(<Poster src="https://example.com/poster.jpg" alt="Test Movie" />)
    const img = screen.getByRole('img', { name: 'Test Movie' })
    expect(img).toHaveAttribute('src', 'https://example.com/poster.jpg')
  })

  it('uses placeholder when no src provided', () => {
    render(<Poster alt="Test Movie" />)
    const img = screen.getByRole('img', { name: 'Test Movie' })
    expect(img.getAttribute('src')).toContain('data:image/svg+xml')
    expect(img.getAttribute('src')).toContain('No%20poster')
  })

  it('uses placeholder when src is "N/A"', () => {
    render(<Poster src="N/A" alt="Test Movie" />)
    const img = screen.getByRole('img', { name: 'Test Movie' })
    expect(img.getAttribute('src')).toContain('data:image/svg+xml')
  })

  it('falls back to placeholder on image load error', () => {
    render(<Poster src="https://broken-url.com/poster.jpg" alt="Test Movie" />)
    const img = screen.getByRole('img', { name: 'Test Movie' })
    
    // Simulate error
    fireEvent.error(img)
    
    expect(img.getAttribute('src')).toContain('data:image/svg+xml')
  })

  it('applies compact class when compact prop is true', () => {
    const { container } = render(<Poster alt="Test Movie" compact />)
    expect(container.firstChild).toHaveClass('h-full')
  })

  it('applies default height when compact is false', () => {
    const { container } = render(<Poster alt="Test Movie" />)
    expect(container.firstChild).toHaveClass('h-72')
  })

  it('starts with blur effect and removes it on load', () => {
    render(<Poster src="https://example.com/poster.jpg" alt="Test Movie" />)
    const img = screen.getByRole('img', { name: 'Test Movie' })
    
    // Initially blurred
    expect(img).toHaveClass('blur-md')
    
    // Simulate load
    fireEvent.load(img)
    
    // Blur removed
    expect(img).not.toHaveClass('blur-md')
  })
})
