import { ref } from 'vue';

// Для работы с push-уведомлениями пользователя
export default function useNotifications() {
  // Множество push-уведомлений
  const currentActiveNotifications = ref(new Set());

  // Позволяет показать push-уведомление
  function showNotification(notificationTitle, notificationMessage) {
    if ('Notification' in window) {

      const createNewNotification = () => {
        const notificationOptions = {
          body: notificationMessage,
          // Уведомление не исчезает самостоятельно. Только пользователь может его закрыть.
          requireInteraction: true,
          // Уведомление просто появляется, нет никаких звуков и вибраций.
          silent: true,
        };
        const notification = new Notification(notificationTitle, notificationOptions);
        notification.addEventListener('close', () => {
          currentActiveNotifications.value.delete(notification);
        });
        currentActiveNotifications.value.add(notification);
      };

      if (Notification.permission === 'granted') {
        // Check whether notification permissions have already been granted;
        // if so, create a notification
        createNewNotification();
      } else if (Notification.permission !== 'denied') {
        // We need to ask the user for permission
        Notification.requestPermission().then((permission) => {
          // If the user accepts, let's create a notification
          if (permission === 'granted') {
            createNewNotification();
          }
        });
      }
    }
  }

  // Позволяет закрыть все открытые push-уведомления
  function closeAllNotifications() {
    currentActiveNotifications.value.forEach((notification) => notification.close());
  }

  return {
    showNotification,
    closeAllNotifications,
  };
}
