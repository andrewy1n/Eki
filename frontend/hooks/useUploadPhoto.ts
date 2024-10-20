import { useState } from 'react';
import { Alert } from 'react-native';
import { AxiosRequestConfig } from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { backendClient } from '@/utils/endpoints';

interface ImageInfo {
    uri: string;
    name: string;
    type: string;
}

export const useUploadPhoto = () => {
    const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please grant permission to access media library');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const newImageInfo: ImageInfo = {
                uri: asset.uri,
                name: asset.fileName || 'image.jpg',
                type: asset.type || 'image/jpeg',
            };
            setImageInfo(newImageInfo);

            return newImageInfo;
        }
    };

    const uploadPhoto = async (imageInfo: ImageInfo | null): Promise<string | undefined> => {
        const formData = new FormData();

        formData.append('file', imageInfo as any);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: '/upload-photo',
            data: formData,
        };

        try {
            const response = await backendClient(config);

            return response.data.download_url;
        } catch (error) {
            console.error(error);
        }
    };

    return {
        uploadPhoto,
        pickImage,
        imageInfo,
        setImageInfo
    };
};