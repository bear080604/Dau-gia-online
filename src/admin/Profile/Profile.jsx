import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import Loading from '../../components/Loading';

function Profile() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileForm, setProfileForm] = useState({
    user: '',
    item: '',
    documentUrl: '',
    depositAmount: '',
    status: 'ChoDuyet',
  });
    const [open, setOpen] = useState(false);
  const togglePopup = (e) => {
    e.stopPropagation(); // tránh đóng liền sau khi mở
    setOpen((prev) => !prev);
  };
  const itemsPerPage = 5;

  const statusMap = {
    ChoDuyet: 'Chờ duyệt',
    DaDuyet: 'Đã duyệt',
    BiTuChoi: 'Bị từ chối',
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}auction-profiles`
        );
        const apiProfiles = response.data.profiles.map((profile) => ({
          id: `#HS-${String(profile.profile_id).padStart(3, '0')}`,
          user: `${profile.user.full_name} (ID: ${profile.user_id})`,
          userId: String(profile.user_id),
          item: profile.item
            ? `#TS-${String(profile.item.item_id).padStart(3, '0')} - ${profile.item.name}`
            : `Phiên đấu giá ${profile.session_id}`,
          itemId: profile.item ? `TS${String(profile.item.item_id).padStart(3, '0')}` : `S${profile.session_id}`,
          documentUrl: profile.document_url,
          depositAmount: formatCurrency(profile.deposit_amount),
          depositAmountValue: parseFloat(profile.deposit_amount),
          status: statusMap[profile.status] || profile.status,
          statusClass: getStatusClass(statusMap[profile.status] || profile.status),
          createdDate: formatDate(profile.created_at),
          rawProfileId: profile.profile_id, // Store raw profile_id for API calls
        }));
        setProfiles(apiProfiles);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách hồ sơ.');
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const applyFilters = () => {
    return profiles.filter((profile) => {
      const searchMatch =
        profile.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.documentUrl.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch =
        !statusFilter || profile.status.toLowerCase().includes(statusFilter.toLowerCase());
      const userMatch = !userFilter || profile.userId.toLowerCase().includes(userFilter.toLowerCase());
      const sessionMatch = !sessionFilter || profile.itemId.toLowerCase().includes(sessionFilter.toLowerCase());
      return searchMatch && statusMatch && userMatch && sessionMatch;
    });
  };

  const filteredProfiles = applyFilters();
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, userFilter, sessionFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleUserFilterChange = (e) => {
    setUserFilter(e.target.value);
  };

  const handleSessionFilterChange = (e) => {
    setSessionFilter(e.target.value);
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

  const openProfileModal = (mode, profile = null) => {
    setModalMode(mode);
    setSelectedProfile(profile);
    if (profile) {
      setProfileForm({
        user: profile.userId,
        item: profile.itemId,
        documentUrl: profile.documentUrl,
        depositAmount: profile.depositAmountValue.toString(),
        status:
          profile.status === 'Chờ duyệt'
            ? 'ChoDuyet'
            : profile.status === 'Đã duyệt'
            ? 'DaDuyet'
            : 'BiTuChoi',
      });
    } else {
      setProfileForm({
        user: '',
        item: '',
        documentUrl: '',
        depositAmount: '',
        status: 'ChoDuyet',
      });
    }
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedProfile(null);
  };

  const openViewModal = (profile) => {
    setSelectedProfile(profile);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedProfile(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      if (modalMode === 'edit' && selectedProfile) {
        // Edit mode: Update existing profile status
        const profileId = selectedProfile.rawProfileId;
        if (!profileId) {
          throw new Error('Không tìm thấy ID hồ sơ.');
        }
        await axios.put(
          `${process.env.REACT_APP_API_URL}auction-profiles/${profileId}/status`,
          { status: profileForm.status }
        );
        alert('Cập nhật trạng thái thành công!');
      } else if (modalMode === 'add') {
        // Add mode: Create new profile (assuming POST endpoint exists)
        const newProfile = {
          user_id: profileForm.user,
          session_id: profileForm.item.startsWith('S') ? profileForm.item.slice(1) : null,
          item_id: profileForm.item.startsWith('TS') ? profileForm.item.slice(2) : null,
          document_url: profileForm.documentUrl,
          deposit_amount: parseFloat(profileForm.depositAmount),
          status: profileForm.status,
        };
        await axios.post(
          `${process.env.REACT_APP_API_URL}auction-profiles`,
          newProfile
        );
        alert('Thêm hồ sơ thành công!');
      }

      // Refresh profiles
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}auction-profiles`
      );
      const apiProfiles = response.data.profiles.map((profile) => ({
        id: `#HS-${String(profile.profile_id).padStart(3, '0')}`,
        user: `${profile.user.full_name} (ID: ${profile.user_id})`,
        userId: String(profile.user_id),
        item: profile.item
          ? `#TS-${String(profile.item.item_id).padStart(3, '0')} - ${profile.item.name}`
          : `Phiên đấu giá ${profile.session_id}`,
        itemId: profile.item ? `TS${String(profile.item.item_id).padStart(3, '0')}` : `S${profile.session_id}`,
        documentUrl: profile.document_url,
        depositAmount: formatCurrency(profile.deposit_amount),
        depositAmountValue: parseFloat(profile.deposit_amount),
        status: statusMap[profile.status] || profile.status,
        statusClass: getStatusClass(statusMap[profile.status] || profile.status),
        createdDate: formatDate(profile.created_at),
        rawProfileId: profile.profile_id,
      }));
      setProfiles(apiProfiles);
      closeProfileModal();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDeleteProfile = async (profile) => {
    if (window.confirm('Bạn có chắc muốn xóa hồ sơ này?')) {
      try {
        const profileId = profile.rawProfileId;
        await axios.delete(
          `${process.env.REACT_APP_API_URL}auction-profiles/${profileId}`
        );
        alert('Xóa hồ sơ thành công!');
        setProfiles(profiles.filter((p) => p.id !== profile.id));
      } catch (err) {
        alert('Xóa thất bại: ' + err.message);
      }
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Chờ duyệt': 'statusChoduyet',
      'Đã duyệt': 'statusDaduyet',
      'Bị từ chối': 'statusBituchoi',
    };
    return statusMap[status] || 'statusChoduyet';
  };

  const getActionButtons = (profile) => {
    const buttons = [];
    buttons.push(
      <button
        key="edit"
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={() => openProfileModal('edit', profile)}
      >
        <i className="fa fa-pencil" aria-hidden="true"></i>
      </button>
    );
    buttons.push(
      <button
        key="delete"
        className={`${styles.btn} ${styles.btnDanger}`}
        onClick={() => handleDeleteProfile(profile)}
      >
        <i className="fa fa-trash" aria-hidden="true"></i>
      </button>
    );
    buttons.push(
      <button
        key="view"
        className={`${styles.btn} ${styles.btnSuccess}`}
        onClick={() => openViewModal(profile)}
      >
        <i className="fa fa-eye" aria-hidden="true"></i>
      </button>
    );
    return buttons;
  };

  if (loading) return <Loading message="Đang tải..." />;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm hồ sơ đấu giá..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      
      </div>

      <h1 className={styles.pageTitle}>Quản Lý Hồ Sơ Đấu Giá</h1>
      <p className={styles.pageSubtitle}>Quản lý hồ sơ tham gia đấu giá của người dùng</p>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Bị từ chối">Bị từ chối</option>
          </select>
          <select
            className={styles.filterSelect}
            value={userFilter}
            onChange={handleUserFilterChange}
          >
            <option value="">Tất cả người dùng</option>
            {[...new Set(profiles.map((p) => p.userId))].map((userId) => (
              <option key={userId} value={userId}>
                {profiles.find((p) => p.userId === userId).user}
              </option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={sessionFilter}
            onChange={handleSessionFilterChange}
          >
            <option value="">Tất cả phiên đấu giá</option>
            {[...new Set(profiles.map((p) => p.itemId))].map((itemId) => (
              <option key={itemId} value={itemId}>
                {profiles.find((p) => p.itemId === itemId).item}
              </option>
            ))}
          </select>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => openProfileModal('add')}
        >
          <i className="fas fa-plus"></i>
          Thêm hồ sơ mới
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Mã HS</th>
            <th>Người dùng (ID)</th>
            <th>Phiên đấu giá</th>
            <th>URL tài liệu</th>
            <th>Tiền đặt cọc</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentProfiles.map((profile) => (
            <tr key={profile.id}>
              <td data-label="Mã HS">{profile.id}</td>
              <td data-label="Người dùng (ID)">{profile.user}</td>
              <td data-label="Phiên đấu giá">{profile.item}</td>
              <td data-label="URL tài liệu">
                <a
                  href={profile.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  doc{profile.id.split('-')[1]}.pdf
                </a>
              </td>
              <td data-label="Tiền đặt cọc">{profile.depositAmount}</td>
              <td data-label="Trạng thái">
                <span
                  className={`${styles.statusBadge} ${styles[profile.statusClass]}`}
                >
                  {profile.status}
                </span>
              </td>
              <td data-label="Ngày tạo">{profile.createdDate}</td>
              <td data-label="Hành động">
                <div className={styles.actionButtons}>
                  {getActionButtons(profile)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>{renderPagination()}</div>

      {showProfileModal && (
        <div className={styles.modal} onClick={closeProfileModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit'
                  ? 'Chỉnh sửa hồ sơ đấu giá'
                  : 'Thêm hồ sơ đấu giá mới'}
              </h2>
              <span className={styles.modalClose} onClick={closeProfileModal}>
                ×
              </span>
            </div>
            <div className={styles.modalBody}>
              <div>
                <label htmlFor="user">Người dùng (ID)</label>
                <select
                  id="user"
                  name="user"
                  value={profileForm.user}
                  onChange={handleFormChange}
                >
                  <option value="">Chọn người dùng</option>
                  {[...new Set(profiles.map((p) => p.userId))].map((userId) => (
                    <option key={userId} value={userId}>
                      {profiles.find((p) => p.userId === userId).user}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="item">Phiên đấu giá</label>
                <select
                  id="item"
                  name="item"
                  value={profileForm.item}
                  onChange={handleFormChange}
                >
                  <option value="">Chọn phiên đấu giá</option>
                  {[...new Set(profiles.map((p) => p.itemId))].map((itemId) => (
                    <option key={itemId} value={itemId}>
                      {profiles.find((p) => p.itemId === itemId).item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="documentUrl">URL tài liệu</label>
                <input
                  type="url"
                  id="documentUrl"
                  name="documentUrl"
                  placeholder="Nhập URL tài liệu"
                  value={profileForm.documentUrl}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="depositAmount">Tiền đặt cọc (VND)</label>
                <input
                  type="number"
                  id="depositAmount"
                  name="depositAmount"
                  placeholder="Nhập tiền đặt cọc"
                  step="0.01"
                  value={profileForm.depositAmount}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="status">Trạng thái</label>
                <select
                  id="status"
                  name="status"
                  value={profileForm.status}
                  onChange={handleFormChange}
                >
                  <option value="ChoDuyet">Chờ duyệt</option>
                  <option value="DaDuyet">Đã duyệt</option>
                  <option value="BiTuChoi">Bị từ chối</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSaveProfile}
              >
                Lưu
              </button>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={closeProfileModal}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedProfile && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Hồ Sơ Đấu Giá</h2>
              <span className={styles.modalClose} onClick={closeViewModal}>
                ×
              </span>
            </div>
            <div className={styles.modalBody}>
              <p>
                <strong>Mã hồ sơ:</strong> {selectedProfile.id}
              </p>
              <p>
                <strong>Người dùng:</strong> {selectedProfile.user}
              </p>
              <p>
                <strong>Phiên đấu giá:</strong> {selectedProfile.item}
              </p>
              <p>
                <strong>URL tài liệu:</strong>{' '}
                <a
                  href={selectedProfile.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  doc{selectedProfile.id.split('-')[1]}.pdf
                </a>
              </p>
              <p>
                <strong>Tiền đặt cọc:</strong> {selectedProfile.depositAmount}
              </p>
              <p>
                <strong>Trạng thái:</strong> {selectedProfile.status}
              </p>
              <p>
                <strong>Ngày tạo:</strong> {selectedProfile.createdDate}
              </p>
              <div className={styles.orderHistory}>
                <h3>Lịch sử duyệt hồ sơ (demo)</h3>
                <table className={styles.orderTable}>
                  <thead>
                    <tr>
                      <th>Hành động</th>
                      <th>Người duyệt</th>
                      <th>Thời gian</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Duyệt</td>
                      <td>Admin QT</td>
                      <td>2025-09-30 11:00</td>
                      <td>Hồ sơ hợp lệ</td>
                    </tr>
                    <tr>
                      <td>Từ chối</td>
                      <td>Manager A</td>
                      <td>2025-09-29 15:00</td>
                      <td>Thiếu tài liệu</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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

export default Profile;