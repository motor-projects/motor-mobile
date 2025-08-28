import { rest } from 'msw'
import { setupServer } from 'msw-react-native'
import { 
  createMockMotorcycle, 
  createMockUser, 
  createMockReview, 
  createMockFavorite 
} from '../utils/testUtils'
import { API_BASE_URL } from '../../utils/constants'

// Mock data
const mockMotorcycles = [
  createMockMotorcycle({ _id: '1', brand: 'Honda', model: 'CBR1000RR' }),
  createMockMotorcycle({ _id: '2', brand: 'Yamaha', model: 'YZF-R1' }),
  createMockMotorcycle({ _id: '3', brand: 'Kawasaki', model: 'Ninja ZX-10R' }),
]

const mockUser = createMockUser()
const mockReviews = [
  createMockReview({ _id: '1', motorcycleId: '1' }),
  createMockReview({ _id: '2', motorcycleId: '1' }),
]
const mockFavorites = [
  createMockFavorite({ _id: '1', motorcycleId: '1' }),
]

// API handlers
export const handlers = [
  // Auth endpoints
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          user: mockUser,
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
        },
      })
    )
  }),

  rest.post(`${API_BASE_URL}/auth/register`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          user: mockUser,
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
        },
      })
    )
  }),

  rest.post(`${API_BASE_URL}/auth/logout`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Logged out successfully',
      })
    )
  }),

  rest.get(`${API_BASE_URL}/auth/profile`, (req, res, ctx) => {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.includes('Bearer')) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Unauthorized',
        })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockUser,
      })
    )
  }),

  rest.put(`${API_BASE_URL}/auth/profile`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockUser,
      })
    )
  }),

  rest.post(`${API_BASE_URL}/auth/refresh`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          token: 'new-mock-jwt-token',
        },
      })
    )
  }),

  // Motorcycle endpoints
  rest.get(`${API_BASE_URL}/motorcycles`, (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page') || '1')
    const limit = parseInt(req.url.searchParams.get('limit') || '10')
    const search = req.url.searchParams.get('search')

    let filteredMotorcycles = mockMotorcycles

    if (search) {
      filteredMotorcycles = mockMotorcycles.filter(
        bike => bike.brand.toLowerCase().includes(search.toLowerCase()) ||
                bike.model.toLowerCase().includes(search.toLowerCase())
      )
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedMotorcycles = filteredMotorcycles.slice(startIndex, endIndex)

    return res(
      ctx.status(200),
      ctx.json({
        motorcycles: paginatedMotorcycles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredMotorcycles.length / limit),
          totalItems: filteredMotorcycles.length,
          hasNext: endIndex < filteredMotorcycles.length,
          hasPrev: page > 1,
        },
        filters: {
          applied: {},
          available: {
            brands: ['Honda', 'Yamaha', 'Kawasaki'],
            categories: ['Sport', 'Cruiser', 'Touring'],
            priceRange: { min: 5000, max: 50000 },
            powerRange: { min: 50, max: 200 },
          },
        },
      })
    )
  }),

  rest.get(`${API_BASE_URL}/motorcycles/:id`, (req, res, ctx) => {
    const { id } = req.params
    const motorcycle = mockMotorcycles.find(bike => bike._id === id)

    if (!motorcycle) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'Motorcycle not found',
        })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: motorcycle,
      })
    )
  }),

  rest.get(`${API_BASE_URL}/motorcycles/search`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        motorcycles: mockMotorcycles,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: mockMotorcycles.length,
          hasNext: false,
          hasPrev: false,
        },
        filters: {
          applied: {},
          available: {
            brands: ['Honda', 'Yamaha', 'Kawasaki'],
            categories: ['Sport', 'Cruiser', 'Touring'],
            priceRange: { min: 5000, max: 50000 },
            powerRange: { min: 50, max: 200 },
          },
        },
      })
    )
  }),

  rest.get(`${API_BASE_URL}/motorcycles/recommendations`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockMotorcycles.slice(0, 3),
      })
    )
  }),

  rest.get(`${API_BASE_URL}/motorcycles/:id/recommendations`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockMotorcycles.slice(0, 3),
      })
    )
  }),

  rest.get(`${API_BASE_URL}/motorcycles/trending`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockMotorcycles.slice(0, 5),
      })
    )
  }),

  rest.get(`${API_BASE_URL}/motorcycles/latest`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockMotorcycles.slice(0, 5),
      })
    )
  }),

  // Review endpoints
  rest.get(`${API_BASE_URL}/motorcycles/:id/reviews`, (req, res, ctx) => {
    const { id } = req.params
    const filteredReviews = mockReviews.filter(review => review.motorcycleId === id)

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          reviews: filteredReviews,
          total: filteredReviews.length,
        },
      })
    )
  }),

  rest.post(`${API_BASE_URL}/motorcycles/:id/reviews`, (req, res, ctx) => {
    const newReview = createMockReview({
      _id: `review-${Date.now()}`,
      motorcycleId: req.params.id,
    })

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: newReview,
      })
    )
  }),

  rest.put(`${API_BASE_URL}/reviews/:id`, (req, res, ctx) => {
    const { id } = req.params
    const review = mockReviews.find(r => r._id === id)

    if (!review) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'Review not found',
        })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: review,
      })
    )
  }),

  rest.delete(`${API_BASE_URL}/reviews/:id`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Review deleted successfully',
      })
    )
  }),

  rest.post(`${API_BASE_URL}/reviews/:id/helpful`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Review marked as helpful',
      })
    )
  }),

  // Favorite endpoints
  rest.get(`${API_BASE_URL}/favorites`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockFavorites,
      })
    )
  }),

  rest.post(`${API_BASE_URL}/favorites`, (req, res, ctx) => {
    const newFavorite = createMockFavorite({
      _id: `favorite-${Date.now()}`,
    })

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: newFavorite,
      })
    )
  }),

  rest.delete(`${API_BASE_URL}/favorites/:motorcycleId`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Favorite removed successfully',
      })
    )
  }),

  rest.get(`${API_BASE_URL}/favorites/check/:motorcycleId`, (req, res, ctx) => {
    const { motorcycleId } = req.params
    const isFavorite = mockFavorites.some(fav => fav.motorcycleId === motorcycleId)

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: { isFavorite },
      })
    )
  }),

  // Stats endpoints
  rest.get(`${API_BASE_URL}/stats`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          totalMotorcycles: 150,
          totalBrands: 15,
          totalCategories: 8,
          totalUsers: 1250,
          totalReviews: 850,
        },
      })
    )
  }),

  rest.get(`${API_BASE_URL}/stats/brands`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [
          { brand: 'Honda', count: 25 },
          { brand: 'Yamaha', count: 20 },
          { brand: 'Kawasaki', count: 18 },
        ],
      })
    )
  }),

  // Error handlers for testing error scenarios
  rest.get(`${API_BASE_URL}/error/500`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        error: 'Internal server error',
      })
    )
  }),

  rest.get(`${API_BASE_URL}/error/404`, (req, res, ctx) => {
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        error: 'Not found',
      })
    )
  }),

  rest.get(`${API_BASE_URL}/error/network`, (req, res, ctx) => {
    return res.networkError('Network error')
  }),
]

// Setup server
export const server = setupServer(...handlers)