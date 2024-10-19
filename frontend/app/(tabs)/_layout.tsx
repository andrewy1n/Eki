import { Tabs } from 'expo-router';
import React from 'react';
import TabSlider from '@/components/TabSlider';
import { PagesProvider } from '@/context/PagesContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';


export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <PagesProvider>
        <Tabs
          initialRouteName="map"
          tabBar={(props) => <TabSlider {...props} />}
          screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
          }}
        >
          <Tabs.Screen name="map" options={{ title: 'Map' }} />
          <Tabs.Screen name="stampbooks" options={{ title: 'Stampbooks' }} />
          <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
          <Tabs.Screen name="community" options={{ title: 'Community' }} />
        </Tabs>
      </PagesProvider>
    </SafeAreaProvider>
  );
}
