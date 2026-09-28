import * as Notifications from 'expo-notifications';

import { pushDebug } from './debug';

export async function showLocalNotification(input: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channel?: 'default' | 'alerts';
}): Promise<void> {
  const settings = await Notifications.getPermissionsAsync();
  const allowed =
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!allowed) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        sound: 'default',
        data: input.data ?? {},
      },
      trigger: null,
    });
    pushDebug('success', 'local', 'Local notification shown', { title: input.title });
  } catch (err) {
    pushDebug('error', 'local', 'Failed to show notification', err);
  }
}

/** Mirror an in-app inbox item as a device banner. */
export async function mirrorInAppNotification(input: {
  id: string;
  title: string;
  body: string;
  href?: string | null;
  type?: string;
}): Promise<void> {
  const title = input.title.startsWith('ORYNO') ? input.title : `ORYNO · ${input.title}`;
  await showLocalNotification({
    title,
    body: input.body,
    channel: 'alerts',
    data: {
      notificationId: input.id,
      href: input.href ?? '/notifications',
      type: input.type ?? 'system',
    },
  });
}
