import React from 'react'
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native'
import { COLORS, FONTS, SPACING } from '../utils/constants'

interface Props {
  size?: 'small' | 'large'
  color?: string
  text?: string
  style?: any
}

const LoadingSpinner: React.FC<Props> = ({
  size = 'large',
  color = COLORS.primary,
  text,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  text: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
})

export default LoadingSpinner