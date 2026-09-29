import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS } from 'react-native';

import { Brand } from '@/constants/theme';

/**
 * System tab bar. On iOS 26, compiled with Xcode 26, this is Liquid Glass.
 */
export default function TabLayout() {
  return (
    <NativeTabs
      tintColor={DynamicColorIOS({
        light: Brand.orange,
        dark: Brand.orangeSoft,
      })}
      iconColor={{
        default: DynamicColorIOS({
          light: Brand.grayMedium,
          dark: '#AEAEB2',
        }),
        selected: DynamicColorIOS({
          light: Brand.orange,
          dark: Brand.orangeSoft,
        }),
      }}
      minimizeBehavior="automatic"
      disableTransparentOnScrollEdge={false}>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cards">
        <Label>Cards</Label>
        <Icon sf={{ default: 'creditcard', selected: 'creditcard.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="services">
        <Label>Services</Label>
        <Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <Label>History</Label>
        <Icon sf={{ default: 'clock', selected: 'clock.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
