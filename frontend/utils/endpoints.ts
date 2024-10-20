import { CreateAccountData, UpdateAccountData } from '@/models/Account';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios, { AxiosRequestConfig } from 'axios';

const backendClientConfig: AxiosRequestConfig = {
    baseURL: 'https://8360-50-234-175-131.ngrok-free.app',
};

export const backendClient = axios.create(backendClientConfig);

export const createAccount = async (accoundData: CreateAccountData) => {
    try {
        const headers = {
            'Content-Type': 'application/json'
        }

        const response = await backendClient.post('/auth/create', accoundData, {
            headers: headers
        });

        await AsyncStorage.setItem('uid', response.data.user_id)
        console.log(response.data);
    
        return true;
    } catch (error: any) { 
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        } else {
            console.error('Unexpected error:', error);
        }

        return false;
    }
};

export const updateAccount = async (uid: string, accountData: UpdateAccountData) => {
    try {
      const response = await backendClient.post('/account/update', accountData, {
        params: {
            uid: uid
        }
      });
  
      console.log(response.data)
      
      return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        } else {
            console.error('Unexpected error:', error);
        }

        return false;
    }
};

export const createScrapbook = async (uid: string, city: string, state: string, attractions?: { name: string; geocode: { lat: number; lng: number } }[]) => {
    try {
      const data = {
        city: city,
        state: state,
        attractions: attractions || [],
        uid: uid,
      }

      console.log(data);

      const response = await backendClient.post('/stampbook/create', data);
  
      console.log(response.data)
      
      return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        } else {
            console.error('Unexpected error:', error);
        }

        return false;
    }
};

export const getAttractions = async (uid: string, city: string, state:string, keywords?: string) => {
    try {
        console.log(keywords);
      const response = await backendClient.get('/travel/rec', {
        params: {
            city: city,
            state: state,
            keywords: keywords,
            uid: uid,
        },
      });
  
      console.log('Attractions Data: ', response.data)
      
      return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        } else {
            console.error('Unexpected error:', error);
        }

        return false;
    }
};

export const createStamp = async (uid: string, bookid: string, location_name:string, geocode: {lat: number, lng: number}, photo_url: string, stamp_url: string, stamp_size:{width: number, height: number}, stamp_transformation: {position: {x: number, y: number}, scale: number, rotation: number}, notes: string | null) => {
    try {
        const data = {
          uid: uid,
          bookid: bookid,
          location_name: location_name,
          geocode: geocode,
          photo_url: photo_url,
          stamp_url: stamp_url,
          stamp_size: stamp_size,
          stamp_transformation: stamp_transformation,
          notes: notes,
        }
  
        console.log(data);
  
        const response = await backendClient.post('/stampbook/create-stamp', data);
    
        console.log(response.data)
        
        return true;
      } catch (error) {
          if (axios.isAxiosError(error)) {
              console.error('Axios error:', {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data,
          });
          } else {
              console.error('Unexpected error:', error);
          }
  
          return false;
      }
};

export const genStamp = async (refImg: string) => {
    try {
      // Create FormData to hold the image
      const formData = new FormData();
      formData.append('reference_image', {
        uri: refImg,
        name: 'reference_image.jpg',
        type: 'image/jpeg', // Adjust if needed
      });
  
      // Optional: Log the FormData content for debugging
      // Note: Logging FormData directly won't show its content; consider logging the URI instead
      console.log('Sending FormData with image URI:', refImg);
  
      const response = await backendClient.post('/stampbook/generate-stamp-image', formData, {
        // Do not manually set 'Content-Type'; let Axios handle it
        // headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('Stamp Link:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        console.error('Unexpected error:', error);
      }
  
      return false;
    }
  };

  export const uploadPhoto = async (refImg: string) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: refImg,
        name: 'reference_image.jpeg',
        type: 'image/jpeg', // Adjust if needed
      });
  
      console.log('Sending FormData with image URI:', refImg);
  
      const response = await backendClient.post('/upload-photo', formData, {
        // Do not manually set 'Content-Type'; let Axios handle it
        // headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('Image Link:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        console.error('Unexpected error:', error);
      }
  
      return;
    }
  };
