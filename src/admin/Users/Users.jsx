import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './Users.module.css';

const API_URL = process.env.REACT_APP_API_URL;

// HÀM CHUYỂN ĐỔI NGÀY TỪ ISO → yyyy-MM-dd
const formatDateForInput = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return isNaN(date) ? '' : date.toISOString().split('T')[0];
};

function Users() {
  // === STATE ===
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '' });
  const [editForm, setEditForm] = useState({});
  const [filePreviews, setFilePreviews] = useState({});

  const itemsPerPage = 5;
  const token = localStorage.getItem('token');

  // === FETCH DATA ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rolesRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}roles`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}showuser`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setRoles(rolesRes.data.roles || []);

        const mappedUsers = (usersRes.data.users || []).map(u => ({
          id: u.user_id,
          name: u.full_name,
          email: u.email,
          phone: u.phone,
          birth_date: u.birth_date,
          gender: u.gender,
          address: u.address,
          identity_number: u.identity_number,
          identity_issue_date: u.identity_issue_date,
          identity_issued_by: u.identity_issued_by,
          id_card_front: u.id_card_front,
          id_card_back: u.id_card_back,
          bank_name: u.bank_name,
          bank_account: u.bank_account,
          bank_branch: u.bank_branch,
          position: u.position,
          organization_name: u.organization_name,
          tax_code: u.tax_code,
          business_license_issue_date: u.business_license_issue_date,
          business_license_issued_by: u.business_license_issued_by,
          business_license: u.business_license,
          online_contact_method: u.online_contact_method,
          certificate_number: u.certificate_number,
          certificate_issue_date: u.certificate_issue_date,
          certificate_issued_by: u.certificate_issued_by,
          auctioneer_card_front: u.auctioneer_card_front,
          auctioneer_card_back: u.auctioneer_card_back,
          role_id: u.role_id,
          role_name: u.role?.name || 'Chưa có vai trò',
          email_verify: u.email_verified_at ? 'Đã xác minh' : 'Chưa xác minh',
          admin_verify:
            u.admin_verify_status === 'approved'
              ? 'Đã xét duyệt'
              : u.admin_verify_status === 'rejected'
              ? 'Bị từ chối'
              : 'Chờ xét duyệt',
          createdDate: u.created_at,
          deletedAt: u.deleted_at,
        }));
        setUsers(mappedUsers);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể lấy dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // === HIỂN THỊ ẢNH CŨ KHI MỞ MODAL ===
  useEffect(() => {
    if (editingUser && showEditModal) {
      const previews = {};
      const baseUrl = API_URL.replace('/api', '/storage'); // Laravel storage symlink

      if (editingUser.id_card_front) previews.id_card_front = `${baseUrl}/${editingUser.id_card_front}`;
      if (editingUser.id_card_back) previews.id_card_back = `${baseUrl}/${editingUser.id_card_back}`;
      if (editingUser.business_license) previews.business_license = `${baseUrl}/${editingUser.business_license}`;
      if (editingUser.auctioneer_card_front) previews.auctioneer_card_front = `${baseUrl}/${editingUser.auctioneer_card_front}`;
      if (editingUser.auctioneer_card_back) previews.auctioneer_card_back = `${baseUrl}/${editingUser.auctioneer_card_back}`;

      setFilePreviews(previews);
    }
  }, [editingUser, showEditModal]);

  // === FILTER & PAGINATION ===
  const filteredUsers = users.filter(u => {
    const search = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const role = !roleFilter || u.role_id === parseInt(roleFilter);
    return search && role;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => setCurrentPage(1), [searchTerm, roleFilter]);

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

  // === MODAL HANDLERS ===
  const openAddModal = () => {
    setAddForm({ name: '', email: '', phone: '' });
    setFormError(null);
    setShowAddModal(true);
  };
  const closeAddModal = () => setShowAddModal(false);

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      birth_date: user.birth_date ? formatDateForInput(user.birth_date) : '',
      gender: user.gender || '',
      address: user.address || '',
      identity_number: user.identity_number || '',
      identity_issue_date: user.identity_issue_date ? formatDateForInput(user.identity_issue_date) : '',
      identity_issued_by: user.identity_issued_by || '',
      bank_name: user.bank_name || '',
      bank_account: user.bank_account || '',
      bank_branch: user.bank_branch || '',
      position: user.position || '',
      organization_name: user.organization_name || '',
      tax_code: user.tax_code || '',
      business_license_issue_date: user.business_license_issue_date ? formatDateForInput(user.business_license_issue_date) : '',
      business_license_issued_by: user.business_license_issued_by || '',
      online_contact_method: user.online_contact_method || '',
      certificate_number: user.certificate_number || '',
      certificate_issue_date: user.certificate_issue_date ? formatDateForInput(user.certificate_issue_date) : '',
      certificate_issued_by: user.certificate_issued_by || '',
      password: '',
      password_confirmation: '',
    });
    setFilePreviews({});
    setFormError(null);
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setFilePreviews({});
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };
  const closeViewModal = () => setShowViewModal(false);

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role_id?.toString() || '');
    setFormError(null);
    setShowRoleModal(true);
  };
  const closeRoleModal = () => {
    setShowRoleModal(false);
    setFormError(null);
  };

  // === CRUD HANDLERS ===
  const handleAddUser = async () => {
    if (!addForm.name || !addForm.email) {
      setFormError('Vui lòng nhập họ tên và email!');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}register`, {
        full_name: addForm.name,
        email: addForm.email,
        phone: addForm.phone || undefined,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const newUser = {
        id: res.data.user.user_id,
        name: addForm.name,
        email: addForm.email,
        phone: addForm.phone,
        role_id: null,
        role_name: 'Chưa có vai trò',
        email_verify: 'Chưa xác minh',
        admin_verify: 'Chờ xét duyệt',
        createdDate: res.data.user.created_at,
        deletedAt: null,
      };
      setUsers(prev => [...prev, newUser]);
      closeAddModal();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi thêm');
    }
  };

  const handleUpdateUser = async () => {
    if (!editForm.full_name || !editForm.email || !editingUser) {
      setFormError('Vui lòng nhập họ tên và email!');
      return;
    }

    // Validate mật khẩu
    if (editForm.password && editForm.password.trim() !== '') {
      if (editForm.password !== editForm.password_confirmation) {
        setFormError('Mật khẩu xác nhận không khớp!');
        return;
      }
    }

    const formData = new FormData();

    // Bắt buộc
    formData.append('full_name', editForm.full_name);
    formData.append('email', editForm.email);
    formData.append('phone', editForm.phone || '');

    // Không bắt buộc
    const optionalFields = [
      'birth_date', 'gender', 'address', 'identity_number', 'identity_issue_date',
      'identity_issued_by', 'bank_name', 'bank_account', 'bank_branch',
      'position', 'organization_name', 'tax_code', 'business_license_issue_date',
      'business_license_issued_by', 'online_contact_method', 'certificate_number',
      'certificate_issue_date', 'certificate_issued_by'
    ];

    optionalFields.forEach(field => {
      const value = editForm[field];
      if (value !== undefined && value !== null && value !== '') {
        formData.append(field, value);
      }
    });

    // File: chỉ gửi nếu có thay đổi
    const fileFields = [
      'id_card_front', 'id_card_back', 'business_license',
      'auctioneer_card_front', 'auctioneer_card_back'
    ];

    fileFields.forEach(field => {
      if (editForm[field] instanceof File) {
        formData.append(field, editForm[field]);
      }
    });

    // Mật khẩu
    if (editForm.password && editForm.password.trim() !== '') {
      formData.append('password', editForm.password);
      formData.append('password_confirmation', editForm.password_confirmation);
    }

    try {
      setLoading(true);
      await axios.put(`${API_URL}user/${editingUser.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Cập nhật state users
      setUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone || '',
        birth_date: editForm.birth_date || u.birth_date,
        gender: editForm.gender || u.gender,
        address: editForm.address || u.address,
        identity_number: editForm.identity_number || u.identity_number,
        identity_issue_date: editForm.identity_issue_date || u.identity_issue_date,
        identity_issued_by: editForm.identity_issued_by || u.identity_issued_by,
        bank_name: editForm.bank_name || u.bank_name,
        bank_account: editForm.bank_account || u.bank_account,
        bank_branch: editForm.bank_branch || u.bank_branch,
        position: editForm.position || u.position,
        organization_name: editForm.organization_name || u.organization_name,
        tax_code: editForm.tax_code || u.tax_code,
        business_license_issue_date: editForm.business_license_issue_date || u.business_license_issue_date,
        business_license_issued_by: editForm.business_license_issued_by || u.business_license_issued_by,
        online_contact_method: editForm.online_contact_method || u.online_contact_method,
        certificate_number: editForm.certificate_number || u.certificate_number,
        certificate_issue_date: editForm.certificate_issue_date || u.certificate_issue_date,
        certificate_issued_by: editForm.certificate_issued_by || u.certificate_issued_by,
      } : u));

      setFormError(null);
      closeEditModal();
    } catch (err) {
      console.error('Update error:', err.response?.data);
      setFormError(err.response?.data?.message || 'Lỗi cập nhật người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setFilePreviews(prev => ({ ...prev, [field]: preview }));
      setEditForm(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !selectedRole) {
      setFormError('Vui lòng chọn vai trò!');
      return;
    }
    const newRole = roles.find(r => r.role_id === parseInt(selectedRole));
    if (!newRole) {
      setFormError('Vai trò không hợp lệ!');
      return;
    }

    const requests = [];
    if (selectedUser.role_id) {
      const oldRole = roles.find(r => r.role_id === selectedUser.role_id);
      if (oldRole) {
        requests.push(axios.delete(`${API_URL}roles/${selectedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { roles: [oldRole.name] },
        }));
      }
    }
    requests.push(axios.post(`${API_URL}users/${selectedUser.id}/roles`, { roles: [newRole.name] }, {
      headers: { Authorization: `Bearer ${token}` },
    }));

    try {
      await Promise.all(requests);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role_id: parseInt(selectedRole), role_name: newRole.name } : u));
      closeRoleModal();
    } catch (err) {
      setFormError('Lỗi đổi vai trò');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm('Xóa người dùng này?')) return;
    try {
      await axios.delete(`${API_URL}users/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi xóa');
    }
  };

  const handleApproveUser = async (user) => {
    try {
      await axios.put(`${API_URL}user/approve/${user.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, admin_verify: 'Đã xét duyệt' } : u));
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi duyệt');
    }
  };

  const handleRejectUser = async (user) => {
    try {
      await axios.put(`${API_URL}user/reject/${user.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, admin_verify: 'Bị từ chối' } : u));
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi từ chối');
    }
  };

  // === RENDER ===
  if (loading) return <div className={styles.mainContent}>Đang tải...</div>;
  if (error) return <div className={`${styles.mainContent} text-red-600`}>Lỗi: {error}</div>;

  return (
    <div className={styles.mainContent}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.userProfile}>
          <div className={styles.notificationBell}><i className="fas fa-bell"></i></div>
          <div className={styles.profileAvatar}>QT</div>
        </div>
      </div>

      <h1 className={styles.pageTitle}>Quản Lý Người Dùng</h1>
      <p className={styles.pageSubtitle}>Quản lý tài khoản và quyền hạn</p>

      <div className={styles.actionsBar}>
        <select className={styles.filterSelect} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.name}</option>)}
        </select>
        <button className={styles.addBtn} onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm người dùng mới
        </button>
      </div>

      {/* TABLE */}
      <div className={styles.dataTable}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={styles.dataTableCell}>ID</th>
              <th className={styles.dataTableCell}>Họ tên</th>
              <th className={styles.dataTableCell}>Email</th>
              <th className={styles.dataTableCell}>SĐT</th>
              <th className={styles.dataTableCell}>Vai trò</th>
              <th className={styles.dataTableCell}>Email</th>
              <th className={styles.dataTableCell}>Duyệt</th>
              <th className={styles.dataTableCell}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id}>
                <td className={styles.dataTableCell}>{user.id}</td>
                <td className={styles.dataTableCell}>{user.name}</td>
                <td className={styles.dataTableCell}>{user.email}</td>
                <td className={styles.dataTableCell}>{user.phone}</td>
                <td className={styles.dataTableCell}>
                  <span className={`${styles.statusBadge} ${styles[`role${user.role_name.replace(/\s/g, '')}`] || styles.roleUser}`}>
                    {user.role_name}
                  </span>
                </td>
                <td className={styles.dataTableCell}>{user.email_verify}</td>
                <td className={styles.dataTableCell}>{user.admin_verify}</td>
                <td className={styles.dataTableCell}>
                  <div className="flex gap-1">
                    <button className={styles.btnPrimary} onClick={() => openEditModal(user)}><i className="fa fa-pencil"></i></button>
                    <button className={styles.btnDanger} onClick={() => handleDeleteUser(user)}><i className="fa fa-trash"></i></button>
                    <button className={styles.btnSuccess} onClick={() => openViewModal(user)}><i className="fa fa-eye"></i></button>
                    <button className={styles.btnInfo} onClick={() => openRoleModal(user)}><i className="fa fa-user-tag"></i></button>
                    {user.admin_verify === 'Chờ xét duyệt' && (
                      <>
                        <button className="bg-green-600 text-white p-1 rounded" onClick={() => handleApproveUser(user)}><i className="fa fa-check"></i></button>
                        <button className="bg-red-600 text-white p-1 rounded" onClick={() => handleRejectUser(user)}><i className="fa fa-times"></i></button>
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

      {/* ADD MODAL */}
      {showAddModal && (
        <div className={styles.modal} onClick={closeAddModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Thêm Người Dùng</h2>
              <button className={styles.modalClose} onClick={closeAddModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className="text-red-600 mb-3">{formError}</div>}
              <input placeholder="Họ tên" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} className={styles.modalInput} />
              <input type="email" placeholder="Email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className={`${styles.modalInput} mt-3`} />
              <input placeholder="SĐT" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} className={`${styles.modalInput} mt-3`} />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={handleAddUser}>Thêm</button>
              <button className={styles.btnSecondary} onClick={closeAddModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL - FULL FORM */}
      {showEditModal && editingUser && (
        <div className={styles.modal} onClick={closeEditModal}>
          <div className={`${styles.modalContent} max-w-5xl max-h-screen overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Sửa: {editingUser.name}</h2>
              <button className={styles.modalClose} onClick={closeEditModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className="text-red-600 mb-4">{formError}</div>}

              {/* THÔNG TIN CƠ BẢN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded mb-4">
                <h3 className="col-span-full font-bold">Thông tin cơ bản</h3>
                <input value={editForm.full_name || ''} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className={styles.modalInput} placeholder="Họ tên *" />
                <input type="email" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className={styles.modalInput} placeholder="Email *" />
                <input value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className={styles.modalInput} placeholder="SĐT" />
                <input type="date" value={editForm.birth_date || ''} onChange={e => setEditForm({ ...editForm, birth_date: e.target.value })} className={styles.modalInput} />
                <select value={editForm.gender || ''} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} className={styles.modalInput}>
                  <option value="">Giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
                <textarea value={editForm.address || ''} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className={`${styles.modalInput} md:col-span-2`} rows={2} placeholder="Địa chỉ" />
              </div>

              {/* CMND */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded mb-4">
                <h3 className="col-span-full font-bold">CMND/CCCD</h3>
                <input value={editForm.identity_number || ''} onChange={e => setEditForm({ ...editForm, identity_number: e.target.value })} className={styles.modalInput} />
                <input type="date" value={editForm.identity_issue_date || ''} onChange={e => setEditForm({ ...editForm, identity_issue_date: e.target.value })} className={styles.modalInput} />
                <input value={editForm.identity_issued_by || ''} onChange={e => setEditForm({ ...editForm, identity_issued_by: e.target.value })} className={`${styles.modalInput} md:col-span-2`} />
                <div>
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'id_card_front')} className={styles.modalInput} />
                  {filePreviews.id_card_front && <img src={filePreviews.id_card_front} className="mt-2 w-32 h-20 object-cover rounded" alt="Front" />}
                </div>
                <div>
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'id_card_back')} className={styles.modalInput} />
                  {filePreviews.id_card_back && <img src={filePreviews.id_card_back} className="mt-2 w-32 h-20 object-cover rounded" alt="Back" />}
                </div>
              </div>

              {/* NGÂN HÀNG */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded mb-4">
                <h3 className="col-span-full font-bold">Ngân hàng</h3>
                <input value={editForm.bank_name || ''} onChange={e => setEditForm({ ...editForm, bank_name: e.target.value })} className={styles.modalInput} />
                <input value={editForm.bank_account || ''} onChange={e => setEditForm({ ...editForm, bank_account: e.target.value })} className={styles.modalInput} />
                <input value={editForm.bank_branch || ''} onChange={e => setEditForm({ ...editForm, bank_branch: e.target.value })} className={styles.modalInput} />
              </div>

              {/* MẬT KHẨU */}
              <div className="p-4 bg-yellow-50 rounded mb-4">
                <h3 className="font-bold mb-2">Đổi mật khẩu (để trống nếu không đổi)</h3>
                <input type="password" placeholder="Mật khẩu mới" value={editForm.password || ''} onChange={e => setEditForm({ ...editForm, password: e.target.value })} className={styles.modalInput} />
                <input type="password" placeholder="Xác nhận" value={editForm.password_confirmation || ''} onChange={e => setEditForm({ ...editForm, password_confirmation: e.target.value })} className={`${styles.modalInput} mt-2`} />
              </div>

              {/* BUSINESS FIELDS */}
              {editingUser.role_name === 'Bussiness' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded mb-4">
                  <h3 className="col-span-full font-bold">Doanh nghiệp</h3>
                  <input value={editForm.position || ''} onChange={e => setEditForm({ ...editForm, position: e.target.value })} className={styles.modalInput} placeholder="Chức vụ" />
                  <input value={editForm.organization_name || ''} onChange={e => setEditForm({ ...editForm, organization_name: e.target.value })} className={styles.modalInput} placeholder="Tên tổ chức" />
                  <input value={editForm.tax_code || ''} onChange={e => setEditForm({ ...editForm, tax_code: e.target.value })} className={styles.modalInput} placeholder="Mã số thuế" />
                  <input type="date" value={editForm.business_license_issue_date || ''} onChange={e => setEditForm({ ...editForm, business_license_issue_date: e.target.value })} className={styles.modalInput} />
                  <input value={editForm.business_license_issued_by || ''} onChange={e => setEditForm({ ...editForm, business_license_issued_by: e.target.value })} className={styles.modalInput} />
                  <input type="file" accept=".pdf,.doc,.docx" onChange={e => handleFileChange(e, 'business_license')} className={styles.modalInput} />
                  {filePreviews.business_license && <a href={filePreviews.business_license} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">Xem file hiện tại</a>}
                </div>
              )}

              {/* AUCTIONEER FIELDS */}
              {editingUser.role_name === 'Auction' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-indigo-50 rounded">
                  <h3 className="col-span-full font-bold">Đấu giá viên</h3>
                  <input value={editForm.certificate_number || ''} onChange={e => setEditForm({ ...editForm, certificate_number: e.target.value })} className={styles.modalInput} placeholder="Số chứng chỉ" />
                  <input type="date" value={editForm.certificate_issue_date || ''} onChange={e => setEditForm({ ...editForm, certificate_issue_date: e.target.value })} className={styles.modalInput} />
                  <input value={editForm.certificate_issued_by || ''} onChange={e => setEditForm({ ...editForm, certificate_issued_by: e.target.value })} className={styles.modalInput} />
                  <input value={editForm.online_contact_method || ''} onChange={e => setEditForm({ ...editForm, online_contact_method: e.target.value })} className={styles.modalInput} placeholder="Liên hệ online" />
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'auctioneer_card_front')} className={styles.modalInput} />
                  {filePreviews.auctioneer_card_front && <img src={filePreviews.auctioneer_card_front} className="mt-2 w-32 h-20 object-cover rounded" alt="Front" />}
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'auctioneer_card_back')} className={styles.modalInput} />
                  {filePreviews.auctioneer_card_back && <img src={filePreviews.auctioneer_card_back} className="mt-2 w-32 h-20 object-cover rounded" alt="Back" />}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={handleUpdateUser}>Cập nhật</button>
              <button className={styles.btnSecondary} onClick={closeEditModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedUser && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi tiết người dùng</h2>
              <button className={styles.modalClose} onClick={closeViewModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p><strong>ID:</strong> {selectedUser.id}</p>
              <p><strong>Họ tên:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>SĐT:</strong> {selectedUser.phone}</p>
              <p><strong>Vai trò:</strong> {selectedUser.role_name}</p>
              <p><strong>Ngày tạo:</strong> {selectedUser.createdDate}</p>
              <p><strong>Trạng thái duyệt:</strong> {selectedUser.admin_verify}</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={closeViewModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ROLE MODAL */}
      {showRoleModal && selectedUser && (
        <div className={styles.modal} onClick={closeRoleModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Đổi vai trò - {selectedUser.name}</h2>
              <button className={styles.modalClose} onClick={closeRoleModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className="text-red-600 mb-3">{formError}</div>}
              <p className="mb-2">Vai trò hiện tại: <strong>{selectedUser.role_name}</strong></p>
              <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className={styles.modalInput}>
                <option value="">-- Chọn vai trò --</option>
                {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.name}</option>)}
              </select>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={handleChangeRole}>Đổi vai trò</button>
              <button className={styles.btnSecondary} onClick={closeRoleModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;