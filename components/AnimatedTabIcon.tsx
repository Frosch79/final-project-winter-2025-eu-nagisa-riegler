import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

type Props = {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused: boolean;
  size?: number;
};

export default function AnimatedTabIcon({
  name,
  color,
  focused,
  size = 22,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.15 : 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <FontAwesome name={name} size={size} color={color} />
    </Animated.View>
  );
}
