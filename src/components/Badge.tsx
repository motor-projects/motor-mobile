import React, { memo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../utils/constants'

interface Props {
  text: string
  color?: string
  backgroundColor?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'solid' | 'outline' | 'soft'
  style?: ViewStyle
}

const Badge: React.FC<Props> = ({
  text,
  color,
  backgroundColor,
  size = 'medium',
  variant = 'solid',
  style,
}) => {
  const getBadgeStyles = () => {
    const baseStyles = [styles.badge]
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyles.push(styles.smallBadge)
        break
      case 'large':
        baseStyles.push(styles.largeBadge)
        break
      default:
        baseStyles.push(styles.mediumBadge)
    }
    
    // Variant styles
    const badgeColor = color || COLORS.primary
    const bgColor = backgroundColor || badgeColor
    
    switch (variant) {
      case 'outline':
        baseStyles.push({
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: badgeColor,
        })
        break
      case 'soft':
        baseStyles.push({
          backgroundColor: `${bgColor}20`, // 20% opacity
        })
        break
      default:
        baseStyles.push({
          backgroundColor: bgColor,
        })
    }
    
    return baseStyles
  }

  const getTextStyles = () => {
    const baseStyles = [styles.text]
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyles.push(styles.smallText)
        break
      case 'large':
        baseStyles.push(styles.largeText)
        break
      default:
        baseStyles.push(styles.mediumText)
    }
    
    // Color styles
    const textColor = color || COLORS.primary
    
    switch (variant) {
      case 'outline':
      case 'soft':
        baseStyles.push({ color: textColor })
        break
      default:
        baseStyles.push({ color: COLORS.white })
    }
    
    return baseStyles
  }

  return (
    <View style={[getBadgeStyles(), style]}>
      <Text style={getTextStyles()} numberOfLines={1}>
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  mediumBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  largeBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  text: {
    fontWeight: FONTS.weights.semibold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: FONTS.sizes.xs,
  },
  mediumText: {
    fontSize: FONTS.sizes.sm,
  },
  largeText: {
    fontSize: FONTS.sizes.base,
  },
})

export default memo(Badge)