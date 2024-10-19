// app/pageeditor.tsx

import React, { useContext, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import StampedPageEditor from '../components/StampedPageEditor';
import { PagesContext } from '../context/PagesContext';
import { Page } from '../models/Page';

const StampedEditor = () => {
  const router = useRouter();
  const { pageId, stampbookId } = useLocalSearchParams();
  const { stampbooks, addPage } = useContext(PagesContext);

  useEffect(() => {
    if (!pageId || !stampbookId) {
      Alert.alert('Error', 'No page ID or stampbook ID provided.');
      router.back();
    } else {
      // Find the stampbook
      const stampbook = stampbooks.find(sb => sb.id === stampbookId);
      if (!stampbook) {
        Alert.alert('Error', 'Stampbook not found.');
        router.back();
      } else {
        // Check if page exists in the stampbook; if not, create it
        const existingPage = stampbook.pages.find((page: Page) => page.id === pageId);
        if (!existingPage) {
          const newPage: Page = {
            id: pageId as string,
            stampbookId: stampbookId as string,
            imageUri: null,
            stamps: [],
            notes: '',
            location: null,
            stamped: false,
          };
          addPage(stampbookId as string, newPage);
        }
      }
    }
  }, [pageId, stampbookId, stampbooks, addPage, router]);

  const handleCloseEditor = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {pageId && stampbookId ? (
        <StampedPageEditor
          pageId={pageId as string}
          stampbookId={stampbookId as string}
          onClose={handleCloseEditor}
        />
      ) : null}
    </View>
  );
};

export default StampedEditor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
