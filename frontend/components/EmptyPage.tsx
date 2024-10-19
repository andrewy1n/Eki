// components/EmptyPage.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface EmptyPageProps {
  title: string;
  onStamp: (imageUri: string) => void;
}

const EmptyPage: React.FC<EmptyPageProps> = ({ title, onStamp }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Function to take a picture
  const takePicture = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to take pictures.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setCapturedImage(imageUri);
    }
  };

  // Function to place the captured picture on the page
  const placePictureOnPage = () => {
    if (capturedImage) {
      onStamp(capturedImage);
      setCapturedImage(null); // Reset after stamping
    } else {
      Alert.alert('No Image', 'Please take a picture before placing it on the page.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* Display the captured image preview */}
      {capturedImage && (
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />
      )}

      <TouchableOpacity style={styles.button} onPress={takePicture}>
        <Text style={styles.buttonText}>Take Picture</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !capturedImage && styles.disabledButton]}
        onPress={placePictureOnPage}
        disabled={!capturedImage}
      >
        <Text style={styles.buttonText}>Place Picture on Page</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '70%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#90CAF9',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
