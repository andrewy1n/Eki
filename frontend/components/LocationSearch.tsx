import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  StyleSheet,
} from 'react-native';
import * as Location from 'expo-location'; // For geocoding and location services
import jsonData from '@/countries+states+cities.json';
import { City, Country } from '@/models/Location';

interface LocationSearchProps {
  onLocationSelect: (locationData: { latitude: number; longitude: number; cityState: string }) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredCities, setFilteredCities] = useState<(City & { state: string })[]>([]);
  const [searchActive, setSearchActive] = useState(false); // Track whether the search is active

  const countriesData: Country[] = jsonData as Country[];

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 2) {
      const filtered = countriesData[0].states.reduce((acc, state) => {
        const matchingCities = state.cities
          .filter((city) => city.name.toLowerCase().includes(text.toLowerCase()))
          .map((city) => ({ ...city, state: state.name }));
        return acc.concat(matchingCities);
      }, [] as (City & { state: string })[]);

      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  };

  const handleSelectCity = async (city: City & { state: string }) => {
    try {
      const geocode = await Location.geocodeAsync(`${city.name}, ${city.state}`);
      if (geocode && geocode.length > 0) {
        onLocationSelect({
          latitude: geocode[0].latitude,
          longitude: geocode[0].longitude,
          cityState: `${city.name}, ${city.state}`, // Pass city and state string
        });
        dismissKeyboard(); // Close the keyboard when a city is selected
        onClose(); // Close the suggestions box when a city is selected
      } else {
        Alert.alert('Error', 'Geocode not found for this city');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to retrieve geocode');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss(); // Function to dismiss the keyboard
  };

  const onClose = () => {
    setSearchText('');
    setFilteredCities([]);
    setSearchActive(false); // Close the search suggestions
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.input}
              placeholderTextColor={'#afafaf'}
              placeholder="Search for a city"
              value={searchText}
              onChangeText={handleSearch}
              onFocus={() => setSearchActive(true)} // Activate the search
            />
          </View>
          {searchText.length > 2 && searchActive && (
            <View style={styles.suggestionsBox}>
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => `${item.name}-${item.state}`} // Unique key
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectCity(item)}
                    style={styles.cityItem}
                  >
                    <Text>{item.name}, {item.state}</Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Keep it at the top
    alignItems: 'center', // Align it in the center horizontally
    paddingTop: 40, // Push the search bar a bit lower
  },
  searchContainer: {
    width: '90%', // Set width to 90% of the screen
    alignItems: 'center',
  },
  searchBar: {
    width: '100%', // Full width search bar
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  suggestionsBox: {
    width: '100%',
    maxHeight: 150, // Limit the height of the suggestions box
    borderRadius: 15, // Rounded corners for the suggestions box
    backgroundColor: '#fff', // White background for better contrast
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5, // Space between search bar and suggestions
    overflow: 'hidden', // Clip the content to maintain rounded corners
  },
  cityItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default LocationSearch;
