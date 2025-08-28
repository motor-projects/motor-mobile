import React, { memo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants'

interface Props {
  value?: string
  placeholder?: string
  onChangeText?: (text: string) => void
  onPress?: () => void
  onSubmit?: (text: string) => void
  onClear?: () => void
  onVoiceSearch?: () => void
  showVoiceSearch?: boolean
  showClear?: boolean
  editable?: boolean
  autoFocus?: boolean
  style?: ViewStyle
}

const SearchBar: React.FC<Props> = ({
  value = '',
  placeholder = 'Search...',
  onChangeText,
  onPress,
  onSubmit,
  onClear,
  onVoiceSearch,
  showVoiceSearch = false,
  showClear = true,
  editable = true,
  autoFocus = false,
  style,
}) => {
  const inputRef = React.useRef<TextInput>(null)

  const handleSubmit = () => {
    if (onSubmit && value.trim()) {
      onSubmit(value.trim())
    }
  }

  const handleClear = () => {
    if (onChangeText) {
      onChangeText('')
    }
    if (onClear) {
      onClear()
    }
  }

  const handleContainerPress = () => {
    if (!editable && onPress) {
      onPress()
    } else if (editable) {
      inputRef.current?.focus()
    }
  }

  const shouldShowClearButton = showClear && value.length > 0 && editable
  const shouldShowVoiceButton = showVoiceSearch && !value.length && editable

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleContainerPress}
      activeOpacity={editable ? 1 : 0.7}
      disabled={editable}
    >
      <View style={styles.searchIcon}>
        <Ionicons name="search" size={20} color={COLORS.gray[500]} />
      </View>

      {editable ? (
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[400]}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
        />
      ) : (
        <Text style={styles.placeholderText} numberOfLines={1}>
          {value || placeholder}
        </Text>
      )}

      <View style={styles.actions}>
        {shouldShowClearButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
        )}

        {shouldShowVoiceButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onVoiceSearch}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="mic" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.normal,
    color: COLORS.text.primary,
    paddingVertical: 0, // Remove default padding
  },
  placeholderText: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.normal,
    color: COLORS.gray[500],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionButton: {
    padding: 2,
  },
})

export default memo(SearchBar)