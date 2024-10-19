import React from 'react';
import { FlatList, Keyboard, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons'; // For using icons

const bookData = [
  { id: '1', city: 'Seattle', state: 'Washington' },
  { id: '2', city: 'Los Angeles', state: 'California' },
  { id: '3', city: 'City', state:'State' },
  { id: '4', city: 'City', state:'State' },
  { id: '5', city: 'City', state:'State' },
  { id: '6', city: 'City', state:'State' },
];

type BookCoverProps = {
  city: string;
  state: string;
};

const BookCover: React.FC<BookCoverProps> = ({ city, state }) => (
  <View style={styles.bookContainer}>
    <View style={styles.bookCover}> 
      <View style={styles.bookBinding} />
    </View>
    <Text style={styles.title}>{city}</Text>
    <Text style={styles.subtitle}>{state}</Text>
  </View>
);

export default function MapScreen() {
  return (
    <View style={styles.container}>
      {/* Wrap only the search bar */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.topRow}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.plusButton}>
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>

      {/* Stampbooks */}
      <FlatList
        data={bookData}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={[styles.bookGrid, { paddingBottom: 30 }]}
        renderItem={({ item }) => <BookCover city={item.city} state={item.state} 
      />}
      />
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
    flex: 1,
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
  bookTitle: {
    marginTop: 5,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  bookBinding: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 0,
    backgroundColor: 'black',
    zIndex: 2,
  },
});
