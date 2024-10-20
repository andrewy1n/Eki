import DraggableImage from './DraggableImage';
import React, { useRef, useContext, useEffect, useCallback, useState } from 'react';
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
import { useFocusEffect, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Page, ScaffoldedPage } from '@/models/Page';
import { useAccountContext } from '@/context/AccountContext';
import { useAccount } from '@/hooks/useAccount';

const screenWidth = Dimensions.get('window').width;
const pageWidth = screenWidth * 0.8; // 80% of screen width
const letterWidth = 50; // Width of each letter in the Spinner

const SimpleBook: React.FC<{ index: number }> = ({ index }) => {
  const router = useRouter()
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList<Page | ScaffoldedPage>>(null);
  const { accountData } = useAccountContext();
  const { getAccountData } = useAccount();

  useFocusEffect(
    useCallback(() => {
      getAccountData();
    }, [])
  );

  const stampbooks = accountData?.books || [];
  const book = stampbooks[index];

  if (!book) {
    Alert.alert('Error', 'Stampbook not found.');
    return null;
  }

  const pages = book.pages;
  let pagesList: Page[] | ScaffoldedPage[] = []
  let letterList: string[] = []
  let indexList: number[] = []
  let ind = index
  let letters = []
    if (pages) {

        letters = Object.keys(pages);

        letters.forEach((letter) => {
            const letterPages = pages[letter]; // Pages under the current letter
            letterPages.forEach((page, index) => {
            pagesList.push(page);      // Add the page to the list
            letterList.push(letter);   // Add the letter associated with this page
            indexList.push(index);     // Add the index of the page within the letter
            });
        });
    }

  const [selectedLetterIndex, setSelectedLetterIndex] = useState(0); // State for tracking the spinner

  // Flags to prevent reciprocal updates
  const isScrollViewProgrammatic = useRef(false);
  const isFlatListProgrammatic = useRef(false);

  // Handle FlatList's momentum scroll end
  const handleFlatListMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isFlatListProgrammatic.current) {
        isFlatListProgrammatic.current = false;
        return;
      }

      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);
      const letterIndex = Math.floor(index / 5);

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


  const renderItem = ({ item, index }: { item: Page | ScaffoldedPage, index: number }) => {
    // Type guard to check if the item is of type Page
    const isPage = (item: Page | ScaffoldedPage): item is Page => {
      return 'photo_url' in item;
    };
  
    const handleOpenEditor = () => {
      const currLetter = letterList[index];
      const currIndex = indexList[index];
        router.push({
          pathname:  '/emptyeditor',
          params: {
            ind: ind,
            currLetter: currLetter,
            currIndex: currIndex,
          },
        });
    };
  
    if (isPage(item)) {
      return (
        <TouchableOpacity style={styles.pageContainer} onPress={handleOpenEditor}>
          <View style={styles.page}>
            <Text>{item.location_name}</Text>
            <Image style={styles.image} source={{ uri: item.photo_url }} borderRadius={15} />
            <DraggableImage
                key={item.stamp_url}
                imageUri={item.stamp_url}
                readonly
                transformations={item.stamp_transformation}
            />
          </View>
        </TouchableOpacity>
      );
    } else {
      // Render for ScaffoldedPage type
      return (
        <TouchableOpacity style={styles.pageContainer} onPress={handleOpenEditor}>
          <View style={styles.page}>
                <Text>{item.location_name}</Text>
                <Feather name="map-pin" size={50} color="#000" />
          </View>
        </TouchableOpacity>
      );
    }
  };

  const footerComponent = () => {
    return (
        <TouchableOpacity style={styles.pageContainer} onPress={() => {}}>
          <View style={styles.page}>
            <Text>Add your own stamp!</Text>
            <Feather name="camera" size={50} color="#888" />          
          </View>
        </TouchableOpacity>
      );
  }
  

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={pagesList}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.location_name}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth} // Ensure snapping happens per page width
        decelerationRate="fast"
        onMomentumScrollEnd={handleFlatListMomentumEnd}
        initialScrollIndex={0} // Reset to the first page of the selected letter
        ListFooterComponent={footerComponent}
      />
    </View>
  );
};

export default SimpleBook;

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
  image: {
    position: 'absolute',
    width: 300,
    height: 500,
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