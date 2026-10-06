import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { business } from '@/constants/business';
import { colors, serif } from '@/constants/theme';
import { useCart } from '@/context/CartContext';

export default function TabLayout() {
  const { items } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: serif, fontSize: 20 },
        headerShadowVisible: false,
        // Disable the static render of the header on web to prevent a hydration error.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Gallery',
          headerTitle: business.title,
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="commission"
        options={{
          title: 'Commission',
          headerTitle: 'Commission a Portrait',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'paintbrush.pointed', android: 'brush', web: 'brush' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About Us',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'person.crop.circle', android: 'person', web: 'person' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: items.length || undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent },
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' }} tintColor={color} size={26} />
          ),
        }}
      />
    </Tabs>
  );
}
