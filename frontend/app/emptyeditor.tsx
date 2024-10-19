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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DraggableImage from '../components/DraggableImage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PagesContext } from '../context/PagesContext';
import { Page, Transformations } from '../models/Page';
import uuid from 'react-native-uuid';
import * as Location from 'expo-location';

const PageEditor: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pageId, stampbookId } = useLocalSearchParams<{
    pageId: string;
    stampbookId: string;
  }>();
  const { stampbooks, updatePage, addPage, addStamp, addLocation } = useContext(PagesContext);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [stampUri, setStampUri] = useState<string | null>(null);
  const [isPlaced, setIsPlaced] = useState(false); // New state to track if 'Place' button is pressed
  const [transformations, setTransformations] = useState<Transformations>({
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0,
  });
  const [imageTransformations, setImageTransformations] = useState<Transformations>({
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0,
  });
  
  const handleUpdateImageTransformations = (transform: Transformations) => {
    setImageTransformations(transform); // Update image transformations state
  };

  const handleUpdateTransformations = (transform: Transformations) => {
    setTransformations(transform); // Update state with the new transformations
  };


  // Function to place the picture (trigger the stamp)
  const handlePlacePicture = () => {
    if (!imageUri) {
      Alert.alert('Error', 'No image selected to place.');
      return;
    }
    setIsPlaced(true); // Mark the image as placed (stamped)
  };

  // // Function to reset stamping (undo the placement)
  // const handleUndoStamp = () => {
  //   setIsPlaced(false); // Reset placement
  // };

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
        imageTransformations: undefined,
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

  const handleGenerateStamp = () => {
    // Implement your generate stamp logic here
    Alert.alert('Generate Stamp', 'Stamp generated successfully.');
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
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back-sharp" size={30} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Editing Page</Text>
            {imageUri && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePage}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <DraggableImage
                  imageUri={imageUri}
                  borderRadius={15}
                  stamped={isPlaced}
                  transformations={imageTransformations}
                  onUpdateTransformations={(transform: Transformations) => {
                    handleUpdateImageTransformations(transform)
                  }}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.cameraContainer}
                onPress={handleTakePicture}
              >
                <Feather name="camera" size={50} color="#000" />
              </TouchableOpacity>
            )}

            {/* Notes Input */}
            <View style={styles.notesContainer}>
              <TextInput
                style={styles.notesInput}
                placeholder="Add your notes here..."
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholderTextColor="#666"
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {imageUri ? (
              <>
                {!isPlaced ? (
                  <TouchableOpacity
                    style={styles.placeButton}
                    onPress={handlePlacePicture} // Call the place function
                  >
                    <Text style={styles.placeButtonText}>Place</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                style={styles.generateStampButton}
                onPress={handleGenerateStamp}
              >
                <Text style={styles.generateStampButtonText}>Generate Stamp</Text>
              </TouchableOpacity>
                )}
              </>
            ) : (
              <></>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default PageEditor;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // White background
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    padding: 10,
  },
  saveButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    width: 250,
    height: 250,
    borderRadius: 10,
    borderWidth: 3,
    borderStyle: 'dotted',
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  notesContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f9f9f9',
  },
  notesInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
  },
  footer: {
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  placeButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  generateStampButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateStampButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
