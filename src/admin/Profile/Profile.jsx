import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Profile() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [itemFilter, setItemFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    user: '',
    item: '',
    documentUrl: '',
    depositAmount: '',
    status: 'ChoDuyet'
  });

  const itemsPerPage = 5;

  const profiles = [
    {
      id: '#HS-001',
      user: 'Nguyễn Văn A (ID: 2)',
      userId: '2',
      item: '#TS-001 - Bất động sản quận 1',
      itemId: 'TS001',
      documentUrl: 'https://example.com/doc1.pdf',
      depositAmount: '250.000.000đ',
      depositAmountValue: 250000000,
      status: 'Đã duyệt',
      statusClass: 'statusDaduyet',
      createdDate: '2025-09-30 10:00'
    },
    {
      id: '#HS-002',
      user: 'Trần Thị B (ID: 3)',
      userId: '3',
      item: '#TS-002 - Xe hơi Mercedes',
      itemId: 'TS002',
      documentUrl: 'https://example.com/doc2.pdf',
      depositAmount: '120.000.000đ',
      depositAmountValue: 120000000,
      status: 'Chờ duyệt',
      statusClass: 'statusChoduyet',
      createdDate: '2025-09-29 14:30'
    },
    {
      id: '#HS-003',
      user: 'Lê Văn C (ID: 4)',
      userId: '4',
      item: '#TS-003 - Đồng hồ Rolex',
      itemId: 'TS003',
      documentUrl: 'https://example.com/doc3.pdf',
      depositAmount: '15.000.000đ',
      depositAmountValue: 15000000,
      status: 'Bị từ chối',
      statusClass: 'statusBituchoi',
      createdDate: '2025-09-28 16:45'
    },
    {
      id: '#HS-004',
      user: 'Nguyễn Văn A (ID: 2)',
      userId: '2',
      item: '#TS-004 - Tranh nghệ thuật',
      itemId: 'TS004',
      documentUrl: 'https://example.com/doc4.pdf',
      depositAmount: '50.000.000đ',
      depositAmountValue: 50000000,
      status: 'Chờ duyệt',
      statusClass: 'statusChoduyet',
      createdDate: '2025-10-01 09:20'
    },
    {
      id: '#HS-005',
      user: 'Trần Thị B (ID: 3)',
      userId: '3',
      item: '#TS-005 - Máy ảnh Canon',
      itemId: 'TS005',
      documentUrl: 'https://example.com/doc5.pdf',
      depositAmount: '5.000.000đ',
      depositAmountValue: 5000000,
      status: 'Đã duyệt',
      statusClass: 'statusDaduyet',
      createdDate: '2025-09-27 12:15'
    },
    {
      id: '#HS-006',
      user: 'Lê Văn C (ID: 4)',
      userId: '4',
      item: '#TS-006 - Điện thoại iPhone',
      itemId: 'TS006',
      documentUrl: 'https://example.com/doc6.pdf',
      depositAmount: '3.000.000đ',
      depositAmountValue: 3000000,
      status: 'Chờ duyệt',
      statusClass: 'statusChoduyet',
      createdDate: '2025-09-26 17:40'
    },
    {
      id: '#HS-007',
      user: 'Nguyễn Văn A (ID: 2)',
      userId: '2',
      item: '#TS-007 - Đất nền ngoại ô',
      itemId: 'TS007',
      documentUrl: 'https://example.com/doc7.pdf',
      depositAmount: '80.000.000đ',
      depositAmountValue: 80000000,
      status: 'Bị từ chối',
      statusClass: 'statusBituchoi',
      createdDate: '2025-09-25 08:50'
    },
  ];

  const applyFilters = () => {
    return profiles.filter(profile => {
      const searchMatch =
        profile.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.documentUrl.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = !statusFilter || profile.status.toLowerCase().includes(statusFilter.toLowerCase());
      const userMatch = !userFilter || profile.userId.toLowerCase().includes(userFilter.toLowerCase());
      const itemMatch = !itemFilter || profile.itemId.toLowerCase().includes(itemFilter.toLowerCase());
      return searchMatch && statusMatch && userMatch && itemMatch;
    });
  };

  const filteredProfiles = applyFilters();
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, userFilter, itemFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleUserFilterChange = (e) => {
    setUserFilter(e.target.value);
  };

  const handleItemFilterChange = (e) => {
    setItemFilter(e.target.value);
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
    if (profile) {
      setProfileForm({
        user: profile.userId,
        item: profile.itemId,
        documentUrl: profile.documentUrl,
        depositAmount: profile.depositAmountValue.toString(),
        status: profile.status === 'Chờ duyệt' ? 'ChoDuyet' :
                profile.status === 'Đã duyệt' ? 'DaDuyet' : 'BiTuChoi'
      });
    } else {
      setProfileForm({
        user: '',
        item: '',
        documentUrl: '',
        depositAmount: '',
        status: 'ChoDuyet'
      });
    }
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
  };

  const openViewModal = (profile) => {
    setSelectedProfile(profile);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    alert('Chức năng lưu chỉ là demo, không lưu thực tế.');
    closeProfileModal();
  };

  const handleDeleteProfile = (profile) => {
    if (window.confirm('Bạn có chắc muốn xóa hồ sơ này?')) {
      alert('Chức năng xóa chỉ là demo, không xóa thực tế.');
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Chờ duyệt': 'statusChoduyet',
      'Đã duyệt': 'statusDaduyet',
      'Bị từ chối': 'statusBituchoi'
    };
    return statusMap[status] || 'statusChoduyet';
  };

  const getActionButtons = (profile) => {
    const buttons = [];

    buttons.push(
      <button key="edit" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openProfileModal('edit', profile)}>
        <i className="fa fa-pencil" aria-hidden="true"></i>
      </button>
    );
    buttons.push(
      <button key="delete" className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteProfile(profile)}>
        <i className="fa fa-trash" aria-hidden="true"></i>
      </button>
    );
    buttons.push(
      <button key="view" className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => openViewModal(profile)}>
        <i className="fa fa-eye" aria-hidden="true"></i>
      </button>
    );

    return buttons;
  };

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
        <div className={styles.userProfile}>
          <div className={styles.notificationBell}>
            <i className="fas fa-bell"></i>
          </div>
          <div className={styles.profileAvatar}>QT</div>
        </div>
      </div>

      <h1 className={styles.pageTitle}>Quản Lý Hồ Sơ Đấu Giá</h1>
      <p className={styles.pageSubtitle}>Quản lý hồ sơ tham gia đấu giá của người dùng</p>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select className={styles.filterSelect} value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Bị từ chối">Bị từ chối</option>
          </select>
          <select className={styles.filterSelect} value={userFilter} onChange={handleUserFilterChange}>
            <option value="">Tất cả người dùng</option>
            <option value="2">Nguyễn Văn A (ID: 2)</option>
            <option value="3">Trần Thị B (ID: 3)</option>
            <option value="4">Lê Văn C (ID: 4)</option>
          </select>
          <select className={styles.filterSelect} value={itemFilter} onChange={handleItemFilterChange}>
            <option value="">Tất cả tài sản</option>
            <option value="TS001">#TS-001 - Bất động sản quận 1</option>
            <option value="TS002">#TS-002 - Xe hơi Mercedes</option>
            <option value="TS003">#TS-003 - Đồng hồ Rolex</option>
            <option value="TS004">#TS-004 - Tranh nghệ thuật</option>
            <option value="TS005">#TS-005 - Máy ảnh Canon</option>
            <option value="TS006">#TS-006 - Điện thoại iPhone</option>
            <option value="TS007">#TS-007 - Đất nền ngoại ô</option>
          </select>
        </div>
        <button className={styles.addBtn} onClick={() => openProfileModal('add')}>
          <i className="fas fa-plus"></i>
          Thêm hồ sơ mới
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Mã HS</th>
            <th>Người dùng (ID)</th>
            <th>Tài sản (ID)</th>
            <th>URL tài liệu</th>
            <th>Tiền đặt cọc</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentProfiles.map(profile => (
            <tr key={profile.id}>
              <td data-label="Mã HS">{profile.id}</td>
              <td data-label="Người dùng (ID)">{profile.user}</td>
              <td data-label="Tài sản (ID)">{profile.item}</td>
              <td data-label="URL tài liệu">
                <a href={profile.documentUrl} target="_blank" rel="noopener noreferrer">doc{profile.id.split('-')[1]}.pdf</a>
              </td>
              <td data-label="Tiền đặt cọc">{profile.depositAmount}</td>
              <td data-label="Trạng thái">
                <span className={`${styles.statusBadge} ${styles[getStatusClass(profile.status)]}`}>{profile.status}</span>
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

      <div className={styles.pagination}>
        {renderPagination()}
      </div>

      {/* Add/Edit Profile Modal */}
      {showProfileModal && (
        <div className={styles.modal} onClick={closeProfileModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa hồ sơ đấu giá' : 'Thêm hồ sơ đấu giá mới'}
              </h2>
              <span className={styles.modalClose} onClick={closeProfileModal}>×</span>
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
                  <option value="2">Nguyễn Văn A (ID: 2)</option>
                  <option value="3">Trần Thị B (ID: 3)</option>
                  <option value="4">Lê Văn C (ID: 4)</option>
                  <option value="5">Phạm Thị D (ID: 5)</option>
                  <option value="6">Hoàng Văn E (ID: 6)</option>
                  <option value="7">Vũ Thị F (ID: 7)</option>
                </select>
              </div>
              <div>
                <label htmlFor="item">Tài sản (ID)</label>
                <select
                  id="item"
                  name="item"
                  value={profileForm.item}
                  onChange={handleFormChange}
                >
                  <option value="">Chọn tài sản</option>
                  <option value="TS001">#TS-001 - Bất động sản quận 1</option>
                  <option value="TS002">#TS-002 - Xe hơi Mercedes</option>
                  <option value="TS003">#TS-003 - Đồng hồ Rolex</option>
                  <option value="TS004">#TS-004 - Tranh nghệ thuật</option>
                  <option value="TS005">#TS-005 - Máy ảnh Canon</option>
                  <option value="TS006">#TS-006 - Điện thoại iPhone</option>
                  <option value="TS007">#TS-007 - Đất nền ngoại ô</option>
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
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveProfile}>Lưu</button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeProfileModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showViewModal && selectedProfile && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Hồ Sơ Đấu Giá</h2>
              <span className={styles.modalClose} onClick={closeViewModal}>×</span>
            </div>
            <div className={styles.modalBody}>
              <p><strong>Mã hồ sơ:</strong> {selectedProfile.id}</p>
              <p><strong>Người dùng:</strong> {selectedProfile.user}</p>
              <p><strong>Tài sản:</strong> {selectedProfile.item}</p>
              <p><strong>URL tài liệu:</strong> <a href={selectedProfile.documentUrl} target="_blank" rel="noopener noreferrer">doc{selectedProfile.id.split('-')[1]}.pdf</a></p>
              <p><strong>Tiền đặt cọc:</strong> {selectedProfile.depositAmount}</p>
              <p><strong>Trạng thái:</strong> {selectedProfile.status}</p>
              <p><strong>Ngày tạo:</strong> {selectedProfile.createdDate}</p>
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
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeViewModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
