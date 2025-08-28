import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Favorite } from '../../types'
import { favoriteAPI } from '../../services/api'

interface FavoriteState {
  favorites: Favorite[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  lastSyncTime: number
}

// 获取收藏列表
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const favorites = await favoriteAPI.getFavorites()
      return favorites
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites')
    }
  }
)

// 添加收藏
export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async (
    { motorcycleId, notes }: { motorcycleId: string; notes?: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const favorite = await favoriteAPI.addFavorite(motorcycleId, notes)
      
      // 同时更新用户状态中的收藏列表
      dispatch({ type: 'auth/addFavoriteToUser', payload: motorcycleId })
      
      return favorite
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to favorites')
    }
  }
)

// 移除收藏
export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (motorcycleId: string, { rejectWithValue, dispatch }) => {
    try {
      await favoriteAPI.removeFavorite(motorcycleId)
      
      // 同时更新用户状态中的收藏列表
      dispatch({ type: 'auth/removeFavoriteFromUser', payload: motorcycleId })
      
      return motorcycleId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from favorites')
    }
  }
)

// 检查是否已收藏
export const checkIsFavorite = createAsyncThunk(
  'favorites/checkIsFavorite',
  async (motorcycleId: string, { rejectWithValue }) => {
    try {
      const isFavorite = await favoriteAPI.isFavorite(motorcycleId)
      return { motorcycleId, isFavorite }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check favorite status')
    }
  }
)

// 更新收藏备注
export const updateFavoriteNotes = createAsyncThunk(
  'favorites/updateNotes',
  async (
    { motorcycleId, notes }: { motorcycleId: string; notes: string },
    { rejectWithValue }
  ) => {
    try {
      const favorite = await favoriteAPI.updateFavorite(motorcycleId, notes)
      return favorite
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update favorite notes')
    }
  }
)

// 批量添加收藏
export const addMultipleFavorites = createAsyncThunk(
  'favorites/addMultiple',
  async (motorcycleIds: string[], { rejectWithValue, dispatch }) => {
    try {
      const promises = motorcycleIds.map(id => favoriteAPI.addFavorite(id))
      const favorites = await Promise.all(promises)
      
      // 更新用户状态
      motorcycleIds.forEach(id => {
        dispatch({ type: 'auth/addFavoriteToUser', payload: id })
      })
      
      return favorites
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add multiple favorites')
    }
  }
)

// 批量移除收藏
export const removeMultipleFavorites = createAsyncThunk(
  'favorites/removeMultiple',
  async (motorcycleIds: string[], { rejectWithValue, dispatch }) => {
    try {
      const promises = motorcycleIds.map(id => favoriteAPI.removeFavorite(id))
      await Promise.all(promises)
      
      // 更新用户状态
      motorcycleIds.forEach(id => {
        dispatch({ type: 'auth/removeFavoriteFromUser', payload: id })
      })
      
      return motorcycleIds
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove multiple favorites')
    }
  }
)

// 初始状态
const initialState: FavoriteState = {
  favorites: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  lastSyncTime: 0,
}

// 创建favorite slice
const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null
    },
    
    // 本地添加收藏（乐观更新）
    addFavoriteOptimistic: (state, action: PayloadAction<Favorite>) => {
      const exists = state.favorites.some(fav => fav.motorcycleId === action.payload.motorcycleId)
      if (!exists) {
        state.favorites.unshift(action.payload)
      }
    },
    
    // 本地移除收藏（乐观更新）
    removeFavoriteOptimistic: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(fav => fav.motorcycleId !== action.payload)
    },
    
    // 更新收藏备注（本地）
    updateFavoriteNotesLocal: (state, action: PayloadAction<{ motorcycleId: string; notes: string }>) => {
      const favorite = state.favorites.find(fav => fav.motorcycleId === action.payload.motorcycleId)
      if (favorite) {
        favorite.notes = action.payload.notes
      }
    },
    
    // 设置收藏列表
    setFavorites: (state, action: PayloadAction<Favorite[]>) => {
      state.favorites = action.payload
      state.lastSyncTime = Date.now()
    },
    
    // 重置收藏状态
    resetFavorites: (state) => {
      state.favorites = []
      state.isLoading = false
      state.isSubmitting = false
      state.error = null
      state.lastSyncTime = 0
    },
    
    // 按条件筛选收藏
    filterFavorites: (state, action: PayloadAction<{ query?: string; category?: string; brand?: string }>) => {
      // 这个reducer不会直接修改state，而是会被selector使用
      // 实际的筛选逻辑在selector中实现
    },
    
    // 按日期排序收藏
    sortFavoritesByDate: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.favorites.sort((a, b) => {
        const dateA = new Date(a.addedAt).getTime()
        const dateB = new Date(b.addedAt).getTime()
        return action.payload === 'asc' ? dateA - dateB : dateB - dateA
      })
    },
    
    // 按摩托车名称排序收藏
    sortFavoritesByName: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.favorites.sort((a, b) => {
        if (!a.motorcycle || !b.motorcycle) return 0
        const nameA = `${a.motorcycle.brand} ${a.motorcycle.model}`.toLowerCase()
        const nameB = `${b.motorcycle.brand} ${b.motorcycle.model}`.toLowerCase()
        return action.payload === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA)
      })
    },
    
    // 同步收藏状态到服务器
    syncFavoritesToServer: (state) => {
      // 这个action会触发后台同步
      state.lastSyncTime = Date.now()
    },
  },
  extraReducers: (builder) => {
    // 获取收藏列表
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false
        state.favorites = action.payload
        state.lastSyncTime = Date.now()
        state.error = null
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // 添加收藏
    builder
      .addCase(addToFavorites.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.isSubmitting = false
        
        // 检查是否已存在
        const exists = state.favorites.some(fav => fav.motorcycleId === action.payload.motorcycleId)
        if (!exists) {
          state.favorites.unshift(action.payload)
        }
        
        state.error = null
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
    
    // 移除收藏
    builder
      .addCase(removeFromFavorites.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.favorites = state.favorites.filter(fav => fav.motorcycleId !== action.payload)
        state.error = null
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
    
    // 检查收藏状态
    builder
      .addCase(checkIsFavorite.fulfilled, (state, action) => {
        // 这个action主要用于UI更新，不直接修改favorites数组
      })
    
    // 更新收藏备注
    builder
      .addCase(updateFavoriteNotes.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateFavoriteNotes.fulfilled, (state, action) => {
        state.isSubmitting = false
        
        const index = state.favorites.findIndex(fav => fav.motorcycleId === action.payload.motorcycleId)
        if (index !== -1) {
          state.favorites[index] = action.payload
        }
        
        state.error = null
      })
      .addCase(updateFavoriteNotes.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
    
    // 批量添加收藏
    builder
      .addCase(addMultipleFavorites.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(addMultipleFavorites.fulfilled, (state, action) => {
        state.isSubmitting = false
        
        // 添加不存在的收藏
        action.payload.forEach(favorite => {
          const exists = state.favorites.some(fav => fav.motorcycleId === favorite.motorcycleId)
          if (!exists) {
            state.favorites.unshift(favorite)
          }
        })
        
        state.error = null
      })
      .addCase(addMultipleFavorites.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
    
    // 批量移除收藏
    builder
      .addCase(removeMultipleFavorites.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(removeMultipleFavorites.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.favorites = state.favorites.filter(
          fav => !action.payload.includes(fav.motorcycleId)
        )
        state.error = null
      })
      .addCase(removeMultipleFavorites.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
  },
})

// 导出actions
export const {
  clearError,
  addFavoriteOptimistic,
  removeFavoriteOptimistic,
  updateFavoriteNotesLocal,
  setFavorites,
  resetFavorites,
  filterFavorites,
  sortFavoritesByDate,
  sortFavoritesByName,
  syncFavoritesToServer,
} = favoriteSlice.actions

// 选择器
export const selectFavorites = (state: { favorites: FavoriteState }) => state.favorites.favorites
export const selectFavoriteLoading = (state: { favorites: FavoriteState }) => state.favorites.isLoading
export const selectFavoriteSubmitting = (state: { favorites: FavoriteState }) => state.favorites.isSubmitting
export const selectFavoriteError = (state: { favorites: FavoriteState }) => state.favorites.error
export const selectFavoriteCount = (state: { favorites: FavoriteState }) => state.favorites.favorites.length

// 检查是否已收藏
export const selectIsFavorite = (motorcycleId: string) => (state: { favorites: FavoriteState }) =>
  state.favorites.favorites.some(fav => fav.motorcycleId === motorcycleId)

// 获取收藏的摩托车ID列表
export const selectFavoriteMotorcycleIds = (state: { favorites: FavoriteState }) =>
  state.favorites.favorites.map(fav => fav.motorcycleId)

// 按品牌分组的收藏
export const selectFavoritesByBrand = (state: { favorites: FavoriteState }) => {
  const groupedFavorites: { [brand: string]: Favorite[] } = {}
  
  state.favorites.favorites.forEach(favorite => {
    if (favorite.motorcycle) {
      const brand = favorite.motorcycle.brand
      if (!groupedFavorites[brand]) {
        groupedFavorites[brand] = []
      }
      groupedFavorites[brand].push(favorite)
    }
  })
  
  return groupedFavorites
}

// 按类别分组的收藏
export const selectFavoritesByCategory = (state: { favorites: FavoriteState }) => {
  const groupedFavorites: { [category: string]: Favorite[] } = {}
  
  state.favorites.favorites.forEach(favorite => {
    if (favorite.motorcycle) {
      const category = favorite.motorcycle.category
      if (!groupedFavorites[category]) {
        groupedFavorites[category] = []
      }
      groupedFavorites[category].push(favorite)
    }
  })
  
  return groupedFavorites
}

// 筛选后的收藏列表
export const selectFilteredFavorites = (
  query?: string,
  category?: string,
  brand?: string
) => (state: { favorites: FavoriteState }) => {
  let filtered = state.favorites.favorites
  
  if (query) {
    const lowerQuery = query.toLowerCase()
    filtered = filtered.filter(favorite => {
      if (!favorite.motorcycle) return false
      
      const fullName = `${favorite.motorcycle.brand} ${favorite.motorcycle.model} ${favorite.motorcycle.year}`.toLowerCase()
      const notes = favorite.notes?.toLowerCase() || ''
      
      return fullName.includes(lowerQuery) || notes.includes(lowerQuery)
    })
  }
  
  if (category) {
    filtered = filtered.filter(favorite => 
      favorite.motorcycle?.category === category
    )
  }
  
  if (brand) {
    filtered = filtered.filter(favorite => 
      favorite.motorcycle?.brand === brand
    )
  }
  
  return filtered
}

// 最近添加的收藏
export const selectRecentFavorites = (limit = 5) => (state: { favorites: FavoriteState }) =>
  state.favorites.favorites
    .slice()
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, limit)

export default favoriteSlice.reducer