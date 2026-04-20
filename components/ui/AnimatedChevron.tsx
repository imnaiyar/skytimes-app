import { Entypo } from "@expo/vector-icons";
import { useEffect } from "react";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface AnimatedChevronProps {
  isCollapsed: boolean;
  color: string;
  size?: number;
  duration?: number;
}

export function AnimatedChevron({
  isCollapsed,
  color,
  size = 16,
  duration = 300,
}: AnimatedChevronProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(isCollapsed ? 0 : 90, { duration });
  }, [isCollapsed, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${interpolate(rotation.value, [0, 90], [0, 90])}deg` },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Entypo name="chevron-right" size={size} color={color} />
    </Animated.View>
  );
}
