import React, { ReactElement } from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { configureStore, Store } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from 'react-query'

import { RootState } from '../../store'
import authSlice from '../../store/slices/authSlice'
import motorcycleSlice from '../../store/slices/motorcycleSlice'
import favoriteSlice from '../../store/slices/favoriteSlice'
import appSlice from '../../store/slices/appSlice'
import searchSlice from '../../store/slices/searchSlice'
import reviewSlice from '../../store/slices/reviewSlice'

// Mock store creation
export function createMockStore(initialState?: Partial<RootState>): Store {
  return configureStore({
    reducer: {
      auth: authSlice,
      motorcycles: motorcycleSlice,
      favorites: favoriteSlice,
      app: appSlice,
      search: searchSlice,
      reviews: reviewSlice,
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// Test wrapper component
interface AllTheProvidersProps {
  children: React.ReactNode
  store?: Store
  queryClient?: QueryClient
}

const AllTheProviders = ({ 
  children, 
  store, 
  queryClient 
}: AllTheProvidersProps) => {
  const mockStore = store || createMockStore()
  const mockQueryClient = queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 375, height: 812 },
        insets: { top: 44, left: 0, right: 0, bottom: 34 },
      }}
    >
      <Provider store={mockStore}>
        <QueryClientProvider client={mockQueryClient}>
          <NavigationContainer>
            {children}
          </NavigationContainer>
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  )
}

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>
  store?: Store
  queryClient?: QueryClient
}

const customRender = (
  ui: ReactElement,
  {
    preloadedState,
    store = createMockStore(preloadedState),
    queryClient,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children?: React.ReactNode }) => (
    <AllTheProviders store={store} queryClient={queryClient}>
      {children}
    </AllTheProviders>
  )
  
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// Navigation test wrapper
interface NavigationTestWrapperProps {
  children: React.ReactNode
  initialRouteName?: string
  initialParams?: any
}

export const NavigationTestWrapper = ({ 
  children, 
  initialRouteName = 'Home', 
  initialParams = {} 
}: NavigationTestWrapperProps) => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    canGoBack: jest.fn(() => true),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn(),
    getState: jest.fn(() => ({
      routes: [{ name: initialRouteName, params: initialParams }],
      index: 0,
    })),
  }

  const mockRoute = {
    key: 'test-key',
    name: initialRouteName,
    params: initialParams,
  }

  return (
    <SafeAreaProvider>
      {React.cloneElement(children as React.ReactElement, {
        navigation: mockNavigation,
        route: mockRoute,
      })}
    </SafeAreaProvider>
  )
}

// Redux test helpers
export const mockInitialState: RootState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  motorcycles: {
    motorcycles: [],
    currentMotorcycle: null,
    recommendations: [],
    trending: [],
    latest: [],
    filters: {},
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNext: false,
      hasPrev: false,
    },
    isLoading: false,
    error: null,
  },
  favorites: {
    favorites: [],
    isLoading: false,
    error: null,
  },
  app: {
    isOffline: false,
    theme: 'light',
    language: 'en',
    firstLaunch: false,
    pushToken: null,
    location: null,
  },
  search: {
    query: '',
    filters: {},
    history: [],
    suggestions: [],
    isLoading: false,
    error: null,
  },
  reviews: {
    reviews: [],
    userReviews: [],
    currentReview: null,
    isLoading: false,
    error: null,
  },
}

// Async utilities
export const waitForLoadingToFinish = () => 
  new Promise((resolve) => setTimeout(resolve, 0))

// Mock generators
export const createMockUser = (overrides = {}) => ({
  _id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  avatar: 'https://example.com/avatar.jpg',
  role: 'user' as const,
  favorites: [],
  reviews: [],
  profile: {
    firstName: 'Test',
    lastName: 'User',
    bio: 'Test bio',
    location: 'Test City',
    joinDate: '2023-01-01T00:00:00.000Z',
  },
  preferences: {
    units: 'metric' as const,
    language: 'en',
    notifications: true,
    darkMode: false,
  },
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  ...overrides,
})

export const createMockMotorcycle = (overrides = {}) => ({
  _id: 'motorcycle-123',
  brand: 'Honda',
  model: 'CBR1000RR',
  year: 2023,
  category: 'Sport',
  price: {
    msrp: 16999,
    currency: 'USD',
  },
  engine: {
    type: '4-Stroke',
    displacement: 999,
    bore: 76,
    stroke: 55,
    compressionRatio: '13.0:1',
    cooling: 'Liquid',
    fuelSystem: 'PGM-FI',
    valvesPerCylinder: 4,
    maxRpm: 13000,
  },
  performance: {
    power: {
      hp: 189,
      kw: 141,
      rpm: 13000,
    },
    torque: {
      nm: 114,
      lbft: 84,
      rpm: 11500,
    },
    topSpeed: 299,
    acceleration: {
      zeroToSixty: 3.1,
      zeroToHundred: 6.2,
      quarterMile: 10.8,
    },
    fuelEconomy: {
      city: 32,
      highway: 40,
      combined: 35,
    },
  },
  dimensions: {
    length: 2100,
    width: 720,
    height: 1145,
    wheelbase: 1405,
    seatHeight: 832,
    groundClearance: 130,
    weight: {
      dry: 195,
      wet: 201,
      gvwr: 360,
    },
    fuelCapacity: 16.1,
  },
  images: [
    {
      url: 'https://example.com/image1.jpg',
      alt: 'Honda CBR1000RR',
      type: 'main',
    },
  ],
  features: ['ABS', 'Traction Control', 'Quick Shifter'],
  colors: [
    {
      name: 'Grand Prix Red',
      hex: '#DC143C',
      imageUrl: 'https://example.com/red.jpg',
    },
  ],
  rating: {
    overall: 4.5,
    reviews: 25,
    breakdown: {
      performance: 4.8,
      comfort: 4.2,
      reliability: 4.3,
      value: 4.1,
      styling: 4.7,
    },
  },
  transmission: {
    type: '6-Speed Manual',
    gears: 6,
  },
  suspension: {
    front: 'Showa BPF',
    rear: 'Showa BPR',
  },
  brakes: {
    front: 'Dual 320mm Disc',
    rear: 'Single 220mm Disc',
    abs: true,
  },
  wheels: {
    front: {
      size: '120/70 ZR17',
      tire: 'Bridgestone RS11',
    },
    rear: {
      size: '190/55 ZR17',
      tire: 'Bridgestone RS11',
    },
  },
  status: 'active',
  tags: ['sportbike', 'superbike', 'track'],
  seo: {
    slug: 'honda-cbr1000rr-2023',
    metaTitle: '2023 Honda CBR1000RR',
    metaDescription: 'The ultimate sportbike experience',
  },
  fullName: '2023 Honda CBR1000RR',
  powerToWeight: '0.94 hp/kg',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  ...overrides,
})

export const createMockReview = (overrides = {}) => ({
  _id: 'review-123',
  motorcycleId: 'motorcycle-123',
  userId: 'user-123',
  user: {
    username: 'testuser',
    avatar: 'https://example.com/avatar.jpg',
  },
  rating: {
    overall: 4.5,
    performance: 5,
    comfort: 4,
    reliability: 4,
    value: 4,
    styling: 5,
  },
  title: 'Amazing sportbike!',
  content: 'This is an excellent motorcycle with great performance.',
  pros: ['Fast', 'Good handling', 'Great looks'],
  cons: ['Expensive', 'Hard seat'],
  ownership: {
    duration: '6 months',
    mileage: 5000,
    useCase: 'Weekend riding',
  },
  helpful: {
    count: 10,
    users: [],
  },
  verified: true,
  images: [],
  createdAt: '2023-06-01T00:00:00.000Z',
  updatedAt: '2023-06-01T00:00:00.000Z',
  ...overrides,
})

export const createMockFavorite = (overrides = {}) => ({
  _id: 'favorite-123',
  userId: 'user-123',
  motorcycleId: 'motorcycle-123',
  motorcycle: createMockMotorcycle(),
  addedAt: '2023-06-01T00:00:00.000Z',
  notes: 'Dream bike!',
  ...overrides,
})

// Export everything
export * from '@testing-library/react-native'
export { customRender as render }