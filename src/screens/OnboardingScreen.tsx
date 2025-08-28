import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useDispatch } from 'react-redux'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  runOnJS,
} from 'react-native-reanimated'
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler'

import { completeFirstLaunch } from '../store/slices/appSlice'
import { COLORS, FONTS, SPACING } from '../utils/constants'

const { width, height } = Dimensions.get('window')

interface OnboardingSlide {
  id: string
  title: string
  subtitle: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
  color: string
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Discover',
    subtitle: 'Your Perfect Motorcycle',
    description: 'Browse thousands of motorcycles with detailed specifications, photos, and expert reviews.',
    icon: 'search',
    color: COLORS.primary,
  },
  {
    id: '2',
    title: 'Compare',
    subtitle: 'Side by Side',
    description: 'Compare different models, specs, and prices to make the best decision for your needs.',
    icon: 'git-compare',
    color: COLORS.success,
  },
  {
    id: '3',
    title: 'Review',
    subtitle: 'Share Your Experience',
    description: 'Read and write authentic reviews from real motorcycle owners and enthusiasts.',
    icon: 'star',
    color: COLORS.warning,
  },
  {
    id: '4',
    title: 'Connect',
    subtitle: 'Find Local Dealers',
    description: 'Locate nearby dealers, schedule test rides, and get expert advice from professionals.',
    icon: 'location',
    color: COLORS.info,
  },
]

interface Props {
  onComplete: () => void
}

const OnboardingScreen: React.FC<Props> = ({ onComplete }) => {
  const dispatch = useDispatch()
  const [currentIndex, setCurrentIndex] = useState(0)
  const translateX = useSharedValue(0)
  const flatListRef = React.useRef<FlatList>(null)

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true })
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = async () => {
    await dispatch(completeFirstLaunch() as any)
    onComplete()
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    }
  })

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.color }]}>
        <StatusBar backgroundColor={item.color} barStyle="light-content" />
        
        {/* 装饰性背景 */}
        <View style={styles.backgroundDecoration}>
          <View style={[styles.decorationCircle, styles.circle1]} />
          <View style={[styles.decorationCircle, styles.circle2]} />
          <View style={[styles.decorationCircle, styles.circle3]} />
        </View>

        <View style={styles.content}>
          {/* 图标 */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name={item.icon} size={80} color={COLORS.white} />
            </View>
          </View>

          {/* 文本内容 */}
          <View style={styles.textContent}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>

        {/* 分页指示器 */}
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.paginationDot,
                {
                  opacity: i === index ? 1 : 0.3,
                  width: i === index ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* 导航按钮 */}
        <View style={styles.navigation}>
          {index > 0 && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                const prevIndex = index - 1
                setCurrentIndex(prevIndex)
                flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true })
              }}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          )}

          <View style={styles.navCenter}>
            {index < slides.length - 1 ? (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            {index === slides.length - 1 ? (
              <View style={styles.getStartedButton}>
                <Text style={styles.getStartedText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color={item.color} />
              </View>
            ) : (
              <View style={styles.nextButtonContent}>
                <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width)
          setCurrentIndex(newIndex)
        }}
        scrollEventThrottle={16}
      />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  backgroundDecoration: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  decorationCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -75,
  },
  circle3: {
    width: 80,
    height: 80,
    top: height * 0.4,
    right: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING['2xl'],
  },
  iconBackground: {
    width: 160,
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS.sizes['4xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.medium,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.normal,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 300,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  paginationDot: {
    height: 8,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    height: 60,
  },
  navButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  skipButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  nextButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonContent: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 25,
  },
  getStartedText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    marginRight: SPACING.sm,
  },
})

export default OnboardingScreen