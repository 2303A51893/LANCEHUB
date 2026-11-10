
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from MongoDB through the backend API
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const res = await api.get('/notifications');

      if (res.data.success) {
        setNotifications(
          Array.isArray(res.data.notifications)
            ? res.data.notifications
            : []
        );

        setUnreadCount(
          Number(res.data.unreadCount) || 0
        );
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user]);

  // Fetch notifications when user logs in and refresh every 15 seconds
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Mark one notification as read
  const markAsRead = async (id) => {
    if (!id) return;

    const notification = notifications.find(
      (item) => String(item._id || item.id) === String(id)
    );

    if (!notification || notification.isRead) return;

    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((previous) =>
        previous.map((item) =>
          String(item._id || item.id) === String(id)
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      await api.post('/notifications/mark-all-read');

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
