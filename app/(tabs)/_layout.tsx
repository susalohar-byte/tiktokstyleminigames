import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          href: '/',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Discover',
          href: '/explore',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          href: '/favorites',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: '/profile',
        }}
      />
    </Tabs>
  );
}
