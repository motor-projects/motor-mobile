import { configureStore } from '@reduxjs/toolkit'
import { server } from '../mocks/server'
import { rest } from 'msw'

import motorcycleReducer, {
  // Async actions
  fetchMotorcycles,
  loadMoreMotorcycles,
  fetchMotorcycleById,
  searchMotorcycles,
  fetchRecommendations,
  fetchTrending,
  fetchLatest,
  // Sync actions
  clearError,
  setFilters,
  updateFilters,
  clearFilters,
  clearSelectedMotorcycle,
  resetPagination,
  setCacheValid,
  updateMotorcycleRating,
  updateAvailableFilters,
  // Selectors
  selectMotorcycles,
  selectSelectedMotorcycle,
  selectMotorcycleFilters,
  selectAvailableFilters,
  selectMotorcycleLoading,
  selectMotorcycleError,
  selectPagination,
  selectRecommendations,
  selectTrending,
  selectLatest,
} from '../../store/slices/motorcycleSlice'
import { MotorcycleFilters } from '../../types'
import { createMockMotorcycle } from '../utils/testUtils'
import { API_BASE_URL } from '../../utils/constants'

// Test store setup
const createTestStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      motorcycles: motorcycleReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

const mockMotorcycles = [
  createMockMotorcycle({ _id: '1', brand: 'Honda', model: 'CBR1000RR' }),
  createMockMotorcycle({ _id: '2', brand: 'Yamaha', model: 'YZF-R1' }),
  createMockMotorcycle({ _id: '3', brand: 'Kawasaki', model: 'Ninja ZX-10R' }),
]

describe('Motorcycle Slice Tests', () => {
  let store: ReturnType<typeof createTestStore>

  beforeAll(() => {
    server.listen()
  })

  beforeEach(() => {
    store = createTestStore()
    jest.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().motorcycles
      
      expect(state.motorcycles).toEqual([])
      expect(state.totalMotorcycles).toBe(0)
      expect(state.currentPage).toBe(1)
      expect(state.totalPages).toBe(1)
      expect(state.hasNext).toBe(false)
      expect(state.hasPrev).toBe(false)
      expect(state.selectedMotorcycle).toBeNull()
      expect(state.recommendations).toEqual([])
      expect(state.trending).toEqual([])
      expect(state.latest).toEqual([])
      expect(state.filters).toEqual({})
      expect(state.availableFilters.brands).toEqual([])
      expect(state.availableFilters.categories).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.isLoadingMore).toBe(false)
      expect(state.isRefreshing).toBe(false)
      expect(state.error).toBeNull()
      expect(state.lastFetchTime).toBe(0)
      expect(state.cacheValid).toBe(false)
    })
  })

  describe('Sync Actions', () => {
    describe('clearError', () => {
      it('should clear error', () => {
        const initialState = {
          motorcycles: {
            ...store.getState().motorcycles,
            error: 'Some error',
          },
        }
        store = createTestStore(initialState)
        
        store.dispatch(clearError())
        
        const state = store.getState().motorcycles
        expect(state.error).toBeNull()
      })
    })

    describe('setFilters', () => {
      it('should set filters and invalidate cache', () => {
        const filters: MotorcycleFilters = {
          brand: ['Honda'],
          category: ['Sport'],
          minPrice: 10000,
          maxPrice: 20000,
        }

        store.dispatch(setFilters(filters))

        const state = store.getState().motorcycles
        expect(state.filters).toEqual(filters)
        expect(state.cacheValid).toBe(false)
      })
    })

    describe('updateFilters', () => {
      it('should update filters partially', () => {
        const initialFilters: MotorcycleFilters = {
          brand: ['Honda'],
          category: ['Sport'],
        }

        store.dispatch(setFilters(initialFilters))
        store.dispatch(setCacheValid(true)) // Set cache valid first

        const updateData: Partial<MotorcycleFilters> = {
          minPrice: 10000,
          maxPrice: 20000,
        }

        store.dispatch(updateFilters(updateData))

        const state = store.getState().motorcycles
        expect(state.filters).toEqual({
          ...initialFilters,
          ...updateData,
        })
        expect(state.cacheValid).toBe(false)
      })
    })

    describe('clearFilters', () => {
      it('should clear all filters and invalidate cache', () => {
        const initialFilters: MotorcycleFilters = {
          brand: ['Honda'],
          category: ['Sport'],
          minPrice: 10000,
        }

        store.dispatch(setFilters(initialFilters))
        store.dispatch(setCacheValid(true))
        
        store.dispatch(clearFilters())

        const state = store.getState().motorcycles
        expect(state.filters).toEqual({})
        expect(state.cacheValid).toBe(false)
      })
    })

    describe('clearSelectedMotorcycle', () => {
      it('should clear selected motorcycle', () => {
        const initialState = {
          motorcycles: {
            ...store.getState().motorcycles,
            selectedMotorcycle: mockMotorcycles[0],
          },
        }
        store = createTestStore(initialState)

        store.dispatch(clearSelectedMotorcycle())

        const state = store.getState().motorcycles
        expect(state.selectedMotorcycle).toBeNull()
      })
    })

    describe('resetPagination', () => {
      it('should reset pagination and clear motorcycles', () => {
        const initialState = {
          motorcycles: {
            ...store.getState().motorcycles,
            motorcycles: mockMotorcycles,
            currentPage: 3,
          },
        }
        store = createTestStore(initialState)

        store.dispatch(resetPagination())

        const state = store.getState().motorcycles
        expect(state.currentPage).toBe(1)
        expect(state.motorcycles).toEqual([])
      })
    })

    describe('setCacheValid', () => {
      it('should set cache validity', () => {
        store.dispatch(setCacheValid(true))

        const state = store.getState().motorcycles
        expect(state.cacheValid).toBe(true)

        store.dispatch(setCacheValid(false))

        const updatedState = store.getState().motorcycles
        expect(updatedState.cacheValid).toBe(false)
      })
    })

    describe('updateMotorcycleRating', () => {
      it('should update rating in motorcycles list', () => {
        const initialState = {
          motorcycles: {
            ...store.getState().motorcycles,
            motorcycles: mockMotorcycles,
          },
        }
        store = createTestStore(initialState)

        const ratingUpdate = {
          id: '1',
          rating: 4.8,
          reviews: 25,
        }

        store.dispatch(updateMotorcycleRating(ratingUpdate))

        const state = store.getState().motorcycles
        const updatedMotorcycle = state.motorcycles.find(m => m._id === '1')
        
        expect(updatedMotorcycle?.rating?.overall).toBe(4.8)
        expect(updatedMotorcycle?.rating?.reviews).toBe(25)
      })

      it('should update rating in selected motorcycle', () => {
        const initialState = {
          motorcycles: {
            ...store.getState().motorcycles,
            selectedMotorcycle: mockMotorcycles[0],
          },
        }
        store = createTestStore(initialState)

        const ratingUpdate = {
          id: '1',
          rating: 4.8,
          reviews: 25,
        }

        store.dispatch(updateMotorcycleRating(ratingUpdate))

        const state = store.getState().motorcycles
        expect(state.selectedMotorcycle?.rating?.overall).toBe(4.8)
        expect(state.selectedMotorcycle?.rating?.reviews).toBe(25)
      })

      it('should update rating in recommendations', () => {
        const initialState = {
          motorcycles: {
            ...store.getState().motorcycles,
            recommendations: mockMotorcycles,
          },
        }
        store = createTestStore(initialState)

        const ratingUpdate = {
          id: '1',
          rating: 4.8,
          reviews: 25,
        }

        store.dispatch(updateMotorcycleRating(ratingUpdate))

        const state = store.getState().motorcycles
        const updatedRecommendation = state.recommendations.find(m => m._id === '1')
        
        expect(updatedRecommendation?.rating?.overall).toBe(4.8)
        expect(updatedRecommendation?.rating?.reviews).toBe(25)
      })
    })

    describe('updateAvailableFilters', () => {
      it('should update available filters', () => {
        const newFilters = {
          brands: ['Honda', 'Yamaha', 'Kawasaki'],
          categories: ['Sport', 'Cruiser'],
          priceRange: { min: 5000, max: 50000 },
        }

        store.dispatch(updateAvailableFilters(newFilters))

        const state = store.getState().motorcycles
        expect(state.availableFilters.brands).toEqual(newFilters.brands)
        expect(state.availableFilters.categories).toEqual(newFilters.categories)
        expect(state.availableFilters.priceRange).toEqual(newFilters.priceRange)
      })
    })
  })

  describe('Async Actions', () => {
    describe('fetchMotorcycles', () => {
      it('should fetch motorcycles successfully', async () => {
        const action = await store.dispatch(fetchMotorcycles({}))

        expect(action.type).toBe('motorcycles/fetchMotorcycles/fulfilled')
        
        const state = store.getState().motorcycles
        expect(state.motorcycles.length).toBeGreaterThan(0)
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()
        expect(state.cacheValid).toBe(true)
        expect(state.lastFetchTime).toBeGreaterThan(0)
      })

      it('should handle refresh correctly', async () => {
        // First, set some initial state
        const initialState = {
          motorcycles: {
            ...store.getState().motorcycles,
            motorcycles: mockMotorcycles,
            currentPage: 2,
          },
        }
        store = createTestStore(initialState)

        const action = await store.dispatch(fetchMotorcycles({ refresh: true }))

        expect(action.type).toBe('motorcycles/fetchMotorcycles/fulfilled')
        expect(action.payload.refresh).toBe(true)

        const state = store.getState().motorcycles
        expect(state.isRefreshing).toBe(false)
        expect(state.currentPage).toBe(1) // Should be reset to 1 for refresh
      })

      it('should set loading state during fetch', async () => {
        const fetchPromise = store.dispatch(fetchMotorcycles({}))
        
        // Check loading state before completion
        let state = store.getState().motorcycles
        expect(state.isLoading).toBe(true)
        expect(state.error).toBeNull()

        await fetchPromise
      })

      it('should handle fetch error', async () => {
        server.use(
          rest.get(`${API_BASE_URL}/motorcycles`, (req, res, ctx) => {
            return res(
              ctx.status(500),
              ctx.json({
                success: false,
                message: 'Internal server error',
              })
            )
          })
        )

        const action = await store.dispatch(fetchMotorcycles({}))

        expect(action.type).toBe('motorcycles/fetchMotorcycles/rejected')

        const state = store.getState().motorcycles
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeTruthy()
      })

      it('should fetch with filters and pagination', async () => {
        const filters: MotorcycleFilters = {
          brand: ['Honda'],
          category: ['Sport'],
        }

        const pagination = {
          page: 2,
          limit: 10,
        }

        const action = await store.dispatch(fetchMotorcycles({ 
          filters, 
          pagination 
        }))

        expect(action.type).toBe('motorcycles/fetchMotorcycles/fulfilled')
      })
    })

    describe('loadMoreMotorcycles', () => {
      it('should load more motorcycles successfully', async () => {
        // Set initial state with some motorcycles
        const initialState = {
          motorcycles: {
            ...store.getState().motorcycles,
            motorcycles: [mockMotorcycles[0]],
            currentPage: 1,
            hasNext: true,
          },
        }
        store = createTestStore(initialState)

        const action = await store.dispatch(loadMoreMotorcycles({
          currentPage: 1,
        }))

        expect(action.type).toBe('motorcycles/loadMore/fulfilled')

        const state = store.getState().motorcycles
        expect(state.motorcycles.length).toBeGreaterThan(1) // Should have more motorcycles
        expect(state.isLoadingMore).toBe(false)
        expect(state.error).toBeNull()
      })

      it('should set loading more state', async () => {
        const loadPromise = store.dispatch(loadMoreMotorcycles({ currentPage: 1 }))

        // Check loading state
        let state = store.getState().motorcycles
        expect(state.isLoadingMore).toBe(true)

        await loadPromise
      })

      it('should handle load more error', async () => {
        server.use(
          rest.get(`${API_BASE_URL}/motorcycles`, (req, res, ctx) => {
            return res(ctx.status(500))
          })
        )

        const action = await store.dispatch(loadMoreMotorcycles({ currentPage: 1 }))

        expect(action.type).toBe('motorcycles/loadMore/rejected')

        const state = store.getState().motorcycles
        expect(state.isLoadingMore).toBe(false)
        expect(state.error).toBeTruthy()
      })
    })

    describe('fetchMotorcycleById', () => {
      it('should fetch motorcycle by ID successfully', async () => {
        const action = await store.dispatch(fetchMotorcycleById('1'))

        expect(action.type).toBe('motorcycles/fetchById/fulfilled')

        const state = store.getState().motorcycles
        expect(state.selectedMotorcycle).toBeTruthy()
        expect(state.selectedMotorcycle?._id).toBe('1')
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()
      })

      it('should handle motorcycle not found', async () => {
        const action = await store.dispatch(fetchMotorcycleById('nonexistent'))

        expect(action.type).toBe('motorcycles/fetchById/rejected')

        const state = store.getState().motorcycles
        expect(state.selectedMotorcycle).toBeNull()
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeTruthy()
      })
    })

    describe('searchMotorcycles', () => {
      it('should search motorcycles successfully', async () => {
        const action = await store.dispatch(searchMotorcycles({
          query: 'Honda',
        }))

        expect(action.type).toBe('motorcycles/search/fulfilled')

        const state = store.getState().motorcycles
        expect(state.motorcycles.length).toBeGreaterThan(0)
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()
      })

      it('should search with filters', async () => {
        const filters: MotorcycleFilters = {
          category: ['Sport'],
        }

        const action = await store.dispatch(searchMotorcycles({
          query: 'CBR',
          filters,
        }))

        expect(action.type).toBe('motorcycles/search/fulfilled')
      })

      it('should handle search error', async () => {
        server.use(
          rest.get(`${API_BASE_URL}/motorcycles/search`, (req, res, ctx) => {
            return res(ctx.status(500))
          })
        )

        const action = await store.dispatch(searchMotorcycles({
          query: 'Honda',
        }))

        expect(action.type).toBe('motorcycles/search/rejected')

        const state = store.getState().motorcycles
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeTruthy()
      })
    })

    describe('fetchRecommendations', () => {
      it('should fetch general recommendations', async () => {
        const action = await store.dispatch(fetchRecommendations())

        expect(action.type).toBe('motorcycles/fetchRecommendations/fulfilled')

        const state = store.getState().motorcycles
        expect(state.recommendations.length).toBeGreaterThan(0)
      })

      it('should fetch recommendations for specific motorcycle', async () => {
        const action = await store.dispatch(fetchRecommendations('1'))

        expect(action.type).toBe('motorcycles/fetchRecommendations/fulfilled')

        const state = store.getState().motorcycles
        expect(state.recommendations.length).toBeGreaterThan(0)
      })

      it('should handle recommendations error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        server.use(
          rest.get(`${API_BASE_URL}/motorcycles/recommendations`, (req, res, ctx) => {
            return res(ctx.status(500))
          })
        )

        const action = await store.dispatch(fetchRecommendations())

        expect(action.type).toBe('motorcycles/fetchRecommendations/rejected')
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
      })
    })

    describe('fetchTrending', () => {
      it('should fetch trending motorcycles', async () => {
        const action = await store.dispatch(fetchTrending())

        expect(action.type).toBe('motorcycles/fetchTrending/fulfilled')

        const state = store.getState().motorcycles
        expect(state.trending.length).toBeGreaterThan(0)
      })

      it('should handle trending error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        server.use(
          rest.get(`${API_BASE_URL}/motorcycles/trending`, (req, res, ctx) => {
            return res(ctx.status(500))
          })
        )

        const action = await store.dispatch(fetchTrending())

        expect(action.type).toBe('motorcycles/fetchTrending/rejected')
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
      })
    })

    describe('fetchLatest', () => {
      it('should fetch latest motorcycles', async () => {
        const action = await store.dispatch(fetchLatest())

        expect(action.type).toBe('motorcycles/fetchLatest/fulfilled')

        const state = store.getState().motorcycles
        expect(state.latest.length).toBeGreaterThan(0)
      })

      it('should handle latest error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        server.use(
          rest.get(`${API_BASE_URL}/motorcycles/latest`, (req, res, ctx) => {
            return res(ctx.status(500))
          })
        )

        const action = await store.dispatch(fetchLatest())

        expect(action.type).toBe('motorcycles/fetchLatest/rejected')
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
      })
    })
  })

  describe('Selectors', () => {
    const mockState = {
      motorcycles: {
        motorcycles: mockMotorcycles,
        selectedMotorcycle: mockMotorcycles[0],
        filters: { brand: ['Honda'] },
        availableFilters: {
          brands: ['Honda', 'Yamaha'],
          categories: ['Sport'],
          priceRange: { min: 0, max: 100000 },
          powerRange: { min: 0, max: 500 },
        },
        isLoading: false,
        error: null,
        currentPage: 2,
        totalPages: 5,
        totalMotorcycles: 100,
        hasNext: true,
        hasPrev: true,
        recommendations: [mockMotorcycles[1]],
        trending: [mockMotorcycles[2]],
        latest: mockMotorcycles,
      },
    }

    it('should select motorcycles', () => {
      const motorcycles = selectMotorcycles(mockState)
      expect(motorcycles).toEqual(mockMotorcycles)
    })

    it('should select selected motorcycle', () => {
      const selectedMotorcycle = selectSelectedMotorcycle(mockState)
      expect(selectedMotorcycle).toEqual(mockMotorcycles[0])
    })

    it('should select filters', () => {
      const filters = selectMotorcycleFilters(mockState)
      expect(filters).toEqual({ brand: ['Honda'] })
    })

    it('should select available filters', () => {
      const availableFilters = selectAvailableFilters(mockState)
      expect(availableFilters.brands).toEqual(['Honda', 'Yamaha'])
      expect(availableFilters.categories).toEqual(['Sport'])
    })

    it('should select loading state', () => {
      const isLoading = selectMotorcycleLoading(mockState)
      expect(isLoading).toBe(false)
    })

    it('should select error', () => {
      const error = selectMotorcycleError(mockState)
      expect(error).toBeNull()
    })

    it('should select pagination info', () => {
      const pagination = selectPagination(mockState)
      expect(pagination).toEqual({
        currentPage: 2,
        totalPages: 5,
        totalMotorcycles: 100,
        hasNext: true,
        hasPrev: true,
      })
    })

    it('should select recommendations', () => {
      const recommendations = selectRecommendations(mockState)
      expect(recommendations).toEqual([mockMotorcycles[1]])
    })

    it('should select trending', () => {
      const trending = selectTrending(mockState)
      expect(trending).toEqual([mockMotorcycles[2]])
    })

    it('should select latest', () => {
      const latest = selectLatest(mockState)
      expect(latest).toEqual(mockMotorcycles)
    })
  })
})