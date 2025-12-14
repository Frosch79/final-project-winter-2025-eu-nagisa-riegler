import { Tabs } from 'expo-router';
import AnimatedTabIcon from '../../../components/AnimatedTabIcon';
import { colors } from '../../../constants/Colors';
import { tabPressHaptic } from '../../../util/haptics';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
        },
      }}
    >
      {/* profile */}
      <Tabs.Screen
        name="followsFeed"
        options={{
          title: 'follow',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="star" color={color} focused={focused} />
          ),
        }}
        listeners={{
          tabPress: () => {
            tabPressHaptic();
          },
        }}
      />

      {/* map */}
      <Tabs.Screen
        name="publicFeed"
        options={{
          title: 'public',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="search" color={color} focused={focused} />
          ),
        }}
        listeners={{
          tabPress: () => {
            tabPressHaptic();
          },
        }}
      />
    </Tabs>
  );
}
