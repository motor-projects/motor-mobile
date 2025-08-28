import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSelector, useDispatch } from 'react-redux'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { Ionicons } from '@expo/vector-icons'

import { RootStackParamList, TabParamList } from '../types'
import { selectIsAuthenticated, restoreAuthState } from '../store/slices/authSlice'
import { initializeApp } from '../store/slices/appSlice'
import { loadSearchHistoryFromStorage } from '../store/slices/searchSlice'

// 导入屏幕组件
import SplashScreen from '../screens/SplashScreen'
import OnboardingScreen from '../screens/OnboardingScreen'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'

// Tab屏幕
import HomeScreen from '../screens/tabs/HomeScreen'
import SearchScreen from '../screens/tabs/SearchScreen'
import FavoritesScreen from '../screens/tabs/FavoritesScreen'
import ProfileScreen from '../screens/tabs/ProfileScreen'

// 其他屏幕
import MotorcycleDetailScreen from '../screens/MotorcycleDetailScreen'
import CameraScreen from '../screens/CameraScreen'
import ImageGalleryScreen from '../screens/ImageGalleryScreen'
import ReviewWriteScreen from '../screens/ReviewWriteScreen'
import ReviewsScreen from '../screens/ReviewsScreen'
import SettingsScreen from '../screens/SettingsScreen'
import AboutScreen from '../screens/AboutScreen'
import DealersScreen from '../screens/DealersScreen'
import CompareScreen from '../screens/CompareScreen'
import VoiceSearchScreen from '../screens/VoiceSearchScreen'

import { COLORS } from '../utils/constants'

const Stack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

// 底部标签导航配置
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline'
              break
            case 'SearchTab':
              iconName = focused ? 'search' : 'search-outline'
              break
            case 'FavoritesTab':
              iconName = focused ? 'heart' : 'heart-outline'
              break
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline'
              break
            default:
              iconName = 'circle-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border.light,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="SearchTab" 
        component={SearchScreen}
        options={{ tabBarLabel: 'Search' }}
      />
      <Tab.Screen 
        name="FavoritesTab" 
        component={FavoritesScreen}
        options={{ tabBarLabel: 'Favorites' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  )
}

// 认证栈导航
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.white },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}

// 主应用栈导航
const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border.light,
        },
        headerTintColor: COLORS.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        cardStyle: { backgroundColor: COLORS.background.light },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="MotorcycleDetail" 
        component={MotorcycleDetailScreen}
        options={({ route }) => ({
          title: 'Motorcycle Details',
          headerBackTitleVisible: false,
        })}
      />
      
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{
          title: 'Camera',
          headerBackTitleVisible: false,
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="ImageGallery" 
        component={ImageGalleryScreen}
        options={{
          title: 'Photos',
          headerBackTitleVisible: false,
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="ReviewWrite" 
        component={ReviewWriteScreen}
        options={{
          title: 'Write Review',
          headerBackTitleVisible: false,
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="Reviews" 
        component={ReviewsScreen}
        options={{
          title: 'Reviews',
          headerBackTitleVisible: false,
        }}
      />
      
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerBackTitleVisible: false,
        }}
      />
      
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{
          title: 'About',
          headerBackTitleVisible: false,
        }}
      />
      
      <Stack.Screen 
        name="Dealers" 
        component={DealersScreen}
        options={{
          title: 'Dealers',
          headerBackTitleVisible: false,
        }}
      />
      
      <Stack.Screen 
        name="Compare" 
        component={CompareScreen}
        options={{
          title: 'Compare',
          headerBackTitleVisible: false,
        }}
      />
      
      <Stack.Screen 
        name="VoiceSearch" 
        component={VoiceSearchScreen}
        options={{
          title: 'Voice Search',
          headerBackTitleVisible: false,
          presentation: 'modal',
        }}
      />
      
      {/* 认证相关屏幕作为模态显示 */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Login',
          headerBackTitleVisible: false,
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Register',
          headerBackTitleVisible: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  )
}

// 主导航组件
export const Navigation = () => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [isReady, setIsReady] = React.useState(false)
  const [showOnboarding, setShowOnboarding] = React.useState(false)

  // 深度链接配置
  const linking = {
    prefixes: ['motorspecs://', 'https://motorspecs.com'],
    config: {
      screens: {
        Home: {
          screens: {
            HomeTab: 'home',
            SearchTab: 'search',
            FavoritesTab: 'favorites',
            ProfileTab: 'profile',
          },
        },
        MotorcycleDetail: 'motorcycle/:id',
        Search: {
          path: 'search',
          parse: {
            query: (query: string) => decodeURIComponent(query),
          },
        },
        Reviews: 'motorcycle/:motorcycleId/reviews',
        Dealers: 'dealers',
        Compare: 'compare',
      },
    },
  }

  // 通知点击处理
  const handleNotificationResponse = React.useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data
    
    if (data?.motorcycleId) {
      // 导航到摩托车详情页
      // 这里需要navigation ref来实现
    } else if (data?.screen) {
      // 导航到指定屏幕
    }
  }, [])

  // 应用初始化
  useEffect(() => {
    const initializeApplication = async () => {
      try {
        // 恢复认证状态
        await dispatch(restoreAuthState() as any)
        
        // 初始化应用设置
        const appInitResult = await dispatch(initializeApp() as any)
        
        if (appInitResult.payload.isFirstLaunch) {
          setShowOnboarding(true)
        }
        
        // 加载搜索历史
        dispatch(loadSearchHistoryFromStorage() as any)
        
        // 设置通知监听器
        const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse)
        
        setIsReady(true)
        
        return () => {
          subscription.remove()
        }
      } catch (error) {
        console.error('App initialization failed:', error)
        setIsReady(true)
      }
    }

    initializeApplication()
  }, [dispatch, handleNotificationResponse])

  // 完成引导流程
  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (!isReady) {
    return <SplashScreen />
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />
  }

  return (
    <NavigationContainer linking={linking}>
      <AppStack />
    </NavigationContainer>
  )
}

export default Navigation