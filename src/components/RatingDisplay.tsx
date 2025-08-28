import React, { memo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SPACING } from '../utils/constants'

interface Props {
  rating: number
  reviewCount?: number
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'light' | 'compact'
  showText?: boolean
  style?: ViewStyle
}

const RatingDisplay: React.FC<Props> = ({
  rating,
  reviewCount,
  size = 'medium',
  variant = 'default',
  showText = true,
  style,
}) => {
  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    const starSize = getStarSize()
    const starColor = getStarColor()

    // 满星
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons
          key={`full-${i}`}
          name="star"
          size={starSize}
          color={starColor}
          style={styles.star}
        />
      )
    }

    // 半星
    if (hasHalfStar) {
      stars.push(
        <View key="half" style={styles.halfStarContainer}>
          <Ionicons
            name="star-outline"
            size={starSize}
            color={getEmptyStarColor()}
            style={[styles.star, styles.halfStarBackground]}
          />
          <Ionicons
            name="star-half"
            size={starSize}
            color={starColor}
            style={[styles.star, styles.halfStarForeground]}
          />
        </View>
      )
    }

    // 空星
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={starSize}
          color={getEmptyStarColor()}
          style={styles.star}
        />
      )
    }

    return stars
  }

  const getStarSize = () => {
    switch (size) {
      case 'small':
        return 12
      case 'large':
        return 20
      default:
        return 16
    }
  }

  const getStarColor = () => {
    switch (variant) {
      case 'light':
        return COLORS.warning
      default:
        return COLORS.warning
    }
  }

  const getEmptyStarColor = () => {
    switch (variant) {
      case 'light':
        return 'rgba(255, 255, 255, 0.5)'
      default:
        return COLORS.gray[300]
    }
  }

  const getTextColor = () => {
    switch (variant) {
      case 'light':
        return COLORS.white
      default:
        return COLORS.text.secondary
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return FONTS.sizes.xs
      case 'large':
        return FONTS.sizes.base
      default:
        return FONTS.sizes.sm
    }
  }

  const formatRating = (value: number) => {
    return value.toFixed(1)
  }

  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  if (variant === 'compact') {
    return (
      <View style={[styles.container, styles.compactContainer, style]}>
        <Ionicons
          name="star"
          size={getStarSize()}
          color={getStarColor()}
          style={styles.compactStar}
        />
        <Text style={[styles.ratingText, { 
          color: getTextColor(), 
          fontSize: getTextSize() 
        }]}>
          {formatRating(rating)}
        </Text>
        {reviewCount && showText && (
          <Text style={[styles.reviewText, { 
            color: getTextColor(), 
            fontSize: getTextSize() - 2 
          }]}>
            ({formatReviewCount(reviewCount)})
          </Text>
        )}
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.ratingText, { 
            color: getTextColor(), 
            fontSize: getTextSize() 
          }]}>
            {formatRating(rating)}
          </Text>
          
          {reviewCount && (
            <Text style={[styles.reviewText, { 
              color: getTextColor(), 
              fontSize: getTextSize() - 2 
            }]}>
              ({formatReviewCount(reviewCount)} reviews)
            </Text>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactContainer: {
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 1,
  },
  compactStar: {
    marginRight: 0,
  },
  halfStarContainer: {
    position: 'relative',
    marginRight: 1,
  },
  halfStarBackground: {
    position: 'absolute',
    marginRight: 0,
  },
  halfStarForeground: {
    marginRight: 0,
  },
  textContainer: {
    marginLeft: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  ratingText: {
    fontWeight: FONTS.weights.semibold,
  },
  reviewText: {
    fontWeight: FONTS.weights.normal,
    opacity: 0.8,
  },
})

export default memo(RatingDisplay)