// EmptyEditor.tsx (Corrected)
import React, { useState, useCallback, useEffect } from 'react';
import {
  Image,
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
  ActivityIndicator,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Transformations } from '../models/Page';
import { genStamp, createStamp, uploadPhoto } from '@/utils/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccountContext } from '@/context/AccountContext';
import { Stampbook } from '../models/Stampbook';
import DraggableImage from '@/components/DraggableImage';

const EmptyEditor: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ind, currLetter, currIndex } = useLocalSearchParams<{ ind: string, currLetter: string, currIndex: string }>();
  
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { accountData } = useAccountContext();
  
  const [bookid, setBookid] = useState<string>('');
  const [location_name, setLocation_name] = useState<string>('');
  const [geocode, setGeocode] = useState<{ lat: number, lng: number }>({ lat: 10, lng: 10 });
  const [photo_url, setPhoto_url] = useState<string>('');
  const [stamp_url, setStamp_url] = useState<string>('');
  const [stamp_size, setStamp_size] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
  
  const [stamp_transformation, setStamp_transformation] = useState<Transformations>({
    position: {
      x: 0,
      y: 0,
    },
    scale: 1.0,
    rotation: 0,
  });

  const books: Stampbook[] = accountData?.books || [];
  const i = Number(ind);
  const currentIndex = Number(currIndex);

  useEffect(() => {
    if (isNaN(i) || i < 0 || i >= books.length) {
      Alert.alert('Error', 'No valid stampbook index provided.');
      router.back();
      return;
    }
    const page = books[i].pages[currLetter]?.[currentIndex];
    if (!page) {
      Alert.alert('Error', 'No page found for the given letter and index.');
      router.back();
      return;
    }
    const bkid = String(books[i].id);
    const locnam = String(page.location_name);
    const geoc = {
      lat: 10,
      lng: 10,
    };
    setNotes(page?.notes || '');
    setBookid(bkid);
    setLocation_name(locnam);
    setGeocode(geoc);
  }, [ind, books, router, currLetter, currentIndex, i]);

  const handleUpdateStampTransformations = (transform: any) => {
    setStamp_transformation(transform);
  };

  const handleTakePicture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Camera access is required to take pictures.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    if (!result.canceled) {
      setPhoto_url(result.assets[0].uri);
      // After the image is taken, run genStamp and show loading
      await handleGenerateStamp(result.assets[0].uri);
    }
  };

  const handleGenerateStamp = async (refImg: string) => {
    if (!refImg) {
      Alert.alert('Error', 'No image available for generating a stamp.');
      return;
    }
  
    // Show loading indicator
    setIsLoading(true);
  
    const result = await genStamp(refImg);
    
    if (result) {
      console.log('Stamp generated successfully:', result);
      setStamp_url(result.image_url);
      console.log(result.image_url);
    } else {
      Alert.alert('Error', 'Failed to generate the stamp.');
    }
  
    // Hide loading indicator
    setIsLoading(false);
  };

  const handleSavePage = async () => {
    const uid = await AsyncStorage.getItem('uid');

    if (!uid) {
      Alert.alert('Error', 'User ID not found.');
      return;
    }
    const response = await uploadPhoto(photo_url);
    if (response.download_url) {
      setPhoto_url(response.download_url)
    }
    const result = await createStamp(uid, bookid, location_name, geocode, response.download_url, stamp_url, stamp_size, stamp_transformation, notes);
    if (result) {
      router.back();
      Alert.alert("Saved!");
    } else {
      Alert.alert("Save Failed");
    }
  };

  useEffect(() => {
    console.log('Current Stamp Transformations:', stamp_transformation);
  }, [stamp_transformation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Generating Stamp...</Text>
      </View>
    );
  }

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
            {stamp_url && (
              <TouchableOpacity style={styles.saveButton} onPress={handleSavePage}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {photo_url ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: photo_url }} style={styles.staticImage} />
                { stamp_url ? (
                  <View style={styles.imageOverlay}>
                    <DraggableImage
                      imageUri={stamp_url}
                      borderRadius={15}
                      transformations={stamp_transformation}
                      onUpdateTransformations={(transform: Transformations) => handleUpdateStampTransformations(transform)}
                    />
                  </View>
                ) : (
                  <Text style={styles.errorText}>Failed to load stamp.</Text>
                )}
              </View>
            ) : (
              <TouchableOpacity style={styles.cameraContainer} onPress={handleTakePicture}>
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
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default EmptyEditor;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
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
    paddingLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingRight: 30, // Adjust padding to center the title
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
    width: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staticImage: {
    width: 350,
    height: '90%',
    borderRadius: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#f9f9f9'
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});
