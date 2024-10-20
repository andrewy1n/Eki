// components/StampbookScreen.tsx

import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import { Stampbook } from '@/models/Stampbook';
import { useAccountContext } from '@/context/AccountContext';
import { useAccount } from '@/hooks/useAccount';
import { City, useCitySearch } from '@/hooks/useCitySearch';
import { createScrapbook } from '@/utils/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { testStampbooks } from '@/data/testData';
import { Image } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const modalWidth = screenWidth * 0.8;

const StampbookScreen: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const { accountData } = useAccountContext();
  const { getAccountData } = useAccount();
  const [filteredData, setFilteredData] = useState<Stampbook[]>(accountData?.books || []);
  const [modalVisible, setModalVisible] = useState(false);
  const { searchCities, searchText, filteredCities} = useCitySearch();
  const [refreshing, setRefreshing] = useState(false);

  const books = accountData?.books || []

  useEffect(() => {
    onRefresh();
  }, [])

  const onRefresh = async () => {
    setRefreshing(true);
    await getAccountData();
    setRefreshing(false);
};

  useEffect(() => {
    setFilteredData(accountData?.books || [])
  }, [accountData])

  const closeModal = async () => {
    Keyboard.dismiss();
    setModalVisible(false);
  };

  const handleSelectCity = async (city: City & { state: string }) => {
    const uid = await AsyncStorage.getItem('uid')
    await createScrapbook(uid || '', city.name, city.state);
    closeModal();
  }

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.topRow}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search Stampbooks"
            placeholderTextColor="#666"
            value={query}
            onChangeText={(text) => {
              setQuery(text)
              if (text) {
                setFilteredData(
                  books.filter(item =>
                    item.city.toLowerCase().includes(query.toLowerCase()) ||
                    item.state.toLowerCase().includes(query.toLowerCase())
                  )
                );
              }
            }}
          />
          <TouchableOpacity style={styles.plusButton} onPress={() => setModalVisible(true)}>
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={[styles.bookGrid, { paddingBottom: 30 }]}
        renderItem={({ item, index }) => (
          <BookCover item={item} index={index} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Modal for Adding New Stampbook */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={closeModal}
        avoidKeyboard={true}
        backdropOpacity={0.5}
        style={styles.modalStyle}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContent}
        >
          {/* 'X' Close Icon */}
          <TouchableOpacity style={styles.closeIcon} onPress={closeModal} accessibilityLabel="Close modal">
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>

          {/* Header with Black Background */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Add New Stampbook</Text>
            <TextInput
              style={styles.modalSearchBar}
              placeholder="Enter City"
              placeholderTextColor="#ccc"
              value={searchText}
              onChangeText={searchCities}
            />
          </View>

          <FlatList
            data={filteredCities}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectCity(item)}
              >
                <Text style={styles.suggestionText}>{`${item.name}, ${item.state}`}</Text>
              </TouchableOpacity>
            )}
          />
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const BookCover: React.FC<{ item: Stampbook, index: number }> = ({ item, index }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: '/stamppages',
         params: { index: index },
        })
      }}
      style={styles.bookContainer}
    >
      <View style={styles.bookCover}>
        <Image source={{uri: item.cover}} style={{flex: 1, width: "100%", height: "100%"}}/>
        <View style={styles.bookBinding} />
      </View>
      <Text style={styles.title}>{item.city}</Text>
      <Text style={styles.subtitle}>{item.state}</Text>
    </TouchableOpacity>
  );
};

export default StampbookScreen;

// Styles remain the same...


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f2f2f2',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  plusButton: {
    width: 40,
    height: 40,
    backgroundColor: 'black',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 3,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  bookGrid: {
    paddingHorizontal: 10,
  },
  bookContainer: {
    flexBasis: '45%',
    margin: 10,
    alignItems: 'center',
  },
  bookCover: {
    width: '100%',
    height: 250,
    backgroundColor: '#d3d3d3',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBinding: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'black',
    zIndex: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Masking effect
  },
  modalContent: {
    width: modalWidth, // Set to 80% of screen width
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'relative', // To position the 'X' icon absolutely within the modal
    paddingBottom: 20, // Additional padding at the bottom
    overflow: 'hidden', // Ensure children don't overflow the border radius
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1, // Ensure the icon appears above other elements
  },
  modalHeader: {
    backgroundColor: 'black',
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalHeaderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSearchBar: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 10,
    color: '#fff',
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  modalStyle: {
    alignItems: 'center',
    margin: 0,
  },
  devButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
