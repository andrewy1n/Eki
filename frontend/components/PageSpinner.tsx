import DraggableImage from './DraggableImage';
import React, { useRef, useContext, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Page } from '@/models/Page';
import { useAccountContext } from '@/context/AccountContext';

const screenWidth = Dimensions.get('window').width;
const pageWidth = screenWidth * 0.8; // 80% of screen width
const letterWidth = 50; // Width of each letter in the Spinner
const centerOffset = (screenWidth - letterWidth) / 2;

const PageSpinner: React.FC<{ index: number }> = ({ index }) => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList<Page>>(null);
  const { accountData } = useAccountContext();

  const stampbooks = accountData?.books || [];
  const book = stampbooks[index];

  if (!book) {
    Alert.alert('Error', 'Stampbook not found.');
    return null;
  }

  const pages = book.pages;
  const letters = Object.keys(pages); // Get all the keys (letters) from the pages object
  const [selectedLetterIndex, setSelectedLetterIndex] = React.useState(0); // State for tracking the spinner
  const selectedLetter = letters[selectedLetterIndex]; // Get the selected letter based on index

  const pagesForSelectedLetter = pages[selectedLetter]; // Pages for the currently selected letter

  // Flags to prevent reciprocal updates
  const isScrollViewProgrammatic = useRef(false);
  const isFlatListProgrammatic = useRef(false);

  // Ref to keep track of the last haptics-triggered letter index
  const lastHapticsLetterIndex = useRef(selectedLetterIndex);

  // Effect to handle haptic feedback when selectedLetterIndex changes
  useEffect(() => {
    if (lastHapticsLetterIndex.current !== selectedLetterIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      lastHapticsLetterIndex.current = selectedLetterIndex;
    }
  }, [selectedLetterIndex]);

  // Handle ScrollView's momentum scroll end (for the spinner)
  const handleScrollViewMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isScrollViewProgrammatic.current) {
        isScrollViewProgrammatic.current = false;
        return;
      }

      const { nativeEvent } = event;
      const offsetX = nativeEvent.contentOffset.x;
      let index = Math.round(offsetX / letterWidth);

      // Clamp the index within the valid range
      index = Math.max(0, Math.min(index, letters.length - 1));

      if (index !== selectedLetterIndex) {
        setSelectedLetterIndex(index); // Update the selected letter index
      }
    },
    [selectedLetterIndex, letters.length]
  );

  // Handle FlatList's momentum scroll end
  const handleFlatListMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isFlatListProgrammatic.current) {
        isFlatListProgrammatic.current = false;
        return;
      }

      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);
      const letterIndex = Math.floor(index / 5); // Adjust based on pages per letter

      const clampedLetterIndex = Math.max(0, Math.min(letterIndex, letters.length - 1));

      if (clampedLetterIndex !== selectedLetterIndex) {
        setSelectedLetterIndex(clampedLetterIndex);

        isScrollViewProgrammatic.current = true;
        scrollViewRef.current?.scrollTo({
          x: clampedLetterIndex * letterWidth,
          animated: true,
        });
      }
    },
    [selectedLetterIndex, letters.length]
  );

  // Render a page for the FlatList
  const renderItem = ({ item }: { item: Page }) => {
    // const handlePagePress = () => {
    //   router.push({
    //     pathname: item.stamped ? '/stampededitor' : '/emptyeditor', // Adjust based on whether the page is stamped or empty
    //     params: {
    //       stampbookId: book.id,
    //       pageId: item.id,
    //     },
    //   });
    // };

    return (
      <TouchableOpacity style={styles.pageContainer}>
        <View style={styles.page}>
          {item.photo_url ? (
            <>
              <Text>{item.location_name}</Text>
              <Image source={{uri: item.photo_url}} borderRadius={15} />
              <DraggableImage key={item.stamp_url} imageUri={item.stamp_url} readonly transformations={item.stamp_transformation} />
            </>
          ) : (
            <>
              {console.log(item.location_name)}
              <Text style={styles.location}>{item.location_name}</Text>
              <Feather name="camera" size={50} color="#000" />
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* FlatList displaying pages for the selected letter */}
      <FlatList
        ref={flatListRef}
        data={pagesForSelectedLetter} // Dynamically use pages based on selected letter
        renderItem={renderItem}
        keyExtractor={(item) => item.location_name}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth} // Ensure snapping happens per page width
        decelerationRate="fast"
        onMomentumScrollEnd={handleFlatListMomentumEnd}
        initialScrollIndex={0} // Reset to the first page of the selected letter
      />

      {/* Spinner */}
      <View style={styles.spinnerContainer}>
        <LinearGradient
          colors={['rgba(242, 242, 242, 1)', 'rgba(242, 242, 242, 0.8)', 'rgba(242, 242, 242, 0.1)', 'rgba(242, 242, 242, 0)']}
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
          scrollEventThrottle={16}
          snapToInterval={letterWidth} // Snap to the width of each letter
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: centerOffset }} // Center first and last letter
        >
          {letters.map((letter, index) => (
            <View key={index} style={styles.letterBox}>
              <Text style={[styles.letter, index === selectedLetterIndex ? styles.selectedLetter : styles.unselectedLetter]}>
                {letter}
              </Text>
            </View>
          ))}
        </ScrollView>
        <LinearGradient
          colors={['rgba(242, 242, 242, 0)', 'rgba(242, 242, 242, 0.1)', 'rgba(242, 242, 242, 0.8)', 'rgba(242, 242, 242, 1)']}
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


export default PageSpinner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    width: '100%',
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
  stampedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
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
    width: letterWidth * 4,
    height: '100%',
    zIndex: 1,
  },
  rightFade: {
    position: 'absolute',
    right: 0,
    width: letterWidth * 4,
    height: '100%',
    zIndex: 1,
  },
  location: {
    position: 'absolute',
    justifyContent: 'center',
    alignSelf:'center',
  },
});