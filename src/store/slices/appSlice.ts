import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import { AppState, Notification } from '../../types'

interface AppSliceState extends AppState {
  notifications: Notification[]
  isFirstLaunch: boolean
  hasLocationPermission: boolean
  hasNotificationPermission: boolean
  deviceId: string | null
  appVersion: string
  lastUpdateCheck: number
}

// 检查网络状态
export const checkNetworkStatus = createAsyncThunk(
  'app/checkNetworkStatus',
  async () => {
    const netInfo = await NetInfo.fetch()
    return !netInfo.isConnected
  }
)

// 请求位置权限
export const requestLocationPermission = createAsyncThunk(
  'app/requestLocationPermission',
  async (_, { rejectWithValue }) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        
        return {
          granted: true,
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
          },
        }
      } else {
        return { granted: false, location: null }
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get location permission')
    }
  }
)

// 请求通知权限
export const requestNotificationPermission = createAsyncThunk(
  'app/requestNotificationPermission',
  async (_, { rejectWithValue }) => {
    try {
      const { status } = await Notifications.requestPermissionsAsync()
      
      if (status === 'granted') {
        const token = await Notifications.getExpoPushTokenAsync()
        return {
          granted: true,
          pushToken: token.data,
        }
      } else {
        return { granted: false, pushToken: null }
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get notification permission')
    }
  }
)

// 获取当前位置
export const getCurrentLocation = createAsyncThunk(
  'app/getCurrentLocation',
  async (_, { rejectWithValue }) => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync()
      
      if (status !== 'granted') {
        return rejectWithValue('Location permission not granted')
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get current location')
    }
  }
)

// 初始化应用设置
export const initializeApp = createAsyncThunk(
  'app/initialize',
  async () => {
    try {
      // 检查是否首次启动
      const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch')
      
      // 获取保存的设置
      const savedSettings = await AsyncStorage.getItem('app_settings')
      const settings = savedSettings ? JSON.parse(savedSettings) : {}
      
      // 检查权限状态
      const locationStatus = await Location.getForegroundPermissionsAsync()
      const notificationStatus = await Notifications.getPermissionsAsync()
      
      return {
        isFirstLaunch: isFirstLaunch === null,
        settings,
        hasLocationPermission: locationStatus.status === 'granted',
        hasNotificationPermission: notificationStatus.status === 'granted',
      }
    } catch (error) {
      return {
        isFirstLaunch: true,
        settings: {},
        hasLocationPermission: false,
        hasNotificationPermission: false,
      }
    }
  }
)

// 保存应用设置
export const saveAppSettings = createAsyncThunk(
  'app/saveSettings',
  async (settings: Partial<AppState>, { getState }) => {
    try {
      const state = getState() as { app: AppSliceState }
      const newSettings = { ...state.app, ...settings }
      
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings))
      
      return newSettings
    } catch (error: any) {
      throw new Error('Failed to save settings')
    }
  }
)

// 标记首次启动完成
export const completeFirstLaunch = createAsyncThunk(
  'app/completeFirstLaunch',
  async () => {
    await AsyncStorage.setItem('isFirstLaunch', 'false')
    return false
  }
)

// 初始状态
const initialState: AppSliceState = {
  isOffline: false,
  theme: 'auto',
  language: 'en',
  firstLaunch: true,
  pushToken: undefined,
  location: undefined,
  notifications: [],
  isFirstLaunch: true,
  hasLocationPermission: false,
  hasNotificationPermission: false,
  deviceId: null,
  appVersion: '1.0.0',
  lastUpdateCheck: 0,
}

// 创建app slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // 设置离线状态
    setOfflineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload
    },
    
    // 设置主题
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload
    },
    
    // 设置语言
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
    
    // 设置位置
    setLocation: (state, action: PayloadAction<AppState['location']>) => {
      state.location = action.payload
    },
    
    // 设置推送token
    setPushToken: (state, action: PayloadAction<string>) => {
      state.pushToken = action.payload
    },
    
    // 添加通知
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      // 限制通知数量
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    },
    
    // 标记通知为已读
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    
    // 标记所有通知为已读
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
    },
    
    // 删除通知
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    
    // 清空所有通知
    clearAllNotifications: (state) => {
      state.notifications = []
    },
    
    // 设置设备ID
    setDeviceId: (state, action: PayloadAction<string>) => {
      state.deviceId = action.payload
    },
    
    // 更新最后检查更新时间
    updateLastUpdateCheck: (state) => {
      state.lastUpdateCheck = Date.now()
    },
    
    // 设置权限状态
    setLocationPermission: (state, action: PayloadAction<boolean>) => {
      state.hasLocationPermission = action.payload
    },
    
    setNotificationPermission: (state, action: PayloadAction<boolean>) => {
      state.hasNotificationPermission = action.payload
    },
    
    // 重置应用状态
    resetAppState: (state) => {
      state.notifications = []
      state.location = undefined
      state.pushToken = undefined
    },
  },
  extraReducers: (builder) => {
    // 检查网络状态
    builder
      .addCase(checkNetworkStatus.fulfilled, (state, action) => {
        state.isOffline = action.payload
      })
    
    // 请求位置权限
    builder
      .addCase(requestLocationPermission.fulfilled, (state, action) => {
        state.hasLocationPermission = action.payload.granted
        if (action.payload.location) {
          state.location = action.payload.location
        }
      })
      .addCase(requestLocationPermission.rejected, (state) => {
        state.hasLocationPermission = false
      })
    
    // 请求通知权限
    builder
      .addCase(requestNotificationPermission.fulfilled, (state, action) => {
        state.hasNotificationPermission = action.payload.granted
        if (action.payload.pushToken) {
          state.pushToken = action.payload.pushToken
        }
      })
      .addCase(requestNotificationPermission.rejected, (state) => {
        state.hasNotificationPermission = false
      })
    
    // 获取当前位置
    builder
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.location = action.payload
      })
      .addCase(getCurrentLocation.rejected, (state) => {
        state.location = undefined
      })
    
    // 初始化应用
    builder
      .addCase(initializeApp.fulfilled, (state, action) => {
        const { isFirstLaunch, settings, hasLocationPermission, hasNotificationPermission } = action.payload
        
        state.isFirstLaunch = isFirstLaunch
        state.firstLaunch = isFirstLaunch
        state.hasLocationPermission = hasLocationPermission
        state.hasNotificationPermission = hasNotificationPermission
        
        // 应用保存的设置
        Object.assign(state, settings)
      })
    
    // 保存应用设置
    builder
      .addCase(saveAppSettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload)
      })
    
    // 完成首次启动
    builder
      .addCase(completeFirstLaunch.fulfilled, (state) => {
        state.isFirstLaunch = false
        state.firstLaunch = false
      })
  },
})

// 导出actions
export const {
  setOfflineStatus,
  setTheme,
  setLanguage,
  setLocation,
  setPushToken,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearAllNotifications,
  setDeviceId,
  updateLastUpdateCheck,
  setLocationPermission,
  setNotificationPermission,
  resetAppState,
} = appSlice.actions

// 选择器
export const selectAppState = (state: { app: AppSliceState }) => state.app
export const selectIsOffline = (state: { app: AppSliceState }) => state.app.isOffline
export const selectTheme = (state: { app: AppSliceState }) => state.app.theme
export const selectLanguage = (state: { app: AppSliceState }) => state.app.language
export const selectLocation = (state: { app: AppSliceState }) => state.app.location
export const selectNotifications = (state: { app: AppSliceState }) => state.app.notifications
export const selectUnreadNotifications = (state: { app: AppSliceState }) => 
  state.app.notifications.filter(n => !n.read)
export const selectIsFirstLaunch = (state: { app: AppSliceState }) => state.app.isFirstLaunch
export const selectHasLocationPermission = (state: { app: AppSliceState }) => state.app.hasLocationPermission
export const selectHasNotificationPermission = (state: { app: AppSliceState }) => state.app.hasNotificationPermission

export default appSlice.reducer