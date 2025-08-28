import axios, { AxiosResponse, AxiosError } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { API_BASE_URL, NETWORK_CONFIG } from '../utils/constants'
import { 
  Motorcycle, 
  MotorcycleListResponse, 
  MotorcycleFilters,
  User,
  LoginCredentials,
  RegisterCredentials,
  Review,
  Favorite,
  ApiResponse,
  PaginationParams
} from '../types'

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: NETWORK_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 处理错误和token刷新
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // 处理401错误（token过期）
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          })
          
          const { token } = response.data
          await AsyncStorage.setItem('auth_token', token)
          
          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // 刷新失败，清除本地存储并跳转到登录页
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user'])
        // TODO: 导航到登录页面
      }
    }

    return Promise.reject(error)
  }
)

// 网络连接检查
const checkNetworkConnection = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch()
  return netInfo.isConnected ?? false
}

// 带重试的请求函数
const requestWithRetry = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  retries = NETWORK_CONFIG.retryAttempts
): Promise<AxiosResponse<T>> => {
  try {
    return await requestFn()
  } catch (error) {
    if (retries > 0 && axios.isAxiosError(error)) {
      // 只在网络错误时重试
      if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
        await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay))
        return requestWithRetry(requestFn, retries - 1)
      }
    }
    throw error
  }
}

// 摩托车相关API
export const motorcycleAPI = {
  // 获取摩托车列表
  getMotorcycles: async (
    filters?: MotorcycleFilters,
    pagination?: PaginationParams
  ): Promise<MotorcycleListResponse> => {
    const params = new URLSearchParams()
    
    // 添加筛选参数
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
          } else {
            params.append(key, value.toString())
          }
        }
      })
    }
    
    // 添加分页参数
    if (pagination) {
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await requestWithRetry(() =>
      api.get<MotorcycleListResponse>(`/motorcycles?${params.toString()}`)
    )
    return response.data
  },

  // 获取单个摩托车详情
  getMotorcycle: async (id: string): Promise<Motorcycle> => {
    const response = await requestWithRetry(() =>
      api.get<ApiResponse<Motorcycle>>(`/motorcycles/${id}`)
    )
    return response.data.data!
  },

  // 搜索摩托车
  searchMotorcycles: async (
    query: string,
    filters?: MotorcycleFilters
  ): Promise<MotorcycleListResponse> => {
    const params = new URLSearchParams({ search: query })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
          } else {
            params.append(key, value.toString())
          }
        }
      })
    }

    const response = await requestWithRetry(() =>
      api.get<MotorcycleListResponse>(`/motorcycles/search?${params.toString()}`)
    )
    return response.data
  },

  // 获取推荐摩托车
  getRecommendations: async (id?: string): Promise<Motorcycle[]> => {
    const endpoint = id ? `/motorcycles/${id}/recommendations` : '/motorcycles/recommendations'
    const response = await requestWithRetry(() =>
      api.get<ApiResponse<Motorcycle[]>>(endpoint)
    )
    return response.data.data!
  },

  // 获取热门摩托车
  getTrending: async (): Promise<Motorcycle[]> => {
    const response = await requestWithRetry(() =>
      api.get<ApiResponse<Motorcycle[]>>('/motorcycles/trending')
    )
    return response.data.data!
  },

  // 获取最新摩托车
  getLatest: async (): Promise<Motorcycle[]> => {
    const response = await requestWithRetry(() =>
      api.get<ApiResponse<Motorcycle[]>>('/motorcycles/latest')
    )
    return response.data.data!
  },
}

// 用户认证API
export const authAPI = {
  // 登录
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string; refreshToken: string }> => {
    const response = await api.post<ApiResponse<{ user: User; token: string; refreshToken: string }>>(
      '/auth/login',
      credentials
    )
    return response.data.data!
  },

  // 注册
  register: async (credentials: RegisterCredentials): Promise<{ user: User; token: string; refreshToken: string }> => {
    const response = await api.post<ApiResponse<{ user: User; token: string; refreshToken: string }>>(
      '/auth/register',
      credentials
    )
    return response.data.data!
  },

  // 登出
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  // 刷新token
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await api.post<ApiResponse<{ token: string }>>(
      '/auth/refresh',
      { refreshToken }
    )
    return response.data.data!
  },

  // 忘记密码
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email })
  },

  // 重置密码
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword })
  },

  // 获取用户信息
  getProfile: async (): Promise<User> => {
    const response = await requestWithRetry(() =>
      api.get<ApiResponse<User>>('/auth/profile')
    )
    return response.data.data!
  },

  // 更新用户信息
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data)
    return response.data.data!
  },

  // 更改密码
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { oldPassword, newPassword })
  },

  // 上传头像
  uploadAvatar: async (imageUri: string): Promise<string> => {
    const formData = new FormData()
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any)

    const response = await api.post<ApiResponse<{ url: string }>>(
      '/auth/upload-avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data!.url
  },
}

// 收藏API
export const favoriteAPI = {
  // 获取收藏列表
  getFavorites: async (): Promise<Favorite[]> => {
    const response = await requestWithRetry(() =>
      api.get<ApiResponse<Favorite[]>>('/favorites')
    )
    return response.data.data!
  },

  // 添加收藏
  addFavorite: async (motorcycleId: string, notes?: string): Promise<Favorite> => {
    const response = await api.post<ApiResponse<Favorite>>('/favorites', {
      motorcycleId,
      notes,
    })
    return response.data.data!
  },

  // 移除收藏
  removeFavorite: async (motorcycleId: string): Promise<void> => {
    await api.delete(`/favorites/${motorcycleId}`)
  },

  // 检查是否已收藏
  isFavorite: async (motorcycleId: string): Promise<boolean> => {
    try {
      const response = await requestWithRetry(() =>
        api.get<ApiResponse<{ isFavorite: boolean }>>(`/favorites/check/${motorcycleId}`)
      )
      return response.data.data!.isFavorite
    } catch (error) {
      return false
    }
  },

  // 更新收藏备注
  updateFavorite: async (motorcycleId: string, notes: string): Promise<Favorite> => {
    const response = await api.put<ApiResponse<Favorite>>(`/favorites/${motorcycleId}`, {
      notes,
    })
    return response.data.data!
  },
}

// 评价API
export const reviewAPI = {
  // 获取摩托车评价
  getReviews: async (motorcycleId: string, page = 1, limit = 20): Promise<{ reviews: Review[]; total: number }> => {
    const response = await requestWithRetry(() =>
      api.get<ApiResponse<{ reviews: Review[]; total: number }>>(
        `/motorcycles/${motorcycleId}/reviews?page=${page}&limit=${limit}`
      )
    )
    return response.data.data!
  },

  // 提交评价
  submitReview: async (reviewData: Omit<Review, '_id' | 'user' | 'helpful' | 'createdAt' | 'updatedAt'>): Promise<Review> => {
    const response = await api.post<ApiResponse<Review>>(
      `/motorcycles/${reviewData.motorcycleId}/reviews`,
      reviewData
    )
    return response.data.data!
  },

  // 更新评价
  updateReview: async (reviewId: string, reviewData: Partial<Review>): Promise<Review> => {
    const response = await api.put<ApiResponse<Review>>(`/reviews/${reviewId}`, reviewData)
    return response.data.data!
  },

  // 删除评价
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`)
  },

  // 标记评价为有用
  markHelpful: async (reviewId: string): Promise<void> => {
    await api.post(`/reviews/${reviewId}/helpful`)
  },

  // 取消标记有用
  unmarkHelpful: async (reviewId: string): Promise<void> => {
    await api.delete(`/reviews/${reviewId}/helpful`)
  },

  // 获取用户的评价
  getUserReviews: async (): Promise<Review[]> => {
    const response = await requestWithRetry(() =>
      api.get<ApiResponse<Review[]>>('/reviews/my-reviews')
    )
    return response.data.data!
  },
}

// 图片上传API
export const uploadAPI = {
  // 上传单张图片
  uploadImage: async (imageUri: string, folder = 'user-uploads'): Promise<string> => {
    const formData = new FormData()
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `upload_${Date.now()}.jpg`,
    } as any)
    formData.append('folder', folder)

    const response = await api.post<ApiResponse<{ url: string }>>(
      '/upload/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data!.url
  },

  // 上传多张图片
  uploadImages: async (imageUris: string[], folder = 'user-uploads'): Promise<string[]> => {
    const formData = new FormData()
    
    imageUris.forEach((uri, index) => {
      formData.append('images', {
        uri,
        type: 'image/jpeg',
        name: `upload_${Date.now()}_${index}.jpg`,
      } as any)
    })
    formData.append('folder', folder)

    const response = await api.post<ApiResponse<{ urls: string[] }>>(
      '/upload/images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data!.urls
  },
}

// 统计API
export const statsAPI = {
  // 获取基本统计信息
  getStats: async (): Promise<{
    totalMotorcycles: number
    totalBrands: number
    totalCategories: number
    totalUsers: number
    totalReviews: number
  }> => {
    const response = await requestWithRetry(() =>
      api.get<ApiResponse<{
        totalMotorcycles: number
        totalBrands: number
        totalCategories: number
        totalUsers: number
        totalReviews: number
      }>>('/stats')
    )
    return response.data.data!
  },

  // 获取品牌统计
  getBrandStats: async (): Promise<{ brand: string; count: number }[]> => {
    const response = await requestWithRetry(() =>
      api.get<ApiResponse<{ brand: string; count: number }[]>>('/stats/brands')
    )
    return response.data.data!
  },

  // 获取类别统计
  getCategoryStats: async (): Promise<{ category: string; count: number }[]> => {
    const response = await requestWithRetry(() =>
      api.get<ApiResponse<{ category: string; count: number }[]>>('/stats/categories')
    )
    return response.data.data!
  },
}

// 通用错误处理
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // 服务器响应错误
      const message = error.response.data?.message || error.response.data?.error
      return message || `Server error: ${error.response.status}`
    } else if (error.request) {
      // 网络连接错误
      return 'Network connection error. Please check your internet connection.'
    }
  }
  
  // 其他错误
  return error instanceof Error ? error.message : 'An unexpected error occurred'
}

// 检查网络状态
export const getNetworkStatus = async (): Promise<{
  isConnected: boolean
  type: string
  isInternetReachable: boolean | null
}> => {
  const netInfo = await NetInfo.fetch()
  return {
    isConnected: netInfo.isConnected ?? false,
    type: netInfo.type,
    isInternetReachable: netInfo.isInternetReachable,
  }
}

export default api