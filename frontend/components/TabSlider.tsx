import React from 'react';
import { View, TouchableOpacity, Animated, Dimensions, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TabSlider: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets()
  const translateX = React.useRef(new Animated.Value(state.index * (width / state.routes.length))).current;
;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * (width / state.routes.length),
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Animated.View
        style={[
          styles.slider,
          {
            width: width / state.routes.length,
            height: 100,
            transform: [{ translateX }],
          },
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = (() => {
          switch (route.name) {
            case 'map':
              return 'map';
            case 'stampbooks':
              return 'book';
            case 'profile':
              return 'user';
            case 'community':
              return 'users';
            default:
              return 'circle';
          }
        })();

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Feather name={iconName} size={24} color={isFocused ? 'white' : 'gray'} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  slider: {
    height: 4,
    backgroundColor: 'black',
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});

export default TabSlider;
