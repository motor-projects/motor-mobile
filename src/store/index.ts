import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers } from 'redux'

import authSlice from './slices/authSlice'
import motorcycleSlice from './slices/motorcycleSlice'
import favoriteSlice from './slices/favoriteSlice'
import appSlice from './slices/appSlice'
import searchSlice from './slices/searchSlice'
import reviewSlice from './slices/reviewSlice'

// 持久化配置
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'favorites', 'app', 'search'], // 只持久化这些slice
  blacklist: ['motorcycles', 'reviews'], // 这些slice不持久化
}

// 合并所有reducer
const rootReducer = combineReducers({
  auth: authSlice,
  motorcycles: motorcycleSlice,
  favorites: favoriteSlice,
  app: appSlice,
  search: searchSlice,
  reviews: reviewSlice,
})

// 创建持久化reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// 配置store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__,
})

// 创建persistor
export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store