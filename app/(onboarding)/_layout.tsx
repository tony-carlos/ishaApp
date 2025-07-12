import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="about" />
      <Stack.Screen name="concerns" />
      <Stack.Screen name="dependent-info" />
      <Stack.Screen name="login" />
      <Stack.Screen name="registration" />
      <Stack.Screen name="routine" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="services" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
