import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants'

interface Props {
  category: string
  onPress: () => void
  style?: ViewStyle
}

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    'Sport': 'flash',
    'Cruiser': 'car-sport',
    'Touring': 'map',
    'Standard': 'bicycle',
    'Adventure': 'trail-sign',
    'Dual-Sport': 'git-branch',
    'Dirt Bike': 'triangle',
    'Electric': 'battery-charging',
    'Scooter': 'bicycle',
    'Three-Wheeler': 'car',
  }
  return iconMap[category] || 'bicycle'
}

const CategoryCard: React.FC<Props> = ({ category, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
      <Ionicons
        name={getCategoryIcon(category)}
        size={32}
        color={COLORS.primary}
        style={styles.icon}
      />
      <Text style={styles.text}>{category}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    ...SHADOWS.sm,
  },
  icon: {
    marginBottom: SPACING.xs,
  },
  text: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
})

export default CategoryCard