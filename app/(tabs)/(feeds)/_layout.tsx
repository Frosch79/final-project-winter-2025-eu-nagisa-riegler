import { Tabs } from 'expo-router';
import { TabBarIcon } from '../../../components/TabBarIcons';
import { colors } from '../../../constants/Colors';

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
      {/* follows */}
      <Tabs.Screen
        name="followsFeed"
        options={{
          title: 'follow',
          tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />,
        }}
        listeners={{}}
      />

      {/* public */}
      <Tabs.Screen
        name="publicFeed"
        options={{
          title: 'public',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
        listeners={{}}
      />
    </Tabs>
  );
}
