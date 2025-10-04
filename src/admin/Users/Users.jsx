import React, { useState, useEffect } from 'react';
import styles from './Users.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'User'
  });

  const itemsPerPage = 5;

  const users = [
    {
      id: 1,
      name: 'Admin QT',
      email: 'admin@example.com',
      phone: '0123456789',
      role: 'Administrator',
      roleClass: 'roleAdmin',
      createdDate: '2025-09-01 09:00',
      password: 'hashed_password_1',
      deletedAt: 'NULL'
    },
    {
      id: 2,
      name: 'Nguyễn Văn A',
      email: 'nva@example.com',
      phone: '0987654321',
      role: 'Customer',
      roleClass: 'roleCustomer',
      createdDate: '2025-09-15 14:30',
      password: 'hashed_password_2',
      deletedAt: 'NULL'
    },
    {
      id: 3,
      name: 'Trần Thị B',
      email: 'ttb@example.com',
      phone: '0976543210',
      role: 'User',
      roleClass: 'roleUser',
      createdDate: '2025-09-20 11:15',
      password: 'hashed_password_3',
      deletedAt: 'NULL'
    },
    {
      id: 4,
      name: 'Lê Văn C',
      email: 'lvc@example.com',
      phone: '0967534209',
      role: 'Chuyên viên thẩm định',
      roleClass: 'roleChuyenvienttc',
      createdDate: '2025-09-25 16:45',
      password: 'hashed_password_4',
      deletedAt: 'NULL'
    },
    {
      id: 5,
      name: 'Phạm Thị D',
      email: 'ptd@example.com',
      phone: '0958526310',
      role: 'Đấu giá viên',
      roleClass: 'roleDaugiavien',
      createdDate: '2025-09-28 13:20',
      password: 'hashed_password_5',
      deletedAt: 'NULL'
    },
    {
      id: 6,
      name: 'Hoàng Văn E',
      email: 'hve@example.com',
      phone: '0947515421',
      role: 'Customer',
      roleClass: 'roleCustomer',
      createdDate: '2025-10-01 10:10',
      password: 'hashed_password_6',
      deletedAt: 'NULL'
    },
    {
      id: 7,
      name: 'Vũ Thị F',
      email: 'vtf@example.com',
      phone: '0936504632',
      role: 'Đơn vị thực hiện',
      roleClass: 'roleDonvithuc',
      createdDate: '2025-10-01 15:55',
      password: 'hashed_password_7',
      deletedAt: 'NULL'
    },
  ];

  const applyFilters = () => {
    return users.filter(user => {
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
        role: user.role
      });
    } else {
      setUserForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'User'
      });
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
      [name]: value
    }));
  };

  const handleSaveUser = () => {
    alert('Chức năng lưu chỉ là demo, không lưu thực tế.');
    closeUserModal();
  };

  const handleDeleteUser = (user) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      alert('Chức năng xóa chỉ là demo, không xóa thực tế.');
    }
  };

  const getRoleClass = (role) => {
    const roleMap = {
      'User': 'roleUser',
      'Administrator': 'roleAdmin',
      'Customer': 'roleCustomer',
      'Chuyên viên thẩm định': 'roleChuyenvienttc',
      'Đấu giá viên': 'roleDaugiavien',
      'Đơn vị thực hiện': 'roleDonvithuc',
      'Tổ chức đấu giá': 'roleTochucdaugia'
    };
    return roleMap[role] || 'roleUser';
  };

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
                <span className={`${styles.statusBadge} ${styles[getRoleClass(user.role)]}`}>{user.role}</span>
              </td>
              <td data-label="Ngày tạo">{user.createdDate}</td>
              <td data-label="Hành động">
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openUserModal('edit', user)}>
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteUser(user)}>
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
                <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => openViewModal(user)}>
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

      {/* Add/Edit User Modal */}
      {showUserModal && (
        <div className={styles.modal} onClick={closeUserModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h2>
              <span className={styles.modalClose} onClick={closeUserModal}>×</span>
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
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveUser}>Lưu</button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeUserModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Người Dùng</h2>
              <span className={styles.modalClose} onClick={closeViewModal}>×</span>
            </div>
            <div className={styles.modalBody}>
              <p><strong>ID:</strong> {selectedUser.id}</p>
              <p><strong>Họ và tên:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Số điện thoại:</strong> {selectedUser.phone}</p>
              <p><strong>Vai trò:</strong> {selectedUser.role}</p>
              <p><strong>Ngày tạo:</strong> {selectedUser.createdDate}</p>
              <p><strong>Trạng thái xóa:</strong> {selectedUser.deletedAt}</p>
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

export default Users;
