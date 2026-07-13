import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const utils = trpc.useUtils();

  const { data: unreadData } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const { data: notifications = [] } = trpc.notifications.list.useQuery(undefined, {
    enabled: open,
    refetchInterval: open ? 30_000 : false,
  });

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = unreadData?.count ?? 0;

  function handleNotificationClick(notif: { id: number; link?: string | null; isRead: boolean }) {
    if (!notif.isRead) {
      markRead.mutate({ id: notif.id });
    }
    if (notif.link) {
      setOpen(false);
      navigate(notif.link);
    }
  }

  function formatTime(date: Date | string) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case "new_lesson": return "📚";
      case "live_lecture": return "🔴";
      case "test_published": return "📝";
      default: return "🔔";
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="الإشعارات"
      >
        <Bell className="w-5 h-5 text-foreground" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-16 left-4 right-4 w-auto md:absolute ltr:md:right-0 rtl:md:left-0 md:top-full md:mt-2 md:w-80 bg-[#1e2a3a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            style={{ transformOrigin: "top right" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white font-semibold text-sm">الإشعارات</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                >
                  تحديد الكل كمقروء
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-right px-4 py-3 flex gap-3 items-start hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                      !notif.isRead ? "bg-blue-500/5" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="flex-shrink-0 mt-1">
                      {!notif.isRead ? (
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-transparent" />
                      )}
                    </div>
                    {/* Icon */}
                    <span className="flex-shrink-0 text-lg leading-none mt-0.5">
                      {getTypeIcon(notif.type)}
                    </span>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!notif.isRead ? "text-white font-medium" : "text-gray-300"}`}>
                        {notif.titleAr}
                      </p>
                      {notif.bodyAr && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.bodyAr}</p>
                      )}
                      <p className="text-[11px] text-gray-500 mt-1">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
