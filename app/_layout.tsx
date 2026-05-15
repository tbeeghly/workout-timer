import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import { colors } from '../theme/colors';

export default function RootLayout() {
  const scheme = useColorScheme() ?? 'dark';
  const dark = scheme === 'dark';
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: dark ? colors.canvasDark : colors.canvas },
            headerTitleStyle: { color: dark ? colors.labelPrimaryDark : colors.labelPrimary },
            headerTintColor: colors.red,
            contentStyle: { backgroundColor: dark ? colors.canvasDark : colors.canvas },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Workouts' }} />
          <Stack.Screen name="edit/[id]" options={{ title: 'Edit workout', presentation: 'modal' }} />
          <Stack.Screen name="run/[id]" options={{ headerShown: false, animation: 'fade' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
