import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

const TabLayout = () => {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'profile',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;

/* import { Link, Tabs } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Icons } from '../../components/Icons';
import { colors } from '../../constants/Colors';

const styles = StyleSheet.create({
  headerRight: {
    marginRight: 16,
  },
});

function HeaderRightGuests() {
  return (
    <Link href="/users/newUser" asChild>
      <TouchableOpacity style={styles.headerRight}>
        <Icons name="add" color={colors.text} />
      </TouchableOpacity>
    </Link>
  );
}
function HeaderRightNotes() {
  return (
    <Link href="/(tabs)/profile" asChild>
      <TouchableOpacity style={styles.headerRight}>
        <Icons name="add" color={colors.text} />
      </TouchableOpacity>
    </Link>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.text,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Guests',
          headerRight: HeaderRightGuests,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, focused }) =>
            Icons({
              name: focused ? 'document-text' : 'document-text-outline',
              color,
            }),
          headerRight: HeaderRightNotes,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) =>
            Icons({
              name: focused ? 'person' : 'person-outline',
              color,
            }),
        }}
      />
    </Tabs>
  );
}
 */
