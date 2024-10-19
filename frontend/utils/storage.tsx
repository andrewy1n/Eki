// utils/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stampbook } from '../models/Stampbook';
import { Alert } from 'react-native';

// Save all stampbooks to AsyncStorage
export const savePagesToStorage = async (stampbooks: Stampbook[]) => {
  try {
    await AsyncStorage.setItem('stampbooks', JSON.stringify(stampbooks));
  } catch (error) {
    console.error('Error saving stampbooks to storage:', error);
    Alert.alert('Error', 'Failed to save stampbooks locally.');
  }
};

// Retrieve all stampbooks from AsyncStorage
export const getPagesFromStorage = async (): Promise<Stampbook[]> => {
  try {
    const stampbooks = await AsyncStorage.getItem('stampbooks');
    return stampbooks ? JSON.parse(stampbooks) : [];
  } catch (error) {
    console.error('Error retrieving stampbooks from storage:', error);
    Alert.alert('Error', 'Failed to retrieve stampbooks locally.');
    return [];
  }
};

// Additional utility functions as needed...
