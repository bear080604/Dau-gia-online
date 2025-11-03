import React, { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './Permissions.module.css';

function Permissions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 5;

  // Lấy URL từ .env
  const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';

  // Fetch danh sách quyền hạn
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/permissions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || 'Không thể tải dữ liệu');
        }

        const data = await response.json();
        setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [API_URL]);

  // Lọc dữ liệu
  const filteredPermissions = permissions.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);
  const currentPermissions = filteredPermissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const openViewModal = (permission) => {
    setSelectedPermission(permission);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  const renderPagination = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, start + 2);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.paginationBtn} ${currentPage === i ? styles.paginationBtnActive : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (loading) return <div className={styles.mainContent}>Đang tải...</div>;
  if (error) return <div className={`${styles.mainContent} text-red-600`}>Lỗi: {error}</div>;

  return (
    <div className={styles.mainContent}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm quyền hạn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.userProfile}>
          <div className={styles.notificationBell}>
            <i className="fas fa-bell"></i>
          </div>
          <div className={styles.profileAvatar}>QT</div>
        </div>
      </div>

      <h1 className={styles.pageTitle}>Quản Lý Quyền Hạn</h1>
      <p className={styles.pageSubtitle}>Quản lý quyền hạn hệ thống</p>

      {/* <div className={styles.actionsBar}>
        <button
          className={styles.addBtn}
          onClick={() => openPermissionModal('add')}
          aria-label="Thêm quyền hạn mới"
        >
          <i className="fas fa-plus"></i>
          Thêm quyền hạn mới
        </button>
      </div> */}

      {/* Bảng */}
      <div className={styles.dataTable}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={styles.dataTableCell}>ID</th>
              <th className={styles.dataTableCell}>Tên quyền hạn</th>
              <th className={styles.dataTableCell}>Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {currentPermissions.map(permission => (
              <tr key={permission.permission_id} className={styles.dataTableRow}>
                <td className={styles.dataTableCell} data-label="ID">{permission.permission_id}</td>
                <td className={styles.dataTableCell} data-label="Tên quyền hạn">{permission.name}</td>
                <td className={styles.dataTableCell} data-label="Mô tả">{permission.description}</td>
                {/* <td className={styles.dataTableCell} data-label="Hành động">
                  <div className="flex gap-2">
                    <button
                      className={styles.btnPrimary}
                      onClick={() => openPermissionModal('edit', permission)}
                      aria-label="Chỉnh sửa quyền hạn"
                    >
                      <i className="fa fa-pencil"></i>
                    </button>
                    <button
                      className={styles.btnDanger}
                      onClick={() => handleDeletePermission(permission)}
                      aria-label="Xóa quyền hạn"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                    <button
                      className={styles.btnSuccess}
                      onClick={() => openViewModal(permission)}
                      aria-label="Xem chi tiết quyền hạn"
                    >
                      <i className="fa fa-eye"></i>
                    </button>
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className={styles.pagination}>{renderPagination()}</div>
      )}

      {/* Modal Xem */}
      {showViewModal && selectedPermission && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Quyền Hạn</h2>
              <button className={styles.modalClose} onClick={closeViewModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p><strong>ID:</strong> {selectedPermission.permission_id}</p>
              <p><strong>Tên:</strong> {selectedPermission.name}</p>
              <p><strong>Mô tả:</strong> {selectedPermission.description || '—'}</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={closeViewModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Permissions;