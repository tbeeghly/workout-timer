import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { PaletteProvider, usePalette } from '../theme/PaletteContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaletteProvider>
          <ThemedStack />
        </PaletteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedStack() {
  const scheme = useColorScheme() ?? 'dark';
  const dark = scheme === 'dark';
  const { palette } = usePalette();
  const router = useRouter();
  const tint = dark ? colors.labelPrimaryDark : colors.labelPrimary;
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: dark ? colors.canvasDark : colors.canvas },
          headerTitleStyle: { color: dark ? colors.labelPrimaryDark : colors.labelPrimary },
          headerTintColor: palette.primary,
          contentStyle: { backgroundColor: dark ? colors.canvasDark : colors.canvas },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Workouts',
            headerRight: () => (
              <Pressable
                onPress={() => router.push('/settings')}
                accessibilityRole="button"
                accessibilityLabel="Settings"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                  width: 40,
                  height: 40,
                  marginRight: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Ionicons name="settings-outline" size={22} color={tint} />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen name="edit/[id]" options={{ title: 'Edit workout', presentation: 'modal' }} />
        <Stack.Screen name="run/[id]" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings', presentation: 'modal' }} />
      </Stack>
    </>
  );
}

