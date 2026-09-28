/**
 * Compatibility surface — prefer `@/lib/push-notifications` for new code.
 */
export {
  hrefToAppRoute,
  getNotificationHref,
  registerForPushNotificationsAsync as registerForPushNotifications,
  registerPushToken as registerAndSyncPushToken,
  syncPushTokenWithServer,
  unregisterPushToken,
  setAppBadge,
} from '@/lib/push-notifications';
