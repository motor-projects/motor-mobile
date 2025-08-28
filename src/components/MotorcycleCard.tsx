import React, { memo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ImageBackground,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useSelector, useDispatch } from 'react-redux'

import { Motorcycle } from '../types'
import { selectIsFavorite } from '../store/slices/favoriteSlice'
import { selectIsAuthenticated } from '../store/slices/authSlice'
import { addToFavorites, removeFromFavorites } from '../store/slices/favoriteSlice'
import { 
  formatPrice, 
  formatPower, 
  getMotorcycleFullName, 
  getPrimaryImage,
  hapticFeedback 
} from '../utils/helpers'
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants'

import FavoriteButton from './FavoriteButton'
import RatingDisplay from './RatingDisplay'
import Badge from './Badge'

interface Props {
  motorcycle: Motorcycle
  onPress: (motorcycle: Motorcycle) => void
  variant?: 'default' | 'compact' | 'list'
  style?: ViewStyle
  showFavorite?: boolean
  showRating?: boolean
  showBadges?: boolean
}

const MotorcycleCard: React.FC<Props> = ({
  motorcycle,
  onPress,
  variant = 'default',
  style,
  showFavorite = true,
  showRating = true,
  showBadges = true,
}) => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isFavorite = useSelector(selectIsFavorite(motorcycle._id))

  const handlePress = () => {
    hapticFeedback('light')
    onPress(motorcycle)
  }

  const handleFavoritePress = async () => {
    if (!isAuthenticated) {
      // TODO: Show login prompt
      return
    }

    hapticFeedback('light')
    
    try {
      if (isFavorite) {
        await dispatch(removeFromFavorites(motorcycle._id) as any)
      } else {
        await dispatch(addToFavorites({ motorcycleId: motorcycle._id }) as any)
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const primaryImage = getPrimaryImage(motorcycle)
  const fullName = getMotorcycleFullName(motorcycle)
  const price = formatPrice(motorcycle.price?.msrp, motorcycle.price?.currency)
  const power = formatPower(motorcycle.performance?.power?.hp, motorcycle.performance?.power?.kw)

  // 根据变体选择样式
  const cardStyle = [
    styles.card,
    variant === 'compact' && styles.compactCard,
    variant === 'list' && styles.listCard,
    style,
  ]

  const imageStyle = [
    styles.image,
    variant === 'compact' && styles.compactImage,
    variant === 'list' && styles.listImage,
  ]

  const contentStyle = [
    styles.content,
    variant === 'compact' && styles.compactContent,
    variant === 'list' && styles.listContent,
  ]

  if (variant === 'list') {
    return (
      <TouchableOpacity style={cardStyle} onPress={handlePress} activeOpacity={0.9}>
        <Image
          source={{ uri: primaryImage }}
          style={imageStyle}
          contentFit="cover"
          transition={200}
          placeholder="https://via.placeholder.com/120x80?text=Loading"
        />
        
        <View style={contentStyle}>
          <View style={styles.listHeader}>
            <Text style={styles.brandText} numberOfLines={1}>
              {motorcycle.brand}
            </Text>
            <Text style={styles.yearText}>{motorcycle.year}</Text>
          </View>
          
          <Text style={styles.modelText} numberOfLines={1}>
            {motorcycle.model}
          </Text>
          
          <View style={styles.listDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="speedometer-outline" size={14} color={COLORS.gray[500]} />
              <Text style={styles.detailText}>{power}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="car-outline" size={14} color={COLORS.gray[500]} />
              <Text style={styles.detailText}>{motorcycle.category}</Text>
            </View>
          </View>
          
          <View style={styles.listFooter}>
            <Text style={styles.priceText}>{price}</Text>
            
            {showRating && motorcycle.rating && (
              <RatingDisplay
                rating={motorcycle.rating.overall}
                size="small"
                showText={false}
              />
            )}
          </View>
        </View>
        
        {showFavorite && (
          <FavoriteButton
            isFavorite={isFavorite}
            onPress={handleFavoritePress}
            style={styles.listFavoriteButton}
          />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity style={cardStyle} onPress={handlePress} activeOpacity={0.9}>
      <ImageBackground
        source={{ uri: primaryImage }}
        style={imageStyle}
        imageStyle={styles.imageBackground}
      >
        {/* 渐变遮罩 */}
        <View style={styles.gradient} />
        
        {/* 徽章 */}
        {showBadges && (
          <View style={styles.badges}>
            {motorcycle.status === 'new' && (
              <Badge text="New" color={COLORS.success} />
            )}
            {motorcycle.tags?.includes('featured') && (
              <Badge text="Featured" color={COLORS.warning} />
            )}
            {motorcycle.category === 'Electric' && (
              <Badge text="Electric" color={COLORS.info} />
            )}
          </View>
        )}
        
        {/* 收藏按钮 */}
        {showFavorite && (
          <FavoriteButton
            isFavorite={isFavorite}
            onPress={handleFavoritePress}
            style={styles.favoriteButton}
          />
        )}
        
        {/* 底部信息 */}
        <View style={styles.imageOverlay}>
          {showRating && motorcycle.rating && (
            <RatingDisplay
              rating={motorcycle.rating.overall}
              reviewCount={motorcycle.rating.reviews}
              size="small"
              variant="light"
            />
          )}
        </View>
      </ImageBackground>
      
      <View style={contentStyle}>
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandText} numberOfLines={1}>
              {motorcycle.brand}
            </Text>
            <Text style={styles.yearText}>{motorcycle.year}</Text>
          </View>
        </View>
        
        <Text style={styles.modelText} numberOfLines={2}>
          {motorcycle.model}
        </Text>
        
        <View style={styles.specs}>
          <View style={styles.specItem}>
            <Ionicons name="speedometer-outline" size={16} color={COLORS.gray[500]} />
            <Text style={styles.specText}>{power}</Text>
          </View>
          
          <View style={styles.specItem}>
            <Ionicons name="car-outline" size={16} color={COLORS.gray[500]} />
            <Text style={styles.specText}>{motorcycle.category}</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.priceText}>{price}</Text>
          
          {motorcycle.performance?.topSpeed && (
            <View style={styles.topSpeedContainer}>
              <Ionicons name="flash-outline" size={14} color={COLORS.gray[500]} />
              <Text style={styles.topSpeedText}>
                {motorcycle.performance.topSpeed} mph
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  compactCard: {
    width: 280,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  image: {
    width: '100%',
    height: 200,
    justifyContent: 'space-between',
  },
  compactImage: {
    height: 160,
  },
  listImage: {
    width: 80,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  imageBackground: {
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  badges: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  listFavoriteButton: {
    marginLeft: SPACING.sm,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
  },
  content: {
    padding: SPACING.md,
  },
  compactContent: {
    padding: SPACING.sm,
  },
  listContent: {
    flex: 1,
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.secondary,
    marginRight: SPACING.xs,
  },
  yearText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.gray[500],
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  modelText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  specs: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  listDetails: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
    gap: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  topSpeedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topSpeedText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
})

export default memo(MotorcycleCard)