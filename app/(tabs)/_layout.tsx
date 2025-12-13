import AnimatedTabIcon from '@/components/AnimatedTabIcon';
import { colors } from '@/constants/Colors';
import { tabPressHaptic } from '@/util/haptics';
import { Tabs } from 'expo-router';

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
        name="(user)/user"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="user" color={color} focused={focused} />
          ),
        }}
        listeners={{
          tabPress: () => {
            tabPressHaptic();
          },
        }}
      />

      {/* feed */}
      <Tabs.Screen
        name="(feeds)"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="th-large" color={color} focused={focused} />
          ),
        }}
        listeners={{
          tabPress: () => {
            tabPressHaptic();
          },
        }}
      />

      {/* hidden in tab */}
      <Tabs.Screen
        name="(user)/[userId]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
