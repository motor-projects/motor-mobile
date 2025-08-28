import React, { memo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SPACING } from '../utils/constants'

interface Props {
  title: string
  subtitle?: string
  showSeeAll?: boolean
  seeAllText?: string
  onSeeAllPress?: () => void
  style?: ViewStyle
}

const SectionHeader: React.FC<Props> = ({
  title,
  subtitle,
  showSeeAll = true,
  seeAllText = 'See All',
  onSeeAllPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      
      {showSeeAll && onSeeAllPress && (
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={onSeeAllPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.seeAllText}>{seeAllText}</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.normal,
    color: COLORS.text.secondary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
  },
})

export default memo(SectionHeader)