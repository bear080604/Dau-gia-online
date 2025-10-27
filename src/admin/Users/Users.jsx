import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './Users.module.css';

const API_URL = 'http://127.0.0.1:8000/api/';

function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  // const [showRoleModal, setShowRoleModal] = useState(false); doi role
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: '',
  });
  // const [selectedRole, setSelectedRole] = useState('');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  const itemsPerPage = 5;

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rolesResponse, usersResponse] = await Promise.all([
          axios.get(`${API_URL}roles`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}showuser`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setRoles(Array.isArray(rolesResponse.data.roles) ? rolesResponse.data.roles : []);

        const mappedUsers = Array.isArray(usersResponse.data.users)
          ? usersResponse.data.users.map(user => ({
              id: user.user_id,
              name: user.full_name,
              email: user.email,
              phone: user.phone,
              role_id: user.role_id,
              role_name: user.role?.name || 'Chưa có vai trò',
              email_verify: user.email_verified_at ? 'Đã xác minh' : 'Chưa xác minh',
              admin_verify:
                user.admin_verify_status === 'approved'
                  ? 'Đã xét duyệt'
                  : user.admin_verify_status === 'rejected'
                  ? 'Bị từ chối'
                  : 'Chờ xét duyệt',
              createdDate: user.created_at,
              deletedAt: user.deleted_at,
            }))
          : [];
        setUsers(mappedUsers);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể lấy dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  // const openRoleModal = (user) => {
  //   setSelectedUser(user);
  //   setSelectedRole(user.role_id || '');
  //   setFormError(null);
  //   setShowRoleModal(true);
  // };

  // const closeRoleModal = () => {
  //   setShowRoleModal(false);
  //   setSelectedRole('');
  //   setFormError(null);
  // };

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

      const url =
        modalMode === 'add'
          ? `${API_URL}register`
          : `${API_URL}user/update/${selectedUser.id}`;
      const method = modalMode === 'add' ? 'post' : 'put';

      const payload = {
        full_name: userForm.name,
        email: userForm.email,
        phone: userForm.phone || undefined,
      };

      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          ...(modalMode === 'add' ? {} : { Authorization: `Bearer ${token}` }),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      let updatedUser = {
        id: modalMode === 'add' ? response.data.user.user_id : selectedUser.id,
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        role_id: userForm.role_id || selectedUser.role_id,
        role_name:
          roles.find(r => r.role_id === parseInt(userForm.role_id))?.name ||
          selectedUser.role_name,
        createdDate: response.data.user.created_at,
        deletedAt: response.data.user.deleted_at || null,
      };

      // Nếu đang ở chế độ chỉnh sửa và chọn vai trò mới → đổi role luôn
      if (modalMode === 'edit' && userForm.role_id) {
        await axios.post(
          `${API_URL}users/${selectedUser.id}/roles`,
          { role_id: parseInt(userForm.role_id) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setUsers(prevUsers =>
        modalMode === 'add'
          ? [...prevUsers, updatedUser]
          : prevUsers.map(u => (u.id === updatedUser.id ? updatedUser : u))
      );

      closeUserModal();
    } catch (err) {
      setFormError(
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : err.response?.data?.message || 'Lỗi khi lưu người dùng'
      );
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        const response = await axios.delete(`${API_URL}users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.data?.status) {
          throw new Error(response.data?.message || 'Lỗi khi xóa người dùng');
        }
        setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
      } catch (err) {
        setFormError(err.response?.data?.message || 'Lỗi khi xóa người dùng');
      }
    }
  };

  const handleApproveUser = async (user) => {
    try {
      const response = await axios.put(`${API_URL}user/approve/${user.id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      if (!response.data.status) {
        throw new Error(response.data.message || 'Lỗi khi duyệt người dùng');
      }
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id
            ? { ...u, admin_verify: 'Đã xét duyệt', admin_verify_status: 'approved' }
            : u
        )
      );
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi duyệt người dùng');
    }
  };

  const handleRejectUser = async (user) => {
    try {
      const response = await axios.put(`${API_URL}user/reject/${user.id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      if (!response.data.status) {
        throw new Error(response.data.message || 'Lỗi khi từ chối người dùng');
      }
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id
            ? { ...u, admin_verify: 'Bị từ chối', admin_verify_status: 'rejected' }
            : u
        )
      );
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi từ chối người dùng');
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
              <th className={styles.dataTableCell}>Xác minh email</th>
              <th className={styles.dataTableCell}>Xét duyệt</th>
              <th className={styles.dataTableCell}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id} className={styles.dataTableCell}>
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
                <td className={styles.dataTableCell} data-label="Xác minh email">{user.email_verify}</td>
                <td className={styles.dataTableCell} data-label="Xét duyệt">{user.admin_verify}</td>
                <td className={styles.dataTableCell} data-label="Thao tác">
                  <div className="flex gap-2">
                    {user.admin_verify === 'Chờ xét duyệt' ? (
                      <>
                        <button
                          className={`${styles.btnSuccess} bg-green-600 hover:bg-green-700`}
                          onClick={() => handleApproveUser(user)}
                          aria-label="Duyệt người dùng"
                        >
                          <i className="fa fa-check"></i>
                        </button>
                        <button
                          className={`${styles.btnDanger} bg-red-600 hover:bg-red-700`}
                          onClick={() => handleRejectUser(user)}
                          aria-label="Từ chối người dùng"
                        >
                          <i className="fa fa-times"></i>
                        </button>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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
              {modalMode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Vai trò</label>
                  <select
                    name="role_id"
                    value={userForm.role_id}
                    onChange={handleFormChange}
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
              )}
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
              <p><strong>Trạng thái duyệt:</strong> {selectedUser.admin_verify}</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={closeViewModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {showRoleModal && selectedUser && (
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
      )} */}
    </div>
  );
}

export default Users;