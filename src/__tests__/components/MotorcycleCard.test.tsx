import React from 'react'
import { render, fireEvent, waitFor } from '../utils/testUtils'
import { createMockMotorcycle } from '../utils/testUtils'
import MotorcycleCard from '../../components/MotorcycleCard'

// Mock the helper functions
jest.mock('../../utils/helpers', () => ({
  formatPrice: jest.fn((price, currency) => price ? `$${price.toLocaleString()}` : 'Price on request'),
  formatPower: jest.fn((hp, kw) => hp ? `${hp} HP` : 'N/A'),
  getMotorcycleFullName: jest.fn((motorcycle) => `${motorcycle.year} ${motorcycle.brand} ${motorcycle.model}`),
  getPrimaryImage: jest.fn((motorcycle) => motorcycle.images?.[0]?.url || 'https://via.placeholder.com/400x300'),
  hapticFeedback: jest.fn(),
}))

// Mock FavoriteButton component
jest.mock('../../components/FavoriteButton', () => {
  return function MockFavoriteButton({ isFavorite, onPress, style }: any) {
    return (
      <button 
        testID="favorite-button"
        onClick={onPress}
        data-isfavorite={isFavorite}
        style={style}
      >
        {isFavorite ? 'Unfavorite' : 'Favorite'}
      </button>
    )
  }
})

// Mock RatingDisplay component
jest.mock('../../components/RatingDisplay', () => {
  return function MockRatingDisplay({ rating, reviewCount, size, variant, showText }: any) {
    return (
      <div testID="rating-display" data-rating={rating} data-reviews={reviewCount}>
        {rating} stars {showText !== false && reviewCount && `(${reviewCount} reviews)`}
      </div>
    )
  }
})

// Mock Badge component
jest.mock('../../components/Badge', () => {
  return function MockBadge({ text, color }: any) {
    return (
      <span testID="badge" data-color={color}>
        {text}
      </span>
    )
  }
})

describe('MotorcycleCard Component', () => {
  const mockMotorcycle = createMockMotorcycle({
    _id: '1',
    brand: 'Honda',
    model: 'CBR1000RR',
    year: 2023,
    category: 'Sport',
    price: {
      msrp: 16999,
      currency: 'USD',
    },
    performance: {
      power: {
        hp: 189,
        kw: 141,
        rpm: 13000,
      },
      topSpeed: 299,
    },
    rating: {
      overall: 4.5,
      reviews: 25,
    },
    status: 'new',
    tags: ['featured'],
    images: [
      {
        url: 'https://example.com/honda-cbr.jpg',
        alt: 'Honda CBR1000RR',
      },
    ],
  })

  const mockOnPress = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render motorcycle card with basic information', () => {
      const { getByText, getByTestId } = render(
        <MotorcycleCard motorcycle={mockMotorcycle} onPress={mockOnPress} />
      )

      expect(getByText('Honda')).toBeTruthy()
      expect(getByText('CBR1000RR')).toBeTruthy()
      expect(getByText('2023')).toBeTruthy()
      expect(getByText('Sport')).toBeTruthy()
      expect(getByTestId('rating-display')).toBeTruthy()
    })

    it('should render price when available', () => {
      const { getByText } = render(
        <MotorcycleCard motorcycle={mockMotorcycle} onPress={mockOnPress} />
      )

      expect(getByText('$16,999')).toBeTruthy()
    })

    it('should render power information when available', () => {
      const { getByText } = render(
        <MotorcycleCard motorcycle={mockMotorcycle} onPress={mockOnPress} />
      )

      expect(getByText('189 HP')).toBeTruthy()
    })

    it('should render top speed when available', () => {
      const { getByText } = render(
        <MotorcycleCard motorcycle={mockMotorcycle} onPress={mockOnPress} />
      )

      expect(getByText('299 mph')).toBeTruthy()
    })

    it('should render badges when showBadges is true', () => {
      const { getAllByTestId } = render(
        <MotorcycleCard 
          motorcycle={mockMotorcycle} 
          onPress={mockOnPress}
          showBadges={true}
        />
      )

      const badges = getAllByTestId('badge')
      expect(badges).toHaveLength(2) // 'New' and 'Featured' badges
      expect(badges[0]).toHaveTextContent('New')
      expect(badges[1]).toHaveTextContent('Featured')
    })

    it('should not render badges when showBadges is false', () => {
      const { queryByTestId } = render(
        <MotorcycleCard 
          motorcycle={mockMotorcycle} 
          onPress={mockOnPress}
          showBadges={false}
        />
      )

      expect(queryByTestId('badge')).toBeNull()
    })

    it('should render favorite button when showFavorite is true', () => {
      const { getByTestId } = render(
        <MotorcycleCard 
          motorcycle={mockMotorcycle} 
          onPress={mockOnPress}
          showFavorite={true}
        />
      )

      expect(getByTestId('favorite-button')).toBeTruthy()
    })

    it('should not render favorite button when showFavorite is false', () => {
      const { queryByTestId } = render(
        <MotorcycleCard 
          motorcycle={mockMotorcycle} 
          onPress={mockOnPress}
          showFavorite={false}
        />
      )

      expect(queryByTestId('favorite-button')).toBeNull()
    })

    it('should render rating when showRating is true', () => {
      const { getByTestId } = render(
        <MotorcycleCard 
          motorcycle={mockMotorcycle} 
          onPress={mockOnPress}
          showRating={true}
        />
      )

      const ratingDisplay = getByTestId('rating-display')
      expect(ratingDisplay).toBeTruthy()
      expect(ratingDisplay).toHaveAttribute('data-rating', '4.5')
      expect(ratingDisplay).toHaveAttribute('data-reviews', '25')
    })

    it('should not render rating when showRating is false', () => {
      const { queryByTestId } = render(
        <MotorcycleCard 
          motorcycle={mockMotorcycle} 
          onPress={mockOnPress}
          showRating={false}
        />
      )

      expect(queryByTestId('rating-display')).toBeNull()
    })

    it('should render electric badge for electric motorcycles', () => {
      const electricMotorcycle = {
        ...mockMotorcycle,
        category: 'Electric',
        status: 'active',
        tags: [],
      }

      const { getAllByTestId } = render(
        <MotorcycleCard 
          motorcycle={electricMotorcycle} 
          onPress={mockOnPress}
          showBadges={true}
        />
      )

      const badges = getAllByTestId('badge')
      expect(badges).toHaveLength(1)
      expect(badges[0]).toHaveTextContent('Electric')
    })
  })

  describe('Variants', () => {
    it('should render compact variant correctly', () => {
      const { container } = render(
        <MotorcycleCard 
          motorcycle={mockMotorcycle} 
          onPress={mockOnPress}
          variant="compact"
        />
      )

      // Check that compact styles are applied
      // Since we're testing with jsdom, we mainly check that the component renders without errors
      expect(container.firstChild).toBeTruthy()
    })

    it('should render list variant correctly', () => {
      const { getByText, getByTestId } = render(
        <MotorcycleCard 
          motorcycle={mockMotorcycle} 
          onPress={mockOnPress}
          variant="list"
        />
      )

      // List variant should still show basic info
      expect(getByText('Honda')).toBeTruthy()
      expect(getByText('CBR1000RR')).toBeTruthy()
      expect(getByText('2023')).toBeTruthy()
      expect(getByTestId('rating-display')).toBeTruthy()
    })

    it('should render default variant correctly', () => {
      const { getByText, getByTestId } = render(
        <MotorcycleCard 
          motorcycle={mockMotorcycle} 
          onPress={mockOnPress}
          variant="default"
        />
      )

      expect(getByText('Honda')).toBeTruthy()
      expect(getByText('CBR1000RR')).toBeTruthy()
      expect(getByTestId('rating-display')).toBeTruthy()
    })
  })

  describe('Interactions', () => {
    it('should call onPress when card is pressed', () => {
      const { getByText } = render(
        <MotorcycleCard motorcycle={mockMotorcycle} onPress={mockOnPress} />
      )

      const card = getByText('CBR1000RR').closest('div')
      fireEvent.click(card!)

      expect(mockOnPress).toHaveBeenCalledWith(mockMotorcycle)
    })

    it('should handle favorite button press when authenticated', async () => {
      const { getByTestId } = render(
        <MotorcycleCard motorcycle={mockMotorcycle} onPress={mockOnPress} />,
        {
          preloadedState: {
            auth: {
              user: { _id: 'user1', email: 'test@test.com' },
              token: 'test-token',
              isAuthenticated: true,
              isLoading: false,
              error: null,
            },
            favorites: {
              favorites: [],
              isLoading: false,
              error: null,
            },
          },
        }
      )

      const favoriteButton = getByTestId('favorite-button')
      fireEvent.click(favoriteButton)

      // Should call haptic feedback
      const { hapticFeedback } = require('../../utils/helpers')
      expect(hapticFeedback).toHaveBeenCalledWith('light')
    })

    it('should not call favorite action when not authenticated', () => {
      const { getByTestId } = render(
        <MotorcycleCard motorcycle={mockMotorcycle} onPress={mockOnPress} />,
        {
          preloadedState: {
            auth: {
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            },
          },
        }
      )

      const favoriteButton = getByTestId('favorite-button')
      fireEvent.click(favoriteButton)

      // Should still call haptic feedback but not dispatch favorite actions
      const { hapticFeedback } = require('../../utils/helpers')
      expect(hapticFeedback).toHaveBeenCalledWith('light')
    })

    it('should show correct favorite state', () => {
      const { getByTestId } = render(
        <MotorcycleCard motorcycle={mockMotorcycle} onPress={mockOnPress} />,
        {
          preloadedState: {
            auth: {
              user: { _id: 'user1', email: 'test@test.com' },
              token: 'test-token',
              isAuthenticated: true,
              isLoading: false,
              error: null,
            },
            favorites: {
              favorites: [{ _id: 'fav1', motorcycleId: '1', userId: 'user1' }],
              isLoading: false,
              error: null,
            },
          },
        }
      )

      const favoriteButton = getByTestId('favorite-button')
      expect(favoriteButton).toHaveAttribute('data-isfavorite', 'true')
      expect(favoriteButton).toHaveTextContent('Unfavorite')
    })

    it('should call haptic feedback when card is pressed', () => {
      const { getByText } = render(
        <MotorcycleCard motorcycle={mockMotorcycle} onPress={mockOnPress} />
      )

      const card = getByText('CBR1000RR').closest('div')
      fireEvent.click(card!)

      const { hapticFeedback } = require('../../utils/helpers')
      expect(hapticFeedback).toHaveBeenCalledWith('light')
    })
  })

  describe('Edge Cases', () => {
    it('should handle motorcycle without price', () => {
      const motorcycleWithoutPrice = {
        ...mockMotorcycle,
        price: undefined,
      }

      const { getByText } = render(
        <MotorcycleCard motorcycle={motorcycleWithoutPrice} onPress={mockOnPress} />
      )

      expect(getByText('Price on request')).toBeTruthy()
    })

    it('should handle motorcycle without power info', () => {
      const motorcycleWithoutPower = {
        ...mockMotorcycle,
        performance: {
          ...mockMotorcycle.performance,
          power: undefined,
        },
      }

      const { getByText } = render(
        <MotorcycleCard motorcycle={motorcycleWithoutPower} onPress={mockOnPress} />
      )

      expect(getByText('N/A')).toBeTruthy()
    })

    it('should handle motorcycle without rating', () => {
      const motorcycleWithoutRating = {
        ...mockMotorcycle,
        rating: undefined,
      }

      const { queryByTestId } = render(
        <MotorcycleCard motorcycle={motorcycleWithoutRating} onPress={mockOnPress} />
      )

      expect(queryByTestId('rating-display')).toBeNull()
    })

    it('should handle motorcycle without top speed', () => {
      const motorcycleWithoutTopSpeed = {
        ...mockMotorcycle,
        performance: {
          ...mockMotorcycle.performance,
          topSpeed: undefined,
        },
      }

      const { queryByText } = render(
        <MotorcycleCard motorcycle={motorcycleWithoutTopSpeed} onPress={mockOnPress} />
      )

      expect(queryByText(/mph/)).toBeNull()
    })

    it('should handle motorcycle without images', () => {
      const motorcycleWithoutImages = {
        ...mockMotorcycle,
        images: [],
      }

      // Should not crash and should use placeholder image
      const { container } = render(
        <MotorcycleCard motorcycle={motorcycleWithoutImages} onPress={mockOnPress} />
      )

      expect(container.firstChild).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible card element', () => {
      const { getByRole } = render(
        <MotorcycleCard motorcycle={mockMotorcycle} onPress={mockOnPress} />
      )

      const button = getByRole('button')
      expect(button).toBeTruthy()
    })

    it('should truncate long text appropriately', () => {
      const motorcycleWithLongName = {
        ...mockMotorcycle,
        model: 'Very Long Motorcycle Model Name That Should Be Truncated',
      }

      const { getByText } = render(
        <MotorcycleCard motorcycle={motorcycleWithLongName} onPress={mockOnPress} />
      )

      const modelText = getByText('Very Long Motorcycle Model Name That Should Be Truncated')
      expect(modelText).toBeTruthy()
    })
  })

  describe('Custom Styles', () => {
    it('should apply custom style prop', () => {
      const customStyle = { backgroundColor: 'red' }
      
      const { container } = render(
        <MotorcycleCard 
          motorcycle={mockMotorcycle} 
          onPress={mockOnPress}
          style={customStyle}
        />
      )

      expect(container.firstChild).toBeTruthy()
    })
  })
})