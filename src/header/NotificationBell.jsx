import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function NotificationBell({ open, onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef(null);
  const socketRef = useRef(null);

  // === CẬP NHẬT UNREAD COUNT CHO HEADER ===
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // === KẾT NỐI SOCKET.IO REALTIME ===
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    const userId = user.user_id;

    socketRef.current = io(process.env.REACT_APP_SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("join.channel", `user.${userId}`);
    });

    socket.on("notification.created", (data) => {
      const newNotif = {
        id: data.notification.notification_id,
        msg: data.notification.message,
        is_read: 0,
        time: data.notification.created_at,
      };

      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === newNotif.id);
        if (exists) return prev;
        return [newNotif, ...prev];
      });

      setUnreadCount((prev) => prev + 1);
      showBrowserNotification(data.notification.message);
    });

    socket.on("disconnect", () => console.log("Socket disconnected"));
    socket.on("connect_error", (err) => console.error("Socket error:", err));

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // === LOAD THÔNG BÁO KHI MỞ POPUP ===
  useEffect(() => {
    if (!open) return;

    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (!storedUser || !storedToken) return;

    const user = JSON.parse(storedUser);
    const userId = user.user_id;

    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}notifications/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status && Array.isArray(data.notifications)) {
          const sorted = data.notifications.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          const readIds = getReadNotifications();
          const formatted = sorted.map((n) => ({
            id: n.notification_id,
            msg: n.message,
            is_read: readIds.includes(n.notification_id) ? 1 : n.is_read,
            time: n.created_at,
          }));

          setNotifications(formatted);
          const count = formatted.filter((n) => !n.is_read).length;
          setUnreadCount(count);
        }
      })
      .catch((err) => console.error("Lỗi tải thông báo:", err))
      .finally(() => setLoading(false));
  }, [open]);

  // === CLICK NGOÀI ĐÓNG POPUP ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  // === LOCALSTORAGE: ĐÃ ĐỌC ===
  const getReadNotifications = () => {
    return JSON.parse(localStorage.getItem("read_notifications") || "[]");
  };

  const saveReadNotifications = (ids) => {
    localStorage.setItem("read_notifications", JSON.stringify(ids));
  };

  // === ĐÁNH DẤU ĐÃ ĐỌC ===
  const markAsRead = (notifId, event) => {
    if (event) {
      event.stopPropagation();
    }

    const storedToken = localStorage.getItem("token");
    if (!storedToken) return;

    fetch(`${process.env.REACT_APP_API_URL}notifications/${notifId}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, is_read: 1 } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        const readIds = getReadNotifications();
        if (!readIds.includes(notifId)) {
          saveReadNotifications([...readIds, notifId]);
        }
      })
      .catch((err) => console.error("Lỗi đánh dấu đã đọc:", err));
  };

  // === ĐỌC TẤT CẢ ===
  const markAllAsRead = () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (!storedUser || !storedToken) return;

    const userId = JSON.parse(storedUser).user_id;

    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}notifications/user/${userId}/read-all`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: 1 }))
          );
          setUnreadCount(0);
          const allIds = notifications.map((n) => n.id);
          saveReadNotifications([...getReadNotifications(), ...allIds]);
        }
      })
      .catch((err) => console.error("Lỗi đọc tất cả:", err))
      .finally(() => setLoading(false));
  };

  // === FORMAT THỜI GIAN ===
  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  // === BROWSER NOTIFICATION ===
  const showBrowserNotification = (message) => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
    if (Notification.permission === "granted") {
      new Notification("Thông báo mới", {
        body: message,
        icon: "/favicon.ico", 
        badge: "/favicon.ico",
        tag: "notification",
      });
    }
  };

  if (!open) return null;

  return (
    <div
      ref={popupRef}
      className="notification-popup"
      style={{
        position: "fixed",
        top: "60px",
        right: "10px",
        width: "380px",
        maxWidth: "calc(100vw - 20px)",
        maxHeight: "calc(100vh - 80px)",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        border: "1px solid #e2e8f0",
        zIndex: 9999,
        animation: "fadeIn 0.2s ease-in-out",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "15px 20px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
          Thông báo
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {unreadCount > 0 && (
            <>
              <span
                style={{
                  background: "#ef4444",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {unreadCount}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                disabled={loading}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                {loading ? "Đang xử lý..." : "Đọc tất cả"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && notifications.length === 0 && (
        <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
          <i className="fa fa-spinner fa-spin fa-xl"></i>
          <p style={{ marginTop: "10px" }}>Đang tải...</p>
        </div>
      )}

      {/* Danh sách */}
      {notifications.length === 0 && !loading ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 20px" }}>
          <i className="fa-regular fa-bell-slash fa-2xl"></i>
          <p style={{ margin: "15px 0 0 0" }}>Không có thông báo</p>
        </div>
      ) : (
        <div className="notification-list" style={{ maxHeight: "calc(100vh - 220px)", minHeight: "200px", overflowY: "auto" }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: "15px 20px",
                borderBottom: "1px solid #f1f5f9",
                background: n.is_read ? "#fff" : "#eff6ff",
                cursor: "default",
                transition: "all 0.2s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = n.is_read ? "#f8fafc" : "#dbeafe";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = n.is_read ? "#fff" : "#eff6ff";
              }}
            >
              {!n.is_read && (
                <span
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "8px",
                    height: "8px",
                    background: "#3b82f6",
                    borderRadius: "50%",
                  }}
                />
              )}

              <div
                style={{
                  marginLeft: n.is_read ? "0" : "15px",
                  fontSize: "14px",
                  color: "#1e293b",
                  lineHeight: "1.5",
                }}
              >
                {n.msg}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "6px",
                  marginLeft: n.is_read ? "0" : "15px",
                }}
              >
                <i className="fa-regular fa-clock" style={{ marginRight: "5px" }} />
                {formatTime(n.time)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          padding: "12px",
          textAlign: "center",
          borderTop: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        <a
          href="/notifications"
          style={{
            color: "#667eea",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
          Xem tất cả thông báo
        </a>
      </div>

      {/* CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Scrollbar */
        .notification-list::-webkit-scrollbar {
          width: 6px;
        }

        .notification-list::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .notification-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .notification-list::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .notification-popup {
            width: calc(100vw - 20px) !important;
            max-width: 400px !important;
            right: 10px !important;
          }

          .notification-list {
            max-height: calc(100vh - 200px) !important;
          }
        }

        @media (max-width: 480px) {
          .notification-popup {
            width: calc(100vw - 16px) !important;
            max-width: none !important;
            right: 8px !important;
            top: 55px !important;
          }

          .notification-list {
            max-height: calc(100vh - 180px) !important;
          }
        }

        @media (max-width: 360px) {
          .notification-popup {
            width: calc(100vw - 12px) !important;
            right: 6px !important;
            top: 50px !important;
            border-radius: 10px !important;
          }

          .notification-popup > div:first-child {
            padding: 10px 12px !important;
          }

          .notification-popup > div:first-child h3 {
            font-size: 14px !important;
          }

          .notification-popup > div:first-child button {
            font-size: 10px !important;
            padding: 3px 6px !important;
          }

          .notification-list > div {
            padding: 10px 12px !important;
          }

          .notification-list {
            max-height: calc(100vh - 160px) !important;
          }
        }

        /* Màn hình rất nhỏ hoặc landscape */
        @media (max-height: 600px) {
          .notification-popup {
            top: 50px !important;
            max-height: calc(100vh - 60px) !important;
          }

          .notification-list {
            max-height: calc(100vh - 150px) !important;
          }
        }
      `}</style>
    </div>
  );
}