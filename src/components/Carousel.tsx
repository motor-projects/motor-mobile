import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native'
import { COLORS, SPACING } from '../utils/constants'

const { width } = Dimensions.get('window')

interface CarouselItem {
  id: string
  [key: string]: any
}

interface Props {
  data: CarouselItem[]
  renderItem: ({ item, index }: { item: CarouselItem; index: number }) => React.ReactElement
  autoPlay?: boolean
  autoPlayInterval?: number
  showPagination?: boolean
  style?: ViewStyle
}

const Carousel: React.FC<Props> = ({
  data,
  renderItem,
  autoPlay = false,
  autoPlayInterval = 3000,
  showPagination = true,
  style,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const autoPlayRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (autoPlay && data.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % data.length
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true })
          return nextIndex
        })
      }, autoPlayInterval)
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [autoPlay, autoPlayInterval, data.length])

  const handleMomentumScrollEnd = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width)
    setCurrentIndex(newIndex)
  }

  const renderPagination = () => {
    if (!showPagination || data.length <= 1) return null

    return (
      <View style={styles.pagination}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                opacity: index === currentIndex ? 1 : 0.3,
                width: index === currentIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
    )
  }

  const itemWidth = width - (SPACING.md * 2)

  return (
    <View style={[styles.container, style]}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item, index }) => (
          <View style={{ width: itemWidth, marginHorizontal: SPACING.md }}>
            {renderItem({ item, index })}
          </View>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        snapToInterval={itemWidth + (SPACING.md * 2)}
        decelerationRate="fast"
        contentContainerStyle={styles.contentContainer}
      />
      {renderPagination()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  contentContainer: {
    paddingHorizontal: 0,
  },
  pagination: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    height: 8,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    marginHorizontal: 4,
  },
})

export default Carousel