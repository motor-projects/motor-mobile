import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SearchHistory, MotorcycleFilters } from '../../types'

interface SearchState {
  query: string
  filters: MotorcycleFilters
  history: SearchHistory[]
  suggestions: string[]
  recentSearches: string[]
  popularSearches: string[]
  isVoiceSearchActive: boolean
  voiceSearchResult: string
}

// 初始状态
const initialState: SearchState = {
  query: '',
  filters: {},
  history: [],
  suggestions: [],
  recentSearches: [],
  popularSearches: [
    'Yamaha R1',
    'Honda CBR1000RR',
    'Kawasaki Ninja',
    'Ducati Panigale',
    'BMW S1000RR',
    'Suzuki GSX-R',
    'KTM Duke',
    'Harley Davidson',
  ],
  isVoiceSearchActive: false,
  voiceSearchResult: '',
}

// 创建search slice
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // 设置搜索查询
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
    
    // 清除搜索查询
    clearQuery: (state) => {
      state.query = ''
    },
    
    // 设置搜索筛选
    setSearchFilters: (state, action: PayloadAction<MotorcycleFilters>) => {
      state.filters = action.payload
    },
    
    // 更新搜索筛选
    updateSearchFilters: (state, action: PayloadAction<Partial<MotorcycleFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    // 清除搜索筛选
    clearSearchFilters: (state) => {
      state.filters = {}
    },
    
    // 添加搜索历史
    addSearchHistory: (state, action: PayloadAction<Omit<SearchHistory, 'id' | 'timestamp'>>) => {
      const { query, filters, resultCount } = action.payload
      
      // 如果查询为空，不添加到历史
      if (!query.trim()) return
      
      // 检查是否已存在相同的搜索
      const existingIndex = state.history.findIndex(
        item => item.query.toLowerCase() === query.toLowerCase() &&
                JSON.stringify(item.filters) === JSON.stringify(filters)
      )
      
      const historyItem: SearchHistory = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        query: query.trim(),
        filters: filters || {},
        resultCount,
        timestamp: new Date().toISOString(),
      }
      
      if (existingIndex !== -1) {
        // 更新现有记录的时间戳和结果数量
        state.history[existingIndex] = historyItem
        // 移动到最前面
        state.history.unshift(state.history.splice(existingIndex, 1)[0])
      } else {
        // 添加新记录到最前面
        state.history.unshift(historyItem)
      }
      
      // 限制历史记录数量
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50)
      }
      
      // 更新最近搜索
      if (!state.recentSearches.includes(query)) {
        state.recentSearches.unshift(query)
        if (state.recentSearches.length > 10) {
          state.recentSearches = state.recentSearches.slice(0, 10)
        }
      } else {
        // 移动到最前面
        const index = state.recentSearches.indexOf(query)
        state.recentSearches.unshift(state.recentSearches.splice(index, 1)[0])
      }
    },
    
    // 删除搜索历史项
    removeSearchHistory: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter(item => item.id !== action.payload)
    },
    
    // 清除所有搜索历史
    clearSearchHistory: (state) => {
      state.history = []
      state.recentSearches = []
    },
    
    // 设置搜索建议
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload
    },
    
    // 清除搜索建议
    clearSuggestions: (state) => {
      state.suggestions = []
    },
    
    // 添加到最近搜索
    addToRecentSearches: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim()
      if (!query) return
      
      // 移除重复项
      state.recentSearches = state.recentSearches.filter(item => item !== query)
      
      // 添加到最前面
      state.recentSearches.unshift(query)
      
      // 限制数量
      if (state.recentSearches.length > 10) {
        state.recentSearches = state.recentSearches.slice(0, 10)
      }
    },
    
    // 从最近搜索中移除
    removeFromRecentSearches: (state, action: PayloadAction<string>) => {
      state.recentSearches = state.recentSearches.filter(item => item !== action.payload)
    },
    
    // 设置热门搜索
    setPopularSearches: (state, action: PayloadAction<string[]>) => {
      state.popularSearches = action.payload
    },
    
    // 开始语音搜索
    startVoiceSearch: (state) => {
      state.isVoiceSearchActive = true
      state.voiceSearchResult = ''
    },
    
    // 结束语音搜索
    endVoiceSearch: (state) => {
      state.isVoiceSearchActive = false
    },
    
    // 设置语音搜索结果
    setVoiceSearchResult: (state, action: PayloadAction<string>) => {
      state.voiceSearchResult = action.payload
      state.query = action.payload
    },
    
    // 应用语音搜索结果
    applyVoiceSearchResult: (state) => {
      if (state.voiceSearchResult) {
        state.query = state.voiceSearchResult
        state.isVoiceSearchActive = false
      }
    },
    
    // 从历史记录恢复搜索
    restoreSearchFromHistory: (state, action: PayloadAction<string>) => {
      const historyItem = state.history.find(item => item.id === action.payload)
      if (historyItem) {
        state.query = historyItem.query
        state.filters = historyItem.filters || {}
      }
    },
    
    // 重置搜索状态
    resetSearchState: (state) => {
      state.query = ''
      state.filters = {}
      state.suggestions = []
      state.isVoiceSearchActive = false
      state.voiceSearchResult = ''
    },
    
    // 生成搜索建议
    generateSuggestions: (state, action: PayloadAction<string>) => {
      const query = action.payload.toLowerCase().trim()
      
      if (!query) {
        state.suggestions = []
        return
      }
      
      const suggestions = new Set<string>()
      
      // 从历史搜索中匹配
      state.history.forEach(item => {
        if (item.query.toLowerCase().includes(query)) {
          suggestions.add(item.query)
        }
      })
      
      // 从最近搜索中匹配
      state.recentSearches.forEach(item => {
        if (item.toLowerCase().includes(query)) {
          suggestions.add(item)
        }
      })
      
      // 从热门搜索中匹配
      state.popularSearches.forEach(item => {
        if (item.toLowerCase().includes(query)) {
          suggestions.add(item)
        }
      })
      
      // 品牌建议
      const brands = ['Yamaha', 'Honda', 'Kawasaki', 'Suzuki', 'Ducati', 'BMW', 'KTM', 'Harley-Davidson', 'Triumph', 'Aprilia']
      brands.forEach(brand => {
        if (brand.toLowerCase().includes(query)) {
          suggestions.add(brand)
        }
      })
      
      // 类别建议
      const categories = ['Sport', 'Cruiser', 'Touring', 'Standard', 'Adventure', 'Dual-Sport', 'Dirt Bike', 'Electric', 'Scooter']
      categories.forEach(category => {
        if (category.toLowerCase().includes(query)) {
          suggestions.add(category)
        }
      })
      
      // 转换为数组并限制数量
      state.suggestions = Array.from(suggestions).slice(0, 8)
    },
    
    // 批量加载搜索历史（用于应用启动时从存储恢复）
    loadSearchHistory: (state, action: PayloadAction<SearchHistory[]>) => {
      state.history = action.payload
      
      // 重新生成最近搜索
      const recentQueries = action.payload
        .slice(0, 10)
        .map(item => item.query)
        .filter((query, index, array) => array.indexOf(query) === index)
      
      state.recentSearches = recentQueries
    },
  },
})

// 异步操作：保存搜索历史到本地存储
export const saveSearchHistoryToStorage = (history: SearchHistory[]) => async () => {
  try {
    await AsyncStorage.setItem('search_history', JSON.stringify(history))
  } catch (error) {
    console.warn('Failed to save search history:', error)
  }
}

// 异步操作：从本地存储加载搜索历史
export const loadSearchHistoryFromStorage = () => async (dispatch: any) => {
  try {
    const historyStr = await AsyncStorage.getItem('search_history')
    if (historyStr) {
      const history: SearchHistory[] = JSON.parse(historyStr)
      dispatch(loadSearchHistory(history))
    }
  } catch (error) {
    console.warn('Failed to load search history:', error)
  }
}

// 导出actions
export const {
  setQuery,
  clearQuery,
  setSearchFilters,
  updateSearchFilters,
  clearSearchFilters,
  addSearchHistory,
  removeSearchHistory,
  clearSearchHistory,
  setSuggestions,
  clearSuggestions,
  addToRecentSearches,
  removeFromRecentSearches,
  setPopularSearches,
  startVoiceSearch,
  endVoiceSearch,
  setVoiceSearchResult,
  applyVoiceSearchResult,
  restoreSearchFromHistory,
  resetSearchState,
  generateSuggestions,
  loadSearchHistory,
} = searchSlice.actions

// 选择器
export const selectSearchQuery = (state: { search: SearchState }) => state.search.query
export const selectSearchFilters = (state: { search: SearchState }) => state.search.filters
export const selectSearchHistory = (state: { search: SearchState }) => state.search.history
export const selectSuggestions = (state: { search: SearchState }) => state.search.suggestions
export const selectRecentSearches = (state: { search: SearchState }) => state.search.recentSearches
export const selectPopularSearches = (state: { search: SearchState }) => state.search.popularSearches
export const selectIsVoiceSearchActive = (state: { search: SearchState }) => state.search.isVoiceSearchActive
export const selectVoiceSearchResult = (state: { search: SearchState }) => state.search.voiceSearchResult

// 组合选择器
export const selectSearchState = (state: { search: SearchState }) => state.search
export const selectActiveSearch = (state: { search: SearchState }) => ({
  query: state.search.query,
  filters: state.search.filters,
})
export const selectSearchSuggestionsList = (state: { search: SearchState }) => {
  const { suggestions, recentSearches, popularSearches } = state.search
  
  return {
    suggestions,
    recent: recentSearches.slice(0, 5),
    popular: popularSearches.slice(0, 5),
  }
}

export default searchSlice.reducer