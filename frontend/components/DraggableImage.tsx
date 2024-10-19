import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, Button, View } from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Transformations } from '../models/Page'; // Import Transformations

interface DraggableImageProps {
    imageUri: string;
    borderRadius?: number;
    transformations?: Transformations;
    readonly?: boolean;
    stamped?: boolean; // New prop to control the stamp state externally
    onUpdateTransformations?: (transform: Transformations) => void;
  }

const DraggableImage: React.FC<DraggableImageProps> = ({
  imageUri,
  borderRadius = 10,
  transformations,
  readonly = false,
  stamped = false, // Default value
  onUpdateTransformations,
}) => {
  // Shared values for scale, rotation, and translation
  const scale = useSharedValue(transformations?.scale ?? 1);
  const rotation = useSharedValue(transformations?.rotation ?? 0);
  const translateX = useSharedValue(transformations?.position.x ?? 0);
  const translateY = useSharedValue(transformations?.position.y ?? 0);

  // Variables to store the starting values of gestures
  const savedScale = useSharedValue(scale.value);
  const savedRotation = useSharedValue(rotation.value);
  const savedTranslateX = useSharedValue(translateX.value);
  const savedTranslateY = useSharedValue(translateY.value);

  // State to track whether stamping is enabled
  const [isStamped, setIsStamped] = useState(stamped);

  useEffect(() => {
    setIsStamped(stamped);
  }, [stamped]);

  // Pinch Gesture for scaling
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      if (!isStamped) {
        savedScale.value = scale.value;
      }
    })
    .onUpdate((event) => {
      if (!isStamped) {
        scale.value = savedScale.value * event.scale;
      }
    });

  // Rotation Gesture for rotating
  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      if (!isStamped) {
        savedRotation.value = rotation.value;
      }
    })
    .onUpdate((event) => {
      if (!isStamped) {
        rotation.value = savedRotation.value + event.rotation;
      }
    });

  // Pan Gesture for dragging
  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (!isStamped) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    })
    .onUpdate((event) => {
      if (!isStamped) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    });

  // Combine gestures to allow simultaneous gesture recognition
  const gesture = readonly
    ? Gesture.Exclusive() // No gestures
    : Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);

  // Animated style to apply transformations
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: withSpring(scale.value) },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  // Update parent with transformation data
  useEffect(() => {
    if (onUpdateTransformations) {
      onUpdateTransformations({
        position: { x: translateX.value, y: translateY.value },
        scale: scale.value,
        rotation: rotation.value,
      });
    }
  }, [translateX.value, translateY.value, scale.value, rotation.value]);

  // Handle the "Undo" action to reset image to initial state
//   const handleUndo = () => {
//     setStamped(false);
//     scale.value = withSpring(1);
//     rotation.value = withSpring(0);
//     translateX.value = withSpring(0);
//     translateY.value = withSpring(0);
//     if (onUpdateTransformations) {
//       onUpdateTransformations({
//         position: { x: 0, y: 0 },
//         scale: 1,
//         rotation: 0,
//       });
//     }
//   };

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { borderRadius }]}
          />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default DraggableImage;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Adjust zIndex as needed
  },
  imageContainer: {
    alignSelf: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: -50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
  },
});
