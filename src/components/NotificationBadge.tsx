import React from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'
import { COLORS, FONTS } from '../utils/constants'

interface Props {
  count: number
  maxCount?: number
}

const NotificationBadge: React.FC<Props> = ({ count, maxCount = 99 }) => {
  if (count <= 0) return null

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString()

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{displayCount}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  text: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
})

export default NotificationBadge