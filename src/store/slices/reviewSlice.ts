import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Review } from '../../types'
import { reviewAPI } from '../../services/api'

interface ReviewState {
  reviews: Review[]
  userReviews: Review[]
  currentMotorcycleReviews: Review[]
  totalReviews: number
  currentPage: number
  hasMore: boolean
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  selectedReview: Review | null
  reviewStats: {
    averageRating: number
    totalCount: number
    ratingDistribution: {
      1: number
      2: number
      3: number
      4: number
      5: number
    }
  }
}

// 获取摩托车评价
export const fetchMotorcycleReviews = createAsyncThunk(
  'reviews/fetchMotorcycleReviews',
  async (
    { motorcycleId, page = 1, limit = 20 }: { motorcycleId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await reviewAPI.getReviews(motorcycleId, page, limit)
      return { ...response, motorcycleId, page }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews')
    }
  }
)

// 提交评价
export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async (
    reviewData: Omit<Review, '_id' | 'user' | 'helpful' | 'createdAt' | 'updatedAt'>,
    { rejectWithValue, dispatch }
  ) => {
    try {
      const review = await reviewAPI.submitReview(reviewData)
      
      // 添加评价到用户状态
      dispatch({ type: 'auth/addReviewToUser', payload: review._id })
      
      return review
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review')
    }
  }
)

// 更新评价
export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async (
    { reviewId, reviewData }: { reviewId: string; reviewData: Partial<Review> },
    { rejectWithValue }
  ) => {
    try {
      const review = await reviewAPI.updateReview(reviewId, reviewData)
      return review
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review')
    }
  }
)

// 删除评价
export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      await reviewAPI.deleteReview(reviewId)
      return reviewId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review')
    }
  }
)

// 标记评价有用
export const markReviewHelpful = createAsyncThunk(
  'reviews/markHelpful',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      await reviewAPI.markHelpful(reviewId)
      return reviewId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark review as helpful')
    }
  }
)

// 取消标记评价有用
export const unmarkReviewHelpful = createAsyncThunk(
  'reviews/unmarkHelpful',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      await reviewAPI.unmarkHelpful(reviewId)
      return reviewId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unmark review as helpful')
    }
  }
)

// 获取用户的评价
export const fetchUserReviews = createAsyncThunk(
  'reviews/fetchUserReviews',
  async (_, { rejectWithValue }) => {
    try {
      const reviews = await reviewAPI.getUserReviews()
      return reviews
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user reviews')
    }
  }
)

// 加载更多评价
export const loadMoreReviews = createAsyncThunk(
  'reviews/loadMore',
  async (
    { motorcycleId, page }: { motorcycleId: string; page: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await reviewAPI.getReviews(motorcycleId, page, 20)
      return { ...response, page }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load more reviews')
    }
  }
)

// 初始状态
const initialState: ReviewState = {
  reviews: [],
  userReviews: [],
  currentMotorcycleReviews: [],
  totalReviews: 0,
  currentPage: 1,
  hasMore: false,
  isLoading: false,
  isSubmitting: false,
  error: null,
  selectedReview: null,
  reviewStats: {
    averageRating: 0,
    totalCount: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  },
}

// 计算评价统计
const calculateReviewStats = (reviews: Review[]) => {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalCount: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating.overall, 0)
  const averageRating = totalRating / reviews.length

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach(review => {
    const rating = Math.round(review.rating.overall) as keyof typeof ratingDistribution
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating]++
    }
  })

  return {
    averageRating,
    totalCount: reviews.length,
    ratingDistribution,
  }
}

// 创建review slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null
    },
    
    // 设置选中的评价
    setSelectedReview: (state, action: PayloadAction<Review | null>) => {
      state.selectedReview = action.payload
    },
    
    // 清除当前摩托车的评价
    clearCurrentMotorcycleReviews: (state) => {
      state.currentMotorcycleReviews = []
      state.currentPage = 1
      state.hasMore = false
      state.reviewStats = {
        averageRating: 0,
        totalCount: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    },
    
    // 本地更新评价有用数
    updateReviewHelpfulLocal: (state, action: PayloadAction<{ reviewId: string; increment: boolean; userId: string }>) => {
      const { reviewId, increment, userId } = action.payload
      
      // 更新当前摩托车评价
      const currentReview = state.currentMotorcycleReviews.find(review => review._id === reviewId)
      if (currentReview) {
        if (increment) {
          currentReview.helpful.count++
          if (!currentReview.helpful.users.includes(userId)) {
            currentReview.helpful.users.push(userId)
          }
        } else {
          currentReview.helpful.count = Math.max(0, currentReview.helpful.count - 1)
          currentReview.helpful.users = currentReview.helpful.users.filter(id => id !== userId)
        }
      }
      
      // 更新全部评价
      const allReview = state.reviews.find(review => review._id === reviewId)
      if (allReview) {
        if (increment) {
          allReview.helpful.count++
          if (!allReview.helpful.users.includes(userId)) {
            allReview.helpful.users.push(userId)
          }
        } else {
          allReview.helpful.count = Math.max(0, allReview.helpful.count - 1)
          allReview.helpful.users = allReview.helpful.users.filter(id => id !== userId)
        }
      }
    },
    
    // 本地添加评价（乐观更新）
    addReviewLocal: (state, action: PayloadAction<Review>) => {
      state.currentMotorcycleReviews.unshift(action.payload)
      state.userReviews.unshift(action.payload)
      state.totalReviews++
      
      // 重新计算统计信息
      state.reviewStats = calculateReviewStats(state.currentMotorcycleReviews)
    },
    
    // 本地更新评价
    updateReviewLocal: (state, action: PayloadAction<Review>) => {
      const updatedReview = action.payload
      
      // 更新当前摩托车评价
      const currentIndex = state.currentMotorcycleReviews.findIndex(review => review._id === updatedReview._id)
      if (currentIndex !== -1) {
        state.currentMotorcycleReviews[currentIndex] = updatedReview
      }
      
      // 更新用户评价
      const userIndex = state.userReviews.findIndex(review => review._id === updatedReview._id)
      if (userIndex !== -1) {
        state.userReviews[userIndex] = updatedReview
      }
      
      // 更新全部评价
      const allIndex = state.reviews.findIndex(review => review._id === updatedReview._id)
      if (allIndex !== -1) {
        state.reviews[allIndex] = updatedReview
      }
      
      // 重新计算统计信息
      state.reviewStats = calculateReviewStats(state.currentMotorcycleReviews)
    },
    
    // 本地删除评价
    deleteReviewLocal: (state, action: PayloadAction<string>) => {
      const reviewId = action.payload
      
      state.currentMotorcycleReviews = state.currentMotorcycleReviews.filter(review => review._id !== reviewId)
      state.userReviews = state.userReviews.filter(review => review._id !== reviewId)
      state.reviews = state.reviews.filter(review => review._id !== reviewId)
      state.totalReviews = Math.max(0, state.totalReviews - 1)
      
      // 重新计算统计信息
      state.reviewStats = calculateReviewStats(state.currentMotorcycleReviews)
    },
    
    // 按评分筛选评价
    filterReviewsByRating: (state, action: PayloadAction<number | null>) => {
      // 这个reducer不会直接修改state，而是会被selector使用
    },
    
    // 按时间排序评价
    sortReviewsByDate: (state, action: PayloadAction<'newest' | 'oldest'>) => {
      const sortFn = (a: Review, b: Review) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return action.payload === 'newest' ? dateB - dateA : dateA - dateB
      }
      
      state.currentMotorcycleReviews.sort(sortFn)
      state.userReviews.sort(sortFn)
      state.reviews.sort(sortFn)
    },
    
    // 按有用数排序评价
    sortReviewsByHelpful: (state, action: PayloadAction<'most' | 'least'>) => {
      const sortFn = (a: Review, b: Review) => {
        return action.payload === 'most' 
          ? b.helpful.count - a.helpful.count
          : a.helpful.count - b.helpful.count
      }
      
      state.currentMotorcycleReviews.sort(sortFn)
      state.userReviews.sort(sortFn)
      state.reviews.sort(sortFn)
    },
    
    // 按评分排序评价
    sortReviewsByRating: (state, action: PayloadAction<'highest' | 'lowest'>) => {
      const sortFn = (a: Review, b: Review) => {
        return action.payload === 'highest'
          ? b.rating.overall - a.rating.overall
          : a.rating.overall - b.rating.overall
      }
      
      state.currentMotorcycleReviews.sort(sortFn)
      state.userReviews.sort(sortFn)
      state.reviews.sort(sortFn)
    },
    
    // 重置评价状态
    resetReviewState: (state) => {
      Object.assign(state, initialState)
    },
  },
  extraReducers: (builder) => {
    // 获取摩托车评价
    builder
      .addCase(fetchMotorcycleReviews.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMotorcycleReviews.fulfilled, (state, action) => {
        state.isLoading = false
        const { reviews, total, page } = action.payload
        
        if (page === 1) {
          state.currentMotorcycleReviews = reviews
        } else {
          state.currentMotorcycleReviews = [...state.currentMotorcycleReviews, ...reviews]
        }
        
        state.totalReviews = total
        state.currentPage = page
        state.hasMore = reviews.length === 20 // 假设每页20条
        
        // 计算统计信息
        state.reviewStats = calculateReviewStats(state.currentMotorcycleReviews)
        
        state.error = null
      })
      .addCase(fetchMotorcycleReviews.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // 提交评价
    builder
      .addCase(submitReview.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.isSubmitting = false
        
        // 添加到当前摩托车评价列表顶部
        state.currentMotorcycleReviews.unshift(action.payload)
        
        // 添加到用户评价列表
        state.userReviews.unshift(action.payload)
        
        // 更新总数
        state.totalReviews++
        
        // 重新计算统计信息
        state.reviewStats = calculateReviewStats(state.currentMotorcycleReviews)
        
        state.error = null
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
    
    // 更新评价
    builder
      .addCase(updateReview.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.isSubmitting = false
        
        const updatedReview = action.payload
        
        // 更新各个列表中的评价
        const updateReviewInArray = (array: Review[]) => {
          const index = array.findIndex(review => review._id === updatedReview._id)
          if (index !== -1) {
            array[index] = updatedReview
          }
        }
        
        updateReviewInArray(state.currentMotorcycleReviews)
        updateReviewInArray(state.userReviews)
        updateReviewInArray(state.reviews)
        
        // 重新计算统计信息
        state.reviewStats = calculateReviewStats(state.currentMotorcycleReviews)
        
        state.error = null
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
    
    // 删除评价
    builder
      .addCase(deleteReview.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isSubmitting = false
        
        const reviewId = action.payload
        
        // 从各个列表中移除评价
        state.currentMotorcycleReviews = state.currentMotorcycleReviews.filter(review => review._id !== reviewId)
        state.userReviews = state.userReviews.filter(review => review._id !== reviewId)
        state.reviews = state.reviews.filter(review => review._id !== reviewId)
        
        // 更新总数
        state.totalReviews = Math.max(0, state.totalReviews - 1)
        
        // 重新计算统计信息
        state.reviewStats = calculateReviewStats(state.currentMotorcycleReviews)
        
        state.error = null
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
    
    // 标记评价有用
    builder
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        // 本地更新已在reducer中处理
      })
      .addCase(markReviewHelpful.rejected, (state, action) => {
        state.error = action.payload as string
      })
    
    // 取消标记评价有用
    builder
      .addCase(unmarkReviewHelpful.fulfilled, (state, action) => {
        // 本地更新已在reducer中处理
      })
      .addCase(unmarkReviewHelpful.rejected, (state, action) => {
        state.error = action.payload as string
      })
    
    // 获取用户评价
    builder
      .addCase(fetchUserReviews.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.isLoading = false
        state.userReviews = action.payload
        state.error = null
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // 加载更多评价
    builder
      .addCase(loadMoreReviews.pending, (state) => {
        // 不显示主加载状态，因为是加载更多
      })
      .addCase(loadMoreReviews.fulfilled, (state, action) => {
        const { reviews, page } = action.payload
        
        state.currentMotorcycleReviews = [...state.currentMotorcycleReviews, ...reviews]
        state.currentPage = page
        state.hasMore = reviews.length === 20
      })
      .addCase(loadMoreReviews.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

// 导出actions
export const {
  clearError,
  setSelectedReview,
  clearCurrentMotorcycleReviews,
  updateReviewHelpfulLocal,
  addReviewLocal,
  updateReviewLocal,
  deleteReviewLocal,
  filterReviewsByRating,
  sortReviewsByDate,
  sortReviewsByHelpful,
  sortReviewsByRating,
  resetReviewState,
} = reviewSlice.actions

// 选择器
export const selectReviews = (state: { reviews: ReviewState }) => state.reviews.currentMotorcycleReviews
export const selectUserReviews = (state: { reviews: ReviewState }) => state.reviews.userReviews
export const selectReviewLoading = (state: { reviews: ReviewState }) => state.reviews.isLoading
export const selectReviewSubmitting = (state: { reviews: ReviewState }) => state.reviews.isSubmitting
export const selectReviewError = (state: { reviews: ReviewState }) => state.reviews.error
export const selectSelectedReview = (state: { reviews: ReviewState }) => state.reviews.selectedReview
export const selectReviewStats = (state: { reviews: ReviewState }) => state.reviews.reviewStats
export const selectHasMoreReviews = (state: { reviews: ReviewState }) => state.reviews.hasMore
export const selectCurrentPage = (state: { reviews: ReviewState }) => state.reviews.currentPage

// 筛选后的评价
export const selectFilteredReviews = (rating?: number) => (state: { reviews: ReviewState }) => {
  if (!rating) return state.reviews.currentMotorcycleReviews
  
  return state.reviews.currentMotorcycleReviews.filter(review => 
    Math.round(review.rating.overall) === rating
  )
}

// 检查用户是否标记了评价为有用
export const selectIsReviewHelpful = (reviewId: string, userId: string) => (state: { reviews: ReviewState }) => {
  const review = state.reviews.currentMotorcycleReviews.find(r => r._id === reviewId)
  return review?.helpful.users.includes(userId) || false
}

// 获取用户对特定摩托车的评价
export const selectUserReviewForMotorcycle = (motorcycleId: string) => (state: { reviews: ReviewState }) =>
  state.reviews.userReviews.find(review => review.motorcycleId === motorcycleId)

export default reviewSlice.reducer