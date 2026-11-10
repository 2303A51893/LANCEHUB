
import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications = [],
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    const notificationId = notification._id || notification.id;

    if (!notification.isRead && notificationId) {
      await markAsRead(notificationId);
    }

    if (notification.link) {
      setIsOpen(false);
      navigate(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-slate-200/80 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">

          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900">
                Notifications
              </span>

              {unreadCount > 0 && (
                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No notifications right now
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id || notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-primary-50/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-900">
                      {notification.title}
                    </h4>

                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />

                    <span>
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )
                        : 'Just now'}
                    </span>

                    {notification.link && (
                      <span className="ml-auto text-primary-600 hover:underline flex items-center gap-0.5">
                        View
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
