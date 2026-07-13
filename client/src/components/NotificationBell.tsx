import { useState } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { mockNotifications } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'test_available':
        return '📝';
      case 'result_ready':
        return '✅';
      case 'streak_reminder':
        return '🔥';
      default:
        return 'ℹ️';
    }
  };

  // Group notifications into Today vs Earlier
  const getGroupedNotifications = () => {
    const today: typeof notifications = [];
    const earlier: typeof notifications = [];
    const now = new Date();
    
    notifications.forEach(n => {
      const date = new Date(n.createdAt);
      const isToday = 
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
        
      if (isToday) {
        today.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, earlier };
  };

  const { today, earlier } = getGroupedNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative w-9 h-9 rounded-xl hover-lift hover:bg-muted">
          <Bell className="w-4.5 h-4.5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 sm:w-96 rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-0 shadow-xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div>
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 font-semibold px-2 py-0.5 text-[10px]">
                  {unreadCount} new
                </Badge>
              )}
            </h3>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline font-medium transition-all"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-red-500 font-medium transition-all flex items-center gap-0.5"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[28rem] overflow-y-auto divide-y divide-border/60">
          {notifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-0.5">No new notifications at this time.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {/* Today's Section */}
              {today.length > 0 && (
                <div className="bg-muted/5">
                  <div className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/10">
                    Today
                  </div>
                  {today.map((notification, idx) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className={`p-4 hover:bg-muted/30 transition-all cursor-pointer relative flex gap-3.5 group ${
                        !notification.read ? 'bg-primary/[0.02] border-l-2 border-primary' : ''
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <span className="text-2xl flex-shrink-0 select-none bg-background dark:bg-muted/50 p-2 h-10 w-10 rounded-xl flex items-center justify-center border border-border/40 shadow-sm">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm text-foreground tracking-tight leading-snug">
                            {notification.title}
                          </p>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 p-0.5 hover:bg-muted dark:hover:bg-muted/50 rounded transition-all flex-shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-normal">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/85 mt-2">
                          {new Date(notification.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Earlier Section */}
              {earlier.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/10">
                    Earlier
                  </div>
                  {earlier.map((notification, idx) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className={`p-4 hover:bg-muted/30 transition-all cursor-pointer relative flex gap-3.5 group ${
                        !notification.read ? 'bg-primary/[0.02] border-l-2 border-primary' : ''
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <span className="text-2xl flex-shrink-0 select-none bg-background dark:bg-muted/50 p-2 h-10 w-10 rounded-xl flex items-center justify-center border border-border/40 shadow-sm">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm text-foreground tracking-tight leading-snug">
                            {notification.title}
                          </p>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 p-0.5 hover:bg-muted dark:hover:bg-muted/50 rounded transition-all flex-shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-normal">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/85 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
