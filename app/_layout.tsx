import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import 'react-native-reanimated';

import { colors, serif } from '@/constants/theme';
import { ArtworksProvider } from '@/context/ArtworksContext';
import { CartProvider } from '@/context/CartContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background, card: colors.background, primary: colors.accent, text: colors.text, border: colors.border },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <ArtworksProvider>
        <CartProvider>
          <Stack screenOptions={{ headerTitleStyle: { fontFamily: serif }, headerTintColor: colors.text, headerShadowVisible: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="art/[id]" options={{ title: '', headerBackTitle: 'Gallery' }} />
            <Stack.Screen name="checkout/success" options={{ title: 'Thank you', headerBackVisible: false, headerLeft: () => null, gestureEnabled: false }} />
          </Stack>
        </CartProvider>
      </ArtworksProvider>
    </ThemeProvider>
  );
}
