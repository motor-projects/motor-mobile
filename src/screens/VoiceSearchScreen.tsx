import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, FONTS, SPACING } from '../utils/constants'

const VoiceSearchScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Search</Text>
      <Text style={styles.subtitle}>Voice search coming soon...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.light,
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
})

export default VoiceSearchScreen