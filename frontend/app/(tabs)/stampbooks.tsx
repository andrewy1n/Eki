import React, { useState } from 'react';
import { Modal, FlatList, Keyboard, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const bookData = [
  { id: '1', city: 'Seattle', state: 'Washington' },
  { id: '2', city: 'Los Angeles', state: 'California' },
  { id: '3', city: 'City', state:'State' },
]

const availableCities = [
  { id: '1', city: 'New York' },
  { id: '2', city: 'San Francisco' },
  { id: '3', city: 'Chicago' },
]

type BookCoverProps = {
  city: string;
  state: string;
  id: string;
}

const BookCover: React.FC<BookCoverProps> = ({ city, state, id }) => {
  const router = useRouter(); 
  
  return (
    <TouchableOpacity onPress={() => router.push({
      pathname: '/stamppages',
      params: { id, city, state },
    })}
      style={styles.bookContainer}
    >
        <View style={styles.bookCover}> 
          <View style={styles.bookBinding} />
        </View>
        <Text style={styles.title}>{city}</Text>
        <Text style={styles.subtitle}>{state}</Text>
    </TouchableOpacity>
  )
};

export default function StampbookScreen() {
  const [query, setQuery] = useState('');
  const [filteredData, setFilteredData] = useState(bookData);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [filteredModalCities, setFilteredModalCities] = useState(availableCities);
  const router = useRouter(); 

  const handleSearch = (text: string) => {
    setQuery(text);
    const filtered = bookData.filter(item =>
      item.city.toLowerCase().includes(text.toLowerCase()) ||
      item.state.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleModalCitySearch = (text: string) => {
    setModalSearchQuery(text);
    const filtered = availableCities.filter(city =>
      city.city.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredModalCities(filtered);
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.topRow}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            placeholderTextColor="#666"
            value={query}
            onChangeText={handleSearch}
          />
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => setModalVisible(true)}
          >
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={[styles.bookGrid, { paddingBottom: 30 }]}
        renderItem={({ item }) => <BookCover city={item.city} state={item.state} id={item.id}/>}
      />

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalSearchBar}
                placeholder="Search cities"
                placeholderTextColor="#666"
                value={modalSearchQuery}
                onChangeText={handleModalCitySearch}
              />
              <FlatList
                data={filteredModalCities}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionItem} onPress={() => {
                    // Handle adding a new stampbook
                    setModalVisible(false);
                  }}>
                    <Text>{item.city}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Masking effect
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalSearchBar: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'blue',
    fontSize: 16,
  },
});

