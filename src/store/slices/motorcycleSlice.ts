import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Motorcycle, MotorcycleFilters, MotorcycleListResponse, PaginationParams } from '../../types'
import { motorcycleAPI } from '../../services/api'

interface MotorcycleState {
  // 摩托车列表
  motorcycles: Motorcycle[]
  totalMotorcycles: number
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  
  // 单个摩托车详情
  selectedMotorcycle: Motorcycle | null
  
  // 推荐和热门
  recommendations: Motorcycle[]
  trending: Motorcycle[]
  latest: Motorcycle[]
  
  // 筛选和排序
  filters: MotorcycleFilters
  availableFilters: {
    brands: string[]
    categories: string[]
    priceRange: { min: number; max: number }
    powerRange: { min: number; max: number }
  }
  
  // 加载状态
  isLoading: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  error: string | null
  
  // 缓存控制
  lastFetchTime: number
  cacheValid: boolean
}

// 获取摩托车列表
export const fetchMotorcycles = createAsyncThunk(
  'motorcycles/fetchMotorcycles',
  async (
    { filters, pagination, refresh = false }: { 
      filters?: MotorcycleFilters
      pagination?: PaginationParams
      refresh?: boolean 
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as { motorcycles: MotorcycleState }
      
      // 如果是刷新操作，重置页码
      const actualPagination = refresh 
        ? { ...pagination, page: 1 }
        : pagination
      
      const response = await motorcycleAPI.getMotorcycles(filters, actualPagination)
      
      return { 
        ...response, 
        refresh,
        isLoadMore: !refresh && (actualPagination?.page || 1) > 1
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch motorcycles')
    }
  }
)

// 加载更多摩托车
export const loadMoreMotorcycles = createAsyncThunk(
  'motorcycles/loadMore',
  async (
    { filters, currentPage }: { filters?: MotorcycleFilters; currentPage: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await motorcycleAPI.getMotorcycles(filters, {
        page: currentPage + 1,
        limit: 20,
      })
      
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load more motorcycles')
    }
  }
)

// 获取单个摩托车详情
export const fetchMotorcycleById = createAsyncThunk(
  'motorcycles/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const motorcycle = await motorcycleAPI.getMotorcycle(id)
      return motorcycle
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch motorcycle details')
    }
  }
)

// 搜索摩托车
export const searchMotorcycles = createAsyncThunk(
  'motorcycles/search',
  async (
    { query, filters }: { query: string; filters?: MotorcycleFilters },
    { rejectWithValue }
  ) => {
    try {
      const response = await motorcycleAPI.searchMotorcycles(query, filters)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed')
    }
  }
)

// 获取推荐摩托车
export const fetchRecommendations = createAsyncThunk(
  'motorcycles/fetchRecommendations',
  async (motorcycleId?: string, { rejectWithValue }) => {
    try {
      const recommendations = await motorcycleAPI.getRecommendations(motorcycleId)
      return recommendations
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommendations')
    }
  }
)

// 获取热门摩托车
export const fetchTrending = createAsyncThunk(
  'motorcycles/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const trending = await motorcycleAPI.getTrending()
      return trending
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending motorcycles')
    }
  }
)

// 获取最新摩托车
export const fetchLatest = createAsyncThunk(
  'motorcycles/fetchLatest',
  async (_, { rejectWithValue }) => {
    try {
      const latest = await motorcycleAPI.getLatest()
      return latest
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch latest motorcycles')
    }
  }
)

// 初始状态
const initialState: MotorcycleState = {
  motorcycles: [],
  totalMotorcycles: 0,
  currentPage: 1,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  
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
  error: null,
  
  lastFetchTime: 0,
  cacheValid: false,
}

// 创建motorcycle slice
const motorcycleSlice = createSlice({
  name: 'motorcycles',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null
    },
    
    // 设置筛选条件
    setFilters: (state, action: PayloadAction<MotorcycleFilters>) => {
      state.filters = action.payload
      state.cacheValid = false // 筛选条件变化时，使缓存失效
    },
    
    // 更新筛选条件
    updateFilters: (state, action: PayloadAction<Partial<MotorcycleFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.cacheValid = false
    },
    
    // 清除筛选条件
    clearFilters: (state) => {
      state.filters = {}
      state.cacheValid = false
    },
    
    // 清除选中的摩托车
    clearSelectedMotorcycle: (state) => {
      state.selectedMotorcycle = null
    },
    
    // 重置分页
    resetPagination: (state) => {
      state.currentPage = 1
      state.motorcycles = []
    },
    
    // 设置缓存有效性
    setCacheValid: (state, action: PayloadAction<boolean>) => {
      state.cacheValid = action.payload
    },
    
    // 更新摩托车评分（用于实时更新）
    updateMotorcycleRating: (state, action: PayloadAction<{ id: string; rating: number; reviews: number }>) => {
      const { id, rating, reviews } = action.payload
      
      // 更新列表中的摩托车
      const motorcycleIndex = state.motorcycles.findIndex(m => m._id === id)
      if (motorcycleIndex !== -1) {
        if (!state.motorcycles[motorcycleIndex].rating) {
          state.motorcycles[motorcycleIndex].rating = { overall: 0, reviews: 0 }
        }
        state.motorcycles[motorcycleIndex].rating!.overall = rating
        state.motorcycles[motorcycleIndex].rating!.reviews = reviews
      }
      
      // 更新选中的摩托车
      if (state.selectedMotorcycle && state.selectedMotorcycle._id === id) {
        if (!state.selectedMotorcycle.rating) {
          state.selectedMotorcycle.rating = { overall: 0, reviews: 0 }
        }
        state.selectedMotorcycle.rating.overall = rating
        state.selectedMotorcycle.rating.reviews = reviews
      }
      
      // 更新推荐列表中的摩托车
      const recIndex = state.recommendations.findIndex(m => m._id === id)
      if (recIndex !== -1) {
        if (!state.recommendations[recIndex].rating) {
          state.recommendations[recIndex].rating = { overall: 0, reviews: 0 }
        }
        state.recommendations[recIndex].rating!.overall = rating
        state.recommendations[recIndex].rating!.reviews = reviews
      }
    },
    
    // 更新可用筛选项
    updateAvailableFilters: (state, action: PayloadAction<Partial<MotorcycleState['availableFilters']>>) => {
      state.availableFilters = { ...state.availableFilters, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    // 获取摩托车列表
    builder
      .addCase(fetchMotorcycles.pending, (state, action) => {
        if (action.meta.arg.refresh) {
          state.isRefreshing = true
        } else {
          state.isLoading = true
        }
        state.error = null
      })
      .addCase(fetchMotorcycles.fulfilled, (state, action) => {
        state.isLoading = false
        state.isRefreshing = false
        
        const { motorcycles, pagination, filters, refresh, isLoadMore } = action.payload
        
        if (refresh || !isLoadMore) {
          // 刷新或首次加载
          state.motorcycles = motorcycles
        } else {
          // 加载更多
          state.motorcycles = [...state.motorcycles, ...motorcycles]
        }
        
        // 更新分页信息
        state.currentPage = pagination.currentPage
        state.totalPages = pagination.totalPages
        state.totalMotorcycles = pagination.totalItems
        state.hasNext = pagination.hasNext
        state.hasPrev = pagination.hasPrev
        
        // 更新可用筛选项
        if (filters.available) {
          state.availableFilters = filters.available
        }
        
        // 更新缓存信息
        state.lastFetchTime = Date.now()
        state.cacheValid = true
        state.error = null
      })
      .addCase(fetchMotorcycles.rejected, (state, action) => {
        state.isLoading = false
        state.isRefreshing = false
        state.error = action.payload as string
      })
    
    // 加载更多摩托车
    builder
      .addCase(loadMoreMotorcycles.pending, (state) => {
        state.isLoadingMore = true
        state.error = null
      })
      .addCase(loadMoreMotorcycles.fulfilled, (state, action) => {
        state.isLoadingMore = false
        
        const { motorcycles, pagination } = action.payload
        
        // 追加新的摩托车到列表
        state.motorcycles = [...state.motorcycles, ...motorcycles]
        
        // 更新分页信息
        state.currentPage = pagination.currentPage
        state.totalPages = pagination.totalPages
        state.totalMotorcycles = pagination.totalItems
        state.hasNext = pagination.hasNext
        state.hasPrev = pagination.hasPrev
        
        state.error = null
      })
      .addCase(loadMoreMotorcycles.rejected, (state, action) => {
        state.isLoadingMore = false
        state.error = action.payload as string
      })
    
    // 获取单个摩托车详情
    builder
      .addCase(fetchMotorcycleById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMotorcycleById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedMotorcycle = action.payload
        state.error = null
      })
      .addCase(fetchMotorcycleById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // 搜索摩托车
    builder
      .addCase(searchMotorcycles.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(searchMotorcycles.fulfilled, (state, action) => {
        state.isLoading = false
        
        const { motorcycles, pagination, filters } = action.payload
        
        state.motorcycles = motorcycles
        state.currentPage = pagination.currentPage
        state.totalPages = pagination.totalPages
        state.totalMotorcycles = pagination.totalItems
        state.hasNext = pagination.hasNext
        state.hasPrev = pagination.hasPrev
        
        // 更新可用筛选项
        if (filters.available) {
          state.availableFilters = filters.available
        }
        
        state.error = null
      })
      .addCase(searchMotorcycles.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // 获取推荐摩托车
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        // 不显示加载状态，因为这是后台加载
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        // 推荐加载失败不影响主要功能
        console.warn('Failed to load recommendations:', action.payload)
      })
    
    // 获取热门摩托车
    builder
      .addCase(fetchTrending.pending, (state) => {
        // 不显示加载状态
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.trending = action.payload
      })
      .addCase(fetchTrending.rejected, (state, action) => {
        console.warn('Failed to load trending motorcycles:', action.payload)
      })
    
    // 获取最新摩托车
    builder
      .addCase(fetchLatest.pending, (state) => {
        // 不显示加载状态
      })
      .addCase(fetchLatest.fulfilled, (state, action) => {
        state.latest = action.payload
      })
      .addCase(fetchLatest.rejected, (state, action) => {
        console.warn('Failed to load latest motorcycles:', action.payload)
      })
  },
})

// 导出actions
export const {
  clearError,
  setFilters,
  updateFilters,
  clearFilters,
  clearSelectedMotorcycle,
  resetPagination,
  setCacheValid,
  updateMotorcycleRating,
  updateAvailableFilters,
} = motorcycleSlice.actions

// 选择器
export const selectMotorcycles = (state: { motorcycles: MotorcycleState }) => state.motorcycles.motorcycles
export const selectSelectedMotorcycle = (state: { motorcycles: MotorcycleState }) => state.motorcycles.selectedMotorcycle
export const selectMotorcycleFilters = (state: { motorcycles: MotorcycleState }) => state.motorcycles.filters
export const selectAvailableFilters = (state: { motorcycles: MotorcycleState }) => state.motorcycles.availableFilters
export const selectMotorcycleLoading = (state: { motorcycles: MotorcycleState }) => state.motorcycles.isLoading
export const selectMotorcycleError = (state: { motorcycles: MotorcycleState }) => state.motorcycles.error
export const selectPagination = (state: { motorcycles: MotorcycleState }) => ({
  currentPage: state.motorcycles.currentPage,
  totalPages: state.motorcycles.totalPages,
  totalMotorcycles: state.motorcycles.totalMotorcycles,
  hasNext: state.motorcycles.hasNext,
  hasPrev: state.motorcycles.hasPrev,
})
export const selectRecommendations = (state: { motorcycles: MotorcycleState }) => state.motorcycles.recommendations
export const selectTrending = (state: { motorcycles: MotorcycleState }) => state.motorcycles.trending
export const selectLatest = (state: { motorcycles: MotorcycleState }) => state.motorcycles.latest

export default motorcycleSlice.reducer