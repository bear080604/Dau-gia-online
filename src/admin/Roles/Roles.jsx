import React, { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './Roles.module.css';
import NotificationBell from "../NotificationBell";

function Roles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
  });
      const [open, setOpen] = useState(false);
    const togglePopup = (e) => {
      e.stopPropagation(); // tránh đóng liền sau khi mở
      setOpen((prev) => !prev);
    };
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/roles', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Không thể lấy danh sách vai trò');
        const data = await response.json();
        setRoles(Array.isArray(data.roles) ? data.roles : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

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
        console.error('Lỗi khi lấy permissions:', err.message);
      }
    };
    fetchPermissions();
  }, []);

  const applyFilters = () => {
    const validRoles = Array.isArray(roles) ? roles : [];
    return validRoles.filter(role => {
      const searchMatch =
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return searchMatch;
    });
  };

  const filteredRoles = applyFilters();
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

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

  const openRoleModal = (mode, role = null) => {
    setModalMode(mode);
    setFormError(null);
    if (role) {
      setRoleForm({
        name: role.name,
        description: role.description || '',
      });
      setSelectedRole(role);
    } else {
      setRoleForm({
        name: '',
        description: '',
      });
      setSelectedRole(null);
    }
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setFormError(null);
  };

  const openViewModal = (role) => {
    setSelectedRole(role);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  const openAssignModal = async (role) => {
    setSelectedRole(role);
    setFormError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/roles/${role.role_id}/permissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Không thể lấy danh sách quyền của vai trò');
      const data = await response.json();
      const permissionIds = Array.isArray(data.permissions) ? data.permissions.map(p => p.permission_id) : [];
      setSelectedPermissions(permissionIds);
    } catch (err) {
      setFormError(err.message);
    }
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setFormError(null);
    setSelectedPermissions([]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setRoleForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllPermissions = () => {
    if (selectedPermissions.length === permissions.length) {
      // Nếu tất cả đã được chọn, bỏ chọn tất cả
      setSelectedPermissions([]);
    } else {
      // Chọn tất cả các quyền
      setSelectedPermissions(permissions.map(p => p.permission_id));
    }
  };

  const handleSaveRole = async () => {
    try {
      setFormError(null);
      if (!roleForm.name) {
        setFormError('Vui lòng nhập tên vai trò!');
        return;
      }

      const url = modalMode === 'add' ? 'http://127.0.0.1:8000/api/roles' : `http://127.0.0.1:8000/api/roles/${selectedRole.role_id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleForm),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Lỗi khi lưu vai trò');
      }

      const newRole = {
        role_id: data.role.role_id,
        name: data.role.name,
        description: data.role.description,
      };

      setRoles(prevRoles =>
        modalMode === 'add'
          ? [...prevRoles, newRole]
          : prevRoles.map(r => (r.role_id === newRole.role_id ? newRole : r))
      );

      closeRoleModal();
    } catch (err) {
      setFormError(err.message || 'Lỗi khi lưu vai trò');
    }
  };

  const handleAssignPermissions = async () => {
    try {
      setFormError(null);
      const response = await fetch(`http://127.0.0.1:8000/api/roles/${selectedRole.role_id}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions: selectedPermissions }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Lỗi khi phân quyền');
      }

      // Cập nhật danh sách roles với permissions mới
      const updatedRoleResponse = await fetch(`http://127.0.0.1:8000/api/roles/${selectedRole.role_id}/permissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const updatedRoleData = await updatedRoleResponse.json();
      setRoles(prevRoles =>
        prevRoles.map(r =>
          r.role_id === selectedRole.role_id
            ? { ...r, permissions: Array.isArray(updatedRoleData.permissions) ? updatedRoleData.permissions : [] }
            : r
        )
      );

      closeAssignModal();
      alert('Phân quyền thành công!');
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteRole = async (role) => {
    if (window.confirm('Bạn có chắc muốn xóa vai trò này?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/roles/${role.role_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Lỗi khi xóa vai trò');
        setRoles(prevRoles => prevRoles.filter(r => r.role_id !== role.role_id));
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
            placeholder="Tìm kiếm vai trò..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
        
      </div>

      <h1 className={styles.pageTitle}>Quản Lý Vai Trò</h1>
      <p className={styles.pageSubtitle}>Quản lý vai trò và phân quyền hệ thống</p>

      <div className={styles.actionsBar}>
        <button
          className={styles.addBtn}
          onClick={() => openRoleModal('add')}
          aria-label="Thêm vai trò mới"
        >
          <i className="fas fa-plus"></i>
          Thêm vai trò mới
        </button>
      </div>

      <div className={styles.dataTable}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={styles.dataTableCell}>ID</th>
              <th className={styles.dataTableCell}>Tên vai trò</th>
              <th className={styles.dataTableCell}>Mô tả</th>
              <th className={styles.dataTableCell}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentRoles.map(role => (
              <tr key={role.role_id} className={styles.dataTableRow}>
                <td className={styles.dataTableCell} data-label="ID">{role.role_id}</td>
                <td className={styles.dataTableCell} data-label="Tên vai trò">{role.name}</td>
                <td className={styles.dataTableCell} data-label="Mô tả">{role.description || 'Không có mô tả'}</td>
                <td className={styles.dataTableCell} data-label="Hành động">
                  <div className="flex gap-2">
                    <button
                      className={styles.btnPrimary}
                      onClick={() => openRoleModal('edit', role)}
                      aria-label="Chỉnh sửa vai trò"
                    >
                      <i className="fa fa-pencil"></i>
                    </button>
                    <button
                      className={styles.btnDanger}
                      onClick={() => handleDeleteRole(role)}
                      aria-label="Xóa vai trò"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                    <button
                      className={styles.btnSuccess}
                      onClick={() => openViewModal(role)}
                      aria-label="Xem chi tiết vai trò"
                    >
                      <i className="fa fa-eye"></i>
                    </button>
                    <button
                      className={styles.btnInfo}
                      onClick={() => openAssignModal(role)}
                      aria-label="Phân quyền"
                    >
                      <i className="fa fa-key"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>{renderPagination()}</div>

      {showRoleModal && (
        <div className={styles.modal} role="dialog" aria-modal="true" onClick={closeRoleModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
              </h2>
              <button className={styles.modalClose} onClick={closeRoleModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className="text-red-600 text-sm mb-4">{formError}</div>}
              <div>
                <label className="block text-sm font-medium mb-1">Tên vai trò</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nhập tên vai trò"
                  value={roleForm.name}
                  onChange={handleFormChange}
                  className={styles.modalInput}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  name="description"
                  placeholder="Nhập mô tả vai trò"
                  value={roleForm.description}
                  onChange={handleFormChange}
                  className={styles.modalInput}
                  rows="3"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={handleSaveRole}>
                Lưu
              </button>
              <button className={styles.btnSecondary} onClick={closeRoleModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedRole && (
        <div className={styles.modal} role="dialog" aria-modal="true" onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Vai Trò</h2>
              <button className={styles.modalClose} onClick={closeViewModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p><strong>ID:</strong> {selectedRole.role_id}</p>
              <p><strong>Tên vai trò:</strong> {selectedRole.name}</p>
              <p><strong>Mô tả:</strong> {selectedRole.description || 'Không có mô tả'}</p>
              <p><strong>Quyền hạn:</strong></p>
              <ul>
                {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                  selectedRole.permissions.map(permission => (
                    <li key={permission.permission_id}>{permission.name} - {permission.description}</li>
                  ))
                ) : (
                  <li>Không có quyền nào được gán</li>
                )}
              </ul>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={closeViewModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedRole && (
        <div className={styles.modal} role="dialog" aria-modal="true" onClick={closeAssignModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Phân Quyền Cho Vai Trò: {selectedRole.name}</h2>
              <button className={styles.modalClose} onClick={closeAssignModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className="text-red-600 text-sm mb-4">{formError}</div>}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium">Chọn quyền hạn:</label>
                  <button
                    className={styles.btnPrimary}
                    onClick={handleSelectAllPermissions}
                  >
                    {selectedPermissions.length === permissions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>
                <div className={styles.permissionsList}>
                  {permissions.map(permission => (
                    <label key={permission.permission_id} className={styles.permissionItem}>
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.permission_id)}
                        onChange={() => handlePermissionChange(permission.permission_id)}
                      />
                      <span>{permission.name} - {permission.description}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={handleAssignPermissions}>
                Lưu Phân Quyền
              </button>
              <button className={styles.btnSecondary} onClick={closeAssignModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Roles; 