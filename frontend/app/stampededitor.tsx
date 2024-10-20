// app/stampededitor.tsx
import DraggableImage from '@/components/DraggableImage'
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Page, Stamp } from '../models/Page';

const StampedEditor: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pageId, stampbookId } = useLocalSearchParams<{
    pageId: string;
    stampbookId: string;
  }>();
  const [imageSize, setImageSize] = useState<{ width: number; height: number; } | undefined>(undefined);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [imageTransformations, setImageTransformations] = useState({
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0,
  });
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (!pageId || !stampbookId) {
      Alert.alert('Error', 'No page ID or stampbook ID provided.');
      router.back();
      return;
    }

    // Fetch the existing page data
    const stampbook = stampbooks.find((sb) => sb.id === stampbookId);
    if (!stampbook) {
      Alert.alert('Error', 'Stampbook not found.');
      router.back();
      return;
    }

    const existingPage = stampbook.pages.find((page: Page) => page.id === pageId);
    if (!existingPage || !existingPage.stamped) {
      Alert.alert('Error', 'Stamped page not found.');
      router.back();
      return;
    }

    // Set the page data to state (for rendering)
    setImageUri(existingPage.imageUri);
    setImageSize(existingPage.imageSize || undefined);
    setImageTransformations(existingPage.imageTransformations || {
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0,
    });
    setStamps(existingPage.stamps || []);
    setNotes(existingPage.notes || '');
  }, [pageId, stampbookId, stampbooks, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back-sharp" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Stamped Page</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Display the main image */}
        <DraggableImage
          key={pageId}
          imageUri={imageUri}
          imageSize={imageSize}
          readonly
          transformations={imageTransformations} // Apply saved stamp transformations
        />

        {/* Display the stamps */}
        {stamps.map((stamp) => (
          <DraggableImage
            key={stamp.id}
            imageUri={stamp.imageUri}
            imageSize={stamp.imageSize}
            readonly
            transformations={stamp.transformations} // Apply saved stamp transformations
          />
        ))}
      </View>

      {/* Display the notes */}
      <View style={styles.notesContainer}>
        <Text style={styles.notesTitle}>Notes:</Text>
        <Text style={styles.notesText}>{notes || 'No notes available.'}</Text>
      </View>
    </View>
  );
};

export default StampedEditor;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    zIndex: 2,
  },
  backButton: {
    paddingLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    paddingRight: 30,
  },
  content: {
    flex: 1, // Take up remaining space
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesContainer: {
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 40,
    backgroundColor: '#f9f9f9',
    alignSelf: 'stretch',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
  },
});
