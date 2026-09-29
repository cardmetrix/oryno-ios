import { useAuth } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { router, useSegments } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Brand, type ThemeColors } from '@/constants/theme';
import { useAppLock } from '@/context/app-lock-context';
import { useAppTheme } from '@/context/theme-context';
import { useTwoFactorOptional } from '@/context/two-factor-context';

export function AppLockOverlay() {
  const { locked, unlock, meta } = useAppLock();
  const twoFa = useTwoFactorOptional();
  const { signOut } = useAuth();
  const segments = useSegments();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [busy, setBusy] = useState(false);
  const promptedForLock = useRef(false);
  const unlockRef = useRef(unlock);
  const segmentsRef = useRef(segments);
  unlockRef.current = unlock;
  segmentsRef.current = segments;

  useEffect(() => {
    if (!locked) {
      promptedForLock.current = false;
      setBusy(false);
      return;
    }
    if (promptedForLock.current) return;
    promptedForLock.current = true;

    setBusy(true);
    void unlockRef.current().then((ok) => {
      setBusy(false);
      if (!ok) return;
      const inApp = (segmentsRef.current as string[]).includes('(app)');
      if (!inApp) router.replace('/(app)/(tabs)');
    });
  }, [locked]);

  if (!locked || twoFa?.blocking) return null;

  const method = meta.title || 'Face ID';

  async function onUnlock() {
    setBusy(true);
    const ok = await unlock();
    setBusy(false);
    if (!ok) return;
    const inApp = (segments as string[]).includes('(app)');
    if (!inApp) router.replace('/(app)/(tabs)');
  }

  return (
    <View style={styles.root} pointerEvents="auto">
      <Animated.View entering={FadeIn.duration(280)} style={StyleSheet.absoluteFill}>
        <View
          style={[
            styles.panel,
            { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 20 },
          ]}>
          <Animated.View entering={FadeInUp.delay(80).duration(360)} style={styles.brand}>
            <View style={styles.logoWell}>
              <Image
                source={require('@/assets/images/oryno-icon.png')}
                style={styles.logo}
                contentFit="cover"
              />
            </View>
            <Text style={styles.brandName}>ORYNO</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(140).duration(380)} style={styles.copy}>
            <View style={styles.iconBubble}>
              <SymbolView name="faceid" tintColor={Brand.orange} size={32} />
            </View>
            <Text style={styles.title}>App locked</Text>
            <Text style={styles.sub}>Use {method} to open your dashboard</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(380)} style={styles.actions}>
            <Button
              title={busy ? 'Waiting…' : `Unlock with ${method}`}
              onPress={() => void onUnlock()}
              loading={busy}
              disabled={busy}
            />
            <Pressable
              onPress={() => void signOut()}
              style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.7 }]}>
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 80,
      elevation: 80,
    },
    panel: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    logoWell: {
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: 'hidden',
    },
    logo: { width: '100%', height: '100%' },
    brandName: {
      fontSize: 20,
      fontWeight: '900',
      letterSpacing: 1.4,
      color: Brand.orange,
    },
    copy: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    iconBubble: {
      width: 72,
      height: 72,
      borderRadius: 28,
      backgroundColor: colors.orangeMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.foreground,
    },
    sub: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.mutedForeground,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 16,
    },
    actions: { gap: 14 },
    signOut: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    signOutText: {
      color: colors.mutedForeground,
      fontWeight: '700',
      fontSize: 14,
    },
  });
}
