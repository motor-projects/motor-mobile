import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

import { RootState } from '../../store'
import { 
  fetchTrending, 
  fetchLatest, 
  fetchRecommendations,
  selectTrending,
  selectLatest,
  selectRecommendations,
  selectMotorcycleLoading,
} from '../../store/slices/motorcycleSlice'
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice'
import { selectNotifications, selectUnreadNotifications } from '../../store/slices/appSlice'

import MotorcycleCard from '../../components/MotorcycleCard'
import CategoryCard from '../../components/CategoryCard'
import BrandCard from '../../components/BrandCard'
import NotificationBadge from '../../components/NotificationBadge'
import SearchBar from '../../components/SearchBar'
import Carousel from '../../components/Carousel'
import SectionHeader from '../../components/SectionHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'

import { COLORS, FONTS, SPACING, MOTORCYCLE_CATEGORIES, MOTORCYCLE_BRANDS } from '../../utils/constants'
import { getGreeting, hapticFeedback } from '../../utils/helpers'
import { Motorcycle } from '../../types'

const HomeScreen: React.FC = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  
  // Selectors
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const trending = useSelector(selectTrending)
  const latest = useSelector(selectLatest)
  const recommendations = useSelector(selectRecommendations)
  const isLoading = useSelector(selectMotorcycleLoading)
  const notifications = useSelector(selectNotifications)
  const unreadNotifications = useSelector(selectUnreadNotifications)

  // Local state
  const [refreshing, setRefreshing] = useState(false)
  const [greeting, setGreeting] = useState('')

  // 初始化数据
  useEffect(() => {
    loadInitialData()
    setGreeting(getGreeting())
  }, [])

  // 每次进入页面时更新问候语
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setGreeting(getGreeting())
    })
    return unsubscribe
  }, [navigation])

  const loadInitialData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchTrending() as any),
        dispatch(fetchLatest() as any),
        isAuthenticated && dispatch(fetchRecommendations() as any),
      ].filter(Boolean))
    } catch (error) {
      console.error('Failed to load initial data:', error)
    }
  }, [dispatch, isAuthenticated])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    hapticFeedback('light')
    
    try {
      await loadInitialData()
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data. Please try again.')
    } finally {
      setRefreshing(false)
    }
  }, [loadInitialData])

  const handleMotorcyclePress = useCallback((motorcycle: Motorcycle) => {
    hapticFeedback('light')
    navigation.navigate('MotorcycleDetail', { 
      id: motorcycle._id, 
      motorcycle 
    })
  }, [navigation])

  const handleCategoryPress = useCallback((category: string) => {
    hapticFeedback('light')
    navigation.navigate('Search', { 
      filters: { category: [category] } 
    })
  }, [navigation])

  const handleBrandPress = useCallback((brand: string) => {
    hapticFeedback('light')
    navigation.navigate('Search', { 
      filters: { brand: [brand] } 
    })
  }, [navigation])

  const handleSearchPress = useCallback(() => {
    hapticFeedback('light')
    navigation.navigate('SearchTab')
  }, [navigation])

  const handleNotificationPress = useCallback(() => {
    hapticFeedback('light')
    // TODO: Navigate to notifications screen
  }, [])

  const handleSeeAllPress = useCallback((section: string) => {
    hapticFeedback('light')
    
    switch (section) {
      case 'trending':
        navigation.navigate('Search', { 
          filters: { sortBy: 'popularity', sortOrder: 'desc' } 
        })
        break
      case 'latest':
        navigation.navigate('Search', { 
          filters: { sortBy: 'year', sortOrder: 'desc' } 
        })
        break
      case 'recommendations':
        navigation.navigate('Search', { 
          filters: { featured: true } 
        })
        break
    }
  }, [navigation])

  // 渲染轮播图数据
  const carouselData = [
    {
      id: '1',
      title: 'New 2024 Models',
      subtitle: 'Discover the latest motorcycles',
      image: 'https://via.placeholder.com/400x200?text=2024+Models',
      onPress: () => handleSeeAllPress('latest'),
    },
    {
      id: '2',
      title: 'Top Rated Bikes',
      subtitle: 'Highest rated by our community',
      image: 'https://via.placeholder.com/400x200?text=Top+Rated',
      onPress: () => handleSeeAllPress('trending'),
    },
    {
      id: '3',
      title: 'Electric Future',
      subtitle: 'Explore electric motorcycles',
      image: 'https://via.placeholder.com/400x200?text=Electric',
      onPress: () => handleCategoryPress('Electric'),
    },
  ]

  const renderHeader = () => (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.headerTop}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{greeting}</Text>
          {isAuthenticated && user && (
            <Text style={styles.userName}>{user.username}!</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.gray[700]} />
          {unreadNotifications.length > 0 && (
            <NotificationBadge count={unreadNotifications.length} />
          )}
        </TouchableOpacity>
      </View>

      <SearchBar
        placeholder="Search motorcycles..."
        onPress={handleSearchPress}
        showVoiceSearch
        style={styles.searchBar}
      />
    </View>
  )

  const renderFeaturedSection = () => (
    <View style={styles.section}>
      <Carousel
        data={carouselData}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.carouselItem}
            onPress={item.onPress}
            activeOpacity={0.9}
          >
            <View style={styles.carouselContent}>
              <Text style={styles.carouselTitle}>{item.title}</Text>
              <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        )}
        autoPlay
        style={styles.carousel}
      />
    </View>
  )

  const renderCategoriesSection = () => (
    <View style={styles.section}>
      <SectionHeader
        title="Browse Categories"
        subtitle="Find bikes by type"
        onSeeAllPress={() => navigation.navigate('SearchTab')}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {MOTORCYCLE_CATEGORIES.slice(0, 6).map((category) => (
          <CategoryCard
            key={category}
            category={category}
            onPress={() => handleCategoryPress(category)}
            style={styles.categoryCard}
          />
        ))}
      </ScrollView>
    </View>
  )

  const renderBrandsSection = () => (
    <View style={styles.section}>
      <SectionHeader
        title="Popular Brands"
        subtitle="Explore by manufacturer"
        onSeeAllPress={() => navigation.navigate('SearchTab')}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {MOTORCYCLE_BRANDS.slice(0, 8).map((brand) => (
          <BrandCard
            key={brand}
            brand={brand}
            onPress={() => handleBrandPress(brand)}
            style={styles.brandCard}
          />
        ))}
      </ScrollView>
    </View>
  )

  const renderTrendingSection = () => {
    if (!trending.length) return null
    
    return (
      <View style={styles.section}>
        <SectionHeader
          title="Trending Now"
          subtitle="Popular this week"
          onSeeAllPress={() => handleSeeAllPress('trending')}
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {trending.slice(0, 5).map((motorcycle) => (
            <MotorcycleCard
              key={motorcycle._id}
              motorcycle={motorcycle}
              onPress={handleMotorcyclePress}
              style={styles.motorcycleCard}
              variant="compact"
            />
          ))}
        </ScrollView>
      </View>
    )
  }

  const renderLatestSection = () => {
    if (!latest.length) return null
    
    return (
      <View style={styles.section}>
        <SectionHeader
          title="Latest Models"
          subtitle="Newest additions"
          onSeeAllPress={() => handleSeeAllPress('latest')}
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {latest.slice(0, 5).map((motorcycle) => (
            <MotorcycleCard
              key={motorcycle._id}
              motorcycle={motorcycle}
              onPress={handleMotorcyclePress}
              style={styles.motorcycleCard}
              variant="compact"
            />
          ))}
        </ScrollView>
      </View>
    )
  }

  const renderRecommendationsSection = () => {
    if (!isAuthenticated || !recommendations.length) return null
    
    return (
      <View style={styles.section}>
        <SectionHeader
          title="Recommended for You"
          subtitle="Based on your preferences"
          onSeeAllPress={() => handleSeeAllPress('recommendations')}
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {recommendations.slice(0, 5).map((motorcycle) => (
            <MotorcycleCard
              key={motorcycle._id}
              motorcycle={motorcycle}
              onPress={handleMotorcyclePress}
              style={styles.motorcycleCard}
              variant="compact"
            />
          ))}
        </ScrollView>
      </View>
    )
  }

  if (isLoading && !refreshing) {
    return <LoadingSpinner />
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderFeaturedSection()}
        {renderCategoriesSection()}
        {renderBrandsSection()}
        {renderTrendingSection()}
        {renderLatestSection()}
        {renderRecommendationsSection()}
        
        {/* 底部间距 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.normal,
    color: COLORS.text.secondary,
  },
  userName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.primary,
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  searchBar: {
    marginTop: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  carousel: {
    height: 160,
  },
  carouselItem: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    justifyContent: 'flex-end',
    marginHorizontal: SPACING.md,
  },
  carouselContent: {
    alignItems: 'flex-start',
  },
  carouselTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  carouselSubtitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.normal,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  horizontalList: {
    paddingHorizontal: SPACING.md,
    paddingRight: SPACING.lg,
  },
  categoryCard: {
    marginRight: SPACING.md,
  },
  brandCard: {
    marginRight: SPACING.md,
  },
  motorcycleCard: {
    marginRight: SPACING.md,
    width: 280,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
})

export default HomeScreen