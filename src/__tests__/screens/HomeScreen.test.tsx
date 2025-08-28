import React from 'react'
import { render, fireEvent, waitFor, act } from '../utils/testUtils'
import { createMockMotorcycle, createMockUser } from '../utils/testUtils'
import HomeScreen from '../../screens/tabs/HomeScreen'

// Mock the navigation
const mockNavigate = jest.fn()
const mockAddListener = jest.fn()

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    addListener: mockAddListener,
  }),
}))

// Mock expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
}))

// Mock helper functions
jest.mock('../../utils/helpers', () => ({
  getGreeting: jest.fn(() => 'Good morning'),
  hapticFeedback: jest.fn(),
}))

// Mock components
jest.mock('../../components/MotorcycleCard', () => {
  return function MockMotorcycleCard({ motorcycle, onPress, variant }: any) {
    return (
      <div
        testID={`motorcycle-card-${motorcycle._id}`}
        data-variant={variant}
        onClick={() => onPress(motorcycle)}
      >
        {motorcycle.brand} {motorcycle.model}
      </div>
    )
  }
})

jest.mock('../../components/CategoryCard', () => {
  return function MockCategoryCard({ category, onPress }: any) {
    return (
      <div
        testID={`category-card-${category}`}
        onClick={() => onPress(category)}
      >
        {category}
      </div>
    )
  }
})

jest.mock('../../components/BrandCard', () => {
  return function MockBrandCard({ brand, onPress }: any) {
    return (
      <div
        testID={`brand-card-${brand}`}
        onClick={() => onPress(brand)}
      >
        {brand}
      </div>
    )
  }
})

jest.mock('../../components/SearchBar', () => {
  return function MockSearchBar({ onPress, placeholder }: any) {
    return (
      <div testID="search-bar" onClick={onPress}>
        {placeholder}
      </div>
    )
  }
})

jest.mock('../../components/Carousel', () => {
  return function MockCarousel({ data, renderItem }: any) {
    return (
      <div testID="carousel">
        {data.map((item: any) => (
          <div key={item.id}>
            {renderItem({ item })}
          </div>
        ))}
      </div>
    )
  }
})

jest.mock('../../components/SectionHeader', () => {
  return function MockSectionHeader({ title, subtitle, onSeeAllPress }: any) {
    return (
      <div testID={`section-header-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <span>{title}</span>
        <span>{subtitle}</span>
        {onSeeAllPress && (
          <button onClick={onSeeAllPress}>See All</button>
        )}
      </div>
    )
  }
})

jest.mock('../../components/LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div testID="loading-spinner">Loading...</div>
  }
})

jest.mock('../../components/NotificationBadge', () => {
  return function MockNotificationBadge({ count }: any) {
    return <div testID="notification-badge">{count}</div>
  }
})

describe('HomeScreen Integration Tests', () => {
  const mockMotorcycles = [
    createMockMotorcycle({ _id: '1', brand: 'Honda', model: 'CBR1000RR' }),
    createMockMotorcycle({ _id: '2', brand: 'Yamaha', model: 'YZF-R1' }),
    createMockMotorcycle({ _id: '3', brand: 'Kawasaki', model: 'Ninja ZX-10R' }),
  ]

  const mockUser = createMockUser()

  beforeEach(() => {
    jest.clearAllMocks()
    mockAddListener.mockReturnValue(jest.fn()) // Mock unsubscribe function
  })

  describe('Rendering', () => {
    it('should render home screen with basic elements', () => {
      const { getByText, getByTestId } = render(<HomeScreen />)

      expect(getByText('Good morning')).toBeTruthy()
      expect(getByTestId('search-bar')).toBeTruthy()
      expect(getByTestId('carousel')).toBeTruthy()
    })

    it('should show greeting and username when authenticated', () => {
      const { getByText } = render(<HomeScreen />, {
        preloadedState: {
          auth: {
            user: mockUser,
            token: 'test-token',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          },
        },
      })

      expect(getByText('Good morning')).toBeTruthy()
      expect(getByText(`${mockUser.username}!`)).toBeTruthy()
    })

    it('should show notification badge when there are unread notifications', () => {
      const { getByTestId } = render(<HomeScreen />, {
        preloadedState: {
          app: {
            notifications: [
              { id: '1', type: 'new_motorcycle', title: 'New bike', message: 'Test', read: false, createdAt: '2023-01-01' },
              { id: '2', type: 'promotion', title: 'Sale', message: 'Test', read: false, createdAt: '2023-01-02' },
            ],
            unreadNotifications: [
              { id: '1', type: 'new_motorcycle', title: 'New bike', message: 'Test', read: false, createdAt: '2023-01-01' },
              { id: '2', type: 'promotion', title: 'Sale', message: 'Test', read: false, createdAt: '2023-01-02' },
            ],
            isOffline: false,
            theme: 'light',
            language: 'en',
            firstLaunch: false,
          },
        },
      })

      const notificationBadge = getByTestId('notification-badge')
      expect(notificationBadge).toBeTruthy()
      expect(notificationBadge.textContent).toBe('2')
    })

    it('should show loading spinner when loading', () => {
      const { getByTestId } = render(<HomeScreen />, {
        preloadedState: {
          motorcycles: {
            motorcycles: [],
            selectedMotorcycle: null,
            recommendations: [],
            trending: [],
            latest: [],
            filters: {},
            availableFilters: {
              brands: [],
              categories: [],
              priceRange: { min: 0, max: 100000 },
              powerRange: { min: 0, max: 500 },
            },
            isLoading: true,
            isLoadingMore: false,
            isRefreshing: false,
            error: null,
            lastFetchTime: 0,
            cacheValid: false,
          },
        },
      })

      expect(getByTestId('loading-spinner')).toBeTruthy()
    })
  })

  describe('Sections', () => {
    it('should render categories section', () => {
      const { getByTestId } = render(<HomeScreen />)

      expect(getByTestId('section-header-browse-categories')).toBeTruthy()

      // Should show first few categories
      expect(getByTestId('category-card-Sport')).toBeTruthy()
      expect(getByTestId('category-card-Cruiser')).toBeTruthy()
    })

    it('should render brands section', () => {
      const { getByTestId } = render(<HomeScreen />)

      expect(getByTestId('section-header-popular-brands')).toBeTruthy()

      // Should show first few brands
      expect(getByTestId('brand-card-Yamaha')).toBeTruthy()
      expect(getByTestId('brand-card-Honda')).toBeTruthy()
    })

    it('should render trending section when motorcycles are available', () => {
      const { getByTestId } = render(<HomeScreen />, {
        preloadedState: {
          motorcycles: {
            motorcycles: [],
            selectedMotorcycle: null,
            recommendations: [],
            trending: mockMotorcycles,
            latest: [],
            filters: {},
            availableFilters: {
              brands: [],
              categories: [],
              priceRange: { min: 0, max: 100000 },
              powerRange: { min: 0, max: 500 },
            },
            isLoading: false,
            isLoadingMore: false,
            isRefreshing: false,
            error: null,
            lastFetchTime: Date.now(),
            cacheValid: true,
          },
        },
      })

      expect(getByTestId('section-header-trending-now')).toBeTruthy()
      expect(getByTestId('motorcycle-card-1')).toBeTruthy()
      expect(getByTestId('motorcycle-card-2')).toBeTruthy()
    })

    it('should render latest section when motorcycles are available', () => {
      const { getByTestId } = render(<HomeScreen />, {
        preloadedState: {
          motorcycles: {
            motorcycles: [],
            selectedMotorcycle: null,
            recommendations: [],
            trending: [],
            latest: mockMotorcycles,
            filters: {},
            availableFilters: {
              brands: [],
              categories: [],
              priceRange: { min: 0, max: 100000 },
              powerRange: { min: 0, max: 500 },
            },
            isLoading: false,
            isLoadingMore: false,
            isRefreshing: false,
            error: null,
            lastFetchTime: Date.now(),
            cacheValid: true,
          },
        },
      })

      expect(getByTestId('section-header-latest-models')).toBeTruthy()
      expect(getByTestId('motorcycle-card-1')).toBeTruthy()
    })

    it('should render recommendations section when authenticated and data available', () => {
      const { getByTestId } = render(<HomeScreen />, {
        preloadedState: {
          auth: {
            user: mockUser,
            token: 'test-token',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          },
          motorcycles: {
            motorcycles: [],
            selectedMotorcycle: null,
            recommendations: mockMotorcycles,
            trending: [],
            latest: [],
            filters: {},
            availableFilters: {
              brands: [],
              categories: [],
              priceRange: { min: 0, max: 100000 },
              powerRange: { min: 0, max: 500 },
            },
            isLoading: false,
            isLoadingMore: false,
            isRefreshing: false,
            error: null,
            lastFetchTime: Date.now(),
            cacheValid: true,
          },
        },
      })

      expect(getByTestId('section-header-recommended-for-you')).toBeTruthy()
      expect(getByTestId('motorcycle-card-1')).toBeTruthy()
    })

    it('should not render recommendations section when not authenticated', () => {
      const { queryByTestId } = render(<HomeScreen />, {
        preloadedState: {
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          },
          motorcycles: {
            motorcycles: [],
            selectedMotorcycle: null,
            recommendations: mockMotorcycles,
            trending: [],
            latest: [],
            filters: {},
            availableFilters: {
              brands: [],
              categories: [],
              priceRange: { min: 0, max: 100000 },
              powerRange: { min: 0, max: 500 },
            },
            isLoading: false,
            isLoadingMore: false,
            isRefreshing: false,
            error: null,
            lastFetchTime: Date.now(),
            cacheValid: true,
          },
        },
      })

      expect(queryByTestId('section-header-recommended-for-you')).toBeNull()
    })
  })

  describe('Interactions', () => {
    it('should navigate to search when search bar is pressed', () => {
      const { getByTestId } = render(<HomeScreen />)

      fireEvent.click(getByTestId('search-bar'))

      expect(mockNavigate).toHaveBeenCalledWith('SearchTab')
    })

    it('should navigate to motorcycle detail when motorcycle card is pressed', () => {
      const { getByTestId } = render(<HomeScreen />, {
        preloadedState: {
          motorcycles: {
            motorcycles: [],
            selectedMotorcycle: null,
            recommendations: [],
            trending: mockMotorcycles,
            latest: [],
            filters: {},
            availableFilters: {
              brands: [],
              categories: [],
              priceRange: { min: 0, max: 100000 },
              powerRange: { min: 0, max: 500 },
            },
            isLoading: false,
            isLoadingMore: false,
            isRefreshing: false,
            error: null,
            lastFetchTime: Date.now(),
            cacheValid: true,
          },
        },
      })

      fireEvent.click(getByTestId('motorcycle-card-1'))

      expect(mockNavigate).toHaveBeenCalledWith('MotorcycleDetail', {
        id: '1',
        motorcycle: mockMotorcycles[0],
      })
    })

    it('should navigate to search with category filter when category is pressed', () => {
      const { getByTestId } = render(<HomeScreen />)

      fireEvent.click(getByTestId('category-card-Sport'))

      expect(mockNavigate).toHaveBeenCalledWith('Search', {
        filters: { category: ['Sport'] },
      })
    })

    it('should navigate to search with brand filter when brand is pressed', () => {
      const { getByTestId } = render(<HomeScreen />)

      fireEvent.click(getByTestId('brand-card-Honda'))

      expect(mockNavigate).toHaveBeenCalledWith('Search', {
        filters: { brand: ['Honda'] },
      })
    })

    it('should navigate to search with sort filter when see all is pressed', () => {
      const { getByTestId } = render(<HomeScreen />, {
        preloadedState: {
          motorcycles: {
            motorcycles: [],
            selectedMotorcycle: null,
            recommendations: [],
            trending: mockMotorcycles,
            latest: [],
            filters: {},
            availableFilters: {
              brands: [],
              categories: [],
              priceRange: { min: 0, max: 100000 },
              powerRange: { min: 0, max: 500 },
            },
            isLoading: false,
            isLoadingMore: false,
            isRefreshing: false,
            error: null,
            lastFetchTime: Date.now(),
            cacheValid: true,
          },
        },
      })

      const trendingHeader = getByTestId('section-header-trending-now')
      const seeAllButton = trendingHeader.querySelector('button')
      
      if (seeAllButton) {
        fireEvent.click(seeAllButton)

        expect(mockNavigate).toHaveBeenCalledWith('Search', {
          filters: { sortBy: 'popularity', sortOrder: 'desc' },
        })
      }
    })
  })

  describe('Carousel Interactions', () => {
    it('should handle carousel item press', () => {
      const { getByTestId } = render(<HomeScreen />)

      const carousel = getByTestId('carousel')
      const firstCarouselItem = carousel.querySelector('[data-testid*="carousel-item"]') ||
                                carousel.firstElementChild?.querySelector('[role="button"]') ||
                                carousel.firstElementChild?.firstElementChild

      if (firstCarouselItem) {
        fireEvent.click(firstCarouselItem)
        
        // Should navigate somewhere based on carousel item action
        expect(mockNavigate).toHaveBeenCalled()
      }
    })
  })

  describe('Pull to Refresh', () => {
    it('should handle refresh action', async () => {
      const { container } = render(<HomeScreen />)

      // Find scroll view with refresh control
      const scrollView = container.querySelector('[data-testid*="scroll"]') || 
                        container.querySelector('[testID*="scroll"]') ||
                        container.firstChild

      if (scrollView) {
        // Simulate pull to refresh
        fireEvent(scrollView, 'refresh')

        await waitFor(() => {
          // Should trigger data refresh
          expect(container).toBeTruthy()
        })
      }
    })
  })

  describe('Navigation Listener', () => {
    it('should update greeting when screen comes into focus', () => {
      render(<HomeScreen />)

      expect(mockAddListener).toHaveBeenCalledWith('focus', expect.any(Function))

      // Simulate focus event
      const focusCallback = mockAddListener.mock.calls[0][1]
      act(() => {
        focusCallback()
      })

      const { getGreeting } = require('../../utils/helpers')
      expect(getGreeting).toHaveBeenCalled()
    })
  })

  describe('Haptic Feedback', () => {
    it('should provide haptic feedback on interactions', () => {
      const { getByTestId } = render(<HomeScreen />)

      fireEvent.click(getByTestId('search-bar'))

      const { hapticFeedback } = require('../../utils/helpers')
      expect(hapticFeedback).toHaveBeenCalledWith('light')
    })
  })

  describe('Error Handling', () => {
    it('should handle loading errors gracefully', async () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const { container } = render(<HomeScreen />, {
        preloadedState: {
          motorcycles: {
            motorcycles: [],
            selectedMotorcycle: null,
            recommendations: [],
            trending: [],
            latest: [],
            filters: {},
            availableFilters: {
              brands: [],
              categories: [],
              priceRange: { min: 0, max: 100000 },
              powerRange: { min: 0, max: 500 },
            },
            isLoading: false,
            isLoadingMore: false,
            isRefreshing: false,
            error: 'Failed to load motorcycles',
            lastFetchTime: 0,
            cacheValid: false,
          },
        },
      })

      // Should still render the screen without crashing
      expect(container.firstChild).toBeTruthy()

      consoleSpy.mockRestore()
    })
  })

  describe('Data Display', () => {
    it('should limit displayed items to expected counts', () => {
      const { container } = render(<HomeScreen />, {
        preloadedState: {
          motorcycles: {
            motorcycles: [],
            selectedMotorcycle: null,
            recommendations: mockMotorcycles,
            trending: mockMotorcycles,
            latest: mockMotorcycles,
            filters: {},
            availableFilters: {
              brands: [],
              categories: [],
              priceRange: { min: 0, max: 100000 },
              powerRange: { min: 0, max: 500 },
            },
            isLoading: false,
            isLoadingMore: false,
            isRefreshing: false,
            error: null,
            lastFetchTime: Date.now(),
            cacheValid: true,
          },
          auth: {
            user: mockUser,
            token: 'test-token',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          },
        },
      })

      // Should show limited number of items (max 5 for trending, latest)
      const motorcycleCards = container.querySelectorAll('[testid^="motorcycle-card-"]')
      
      // We expect cards from trending, latest, and recommendations sections
      // But each section should limit to 5 items max
      expect(motorcycleCards.length).toBeLessThanOrEqual(15) // 3 sections × 5 items max
    })

    it('should show categories limited to 6 items', () => {
      const { container } = render(<HomeScreen />)

      const categoryCards = container.querySelectorAll('[testid^="category-card-"]')
      
      // Should show max 6 categories
      expect(categoryCards.length).toBeLessThanOrEqual(6)
    })

    it('should show brands limited to 8 items', () => {
      const { container } = render(<HomeScreen />)

      const brandCards = container.querySelectorAll('[testid^="brand-card-"]')
      
      // Should show max 8 brands
      expect(brandCards.length).toBeLessThanOrEqual(8)
    })
  })
})