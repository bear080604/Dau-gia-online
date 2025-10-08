import React, { useState, useEffect } from 'react';
import styles from './Users.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'User',
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 5;

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

        if (!response.ok) {
          throw new Error('Không thể lấy danh sách người dùng');
        }

        const data = await response.json();
        const mappedUsers = Array.isArray(data.users)
          ? data.users.map(user => ({
              id: user.user_id,
              name: user.full_name,
              email: user.email,
              phone: user.phone,
              role: user.role,
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
      const roleMatch = !roleFilter || user.role.toLowerCase().includes(roleFilter.toLowerCase());
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
    if (user) {
      setUserForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: '',
        password_confirmation: '',
        role: user.role,
      });
      setSelectedUser(user);
    } else {
      setUserForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'User',
      });
      setSelectedUser(null);
    }
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
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
      if (modalMode === 'add' && (!userForm.name || !userForm.email || !userForm.password)) {
        alert('Vui lòng nhập đầy đủ họ tên, email và mật khẩu!');
        return;
      }
      if (modalMode === 'add' && userForm.password !== userForm.password_confirmation) {
        alert('Mật khẩu và xác nhận mật khẩu không khớp!');
        return;
      }

      const url = modalMode === 'add' ? 'http://127.0.0.1:8000/api/register' : `http://127.0.0.1:8000/api/update`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const payload = {
        full_name: userForm.name,
        email: userForm.email,
        phone: userForm.phone || undefined,
        password: userForm.password || undefined,
        password_confirmation: userForm.password_confirmation || undefined,
        role: userForm.role || 'User',
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

      const newUser = {
        id: data.user.user_id,
        name: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
        createdDate: data.user.created_at,
        deletedAt: data.user.deleted_at || null,
      };

      setUsers(prevUsers =>
        modalMode === 'add'
          ? [...prevUsers, newUser]
          : prevUsers.map(u => (u.id === newUser.id ? newUser : u))
      );

      alert('Người dùng đã được lưu thành công!');
      closeUserModal();
    } catch (err) {
      alert('Lỗi khi lưu người dùng: ' + (err.message || JSON.stringify(err)));
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

        if (!response.ok) {
          throw new Error('Lỗi khi xóa người dùng');
        }

        setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
        alert('Người dùng đã được xóa thành công!');
      } catch (err) {
        alert('Lỗi khi xóa người dùng: ' + err.message);
      }
    }
  };

  const getRoleClass = (role) => {
    const roleMap = {
      User: 'roleUser',
      Administrator: 'roleAdmin',
      Customer: 'roleCustomer',
      'Chuyên viên thẩm định': 'roleChuyenvienttc',
      'Đấu giá viên': 'roleDaugiavien',
      'Đơn vị thực hiện': 'roleDonvithuc',
      'Tổ chức đấu giá': 'roleTochucdaugia',
    };
    return roleMap[role] || 'roleUser';
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

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
          <select className={styles.filterSelect} value={roleFilter} onChange={handleRoleFilterChange}>
            <option value="">Tất cả vai trò</option>
            <option value="User">User</option>
            <option value="Administrator">Administrator</option>
            <option value="Customer">Customer</option>
            <option value="Chuyên viên thẩm định">Chuyên viên thẩm định</option>
            <option value="Đấu giá viên">Đấu giá viên</option>
            <option value="Đơn vị thực hiện">Đơn vị thực hiện</option>
            <option value="Tổ chức đấu giá">Tổ chức đấu giá</option>
          </select>
        </div>
        <button className={styles.addBtn} onClick={() => openUserModal('add')}>
          <i className="fas fa-plus"></i>
          Thêm người dùng mới
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map(user => (
            <tr key={user.id}>
              <td data-label="ID">{user.id}</td>
              <td data-label="Họ và tên">{user.name}</td>
              <td data-label="Email">{user.email}</td>
              <td data-label="Số điện thoại">{user.phone}</td>
              <td data-label="Vai trò">
                <span className={`${styles.statusBadge} ${styles[getRoleClass(user.role)]}`}>
                  {user.role}
                </span>
              </td>
              <td data-label="Ngày tạo">{user.createdDate}</td>
              <td data-label="Hành động">
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => openUserModal('edit', user)}
                >
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleDeleteUser(user)}
                >
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
                <button
                  className={`${styles.btn} ${styles.btnSuccess}`}
                  onClick={() => openViewModal(user)}
                >
                  <i className="fa fa-eye" aria-hidden="true"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>{renderPagination()}</div>

      {/* Add/Edit User Modal */}
      {showUserModal && (
        <div className={styles.modal} onClick={closeUserModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h2>
              <span className={styles.modalClose} onClick={closeUserModal}>
                ×
              </span>
            </div>
            <div className={styles.modalBody}>
              <div>
                <label htmlFor="name">Họ và tên</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nhập họ và tên"
                  value={userForm.name}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Nhập email"
                  value={userForm.email}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Nhập số điện thoại"
                  value={userForm.phone}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="password">Mật khẩu</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={userForm.password}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="password_confirmation">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="password_confirmation"
                  name="password_confirmation"
                  placeholder="Xác nhận mật khẩu"
                  value={userForm.password_confirmation}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="role">Vai trò</label>
                <select
                  id="role"
                  name="role"
                  value={userForm.role}
                  onChange={handleFormChange}
                >
                  <option value="User">User</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Customer">Customer</option>
                  <option value="Chuyên viên thẩm định">Chuyên viên thẩm định</option>
                  <option value="Đấu giá viên">Đấu giá viên</option>
                  <option value="Đơn vị thực hiện">Đơn vị thực hiện</option>
                  <option value="Tổ chức đấu giá">Tổ chức đấu giá</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSaveUser}
              >
                Lưu
              </button>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={closeUserModal}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Người Dùng</h2>
              <span className={styles.modalClose} onClick={closeViewModal}>
                ×
              </span>
            </div>
            <div className={styles.modalBody}>
              <p>
                <strong>ID:</strong> {selectedUser.id}
              </p>
              <p>
                <strong>Họ và tên:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {selectedUser.phone}
              </p>
              <p>
                <strong>Vai trò:</strong> {selectedUser.role}
              </p>
              <p>
                <strong>Ngày tạo:</strong> {selectedUser.createdDate}
              </p>
              <p>
                <strong>Trạng thái xóa:</strong> {selectedUser.deletedAt || 'Đang hoạt động'}
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={closeViewModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;