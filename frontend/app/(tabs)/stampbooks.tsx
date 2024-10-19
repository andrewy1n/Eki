import React from 'react';
import { Keyboard, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons'; // For using icons

export default function MapScreen() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
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
        {/* Rest of the content */}
        <Text style={styles.title}>Welcome to React Native</Text>
        <Text style={styles.subtitle}>
          This is a simple screen using traditional styling.
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Ensure space for top elements
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
    borderColor: '#ddd',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});
