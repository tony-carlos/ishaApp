import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import {
  Chrome as Home,
  ShoppingBag,
  MessageSquare,
  Gamepad2,
  User,
} from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.default,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.neutral.light,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Regular',
          fontSize: 12,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="consultation"
        options={{
          title: 'Consult',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'Game',
          tabBarIcon: ({ color, size }) => (
            <Gamepad2 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan-results"
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
