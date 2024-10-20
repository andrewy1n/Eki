import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import LocationSearch from '@/components/LocationSearch';
import { createScrapbook, getAttractions } from '@/utils/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; cityState?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [attractions, setAttractions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission Denied: Location access is required to display the map.');
        setLoading(false);
        return;
      }

      try {
        let loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(loc);

        const [place] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        const cityState = place ? `${place.city}, ${place.region}` : undefined;

        setSelectedLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          cityState,
        });
      } catch (error) {
        setErrorMsg('Failed to get your location. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLocationSelect = (locationData: { latitude: number; longitude: number; cityState: string }) => {
    setSelectedLocation(locationData);
  };

  const handleCreateScrapbook = async () => {
    if (!selectedLocation || !selectedLocation.cityState) {
      Alert.alert('No Location Selected', 'Please search and select a location before creating the scrapbook.');
      return;
    }

    const id = await AsyncStorage.getItem('uid');
    const [city, state] = selectedLocation.cityState.split(',').map((s) => s.trim());

    if (!city || !state || !id) {
      Alert.alert('Error', 'User ID or location information is missing.');
      return;
    }

    setIsCreating(true);

    try {
      const attractionData = await getAttractions(id, city, state);

      if (attractionData && attractionData.places) {
        const formattedAttractions = attractionData.places.map((place: any) => ({
          location_name: place.display_name,
          geocode: {
            lat: place.geocode.lat,
            lng: place.geocode.lng,
          },
        }));

        setAttractions(attractionData.places);

        const success = await createScrapbook(id, city, state, formattedAttractions);
        if (success) {
          console.log('Scrapbook created for', selectedLocation.cityState);
        } else {
          Alert.alert('Error', 'Failed to create scrapbook.');
        }
      } else {
        Alert.alert('Error', 'Failed to get attractions or none exist.');
      }
    } catch (error) {
      console.error('Error creating scrapbook:', error);
      Alert.alert('Error', 'Failed to create scrapbook.');
    } finally {
      setIsCreating(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open link: ', err));
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </View>

        {location ? (
          <MapView
            style={styles.map}
            region={{
              latitude: selectedLocation?.latitude || location.coords.latitude,
              longitude: selectedLocation?.longitude || location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker
              coordinate={{
                latitude: selectedLocation?.latitude || location.coords.latitude,
                longitude: selectedLocation?.longitude || location.coords.longitude,
              }}
              title={selectedLocation ? 'Selected Location' : 'You are here'}
              description={selectedLocation ? 'This is the location you selected.' : 'Your current location'}
            />

            {attractions.map((attraction, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: attraction.geocode.lat,
                  longitude: attraction.geocode.lng,
                }}
                pinColor='blue'
              >
                <Callout>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{attraction.display_name}</Text>
                    <Text>{attraction.formatted_address}</Text>
                    <Text>Google Rating: {attraction?.rating || 'Not Available'}</Text>
                    <Image
                      source={{ uri: attraction.photo_uri }}
                      style={styles.calloutImage}
                    />
                    <TouchableOpacity onPress={() => openLink(attraction.google_maps_uri)}>
                      <Text style={styles.calloutLink}>Visit Website</Text>
                    </TouchableOpacity>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        ) : (
          <Text>Location not found</Text>
        )}

        <TouchableOpacity style={styles.createButton} onPress={handleCreateScrapbook} disabled={isCreating}>
          {isCreating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Scrapbook</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  createButton: {
    position: 'absolute',
    bottom: 40,
    left: 120,
    right: 120,
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calloutContainer: {
    width: 150,
    alignItems: 'center',
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  calloutLink: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});
