import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import DraggableImage from './DraggableImage';
import { Page } from '../models/Page';

interface StampedPageProps {
  stampbookId: string;
  pageId: string;
}

const StampedPage: React.FC<StampedPageProps> = ({ stampbookId, pageId }) => {
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    const stampbook = stampbooks.find((sb) => sb.id === stampbookId);
    if (!stampbook) {
      Alert.alert('Error', 'Stampbook not found.');
      return;
    }

    const fetchedPage = stampbook.pages.find((p) => p.id === pageId) || null;
    if (!fetchedPage) {
      Alert.alert('Error', 'Page not found.');
      return;
    }
    setPage(fetchedPage);
  }, [pageId, stampbookId, stampbooks]);

  if (!page) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading page...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Main Image */}
      {page.imageUri && (
        <DraggableImage
          imageUri={page.imageUri}
          borderRadius={15}
          readonly
          transformations={{
            position: { x: 0, y: 0 }, // Adjust as needed
            scale: 1,
            rotation: 0,
          }}
        />
      )}

      {/* Stamps */}
      {page.stamps.map((stamp) => (
        <DraggableImage
          key={stamp.id}
          imageUri={stamp.imageUri}
          borderRadius={stamp.borderRadius}
          readonly
          transformations={stamp.transformations}
        />
      ))}

      {/* Notes */}
      {page.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>{page.notes}</Text>
        </View>
      ) : null}

      {/* Location Info */}
      {page.location ? (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            Location: {page.location.latitude.toFixed(2)}, {page.location.longitude.toFixed(2)}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default StampedPage;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#333333',
  },
  locationContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#333333',
  },
});
