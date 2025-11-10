import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Notification.module.css";

const API_URL = process.env.REACT_APP_API_URL;

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationForm, setNotificationForm] = useState({
    id: "",
    user_id: "",
    message: "",
    type: "",
    is_read: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
  const togglePopup = (e) => {
    e.stopPropagation(); // tránh đóng liền sau khi mở
    setOpen((prev) => !prev);
  };
  const itemsPerPage = 8;

  // Auth token from localStorage (adjust as needed)
const getAuthConfig = () => {
  const token = localStorage.getItem("token"); // chính là cái 272|QUmqTgKsUR...
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

  // 🟩 1. Load dữ liệu thông báo
  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}notification`, getAuthConfig());
      if (res.data.status) {
        setNotifications(res.data.notifications || []);
      } else {
        setError("Không thể tải dữ liệu.");
      }
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
      setError(`Lỗi: ${err.response?.data?.message || "Không thể kết nối."}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, userFilter]);

  // 🔍 Lọc, tìm kiếm (exact match for user_id)
  const filteredNotifications = notifications.filter((n) => {
    const searchMatch =
      n.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(n.user_id).includes(searchTerm);
    const statusMatch =
      !statusFilter ||
      (statusFilter === "Đã đọc" && n.is_read === 1) ||
      (statusFilter === "Chưa đọc" && n.is_read === 0);
    const userMatch = !userFilter || String(n.user_id) === userFilter.trim();
    return searchMatch && statusMatch && userMatch;
  });

  // 📑 Phân trang
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const currentNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Render pagination with prev/next
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles.pageButton}
        >
          Trước
        </button>
        {[...Array(totalPages).keys()].map((page) => (
          <button
            key={page + 1}
            onClick={() => handlePageChange(page + 1)}
            className={
              currentPage === page + 1 ? styles.activePage : styles.pageButton
            }
          >
            {page + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles.pageButton}
        >
          Sau
        </button>
      </div>
    );
  };

  // 🟨 2. Mở modal Thêm / Sửa
  const openNotificationModal = (mode, notification = null) => {
    setModalMode(mode);
    setError(""); // Clear error
    if (mode === "edit" && notification) {
      setNotificationForm({
        ...notification,
        user_id: String(notification.user_id), // Ensure string for input
      });
    } else {
      setNotificationForm({
        id: "",
        user_id: "",
        message: "",
        type: "",
        is_read: 0,
      });
    }
    setShowNotificationModal(true);
  };

  // 🟥 3. Xóa
  const handleDeleteNotification = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}notification/${id}`, getAuthConfig());
      fetchNotifications();
    } catch (err) {
      console.error("Lỗi xóa:", err);
      setError(`Lỗi xóa: ${err.response?.data?.message || "Thử lại sau."}`);
    } finally {
      setLoading(false);
    }
  };

  // 🟦 4. Lưu (Thêm / Sửa) with validation
  const handleSaveNotification = async () => {
    if (!notificationForm.user_id || !notificationForm.message.trim()) {
      setError("Vui lòng điền User ID và Nội dung!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        user_id: parseInt(notificationForm.user_id),
        type: notificationForm.type,
        message: notificationForm.message.trim(),
        ...(modalMode === "edit" && { is_read: notificationForm.is_read }),
      };
      if (modalMode === "add") {
        await axios.post(`${API_URL}notification`, payload, getAuthConfig());
      } else {
        await axios.put(
          `${API_URL}notification/${notificationForm.notification_id}`,
          payload,
          getAuthConfig()
        );
      }
      setShowNotificationModal(false);
      fetchNotifications();
    } catch (err) {
      console.error("Lỗi lưu thông báo:", err);
      setError(`Lỗi lưu: ${err.response?.data?.message || "Thử lại sau."}`);
    } finally {
      setLoading(false);
    }
  };

  // 👁️ 5. Xem chi tiết
  const handleViewNotification = (n) => {
    setSelectedNotification(n);
    setShowViewModal(true);
  };

  // 🟩 6. Đánh dấu đã đọc
  const markAsRead = async (id) => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}notifications/${id}/read`, {}, getAuthConfig());
      fetchNotifications();
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
      setError(`Lỗi: ${err.response?.data?.message || "Thử lại sau."}`);
    } finally {
      setLoading(false);
    }
  };

  // Unread count for NotificationBell
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // 🧾 Giao diện
  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      
      </div>

      <h1 className={styles.pageTitle}>Quản Lý Thông Báo</h1>
      <p className={styles.pageSubtitle}>Quản lý và theo dõi các thông báo gửi đến người dùng</p>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Chưa đọc">Chưa đọc</option>
            <option value="Đã đọc">Đã đọc</option>
          </select>
        </div>
        <button className={styles.addBtn} onClick={() => openNotificationModal("add")} disabled={loading}>
          <i className="fas fa-plus"></i>
          Gửi thông báo mới
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Nội dung</th>
            <th>Ngày gửi</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className={styles.loading}>Đang tải...</td>
            </tr>
          ) : currentNotifications.length === 0 ? (
            <tr>
              <td colSpan="6" className={styles.noData}>Không có thông báo nào</td>
            </tr>
          ) : (
            currentNotifications.map((n) => (
              <tr key={n.notification_id}>
                <td data-label="ID">{n.notification_id}</td>
                <td data-label="User ID">{n.user.full_name}</td>
                <td data-label="Nội dung">{n.message}</td>
                <td data-label="Ngày gửi">{new Date(n.created_at).toLocaleString()}</td>
                <td data-label="Trạng thái">
                  <span className={`${styles.statusBadge} ${n.is_read ? styles.statusDadoc : styles.statusChuadoc}`}>
                    {n.is_read ? "Đã đọc" : "Chưa đọc"}
                  </span>
                </td>
                <td data-label="Hành động">
                  <button
                    className={`${styles.btn} ${styles.btnSuccess}`}
                    onClick={() => handleViewNotification(n)}
                    disabled={loading}
                  >
                    <i className="fa fa-eye" aria-hidden="true"></i>
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => openNotificationModal("edit", n)}
                    disabled={loading}
                  >
                    <i className="fa fa-pencil" aria-hidden="true"></i>
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={() => handleDeleteNotification(n.notification_id)}
                    disabled={loading}
                  >
                    <i className="fa fa-trash" aria-hidden="true"></i>
                  </button>
                  {!n.is_read && (
                    <button
                      className={`${styles.btn} ${styles.btnMarkRead}`}
                      onClick={() => markAsRead(n.notification_id)}
                      disabled={loading}
                    >
                      <i className="fa fa-check" aria-hidden="true"></i>
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {renderPagination()}

      {/* Add/Edit Notification Modal */}
      {showNotificationModal && (
        <div className={styles.modal} onClick={() => setShowNotificationModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === "edit" ? "Chỉnh sửa thông báo" : "Gửi thông báo mới"}
              </h2>
              <span className={styles.modalClose} onClick={() => setShowNotificationModal(false)}>×</span>
            </div>
            <div className={styles.modalBody}>
              {error && <div className={styles.errorMessage}>{error}</div>}
              <div>
                <label htmlFor="user_id">Người nhận (User ID)</label>
                <input
                  id="user_id"
                  type="number"
                  placeholder="Nhập User ID"
                  value={notificationForm.user_id}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      user_id: e.target.value,
                    })
                  }
                  className={styles.input}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="type">Loại thông báo</label>
                <input
                  id="type"
                  type="text"
                  placeholder="Nhập loại (tùy chọn)"
                  value={notificationForm.type}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      type: e.target.value,
                    })
                  }
                  className={styles.input}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="message">Nội dung thông báo</label>
                <textarea
                  id="message"
                  placeholder="Nhập nội dung thông báo"
                  value={notificationForm.message}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      message: e.target.value,
                    })
                  }
                  className={styles.textarea}
                  disabled={loading}
                ></textarea>
              </div>
              {modalMode === "edit" && (
                <div>
                  <label htmlFor="is_read">Trạng thái</label>
                  <select
                    id="is_read"
                    value={notificationForm.is_read}
                    onChange={(e) =>
                      setNotificationForm({
                        ...notificationForm,
                        is_read: parseInt(e.target.value),
                      })
                    }
                    className={styles.input}
                    disabled={loading}
                  >
                    <option value={0}>Chưa đọc</option>
                    <option value={1}>Đã đọc</option>
                  </select>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnPrimarySave}`} onClick={handleSaveNotification} disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setShowNotificationModal(false)}
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Notification Modal */}
      {showViewModal && selectedNotification && (
        <div className={styles.modal} onClick={() => setShowViewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Thông Báo</h2>
              <span className={styles.modalClose} onClick={() => setShowViewModal(false)}>×</span>
            </div>
            <div className={styles.modalBody}>
              <p><strong>ID:</strong> {selectedNotification.notification_id}</p>
              <p><strong>User ID:</strong> {selectedNotification.user.full_name}</p>
              <p><strong>Loại:</strong> {selectedNotification.type || "(trống)"}</p>
              <p><strong>Nội dung:</strong> {selectedNotification.message}</p>
              <p><strong>Ngày gửi:</strong> {new Date(selectedNotification.created_at).toLocaleString()}</p>
              <p><strong>Trạng thái:</strong> {selectedNotification.is_read ? "Đã đọc" : "Chưa đọc"}</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;