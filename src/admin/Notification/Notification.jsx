import React, { useState, useEffect } from 'react';
import styles from './Notification.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import NotificationBell from "../NotificationBell";

function Notification() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationForm, setNotificationForm] = useState({
    user: '',
    message: '',
    status: 'ChuaDoc'
  });
    const [open, setOpen] = useState(false);
  const togglePopup = (e) => {
    e.stopPropagation(); // tránh đóng liền sau khi mở
    setOpen((prev) => !prev);
  };
  const itemsPerPage = 5;

  const notifications = [
    {
      id: '#TB-001',
      userId: 'Nguyễn Văn A (ID: 2)',
      userIdValue: '2',
      message: 'Hồ sơ HS-001 đã được duyệt, bạn có thể tham gia phiên PH-001.',
      fullMessage: 'Thông báo đầy đủ: Hồ sơ HS-001 đã được duyệt thành công. Bạn có thể tham gia phiên đấu giá PH-001 bắt đầu từ 2025-10-03.',
      date: '2025-10-01 10:00',
      status: 'Đã đọc',
      statusClass: 'statusDadoc'
    },
    {
      id: '#TB-002',
      userId: 'Trần Thị B (ID: 3)',
      userIdValue: '3',
      message: 'Phiên PH-002 sắp bắt đầu, vui lòng kiểm tra hồ sơ HS-002.',
      fullMessage: 'Thông báo đầy đủ: Phiên đấu giá PH-002 sẽ bắt đầu vào 2025-10-04. Vui lòng kiểm tra và cập nhật hồ sơ HS-002 nếu cần.',
      date: '2025-09-30 15:30',
      status: 'Chưa đọc',
      statusClass: 'statusChuadoc'
    },
    {
      id: '#TB-003',
      userId: 'Lê Văn C (ID: 4)',
      userIdValue: '4',
      message: 'Hồ sơ HS-003 bị từ chối do thiếu tài liệu, vui lòng bổ sung.',
      fullMessage: 'Thông báo đầy đủ: Hồ sơ HS-003 bị từ chối vì thiếu giấy tờ pháp lý. Vui lòng bổ sung và nộp lại trong vòng 3 ngày.',
      date: '2025-09-29 18:00',
      status: 'Đã đọc',
      statusClass: 'statusDadoc'
    },
    {
      id: '#TB-004',
      userId: 'Nguyễn Văn A (ID: 2)',
      userIdValue: '2',
      message: 'Bạn đã thắng phiên PH-001 với giá 2.7 tỷ, vui lòng thanh toán trong 7 ngày.',
      fullMessage: 'Thông báo đầy đủ: Chúc mừng bạn đã thắng phiên đấu giá PH-001 với giá cuối 2.700.000.000 VND. Vui lòng hoàn tất thanh toán trong 7 ngày để nhận tài sản.',
      date: '2025-10-02 09:15',
      status: 'Chưa đọc',
      statusClass: 'statusChuadoc'
    },
    {
      id: '#TB-005',
      userId: 'Trần Thị B (ID: 3)',
      userIdValue: '3',
      message: 'Hợp đồng HD-002 đã được ký, kiểm tra thanh toán.',
      fullMessage: 'Thông báo đầy đủ: Hợp đồng HD-002 đã được ký điện tử thành công. Vui lòng kiểm tra và thực hiện thanh toán theo điều khoản.',
      date: '2025-10-01 13:45',
      status: 'Đã đọc',
      statusClass: 'statusDadoc'
    },
    {
      id: '#TB-006',
      userId: 'Lê Văn C (ID: 4)',
      userIdValue: '4',
      message: 'Phiên PH-003 đã kết thúc, bạn không thắng cuộc.',
      fullMessage: 'Thông báo đầy đủ: Phiên đấu giá PH-003 đã kết thúc. Rất tiếc, bạn không phải là người thắng cuộc. Cảm ơn bạn đã tham gia.',
      date: '2025-09-30 20:00',
      status: 'Chưa đọc',
      statusClass: 'statusChuadoc'
    },
    {
      id: '#TB-007',
      userId: 'Nguyễn Văn A (ID: 2)',
      userIdValue: '2',
      message: 'Cập nhật quy định mới cho phiên đấu giá sắp tới.',
      fullMessage: 'Thông báo đầy đủ: Có cập nhật quy định mới cho các phiên đấu giá từ ngày 2025-10-03. Vui lòng đọc kỹ trước khi tham gia.',
      date: '2025-10-02 08:30',
      status: 'Đã đọc',
      statusClass: 'statusDadoc'
    },
  ];

  const applyFilters = () => {
    return notifications.filter(notification => {
      const searchMatch =
        notification.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = !statusFilter || notification.status.toLowerCase().includes(statusFilter.toLowerCase());
      const userMatch = !userFilter || notification.userIdValue.toLowerCase().includes(userFilter.toLowerCase());
      return searchMatch && statusMatch && userMatch;
    });
  };

  const filteredNotifications = applyFilters();
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = filteredNotifications.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, userFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleUserFilterChange = (e) => {
    setUserFilter(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);

    if (endPage - startPage + 1 < 3 && startPage > 1) {
      startPage = Math.max(1, endPage - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.paginationBtn} ${currentPage === i ? styles.paginationBtnActive : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  const openNotificationModal = (mode, notification = null) => {
    setModalMode(mode);
    if (notification) {
      setNotificationForm({
        user: notification.userIdValue,
        message: notification.fullMessage,
        status: notification.status === 'Chưa đọc' ? 'ChuaDoc' : 'DaDoc'
      });
    } else {
      setNotificationForm({
        user: '',
        message: '',
        status: 'ChuaDoc'
      });
    }
    setShowNotificationModal(true);
  };

  const closeNotificationModal = () => {
    setShowNotificationModal(false);
  };

  const openViewModal = (notification) => {
    setSelectedNotification(notification);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNotificationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveNotification = () => {
    alert('Chức năng gửi chỉ là demo, không gửi thực tế.');
    closeNotificationModal();
  };

  const handleDeleteNotification = (notification) => {
    if (window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
      alert('Chức năng xóa chỉ là demo, không xóa thực tế.');
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Chưa đọc': 'statusChuadoc',
      'Đã đọc': 'statusDadoc'
    };
    return statusMap[status] || 'statusChuadoc';
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className={styles.userProfile}>
           <div>
                       <div onClick={togglePopup} style={{ cursor: "pointer" }}>
                         <i className="fa-solid fa-bell fa-lg"></i>
                       </div>
         
                       <NotificationBell open={open} onClose={() => setOpen(false)} />
                     </div>
          <div className={styles.profileAvatar}>QT</div>
        </div>
      </div>

      <h1 className={styles.pageTitle}>Quản Lý Thông Báo</h1>
      <p className={styles.pageSubtitle}>Quản lý và theo dõi các thông báo gửi đến người dùng</p>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select className={styles.filterSelect} value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="">Tất cả trạng thái</option>
            <option value="Chưa đọc">Chưa đọc</option>
            <option value="Đã đọc">Đã đọc</option>
          </select>
          <select className={styles.filterSelect} value={userFilter} onChange={handleUserFilterChange}>
            <option value="">Tất cả người nhận</option>
            <option value="2">Nguyễn Văn A (ID: 2)</option>
            <option value="3">Trần Thị B (ID: 3)</option>
            <option value="4">Lê Văn C (ID: 4)</option>
          </select>
        </div>
        <button className={styles.addBtn} onClick={() => openNotificationModal('add')}>
          <i className="fas fa-plus"></i>
          Gửi thông báo mới
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Mã TB</th>
            <th>Người nhận (ID)</th>
            <th>Nội dung</th>
            <th>Ngày gửi</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentNotifications.map(notification => (
            <tr key={notification.id}>
              <td data-label="Mã TB">{notification.id}</td>
              <td data-label="Người nhận (ID)">{notification.userId}</td>
              <td data-label="Nội dung">{notification.message}</td>
              <td data-label="Ngày gửi">{notification.date}</td>
              <td data-label="Trạng thái">
                <span className={`${styles.statusBadge} ${styles[getStatusClass(notification.status)]}`}>{notification.status}</span>
              </td>
              <td data-label="Hành động">
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openNotificationModal('edit', notification)}>
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteNotification(notification)}>
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
                <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => openViewModal(notification)}>
                  <i className="fa fa-eye" aria-hidden="true"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        {renderPagination()}
      </div>

      {/* Add/Edit Notification Modal */}
      {showNotificationModal && (
        <div className={styles.modal} onClick={closeNotificationModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa thông báo' : 'Gửi thông báo mới'}
              </h2>
              <span className={styles.modalClose} onClick={closeNotificationModal}>×</span>
            </div>
            <div className={styles.modalBody}>
              <div>
                <label htmlFor="user">Người nhận (ID User)</label>
                <select
                  id="user"
                  name="user"
                  value={notificationForm.user}
                  onChange={handleFormChange}
                >
                  <option value="">Chọn người nhận</option>
                  <option value="2">Nguyễn Văn A (ID: 2)</option>
                  <option value="3">Trần Thị B (ID: 3)</option>
                  <option value="4">Lê Văn C (ID: 4)</option>
                  <option value="5">Phạm Thị D (ID: 5)</option>
                  <option value="6">Hoàng Văn E (ID: 6)</option>
                  <option value="7">Vũ Thị F (ID: 7)</option>
                </select>
              </div>
              <div>
                <label htmlFor="message">Nội dung thông báo</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Nhập nội dung thông báo"
                  value={notificationForm.message}
                  onChange={handleFormChange}
                ></textarea>
              </div>
              <div>
                <label htmlFor="status">Trạng thái</label>
                <select
                  id="status"
                  name="status"
                  value={notificationForm.status}
                  onChange={handleFormChange}
                >
                  <option value="ChuaDoc">Chưa đọc</option>
                  <option value="DaDoc">Đã đọc</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveNotification}>Gửi</button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeNotificationModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* View Notification Modal */}
      {showViewModal && selectedNotification && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Thông Báo</h2>
              <span className={styles.modalClose} onClick={closeViewModal}>×</span>
            </div>
            <div className={styles.modalBody}>
              <p><strong>Mã thông báo:</strong> {selectedNotification.id}</p>
              <p><strong>Người nhận:</strong> {selectedNotification.userId}</p>
              <p><strong>Nội dung:</strong> {selectedNotification.fullMessage}</p>
              <p><strong>Ngày gửi:</strong> {selectedNotification.date}</p>
              <p><strong>Trạng thái:</strong> {selectedNotification.status}</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeViewModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notification;
