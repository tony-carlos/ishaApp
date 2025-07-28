import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import Colors from '@/constants/Colors';
import { Home, Shop, Consultation, Game, Profile } from '@/utils/icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.default,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: Colors.neutral.white,
          borderTopWidth: 1,
          borderTopColor: Colors.neutral.light,
          height: Platform.OS === 'ios' ? 105 : 90,
          paddingBottom: Platform.OS === 'ios' ? 34 : 20,
          paddingTop: 20,
          paddingHorizontal: 16,
          marginHorizontal: 12,
          marginBottom: Platform.OS === 'ios' ? 0 : 8,
          borderRadius: 24,
          shadowColor: Colors.neutral.darkest,
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 16,
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
          marginHorizontal: 4,
          flex: 1,
          minHeight: 50,
          borderRadius: 16,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 13,
          fontWeight: '600',
          marginTop: 8,
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
          tabBarIcon: ({ color, focused }) => (
            <Home size={focused ? 32 : 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <Shop size={focused ? 32 : 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="consultation"
        options={{
          title: 'Consult',
          tabBarIcon: ({ color, focused }) => (
            <Consultation size={focused ? 32 : 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'Game',
          tabBarIcon: ({ color, focused }) => (
            <Game size={focused ? 32 : 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Profile size={focused ? 32 : 28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
