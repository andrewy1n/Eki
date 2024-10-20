import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, KeyboardAvoidingView, Dimensions, FlatList, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, View, Image } from 'react-native';
import { signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig'
import { Marquee } from '@animatereactnative/marquee';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const windowWidth = Dimensions.get('window').width;
  const images = [
    {
        id: '1',
        src: 'https://foyr.com/learn/wp-content/uploads/2019/01/Colosseum-Rome-Italy.jpg',
        styles: {width: '131px', height: '238px', marginLeft: '10px',}
    },
    {
        id: '2',
        src: 'https://foyr.com/learn/wp-content/uploads/2019/01/petronas-towers.jpg',
        styles: {width: '131px', height: '200px', marginLeft: '5px',}
    },
    {
        id: '3',
        src: 'https://foyr.com/learn/wp-content/uploads/2019/01/Palm-Jumeirah-1068x610.jpg',
        styles: {width: '131px', height: '220px', marginLeft: '5px',}
    },
    {
        id: '4',
        src: 'https://www.askanis.com/wp-content/uploads/2019/07/01-3.jpg',
        styles: {width: '131px', height: '178px', marginTop: '5px', marginLeft: '10px',}
    },
    {
        id: '5',
        src: 'https://www.cuddlynest.com/blog/wp-content/uploads/2020/09/neuschwanstein-castle-germany-most-beautiful-buildings-world.jpg',
        styles: {width: '131px', height: '216px', marginTop: '-32px', marginLeft: '5px',}
    },
    {
        id: '6',
        src: 'https://www.cuddlynest.com/blog/wp-content/uploads/2021/07/versailles-france-most-beautiful-buildings-world.jpg',
        styles: {width: '131px', height: '195px', marginTop: '-13px', marginLeft: '5px',}
    },
];

  const numColumns = 3;

  useEffect(() => { 
    const checkLoggedIn = async () => {
      const uid = await AsyncStorage.getItem('uid');
      if (uid) {
        router.replace('/(tabs)/map');
      }
    }
    checkLoggedIn();
  }, [])

  const handleLogin = async () => {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            AsyncStorage.setItem('uid', user.uid);
            router.push('/(tabs)/map');
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error(`Error: ${errorCode}, ${errorMessage}`);
          Alert.alert('Wrong password or email, please try again.')
        });
  };

  const handleCreateRoute = () => {
    router.push('/createaccount');
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <View style={styles.container}>
        <View>
            <Marquee spacing={-6} speed={1}>
                <FlatList
                    data={images}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      const { width, height, marginLeft, marginTop } = item.styles;
                    
                      return (
                        <Image
                          source={{ uri: item.src }}
                          style={[
                            {
                              width: parseInt(width.replace('px', '')),  // Convert to number
                              height: parseInt(height.replace('px', '')),  // Convert to number
                              marginLeft: marginLeft ? parseInt(marginLeft.replace('px', '')) : 0,  // Convert if exists
                              marginTop: marginTop ? parseInt(marginTop.replace('px', '')) : 0,  // Convert if exists
                              flex: 1,
                              borderRadius: 10,
                            },
                          ]}
                        />
                      );
                    }}
                    numColumns={numColumns}
                    bounces={false}
                    contentContainerStyle={{ width: windowWidth }}
                    showsHorizontalScrollIndicator={false}
                />
            </Marquee>
          </View>
          <View>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={"gray"}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={"gray"}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleCreateRoute}>
            <Text style={styles.buttonText}>Crreate Account</Text>
          </TouchableOpacity>
        </View>
        </View>
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingBottom:100,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 20,
    marginTop: 20,
    color: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: '#fff'
  },
  buttonText: {
    margin: 20,
    color: 'white',
  },
  button: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderRadius: 20,
    borderColor: 'white',
    marginLeft: 10,
  },
  container1: {
    borderRadius: 10,
  },
});

export default LoginScreen;
