import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../../types'
import { authAPI } from '../../services/api'

// 异步登录action
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      
      // 保存token到本地存储
      await AsyncStorage.setItem('auth_token', response.token)
      await AsyncStorage.setItem('refresh_token', response.refreshToken)
      await AsyncStorage.setItem('user', JSON.stringify(response.user))
      
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

// 异步注册action
export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(credentials)
      
      // 保存token到本地存储
      await AsyncStorage.setItem('auth_token', response.token)
      await AsyncStorage.setItem('refresh_token', response.refreshToken)
      await AsyncStorage.setItem('user', JSON.stringify(response.user))
      
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

// 异步登出action
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout()
      
      // 清除本地存储
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user'])
      
      return null
    } catch (error: any) {
      // 即使API调用失败，也要清除本地存储
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user'])
      return null
    }
  }
)

// 获取用户资料
export const getUserProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authAPI.getProfile()
      
      // 更新本地存储
      await AsyncStorage.setItem('user', JSON.stringify(user))
      
      return user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get profile')
    }
  }
)

// 更新用户资料
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const user = await authAPI.updateProfile(userData)
      
      // 更新本地存储
      await AsyncStorage.setItem('user', JSON.stringify(user))
      
      return user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile')
    }
  }
)

// 上传头像
export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (imageUri: string, { rejectWithValue, getState, dispatch }) => {
    try {
      const avatarUrl = await authAPI.uploadAvatar(imageUri)
      
      // 更新用户资料
      const state = getState() as { auth: AuthState }
      if (state.auth.user) {
        const updatedUser = { ...state.auth.user, avatar: avatarUrl }
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser))
        return updatedUser
      }
      
      return avatarUrl
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar')
    }
  }
)

// 从本地存储恢复认证状态
export const restoreAuthState = createAsyncThunk(
  'auth/restore',
  async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token')
      const userStr = await AsyncStorage.getItem('user')
      
      if (token && userStr) {
        const user = JSON.parse(userStr)
        return { user, token }
      }
      
      return null
    } catch (error) {
      return null
    }
  }
)

// 忘记密码
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await authAPI.forgotPassword(email)
      return email
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset email')
    }
  }
)

// 更改密码
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      await authAPI.changePassword(oldPassword, newPassword)
      return true
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password')
    }
  }
)

// 初始状态
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// 创建auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null
    },
    
    // 清除认证状态
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
    },
    
    // 设置用户信息（用于实时更新）
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    
    // 更新用户偏好设置
    updateUserPreferences: (state, action: PayloadAction<Partial<User['preferences']>>) => {
      if (state.user) {
        state.user.preferences = {
          ...state.user.preferences,
          ...action.payload,
        } as User['preferences']
      }
    },
    
    // 添加收藏到用户信息
    addFavoriteToUser: (state, action: PayloadAction<string>) => {
      if (state.user && !state.user.favorites.includes(action.payload)) {
        state.user.favorites.push(action.payload)
      }
    },
    
    // 从用户信息中移除收藏
    removeFavoriteFromUser: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.favorites = state.user.favorites.filter(id => id !== action.payload)
      }
    },
    
    // 添加评价到用户信息
    addReviewToUser: (state, action: PayloadAction<string>) => {
      if (state.user && !state.user.reviews.includes(action.payload)) {
        state.user.reviews.push(action.payload)
      }
    },
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
    
    // 注册
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
    
    // 登出
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })
    
    // 获取用户资料
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // 更新用户资料
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // 上传头像
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false
        if (typeof action.payload === 'string') {
          // 如果返回的是URL字符串
          if (state.user) {
            state.user.avatar = action.payload
          }
        } else {
          // 如果返回的是完整用户对象
          state.user = action.payload
        }
        state.error = null
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // 恢复认证状态
    builder
      .addCase(restoreAuthState.pending, (state) => {
        state.isLoading = true
      })
      .addCase(restoreAuthState.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.user = action.payload.user
          state.token = action.payload.token
          state.isAuthenticated = true
        }
      })
      .addCase(restoreAuthState.rejected, (state) => {
        state.isLoading = false
      })
    
    // 忘记密码
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // 更改密码
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

// 导出actions
export const {
  clearError,
  clearAuth,
  setUser,
  updateUserPreferences,
  addFavoriteToUser,
  removeFavoriteFromUser,
  addReviewToUser,
} = authSlice.actions

// 选择器
export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error

export default authSlice.reducer