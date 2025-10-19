import React, { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './Permissions.module.css';

function Permissions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [permissionForm, setPermissionForm] = useState({
    name: '',
    description: '',
  });
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/permissions', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Không thể lấy danh sách quyền hạn');
        const data = await response.json();
        setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const applyFilters = () => {
    const validPermissions = Array.isArray(permissions) ? permissions : [];
    return validPermissions.filter(permission => {
      const searchMatch =
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    });
  };

  const filteredPermissions = applyFilters();
  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPermissions = filteredPermissions.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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

  const openPermissionModal = (mode, permission = null) => {
    setModalMode(mode);
    setFormError(null);
    if (permission) {
      setPermissionForm({
        name: permission.name,
        description: permission.description,
      });
      setSelectedPermission(permission);
    } else {
      setPermissionForm({
        name: '',
        description: '',
      });
      setSelectedPermission(null);
    }
    setShowPermissionModal(true);
  };

  const closePermissionModal = () => {
    setShowPermissionModal(false);
    setFormError(null);
  };

  const openViewModal = (permission) => {
    setSelectedPermission(permission);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPermissionForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePermission = async () => {
    try {
      setFormError(null);
      if (!permissionForm.name) {
        setFormError('Vui lòng nhập tên quyền hạn!');
        return;
      }

      const url = modalMode === 'add' ? 'http://127.0.0.1:8000/api/permissions' : `http://127.0.0.1:8000/api/permissions/${selectedPermission.permission_id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permissionForm),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Lỗi khi lưu quyền hạn');
      }

      const newPermission = {
        permission_id: data.permission.permission_id,
        name: data.permission.name,
        description: data.permission.description,
      };

      setPermissions(prevPermissions =>
        modalMode === 'add'
          ? [...prevPermissions, newPermission]
          : prevPermissions.map(p => (p.permission_id === newPermission.permission_id ? newPermission : p))
      );

      closePermissionModal();
    } catch (err) {
      setFormError(err.message || 'Lỗi khi lưu quyền hạn');
    }
  };

  const handleDeletePermission = async (permission) => {
    if (window.confirm('Bạn có chắc muốn xóa quyền hạn này?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/permissions/${permission.permission_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Lỗi khi xóa quyền hạn');
        setPermissions(prevPermissions => prevPermissions.filter(p => p.permission_id !== permission.permission_id));
      } catch (err) {
        setFormError(err.message);
      }
    }
  };

  if (loading) return <div className={styles.mainContent}>Đang tải...</div>;
  if (error) return <div className={`${styles.mainContent} text-red-600`}>Lỗi: {error}</div>;

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm quyền hạn..."
            value={searchTerm}
            onChange={handleSearchChange}
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

      <div className={styles.actionsBar}>
        <button
          className={styles.addBtn}
          onClick={() => openPermissionModal('add')}
          aria-label="Thêm quyền hạn mới"
        >
          <i className="fas fa-plus"></i>
          Thêm quyền hạn mới
        </button>
      </div>

      <div className={styles.dataTable}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={styles.dataTableCell}>ID</th>
              <th className={styles.dataTableCell}>Tên quyền hạn</th>
              <th className={styles.dataTableCell}>Mô tả</th>
              <th className={styles.dataTableCell}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentPermissions.map(permission => (
              <tr key={permission.permission_id} className={styles.dataTableRow}>
                <td className={styles.dataTableCell} data-label="ID">{permission.permission_id}</td>
                <td className={styles.dataTableCell} data-label="Tên quyền hạn">{permission.name}</td>
                <td className={styles.dataTableCell} data-label="Mô tả">{permission.description}</td>
                <td className={styles.dataTableCell} data-label="Hành động">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>{renderPagination()}</div>

      {showPermissionModal && (
        <div className={styles.modal} role="dialog" aria-modal="true" onClick={closePermissionModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa quyền hạn' : 'Thêm quyền hạn mới'}
              </h2>
              <button className={styles.modalClose} onClick={closePermissionModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className="text-red-600 text-sm mb-4">{formError}</div>}
              <div>
                <label className="block text-sm font-medium mb-1">Tên quyền hạn</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nhập tên quyền hạn"
                  value={permissionForm.name}
                  onChange={handleFormChange}
                  className={styles.modalInput}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  name="description"
                  placeholder="Nhập mô tả quyền hạn"
                  value={permissionForm.description}
                  onChange={handleFormChange}
                  className={styles.modalInput}
                  rows="3"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={handleSavePermission}>
                Lưu
              </button>
              <button className={styles.btnSecondary} onClick={closePermissionModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedPermission && (
        <div className={styles.modal} role="dialog" aria-modal="true" onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Quyền Hạn</h2>
              <button className={styles.modalClose} onClick={closeViewModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p><strong>ID:</strong> {selectedPermission.permission_id}</p>
              <p><strong>Tên quyền hạn:</strong> {selectedPermission.name}</p>
              <p><strong>Mô tả:</strong> {selectedPermission.description}</p>
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
