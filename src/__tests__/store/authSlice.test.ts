import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureStore } from '@reduxjs/toolkit'
import { server } from '../mocks/server'
import { rest } from 'msw'

import authReducer, {
  // Async actions
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  restoreAuthState,
  forgotPassword,
  changePassword,
  // Sync actions
  clearError,
  clearAuth,
  setUser,
  updateUserPreferences,
  addFavoriteToUser,
  removeFavoriteFromUser,
  addReviewToUser,
  // Selectors
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '../../store/slices/authSlice'
import { AuthState } from '../../types'
import { createMockUser } from '../utils/testUtils'
import { API_BASE_URL } from '../../utils/constants'

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>

// Test store setup
const createTestStore = (preloadedState?: { auth: AuthState }) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

const mockUser = createMockUser()
const mockCredentials = {
  email: 'test@example.com',
  password: 'password123',
}

const mockRegisterCredentials = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  confirmPassword: 'password123',
}

describe('Auth Slice Tests', () => {
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
      const state = store.getState().auth
      
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('Sync Actions', () => {
    describe('clearError', () => {
      it('should clear error', () => {
        const initialState: AuthState = {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Some error',
        }

        store = createTestStore({ auth: initialState })
        store.dispatch(clearError())

        const state = store.getState().auth
        expect(state.error).toBeNull()
      })
    })

    describe('clearAuth', () => {
      it('should clear all auth state', () => {
        const initialState: AuthState = {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }

        store = createTestStore({ auth: initialState })
        store.dispatch(clearAuth())

        const state = store.getState().auth
        expect(state.user).toBeNull()
        expect(state.token).toBeNull()
        expect(state.isAuthenticated).toBe(false)
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()
      })
    })

    describe('setUser', () => {
      it('should set user', () => {
        store.dispatch(setUser(mockUser))

        const state = store.getState().auth
        expect(state.user).toEqual(mockUser)
      })
    })

    describe('updateUserPreferences', () => {
      it('should update user preferences', () => {
        const initialState: AuthState = {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }

        store = createTestStore({ auth: initialState })
        
        const newPreferences = {
          darkMode: true,
          language: 'es',
        }

        store.dispatch(updateUserPreferences(newPreferences))

        const state = store.getState().auth
        expect(state.user?.preferences?.darkMode).toBe(true)
        expect(state.user?.preferences?.language).toBe('es')
        expect(state.user?.preferences?.units).toBe('metric') // Should keep existing
      })

      it('should not update preferences if user is null', () => {
        store.dispatch(updateUserPreferences({ darkMode: true }))

        const state = store.getState().auth
        expect(state.user).toBeNull()
      })
    })

    describe('addFavoriteToUser', () => {
      it('should add favorite to user', () => {
        const userWithoutFavorites = { ...mockUser, favorites: [] }
        const initialState: AuthState = {
          user: userWithoutFavorites,
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }

        store = createTestStore({ auth: initialState })
        store.dispatch(addFavoriteToUser('motorcycle-123'))

        const state = store.getState().auth
        expect(state.user?.favorites).toContain('motorcycle-123')
      })

      it('should not add duplicate favorites', () => {
        const userWithFavorites = { ...mockUser, favorites: ['motorcycle-123'] }
        const initialState: AuthState = {
          user: userWithFavorites,
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }

        store = createTestStore({ auth: initialState })
        store.dispatch(addFavoriteToUser('motorcycle-123'))

        const state = store.getState().auth
        expect(state.user?.favorites).toHaveLength(1)
      })

      it('should not add favorite if user is null', () => {
        store.dispatch(addFavoriteToUser('motorcycle-123'))

        const state = store.getState().auth
        expect(state.user).toBeNull()
      })
    })

    describe('removeFavoriteFromUser', () => {
      it('should remove favorite from user', () => {
        const userWithFavorites = { ...mockUser, favorites: ['motorcycle-123', 'motorcycle-456'] }
        const initialState: AuthState = {
          user: userWithFavorites,
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }

        store = createTestStore({ auth: initialState })
        store.dispatch(removeFavoriteFromUser('motorcycle-123'))

        const state = store.getState().auth
        expect(state.user?.favorites).not.toContain('motorcycle-123')
        expect(state.user?.favorites).toContain('motorcycle-456')
      })
    })

    describe('addReviewToUser', () => {
      it('should add review to user', () => {
        const userWithoutReviews = { ...mockUser, reviews: [] }
        const initialState: AuthState = {
          user: userWithoutReviews,
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }

        store = createTestStore({ auth: initialState })
        store.dispatch(addReviewToUser('review-123'))

        const state = store.getState().auth
        expect(state.user?.reviews).toContain('review-123')
      })
    })
  })

  describe('Async Actions', () => {
    describe('loginUser', () => {
      beforeEach(() => {
        mockAsyncStorage.setItem.mockResolvedValue()
      })

      it('should login successfully', async () => {
        const action = await store.dispatch(loginUser(mockCredentials))
        
        expect(action.type).toBe('auth/login/fulfilled')
        expect(action.payload).toHaveProperty('user')
        expect(action.payload).toHaveProperty('token')
        expect(action.payload).toHaveProperty('refreshToken')

        const state = store.getState().auth
        expect(state.user).toEqual(action.payload.user)
        expect(state.token).toBe(action.payload.token)
        expect(state.isAuthenticated).toBe(true)
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()

        // Verify AsyncStorage calls
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('auth_token', action.payload.token)
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('refresh_token', action.payload.refreshToken)
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(action.payload.user))
      })

      it('should handle login failure', async () => {
        server.use(
          rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
            return res(
              ctx.status(401),
              ctx.json({
                success: false,
                message: 'Invalid credentials',
              })
            )
          })
        )

        const action = await store.dispatch(loginUser(mockCredentials))

        expect(action.type).toBe('auth/login/rejected')
        
        const state = store.getState().auth
        expect(state.user).toBeNull()
        expect(state.token).toBeNull()
        expect(state.isAuthenticated).toBe(false)
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeTruthy()
      })

      it('should set loading state during login', () => {
        // Start login action
        store.dispatch(loginUser(mockCredentials))
        
        // Check loading state before completion
        let state = store.getState().auth
        expect(state.isLoading).toBe(true)
        expect(state.error).toBeNull()
      })
    })

    describe('registerUser', () => {
      beforeEach(() => {
        mockAsyncStorage.setItem.mockResolvedValue()
      })

      it('should register successfully', async () => {
        const action = await store.dispatch(registerUser(mockRegisterCredentials))

        expect(action.type).toBe('auth/register/fulfilled')
        expect(action.payload).toHaveProperty('user')
        expect(action.payload).toHaveProperty('token')

        const state = store.getState().auth
        expect(state.user).toEqual(action.payload.user)
        expect(state.token).toBe(action.payload.token)
        expect(state.isAuthenticated).toBe(true)
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()
      })

      it('should handle registration failure', async () => {
        server.use(
          rest.post(`${API_BASE_URL}/auth/register`, (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({
                success: false,
                message: 'Email already exists',
              })
            )
          })
        )

        const action = await store.dispatch(registerUser(mockRegisterCredentials))

        expect(action.type).toBe('auth/register/rejected')

        const state = store.getState().auth
        expect(state.isAuthenticated).toBe(false)
        expect(state.error).toBeTruthy()
      })
    })

    describe('logoutUser', () => {
      beforeEach(() => {
        mockAsyncStorage.multiRemove.mockResolvedValue()
      })

      it('should logout successfully', async () => {
        // Set initial authenticated state
        const initialState: AuthState = {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }
        store = createTestStore({ auth: initialState })

        const action = await store.dispatch(logoutUser())

        expect(action.type).toBe('auth/logout/fulfilled')

        const state = store.getState().auth
        expect(state.user).toBeNull()
        expect(state.token).toBeNull()
        expect(state.isAuthenticated).toBe(false)
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()

        // Verify AsyncStorage cleanup
        expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
          'auth_token',
          'refresh_token',
          'user'
        ])
      })

      it('should clear local storage even if API fails', async () => {
        server.use(
          rest.post(`${API_BASE_URL}/auth/logout`, (req, res, ctx) => {
            return res(ctx.status(500))
          })
        )

        const initialState: AuthState = {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }
        store = createTestStore({ auth: initialState })

        const action = await store.dispatch(logoutUser())

        // Should still fulfill and clear state
        expect(action.type).toBe('auth/logout/fulfilled')

        const state = store.getState().auth
        expect(state.user).toBeNull()
        expect(state.token).toBeNull()
        expect(state.isAuthenticated).toBe(false)

        expect(mockAsyncStorage.multiRemove).toHaveBeenCalled()
      })
    })

    describe('getUserProfile', () => {
      beforeEach(() => {
        mockAsyncStorage.setItem.mockResolvedValue()
      })

      it('should get user profile successfully', async () => {
        const action = await store.dispatch(getUserProfile())

        expect(action.type).toBe('auth/getProfile/fulfilled')
        expect(action.payload).toHaveProperty('_id')
        expect(action.payload).toHaveProperty('username')

        const state = store.getState().auth
        expect(state.user).toEqual(action.payload)
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()

        // Verify AsyncStorage update
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(action.payload))
      })

      it('should handle profile fetch failure', async () => {
        server.use(
          rest.get(`${API_BASE_URL}/auth/profile`, (req, res, ctx) => {
            return res(
              ctx.status(401),
              ctx.json({
                success: false,
                error: 'Unauthorized',
              })
            )
          })
        )

        const action = await store.dispatch(getUserProfile())

        expect(action.type).toBe('auth/getProfile/rejected')

        const state = store.getState().auth
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeTruthy()
      })
    })

    describe('updateUserProfile', () => {
      beforeEach(() => {
        mockAsyncStorage.setItem.mockResolvedValue()
      })

      it('should update user profile successfully', async () => {
        const updateData = {
          profile: {
            firstName: 'Updated',
            lastName: 'User',
          },
        }

        const action = await store.dispatch(updateUserProfile(updateData))

        expect(action.type).toBe('auth/updateProfile/fulfilled')

        const state = store.getState().auth
        expect(state.user).toEqual(action.payload)
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()

        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(action.payload))
      })
    })

    describe('uploadAvatar', () => {
      beforeEach(() => {
        mockAsyncStorage.setItem.mockResolvedValue()
        
        // Mock the upload endpoint
        server.use(
          rest.post(`${API_BASE_URL}/auth/upload-avatar`, (req, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.json({
                success: true,
                data: {
                  url: 'https://example.com/new-avatar.jpg'
                }
              })
            )
          })
        )
      })

      it('should upload avatar successfully', async () => {
        const initialState: AuthState = {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }
        store = createTestStore({ auth: initialState })

        const imageUri = 'file://test-image.jpg'
        const action = await store.dispatch(uploadAvatar(imageUri))

        expect(action.type).toBe('auth/uploadAvatar/fulfilled')

        const state = store.getState().auth
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()
      })
    })

    describe('restoreAuthState', () => {
      it('should restore auth state from storage', async () => {
        const storedUser = JSON.stringify(mockUser)
        const storedToken = 'stored-token'

        mockAsyncStorage.getItem
          .mockImplementation((key: string) => {
            if (key === 'auth_token') return Promise.resolve(storedToken)
            if (key === 'user') return Promise.resolve(storedUser)
            return Promise.resolve(null)
          })

        const action = await store.dispatch(restoreAuthState())

        expect(action.type).toBe('auth/restore/fulfilled')
        expect(action.payload).toEqual({
          user: mockUser,
          token: storedToken,
        })

        const state = store.getState().auth
        expect(state.user).toEqual(mockUser)
        expect(state.token).toBe(storedToken)
        expect(state.isAuthenticated).toBe(true)
        expect(state.isLoading).toBe(false)
      })

      it('should return null if no stored auth', async () => {
        mockAsyncStorage.getItem.mockResolvedValue(null)

        const action = await store.dispatch(restoreAuthState())

        expect(action.type).toBe('auth/restore/fulfilled')
        expect(action.payload).toBeNull()

        const state = store.getState().auth
        expect(state.user).toBeNull()
        expect(state.token).toBeNull()
        expect(state.isAuthenticated).toBe(false)
      })

      it('should handle storage errors gracefully', async () => {
        mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))

        const action = await store.dispatch(restoreAuthState())

        expect(action.type).toBe('auth/restore/fulfilled')
        expect(action.payload).toBeNull()
      })
    })

    describe('forgotPassword', () => {
      it('should send forgot password email successfully', async () => {
        const email = 'test@example.com'
        const action = await store.dispatch(forgotPassword(email))

        expect(action.type).toBe('auth/forgotPassword/fulfilled')
        expect(action.payload).toBe(email)

        const state = store.getState().auth
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()
      })

      it('should handle forgot password failure', async () => {
        server.use(
          rest.post(`${API_BASE_URL}/auth/forgot-password`, (req, res, ctx) => {
            return res(
              ctx.status(404),
              ctx.json({
                success: false,
                message: 'Email not found',
              })
            )
          })
        )

        const email = 'nonexistent@example.com'
        const action = await store.dispatch(forgotPassword(email))

        expect(action.type).toBe('auth/forgotPassword/rejected')

        const state = store.getState().auth
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeTruthy()
      })
    })

    describe('changePassword', () => {
      it('should change password successfully', async () => {
        const passwordData = {
          oldPassword: 'oldpass',
          newPassword: 'newpass',
        }

        const action = await store.dispatch(changePassword(passwordData))

        expect(action.type).toBe('auth/changePassword/fulfilled')
        expect(action.payload).toBe(true)

        const state = store.getState().auth
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()
      })

      it('should handle change password failure', async () => {
        server.use(
          rest.post(`${API_BASE_URL}/auth/change-password`, (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({
                success: false,
                message: 'Invalid old password',
              })
            )
          })
        )

        const passwordData = {
          oldPassword: 'wrongpass',
          newPassword: 'newpass',
        }

        const action = await store.dispatch(changePassword(passwordData))

        expect(action.type).toBe('auth/changePassword/rejected')

        const state = store.getState().auth
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeTruthy()
      })
    })
  })

  describe('Selectors', () => {
    it('should select auth state', () => {
      const state = store.getState()
      const authState = selectAuth(state)
      
      expect(authState).toEqual(state.auth)
    })

    it('should select user', () => {
      const initialState: AuthState = {
        user: mockUser,
        token: 'test-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
      store = createTestStore({ auth: initialState })

      const state = store.getState()
      const user = selectUser(state)
      
      expect(user).toEqual(mockUser)
    })

    it('should select isAuthenticated', () => {
      const initialState: AuthState = {
        user: mockUser,
        token: 'test-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
      store = createTestStore({ auth: initialState })

      const state = store.getState()
      const isAuthenticated = selectIsAuthenticated(state)
      
      expect(isAuthenticated).toBe(true)
    })

    it('should select loading state', () => {
      const initialState: AuthState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
      }
      store = createTestStore({ auth: initialState })

      const state = store.getState()
      const isLoading = selectAuthLoading(state)
      
      expect(isLoading).toBe(true)
    })

    it('should select error', () => {
      const errorMessage = 'Test error'
      const initialState: AuthState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      }
      store = createTestStore({ auth: initialState })

      const state = store.getState()
      const error = selectAuthError(state)
      
      expect(error).toBe(errorMessage)
    })
  })
})