import React, { useEffect, useState, useRef } from "react";

export default function NotificationPopup({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const popupRef = useRef(null);

  // 🧭 Gọi API thật
  useEffect(() => {
    if (!open) return; // chỉ gọi khi mở popup
    fetch("http://localhost:8000/api/notifications/10")
      .then((res) => res.json())
      .then((data) => {
        if (data.status && Array.isArray(data.notifications)) {
          // Sắp xếp giảm dần theo thời gian, sau đó lấy 7 thông báo mới nhất
          const sorted = data.notifications
            .sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            )
            .slice(0, 7);

          setNotifications(
            sorted.map((n) => ({
              id: n.notification_id,
              msg: n.message,
              is_read: n.is_read,
              time: n.created_at,
            }))
          );
        }
      })
      .catch((err) => console.error("Lỗi tải thông báo:", err));
  }, [open]);

  // 🚪 Click ngoài popup => đóng
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (open) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={popupRef}
      className="notification-popup"
      style={{
        position: "absolute",
        top: "46px",
        right: "70px",
        width: "340px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
        border: "1px solid #e2e8f0",
        padding: "10px",
        zIndex: 9999,
        animation: "fadeIn 0.2s ease-in-out",
      }}
    >
      <h3 style={{ margin: "8px 0", textAlign: "center" }}>Thông báo mới nhất</h3>

      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
          <i className="fa-regular fa-bell-slash fa-2xl"></i>
          <p>Không có thông báo</p>
        </div>
      ) : (
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: "10px 15px",
                borderBottom: "1px solid #f1f5f9",
                background: n.is_read ? "#fff" : "#eff6ff",
              }}
            >
              <div>{n.msg}</div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "5px",
                }}
              >
                {n.time}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
