import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

import { PagesProvider } from '@/context/PagesContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PagesProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="stamppages"
              options={{
                headerShown: false, 
              }}
            />
            <Stack.Screen
              name="emptyeditor"
              options={{
                headerShown: false, 
              }}
            />
            <Stack.Screen
              name="stampededitor"
              options={{
                headerShown: false, 
              }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </PagesProvider>
    </SafeAreaProvider>
  );
}
