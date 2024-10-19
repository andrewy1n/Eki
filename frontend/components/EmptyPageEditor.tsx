// app/pageeditor.tsx

import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DraggableImage from '../components/DraggableImage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PagesContext } from '../context/PagesContext';
import { Page, Stamp } from '../models/Page';
import uuid from 'react-native-uuid';
import * as Location from 'expo-location';

const PageEditor: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pageId, stampbookId } = useLocalSearchParams<{ pageId: string; stampbookId: string }>();
  const { stampbooks, updatePage, addPage, addStamp, addLocation } = useContext(PagesContext);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [stampUri, setStampUri] = useState<string | null>(null);

  useEffect(() => {
    if (!pageId || !stampbookId) {
      Alert.alert('Error', 'No page ID or stampbook ID provided.');
      router.back();
      return;
    }

    // Find the stampbook
    const stampbook = stampbooks.find((sb) => sb.id === stampbookId);
    if (!stampbook) {
      Alert.alert('Error', 'Stampbook not found.');
      router.back();
      return;
    }

    // Find or create the page
    let existingPage = stampbook.pages.find((page: Page) => page.id === pageId);
    if (!existingPage) {
      const newPage: Page = {
        id: pageId,
        stampbookId: stampbookId,
        imageUri: null,
        stamps: [],
        notes: '',
        location: null,
        stamped: false,
      };
      addPage(stampbookId, newPage);
      existingPage = newPage;
    }

    // Set initial state from the existing page
    setImageUri(existingPage.imageUri);
    setNotes(existingPage.notes);
    setLocation(existingPage.location);
    // Stamps are handled separately via addStamp
  }, [pageId, stampbookId, stampbooks, addPage, router]);

  const handleTakePicture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Camera access is required to take pictures.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePlacePicture = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Media library access is required to select pictures.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permissions are required to add location info.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      addLocation(stampbookId, pageId, {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not fetch location.');
    }
  };

  const handleSavePage = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'No image to save.');
      return;
    }

    const stampbook = stampbooks.find((sb) => sb.id === stampbookId);
    if (stampbook) {
      const existingPage = stampbook.pages.find((page: Page) => page.id === pageId);
      if (existingPage) {
        const updatedPage: Page = {
          ...existingPage,
          imageUri: imageUri,
          notes: notes,
          location: location,
          stamped: true,
          // Stamps are already handled via addStamp
        };

        updatePage(stampbookId, updatedPage);

        Alert.alert('Success', 'Page saved successfully.');
        router.back();
      } else {
        Alert.alert('Error', 'Page not found.');
      }
    } else {
      Alert.alert('Error', 'Stampbook not found.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back-sharp" size={30} color="#000" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Editing Page: {pageId}</Text>

      {/* Image or Placeholder */}
      {imageUri ? (
        <DraggableImage
          imageUri={imageUri}
          borderRadius={15}
          readonly={false}
          onUpdateTransformations={(transform) => {
            // Implement as per your data model
          }}
        />
      ) : (
        <>
          {/* Camera Icon with Dotted Border */}
          <TouchableOpacity
            style={styles.cameraContainer}
            onPress={handleTakePicture}
            accessibilityLabel="Take a picture with the camera"
          >
            <Feather name="camera" size={50} color="#000" />
          </TouchableOpacity>

          {/* Place Picture on Page Button */}
          <TouchableOpacity
            style={styles.placeButton}
            onPress={handlePlacePicture}
            accessibilityLabel="Place a picture on the page from your gallery"
          >
            <Text style={styles.placeButtonText}>Place Picture on Page</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Notes Input */}
      <View style={styles.notesContainer}>
        <TextInput
          style={styles.notesInput}
          placeholder="Add your notes here..."
          value={notes}
          onChangeText={(text) => setNotes(text)}
          multiline
        />
      </View>

      {/* Location Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={handleGetLocation}
        accessibilityLabel="Add your current location"
      >
        <Text style={styles.locationButtonText}>
          {location
            ? `Location: ${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`
            : 'Add Location'}
        </Text>
      </TouchableOpacity>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSavePage}
        accessibilityLabel="Save the current page"
      >
        <Text style={styles.saveButtonText}>Save Page</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PageEditor;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 10, // Adjusted to account for insets
    left: 20,
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cameraContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  placeButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    width: width * 0.8,
    alignItems: 'center',
  },
  placeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notesContainer: {
    width: '80%',
    marginTop: 20,
  },
  notesInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
  },
  locationButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    width: width * 0.8,
    alignItems: 'center',
    marginTop: 20,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: width * 0.8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
