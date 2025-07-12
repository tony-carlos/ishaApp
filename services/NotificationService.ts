import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    this.configureNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async configureNotifications() {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  async requestPermissions() {
    if (Platform.OS === 'ios') {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    }
    return true;
  }

  async scheduleNotification(title: string, body: string, seconds: number = 0) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  showSuccess(message: string) {
    this.scheduleNotification('Success', message, 0);
  }

  showError(message: string) {
    this.scheduleNotification('Error', message, 0);
  }

  showInfo(message: string) {
    this.scheduleNotification('Info', message, 0);
  }
}

export default NotificationService.getInstance();
