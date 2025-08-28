import React, { memo } from 'react'
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, SHADOWS } from '../utils/constants'

interface Props {
  isFavorite: boolean
  onPress: () => void
  size?: number
  style?: ViewStyle
  variant?: 'default' | 'light' | 'dark'
}

const FavoriteButton: React.FC<Props> = ({
  isFavorite,
  onPress,
  size = 24,
  style,
  variant = 'default',
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current

  const handlePress = () => {
    // 添加点击动画
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    onPress()
  }

  const getBackgroundColor = () => {
    switch (variant) {
      case 'light':
        return 'rgba(255, 255, 255, 0.9)'
      case 'dark':
        return 'rgba(0, 0, 0, 0.6)'
      default:
        return COLORS.white
    }
  }

  const getIconColor = () => {
    if (isFavorite) {
      return COLORS.danger
    }
    
    switch (variant) {
      case 'light':
        return COLORS.gray[600]
      case 'dark':
        return COLORS.white
      default:
        return COLORS.gray[500]
    }
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            width: size + 16,
            height: size + 16,
          },
          style,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={size}
          color={getIconColor()}
        />
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
})

export default memo(FavoriteButton)