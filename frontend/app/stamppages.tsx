import React, { useEffect, useContext, useState } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import PageSpinner from '@/components/PageSpinner';
import SimpleBook from '@/components/SimpleBook';
import { Stampbook } from '../models/Stampbook';
import { useAccountContext } from '@/context/AccountContext';
import { useAccount } from '@/hooks/useAccount';

const StampPage: React.FC = () => {
  const router = useRouter();
  const { index } = useLocalSearchParams<{ index: string }>()
  const { accountData } = useAccountContext();
  const { getAccountData } = useAccount();
  const [ city, setCity ] = useState<string>("")
  const [ state, setState ] = useState<string>("")

  const books : Stampbook[]= accountData?.books || [];
  const i = Number(index);

  useEffect(() => {
    if (isNaN(i) || i < 0 || i >= books.length) {
      Alert.alert('Error', 'No valid stampbook index provided.');
      router.back();
      return;
    }
    setCity(books[i].city)
    setState(books[i].state)
    
    }, [index, books, router]);

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
        <View style={styles.headerTitle}>
          <Text style={styles.title}>{city}</Text>
          <Text style={styles.subtitle}>{state}</Text>
        </View>
      </View>

      {/* Page Content */}
      <View style={styles.content}>
        <SimpleBook index={i}/>
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
    paddingRight: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 3,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
