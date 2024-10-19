import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import PageSpinner from '@/components/PageSpinner';


const StampPage: React.FC = () => {
  const router = useRouter();
  const { id, city, state } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity  
          onPress={() => router.back()}
          hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }}
        >
          <Ionicons 
            name="chevron-back-sharp" 
            size={24} 
            color="black"
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{city + ', ' + state}</Text>
      </View>

      {/* Page Content */}
      <View style={styles.content}>
        <PageSpinner/>
      </View>
    </SafeAreaView>
  );
};

export default StampPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  backButton: {
    paddingLeft: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    paddingRight: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
