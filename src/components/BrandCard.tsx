import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants'
import { getBrandLogo } from '../utils/helpers'

interface Props {
  brand: string
  onPress: () => void
  style?: ViewStyle
}

const BrandCard: React.FC<Props> = ({ brand, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: getBrandLogo(brand) }}
          style={styles.logo}
          contentFit="contain"
          placeholder="https://via.placeholder.com/60x40?text=Logo"
        />
      </View>
      <Text style={styles.text}>{brand}</Text>
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
  logoContainer: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
})

export default BrandCard