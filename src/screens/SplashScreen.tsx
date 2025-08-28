import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, APP_CONFIG } from '../utils/constants'

const { width, height } = Dimensions.get('window')

const SplashScreen: React.FC = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current
  const slideAnim = React.useRef(new Animated.Value(50)).current

  useEffect(() => {
    // 启动动画序列
    const animationSequence = Animated.sequence([
      // Logo缩放和淡入
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // 文字向上滑入
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ])

    animationSequence.start()
  }, [fadeAnim, scaleAnim, slideAnim])

  return (
    <>
      <StatusBar hidden />
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.logoBackground}>
              <Ionicons
                name="bicycle"
                size={80}
                color={COLORS.white}
              />
            </View>
          </Animated.View>

          {/* 应用名称和标语 */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.appName}>{APP_CONFIG.name}</Text>
            <Text style={styles.tagline}>
              Discover Your Perfect Ride
            </Text>
          </Animated.View>

          {/* 版本信息 */}
          <Animated.View
            style={[
              styles.versionContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.version}>
              Version {APP_CONFIG.version}
            </Text>
            <Text style={styles.developer}>
              by {APP_CONFIG.developer}
            </Text>
          </Animated.View>
        </View>

        {/* 装饰性元素 */}
        <View style={styles.decorationContainer}>
          <Animated.View
            style={[
              styles.circle,
              styles.circle1,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              styles.circle2,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              styles.circle3,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />
        </View>
      </LinearGradient>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoBackground: {
    width: 160,
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: FONTS.sizes['4xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.light,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  version: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  developer: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.light,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  decorationContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
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
    bottom: -75,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.3,
    left: -50,
  },
})

export default SplashScreen