import { useAccountContext } from '@/context/AccountContext';
import { useAccount } from '@/hooks/useAccount';
import { useUploadPhoto } from '@/hooks/useUploadPhoto';
import { updateAccount } from '@/utils/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { UpdateAccountData } from '@/models/Account';

export default function ProfileScreen() {
  const { getAccountData } = useAccount();
  const { accountData } = useAccountContext();
  const { pickImage, uploadPhoto } = useUploadPhoto();
  
  const [bio, setBio] = useState('');
  const [imageURI, setImageURI] = useState(accountData?.profile_photo || 'https://via.placeholder.com/80');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    getAccountData();
  }, []);

  useEffect(() => {
    if (accountData) {
      setBio(accountData.bio || '');
      setImageURI(accountData.profile_photo || 'https://via.placeholder.com/80');

    }
  }, [accountData]);

  if (!accountData) {
    return null;
  }

  const handleUpdatePhoto = async () => {
    const imageInfo = await pickImage();

    if (!imageInfo) { 
      return;
    }

    const imageURL = await uploadPhoto(imageInfo);
    
    if (!imageURL) {
      return;
    }
    const id = await AsyncStorage.getItem('uid');

    if (accountData) {
      accountData.profile_photo = imageURL;
      setImageURI(imageURL);
    }

    const updateData: UpdateAccountData = {
      profile_photo: imageURL,
      bio: bio || ''
    };

    await updateAccount(id || '', updateData);
  };

  const handleBioUpdate = async () => {
    const id = await AsyncStorage.getItem('uid');
    const updateData: UpdateAccountData = {
      profile_photo: accountData.profile_photo || '',
      bio: bio || ''
    };

    await updateAccount(id || '', updateData);
  };

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{accountData.display_name}</Text>
      <TouchableOpacity style={styles.imageContainer} onPress={handleUpdatePhoto}>
        <Image
            source={{ uri: imageError ? 'https://via.placeholder.com/80' : imageURI }}
            style={styles.profilePicture}
            onError={handleImageError}
        />
      </TouchableOpacity>
      <TextInput
        style={styles.bioInput}
        value={bio}
        onChangeText={setBio}
        onSubmitEditing={handleBioUpdate}
        placeholder="Edit your bio..."
      />
      <Text style={styles.subtitle}>{accountData.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  imageContainer: {
    position: 'absolute',
    top: '32%', // Adjust as needed
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, // For Android shadow
  },
  profilePicture: {
      width: 100,
      height: 100,
      borderWidth: 4,
      borderColor: 'white',
      borderRadius: 50,
  },
  bioInput: {
    marginTop: 20,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    width: '80%',
    textAlign: 'center',
  },
  cameraButton: {
      position: 'absolute',
      right: '5%',
      bottom: '5%',
      width: 25,
      height: 25,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      borderRadius: 50,
      shadowColor: '#000',
      shadowOffset: {
          width: 0,
          height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  }
});