import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

const SYMBOLS: Record<string, { outline: SFSymbol; filled: SFSymbol }> = {
  index: { outline: 'house', filled: 'house.fill' },
  cards: { outline: 'creditcard', filled: 'creditcard.fill' },
  services: { outline: 'square.grid.2x2', filled: 'square.grid.2x2.fill' },
  history: { outline: 'clock', filled: 'clock.fill' },
  profile: { outline: 'person', filled: 'person.fill' },
};

export function FloatingGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const bottom = Math.max(insets.bottom, 10);

  const shell = {
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.65)',
    backgroundColor: isDark ? colors.card : 'rgba(255,255,255,0.55)',
    shadowOpacity: isDark ? 0.5 : 0.14,
  };

  const glassTint = isDark ? 'rgba(15,15,18,0.45)' : 'rgba(255,255,255,0.28)';

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: bottom }]}>
      <View style={[styles.shadow, { shadowOpacity: shell.shadowOpacity }]}>
        <View
          style={[
            styles.clip,
            {
              borderColor: shell.borderColor,
              backgroundColor: shell.backgroundColor,
            },
          ]}>
          <BlurView
            intensity={isDark ? 36 : 56}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.glassTint, { backgroundColor: glassTint }]} />
          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label =
                typeof options.tabBarLabel === 'string'
                  ? options.tabBarLabel
                  : options.title ?? route.name;
              const focused = state.index === index;
              const color = focused ? colors.tint : colors.mutedForeground;
              const symbols = SYMBOLS[route.name] ?? {
                outline: 'circle' as const,
                filled: 'circle.fill' as const,
              };
              const icon = (
                <SymbolView
                  name={focused ? symbols.filled : symbols.outline}
                  tintColor={color}
                  size={22}
                  weight={focused ? 'semibold' : 'regular'}
                />
              );

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate(route.name, route.params);
                }
              };

              return (
                <TabItem
                  key={route.key}
                  label={label}
                  icon={icon}
                  focused={focused}
                  onPress={onPress}
                  activeColor={colors.tint}
                  inactiveColor={colors.mutedForeground}
                  pillColor={colors.orangeMuted}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

function TabItem({
  label,
  icon,
  focused,
  onPress,
  activeColor,
  inactiveColor,
  pillColor,
}: {
  label: string;
  icon: ReactNode;
  focused: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
  pillColor: string;
}) {
  const scale = useSharedValue(1);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
      style={styles.item}>
      <Animated.View style={[styles.itemInner, anim]}>
        {focused ? (
          <Animated.View
            entering={FadeIn.duration(180)}
            style={[styles.activePill, { backgroundColor: pillColor }]}
          />
        ) : null}
        {icon}
        <Text
          style={[
            styles.label,
            { color: focused ? activeColor : inactiveColor },
            focused && styles.labelActive,
          ]}
          numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
  },
  shadow: {
    borderRadius: Radius.phone,
    shadowColor: '#0F0F12',
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
  },
  clip: {
    borderRadius: Radius.phone,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  glassTint: {
    ...StyleSheet.absoluteFill,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 8,
    minHeight: 66,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 18,
    minWidth: 58,
  },
  activePill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 18,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  labelActive: {
    fontWeight: '700',
  },
});
