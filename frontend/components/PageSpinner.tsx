import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const screenWidth = Dimensions.get('window').width;
const pageWidth = screenWidth * 0.8; // 80% of screen width
const letterWidth = 50; // Width of each letter in the Spinner
const centerOffset = (screenWidth - letterWidth) / 2; // To center the selected letter

const PageSpinner = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);
  const [selectedLetterIndex, setSelectedLetterIndex] = useState(0);

  // Flags to prevent reciprocal updates
  const isScrollViewProgrammatic = useRef(false);
  const isFlatListProgrammatic = useRef(false);

  // Ref to keep track of the last haptics-triggered letter index
  const lastHapticsLetterIndex = useRef(selectedLetterIndex);

  // Generate pages: 5 pages per letter
  const pages = letters.reduce((acc: string[], letter: string) => {
    const letterPages = Array.from({ length: 5 }, (_, i) => `${letter} Page ${i + 1}`);
    return [...acc, ...letterPages];
  }, []);

  const maxIndex = pages.length - 1; // Maximum index for FlatList

  // Effect to handle haptic feedback when selectedLetterIndex changes
  useEffect(() => {
    // Trigger haptics only when the letter index changes
    if (lastHapticsLetterIndex.current !== selectedLetterIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      lastHapticsLetterIndex.current = selectedLetterIndex;
    }
  }, [selectedLetterIndex]);

  // Handle ScrollView's momentum scroll end
  const handleScrollViewMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isScrollViewProgrammatic.current) {
        // Reset the flag and exit to prevent reciprocal update
        isScrollViewProgrammatic.current = false;
        return;
      }

      const { nativeEvent } = event;
      if (!nativeEvent) {
        console.warn('ScrollView event has no nativeEvent');
        return;
      }

      const offsetX = nativeEvent.contentOffset.x;
      let index = Math.round(offsetX / letterWidth);

      // Clamp the index within valid range
      index = Math.max(0, Math.min(index, letters.length - 1));

      if (index !== selectedLetterIndex) {
        setSelectedLetterIndex(index);

        // Calculate the target page index for the FlatList
        const targetPageIndex = index * 5;

        if (targetPageIndex >= 0 && targetPageIndex <= maxIndex) {
          isFlatListProgrammatic.current = true; // Indicate FlatList is being updated programmatically
          flatListRef.current?.scrollToIndex({ index: targetPageIndex, animated: true });
        }
      }
    },
    [selectedLetterIndex, maxIndex]
  );

  // Handle FlatList's momentum scroll end
  const handleFlatListMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isFlatListProgrammatic.current) {
        // Reset the flag and exit to prevent reciprocal update
        isFlatListProgrammatic.current = false;
        return;
      }

      const { nativeEvent } = event;
      if (!nativeEvent) {
        console.warn('FlatList event has no nativeEvent');
        return;
      }

      const offsetX = nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);
      const letterIndex = Math.floor(index / 5); // Each letter has 5 pages

      // Clamp the letter index within valid range
      const clampedLetterIndex = Math.max(0, Math.min(letterIndex, letters.length - 1));

      if (clampedLetterIndex !== selectedLetterIndex) {
        setSelectedLetterIndex(clampedLetterIndex);

        isScrollViewProgrammatic.current = true; // Indicate ScrollView is being updated programmatically
        scrollViewRef.current?.scrollTo({
          x: clampedLetterIndex * letterWidth,
          animated: true,
        });
      }
    },
    [selectedLetterIndex]
  );

  // Handle scrollToIndex failure (e.g., if the index is out of bounds)
  const onFlatListScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number }) => {
      const wait = setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
      }, 500); // Wait for 500ms

      return () => clearTimeout(wait);
    },
    []
  );

  // Render a page for the FlatList
  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.pageContainer}>
      <View style={styles.page}>
        <Text style={styles.pageText}>{item}</Text>
      </View>
    </View>
  );

  // Provide the layout of each item in the FlatList for scrollToIndex
  const getItemLayout = (_: any, index: number) => ({
    length: screenWidth, // Keep the screen width for paging purposes
    offset: screenWidth * index, // Offset is screenWidth multiplied by index
    index,
  });

  // Handle the ScrollView's onScroll event to trigger haptics for every letter passed
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { nativeEvent } = event;
    if (!nativeEvent) {
      return;
    }
    const offsetX = nativeEvent.contentOffset.x;
    const currentLetterIndex = Math.round(offsetX / letterWidth);
    const clampedIndex = Math.max(0, Math.min(currentLetterIndex, letters.length - 1));

    if (clampedIndex !== lastHapticsLetterIndex.current) {
      // Update the last haptics letter index
      lastHapticsLetterIndex.current = clampedIndex;

      // Trigger haptics only if the scroll is not programmatic
      if (!isScrollViewProgrammatic.current && !isFlatListProgrammatic.current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* FlatList displaying pages for each letter */}
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth} // Ensure snapping happens per page width
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleFlatListMomentumEnd}
        onScrollToIndexFailed={onFlatListScrollToIndexFailed}
        initialScrollIndex={0}
      />

      {/* Spinner */}
      <View style={styles.spinnerContainer}>
        <LinearGradient
          colors={['white', 'rgba(242, 242, 242, 0.8)', 'rgba(242, 242, 242, 0.1)', 'rgba(242, 242, 242, 0)']}
          style={styles.leftFade}
          start={[0, 0]}
          end={[1, 0]}
          pointerEvents="none"
        />

        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollViewMomentumEnd}
          onScroll={handleScroll} // Added onScroll handler for haptics
          scrollEventThrottle={16}
          snapToInterval={letterWidth} // Snap to the width of each letter
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: centerOffset }} // Center first and last letter
        >
          {letters.map((letter, index) => (
            <View key={index} style={styles.letterBox}>
              <Text
                style={[
                  styles.letter,
                  index === selectedLetterIndex ? styles.selectedLetter : styles.unselectedLetter,
                ]}
              >
                {letter}
              </Text>
            </View>
          ))}
        </ScrollView>

        <LinearGradient
          colors={['rgba(242, 242, 242, 0)', 'rgba(242, 242, 242, 0.1)', 'rgba(242, 242, 242, 0.8)', 'white']}
          style={styles.rightFade}
          start={[0, 0]}
          end={[1, 0]}
          pointerEvents="none"
        />

        <View style={styles.selectionBox} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  pageContainer: {
    width: screenWidth,
    alignItems: 'center',
    marginTop: 30,
  },
  page: {
    width: pageWidth,
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pageText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  spinnerContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
  },
  letterBox: {
    width: letterWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  unselectedLetter: {
    fontSize: 18,
    color: '#aaa',
  },
  selectedLetter: {
    fontSize: 36,
    color: 'black',
  },
  selectionBox: {
    position: 'absolute',
    top: '0%',
    bottom: '0%',
    width: letterWidth,
    backgroundColor: 'white',
    zIndex: -1,
    borderRadius: 10,
  },
  leftFade: {
    position: 'absolute',
    left: 0,
    width: letterWidth * 2, // 100
    height: '100%',
    zIndex: 1,
  },
  rightFade: {
    position: 'absolute',
    right: 0,
    width: letterWidth * 2, // 100
    height: '100%',
    zIndex: 1,
  },
});

export default PageSpinner;
