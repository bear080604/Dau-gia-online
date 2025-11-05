// NotificationBell.jsx
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function NotificationBell({ open, onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const popupRef = useRef(null);
  const socketRef = useRef(null);
  const listRef = useRef(null);
  const observer = useRef(null);

  const PER_PAGE = 20; // Số thông báo mỗi lần tải

  // === CẬP NHẬT BADGE CHO HEADER ===
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

    socketRef.current = io("http://localhost:6001", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join.channel", `user.${userId}`);
    });

    socket.on("notification.created", (data) => {
      console.log("Thông báo mới realtime:", data);

      const newNotif = {
        id: data.notification.notification_id,
        msg: data.notification.message,
        is_read: 0,
        time: data.notification.created_at,
      };

      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === newNotif.id);
        if (exists) return prev;
        return [newNotif, ...prev]; // Thêm vào đầu
      });

      setUnreadCount((prev) => prev + 1);
      showBrowserNotification(data.notification.message);

      // Cuộn lên đầu khi có thông báo mới
      if (listRef.current) {
        listRef.current.scrollTop = 0;
      }
    });

    socket.on("disconnect", () => console.log("Socket disconnected"));
    socket.on("connect_error", (err) => console.error("Socket error:", err));

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // === TẢI THÔNG BÁO KHI MỞ POPUP ===
  const loadNotifications = async (pageNum = 1, append = false) => {
    if (!open) return;
    if (pageNum === 1) setLoading(true);

    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (!storedUser || !storedToken) return;

    const user = JSON.parse(storedUser);
    const userId = user.user_id;

    try {
      const res = await fetch(
        `http://localhost:8000/api/notification`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );
      const data = await res.json();

      if (data.status && Array.isArray(data.notifications)) {
        const readIds = getReadNotifications();
        const formatted = data.notifications.map((n) => ({
          id: n.notification_id,
          msg: n.message,
          is_read: readIds.includes(n.notification_id) ? 1 : n.is_read,
          time: n.created_at,
        }));

        if (append) {
          setNotifications((prev) => [...prev, ...formatted]);
        } else {
          setNotifications(formatted);
          const count = formatted.filter((n) => !n.is_read).length;
          setUnreadCount(count);
        }

        setHasMore(data.notifications.length === PER_PAGE);
      }
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
    } finally {
      if (pageNum === 1) setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPage(1);
      loadNotifications(1, false);
    }
  }, [open]);

  // === TẢI THÊM KHI CUỘN XUỐNG ===
  useEffect(() => {
    if (!open || !hasMore || loading) return;

    const currentObserver = observer.current;
    if (currentObserver) currentObserver.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => {
            const nextPage = prev + 1;
            loadNotifications(nextPage, true);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById("notification-sentinel");
    if (sentinel) observer.current.observe(sentinel);

    return () => {
      if (currentObserver) currentObserver.disconnect();
    };
  }, [open, hasMore, loading]);

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
  const markAsRead = (notifId) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return;

    fetch(`http://localhost:8000/api/notifications/${notifId}/read`, {
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
    fetch(`http://localhost:8000/api/notifications/user/${userId}/read-all`, {
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
        tag: "admin-notification",
      });
    }
  };

  if (!open) return null;

  return (
    <div
      ref={popupRef}
      style={{
        position: "absolute",
        top: "50px",
        right: "0",
        width: "380px",
        maxHeight: "80vh",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
        border: "1px solid #e2e8f0",
        zIndex: 9999,
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        animation: "slideDown 0.25s ease-out",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "white",
          fontWeight: "600",
          fontSize: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <span>Thông báo</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {unreadCount > 0 && (
            <>
              <span
                style={{
                  background: "#ef4444",
                  color: "white",
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                }}
              >
                {unreadCount}
              </span>
              <button
                onClick={markAllAsRead}
                disabled={loading}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "none",
                  padding: "4px 10px",
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

      {/* Danh sách */}
      <div
        ref={listRef}
        style={{
          maxHeight: "60vh",
          overflowY: "auto",
          padding: "0 8px",
        }}
      >
        {loading && notifications.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
            <i className="fa fa-spinner fa-spin fa-xl"></i>
            <p style={{ marginTop: "10px" }}>Đang tải...</p>
          </div>
        )}

        {notifications.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
            <i className="fa-regular fa-bell-slash fa-2x" style={{ marginBottom: "10px" }}></i>
            <p>Chưa có thông báo nào</p>
          </div>
        ) : (
          <>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markAsRead(n.id)}
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #f1f5f9",
                  background: n.is_read ? "#fff" : "#f0f9ff",
                  cursor: n.is_read ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                  borderRadius: "8px",
                  margin: "4px 0",
                }}
                onMouseEnter={(e) => {
                  if (!n.is_read) e.currentTarget.style.background = "#dbeafe";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = n.is_read ? "#fff" : "#f0f9ff";
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
                    marginLeft: n.is_read ? "0" : "16px",
                    fontSize: "13.5px",
                    color: "#1e293b",
                    lineHeight: "1.5",
                  }}
                >
                  {n.msg}
                </div>

                <div
                  style={{
                    fontSize: "11.5px",
                    color: "#64748b",
                    marginTop: "4px",
                    marginLeft: n.is_read ? "0" : "16px",
                  }}
                >
                  <i className="fa-regular fa-clock" style={{ marginRight: "4px" }} />
                  {formatTime(n.time)}
                </div>
              </div>
            ))}

            {/* Sentinel để tải thêm */}
            {hasMore && (
              <div id="notification-sentinel" style={{ height: "10px" }}></div>
            )}

            {loading && notifications.length > 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                <i className="fa fa-spinner fa-spin"></i>
                <p style={{ marginTop: "8px", fontSize: "13px" }}>Đang tải thêm...</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px",
          textAlign: "center",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          fontSize: "13px",
        }}
      >
        <a
          href="/admin/notifications"
          style={{
            color: "#6366f1",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          Xem tất cả thông báo
        </a>
      </div>

      {/* CSS */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Custom Scrollbar */
        div[style*="maxHeight: 60vh"]::-webkit-scrollbar {
          width: 6px;
        }
        div[style*="maxHeight: 60vh"]::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        div[style*="maxHeight: 60vh"]::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        div[style*="maxHeight: 60vh"]::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
} 