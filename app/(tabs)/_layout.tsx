import { Tabs } from 'expo-router';
import { TabBarIcon } from '../../components/TabBarIcons';
import { colors } from '../../constants/Colors';

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
          tabBarIcon: ({ color }) => <TabBarIcon name="man" color={color} />,
        }}
      />

      {/* feed */}
      <Tabs.Screen
        name="(feeds)"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <TabBarIcon name="albums" color={color} />,
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
