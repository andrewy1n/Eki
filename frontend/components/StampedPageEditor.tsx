// components/EmptyPageEditor.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather'; // For Camera Icon
import Ionicons from '@expo/vector-icons/Ionicons'; // For Back Icon
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets

interface EmptyPageEditorProps {
  pageId: string;
  onStamp?: (pageId: string, imageUri: string) => void; // Optional prop for stamping
}

const EmptyPageEditor: React.FC<EmptyPageEditorProps> = ({
  pageId,
  onStamp,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Retrieve safe area insets

  // Function to handle taking a picture using the camera
  const handleTakePicture = async () => {
    // Implement the functionality to take a picture
    Alert.alert('Take Picture', `Take picture for page ${pageId}`);
    // After taking picture, navigate back or perform other actions
    router.back();
  };

  // Function to handle placing a picture from the gallery
  const handlePlacePicture = () => {
    // Implement the functionality to place a picture on the page
    Alert.alert('Place Picture', `Place picture on page ${pageId}`);
    // After placing picture, navigate back or perform other actions
    router.back();
  };

  // Function to handle back navigation
  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="chevron-back-sharp" size={30} color="#000" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Editing Empty Page: {pageId}</Text>

      {/* Camera Icon with Dotted Border */}
      <TouchableOpacity style={styles.cameraContainer} onPress={handleTakePicture}>
        <Feather name="camera" size={50} color="#000" />
      </TouchableOpacity>

      {/* Place Picture on Page Button */}
      <TouchableOpacity style={styles.placeButton} onPress={handlePlacePicture}>
        <Text style={styles.placeButtonText}>Place Picture on Page</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyPageEditor;

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
    marginBottom: 40,
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
    width: '80%',
    alignItems: 'center',
  },
  placeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
