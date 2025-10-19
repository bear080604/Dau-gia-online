import React, { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './Users.module.css';

function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: '',
  });
  const [selectedRole, setSelectedRole] = useState('');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
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
        console.error('Lỗi khi lấy roles:', err.message);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/showuser', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Không thể lấy danh sách người dùng');
        const data = await response.json();
        const mappedUsers = Array.isArray(data.users)
          ? data.users.map(user => ({
              id: user.user_id,
              name: user.full_name,
              email: user.email,
              phone: user.phone,
              role_id: user.role_id,
              role_name: user.role?.name || 'Chưa có vai trò',
              createdDate: user.created_at,
              deletedAt: user.deleted_at,
            }))
          : [];
        setUsers(mappedUsers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const applyFilters = () => {
    const validUsers = Array.isArray(users) ? users : [];
    return validUsers.filter(user => {
      const searchMatch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = !roleFilter || user.role_id === parseInt(roleFilter);
      return searchMatch && roleMatch;
    });
  };

  const filteredUsers = applyFilters();
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
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

  const openUserModal = (mode, user = null) => {
    setModalMode(mode);
    setFormError(null);
    if (user) {
      setUserForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id || '',
      });
      setSelectedUser(user);
    } else {
      setUserForm({
        name: '',
        email: '',
        phone: '',
        role_id: roles.length > 0 ? roles[0].role_id : '',
      });
      setSelectedUser(null);
    }
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setFormError(null);
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role_id || '');
    setFormError(null);
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setSelectedRole('');
    setFormError(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveUser = async () => {
    try {
      setFormError(null);
      if (!userForm.name || !userForm.email) {
        setFormError('Vui lòng nhập đầy đủ họ tên và email!');
        return;
      }

      // Lưu thông tin user (không bao gồm role)
      const url = modalMode === 'add' 
        ? 'http://127.0.0.1:8000/api/register' 
        : `http://127.0.0.1:8000/api/users/${selectedUser.id}/update`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const payload = {
        full_name: userForm.name,
        email: userForm.email,
        phone: userForm.phone || undefined,
      };

      const response = await fetch(url, {
        method,
        headers: {
          ...(modalMode === 'add' ? {} : { 'Authorization': `Bearer ${localStorage.getItem('token')}` }),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Lỗi khi lưu người dùng');
      }

      // Cập nhật danh sách users trong state
      const newUser = {
        id: modalMode === 'add' ? data.user.user_id : selectedUser.id,
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        role_id: modalMode === 'add' ? null : selectedUser.role_id,
        role_name: modalMode === 'add' ? 'Chưa có vai trò' : selectedUser.role_name,
        createdDate: data.user.created_at,
        deletedAt: data.user.deleted_at || null,
      };

      setUsers(prevUsers =>
        modalMode === 'add'
          ? [...prevUsers, newUser]
          : prevUsers.map(u => (u.id === newUser.id ? newUser : u))
      );

      closeUserModal();
    } catch (err) {
      setFormError(err.message || 'Lỗi khi lưu người dùng');
    }
  };

  const handleChangeRole = async () => {
    try {
      setFormError(null);
      
      if (!selectedRole) {
        setFormError('Vui lòng chọn vai trò!');
        return;
      }

      const newRole = roles.find(r => r.role_id === parseInt(selectedRole));
      if (!newRole) {
        setFormError('Vai trò không hợp lệ!');
        return;
      }

      // Xóa role cũ nếu có
      if (selectedUser.role_id) {
        const oldRole = roles.find(r => r.role_id === parseInt(selectedUser.role_id));
        if (oldRole) {
          await fetch(`http://127.0.0.1:8000/api/users/${selectedUser.id}/roles`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ roles: [oldRole.name] }),
          });
        }
      }

      // Gán role mới
      const roleResponse = await fetch(`http://127.0.0.1:8000/api/users/${selectedUser.id}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ roles: [newRole.name] }),
      });

      const roleData = await roleResponse.json();
      if (!roleResponse.ok) {
        if (roleData.errors) {
          const errorMessages = Object.values(roleData.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(roleData.message || 'Lỗi khi đổi vai trò');
      }

      // Cập nhật state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === selectedUser.id
            ? { ...u, role_id: parseInt(selectedRole), role_name: newRole.name }
            : u
        )
      );

      closeRoleModal();
    } catch (err) {
      setFormError(err.message || 'Lỗi khi đổi vai trò');
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Lỗi khi xóa người dùng');
        setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
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
            placeholder="Tìm kiếm người dùng..."
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

      <h1 className={styles.pageTitle}>Quản Lý Người Dùng</h1>
      <p className={styles.pageSubtitle}>Quản lý tài khoản và quyền hạn người dùng hệ thống</p>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={roleFilter}
            onChange={handleRoleFilterChange}
          >
            <option value="">Tất cả vai trò</option>
            {roles.map(role => (
              <option key={role.role_id} value={role.role_id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => openUserModal('add')}
          aria-label="Thêm người dùng mới"
        >
          <i className="fas fa-plus"></i>
          Thêm người dùng mới
        </button>
      </div>

      <div className={styles.dataTable}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={styles.dataTableCell}>ID</th>
              <th className={styles.dataTableCell}>Họ và tên</th>
              <th className={styles.dataTableCell}>Email</th>
              <th className={styles.dataTableCell}>Số điện thoại</th>
              <th className={styles.dataTableCell}>Vai trò</th>
              <th className={styles.dataTableCell}>Ngày tạo</th>
              <th className={styles.dataTableCell}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id} className={styles.dataTableRow}>
                <td className={styles.dataTableCell} data-label="ID">{user.id}</td>
                <td className={styles.dataTableCell} data-label="Họ và tên">{user.name}</td>
                <td className={styles.dataTableCell} data-label="Email">{user.email}</td>
                <td className={styles.dataTableCell} data-label="Số điện thoại">{user.phone}</td>
                <td className={styles.dataTableCell} data-label="Vai trò">
                  <span
                    className={`${styles.statusBadge} ${
                      styles[`role${user.role_name.replace(/\s/g, '')}`] || styles.roleUser
                    }`}
                  >
                    {user.role_name}
                  </span>
                </td>
                <td className={styles.dataTableCell} data-label="Ngày tạo">{user.createdDate}</td>
                <td className={styles.dataTableCell} data-label="Hành động">
                  <div className="flex gap-2">
                    <button
                      className={styles.btnPrimary}
                      onClick={() => openUserModal('edit', user)}
                      aria-label="Chỉnh sửa người dùng"
                    >
                      <i className="fa fa-pencil"></i>
                    </button>
                    <button
                      className={styles.btnDanger}
                      onClick={() => handleDeleteUser(user)}
                      aria-label="Xóa người dùng"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                    <button
                      className={styles.btnSuccess}
                      onClick={() => openViewModal(user)}
                      aria-label="Xem chi tiết người dùng"
                    >
                      <i className="fa fa-eye"></i>
                    </button>
                    <button
                      className={styles.btnInfo}
                      onClick={() => openRoleModal(user)}
                      aria-label="Đổi vai trò"
                    >
                      <i className="fa fa-user-tag"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>{renderPagination()}</div>

      {showUserModal && (
        <div className={styles.modal} role="dialog" aria-modal="true" onClick={closeUserModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h2>
              <button className={styles.modalClose} onClick={closeUserModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className="text-red-600 text-sm mb-4">{formError}</div>}
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nhập họ và tên"
                  value={userForm.name}
                  onChange={handleFormChange}
                  className={styles.modalInput}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập email"
                  value={userForm.email}
                  onChange={handleFormChange}
                  className={styles.modalInput}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Nhập số điện thoại"
                  value={userForm.phone}
                  onChange={handleFormChange}
                  className={styles.modalInput}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={handleSaveUser}>
                Lưu
              </button>
              <button className={styles.btnSecondary} onClick={closeUserModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedUser && (
        <div className={styles.modal} role="dialog" aria-modal="true" onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Người Dùng</h2>
              <button className={styles.modalClose} onClick={closeViewModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p><strong>ID:</strong> {selectedUser.id}</p>
              <p><strong>Họ và tên:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Số điện thoại:</strong> {selectedUser.phone}</p>
              <p><strong>Vai trò:</strong> {selectedUser.role_name}</p>
              <p><strong>Ngày tạo:</strong> {selectedUser.createdDate}</p>
              <p><strong>Trạng thái xóa:</strong> {selectedUser.deletedAt || 'Đang hoạt động'}</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={closeViewModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && selectedUser && (
        <div className={styles.modal} role="dialog" aria-modal="true" onClick={closeRoleModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Đổi Vai Trò - {selectedUser.name}</h2>
              <button className={styles.modalClose} onClick={closeRoleModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className="text-red-600 text-sm mb-4">{formError}</div>}
              <div>
                <label className="block text-sm font-medium mb-2">Vai trò hiện tại</label>
                <p className="text-gray-700 mb-4 font-semibold">{selectedUser.role_name}</p>
                
                <label className="block text-sm font-medium mb-1">Chọn vai trò mới</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className={styles.modalInput}
                >
                  <option value="">-- Chọn vai trò --</option>
                  {roles.map(role => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={handleChangeRole}>
                Đổi Vai Trò
              </button>
              <button className={styles.btnSecondary} onClick={closeRoleModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;