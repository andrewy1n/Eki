// components/StampbookScreen.tsx

import React, { useContext } from 'react';
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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import { PagesContext } from '@/context/PagesContext';
import { Stampbook } from '@/models/Stampbook';

const { width: screenWidth } = Dimensions.get('window');
const modalWidth = screenWidth * 0.8;

// Define the City interface
interface City {
  id: string;
  city: string;
  state: string;
}

const StampbookScreen: React.FC = () => {
  const { stampbooks, addStampbook } = useContext(PagesContext);
  const [query, setQuery] = React.useState('');
  const [filteredData, setFilteredData] = React.useState<Stampbook[]>(stampbooks);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalSearchQuery, setModalSearchQuery] = React.useState('');
  const [filteredModalCities, setFilteredModalCities] = React.useState<City[]>([]); // Updated type
  const router = useRouter();

  // Define availableCities as City[]
  const availableCities: City[] = [
    { id: 'stampbook-4', city: 'New York', state: 'New York' },
    { id: 'stampbook-5', city: 'Chicago', state: 'Illinois' },
    // Add more cities as needed
  ];

  React.useEffect(() => {
    setFilteredData(
      stampbooks.filter(item =>
        item.city.toLowerCase().includes(query.toLowerCase()) ||
        item.state.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, stampbooks]);

  const handleModalCitySearch = (text: string) => {
    setModalSearchQuery(text);
    const filtered: City[] = availableCities.filter(city =>
      city.city.toLowerCase().includes(text.toLowerCase()) ||
      city.state.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredModalCities(filtered);
  };

  const closeModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.topRow}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search Stampbooks"
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
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
        renderItem={({ item }) => (
          <BookCover city={item.city} state={item.state} id={item.id} />
        )}
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
              value={modalSearchQuery}
              onChangeText={handleModalCitySearch}
            />
          </View>

          <FlatList
            data={filteredModalCities} // Correctly typed as City[]
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                  // Handle adding a new stampbook
                  addStampbook({
                    id: item.id,
                    city: item.city,
                    state: item.state,
                    pages: [], // Include the 'pages' property
                  });
                  closeModal();
                }}
              >
                <Text style={styles.suggestionText}>{`${item.city}, ${item.state}`}</Text>
              </TouchableOpacity>
            )}
          />
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

type BookCoverProps = {
  city: string;
  state: string;
  id: string;
};

const BookCover: React.FC<BookCoverProps> = ({ city, state, id }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: '/stamppages',
          params: { stampbookId: id },
        })
      }}
      style={styles.bookContainer}
    >
      <View style={styles.bookCover}>
        <View style={styles.bookBinding} />
      </View>
      <Text style={styles.title}>{city}</Text>
      <Text style={styles.subtitle}>{state}</Text>
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
