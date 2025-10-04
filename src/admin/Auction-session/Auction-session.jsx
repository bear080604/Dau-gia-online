import React, { useState, useEffect } from 'react';
import styles from './Auction-session.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function AuctionSession() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemFilter, setItemFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    item: '',
    creator: '1',
    startTime: '',
    endTime: '',
    regulation: '',
    status: 'Mo'
  });

  const itemsPerPage = 5;

  const sessions = [
    {
      id: '#PH-001',
      item: '#TS-001 - Bất động sản quận 1',
      itemId: 'TS001',
      creator: 'Admin QT',
      creatorId: '1',
      startTime: '2025-10-03 09:00',
      endTime: '2025-10-03 17:00',
      regulation: 'Đấu giá trực tuyến, bước nhảy 100.000đ',
      regulationFull: 'Quy định đầy đủ: Đấu giá trực tuyến, bước nhảy tối thiểu 100.000đ, thời gian gia hạn 5 phút nếu có bid cuối.',
      status: 'Đang diễn ra',
      statusClass: 'statusDangdienra'
    },
    {
      id: '#PH-002',
      item: '#TS-002 - Xe hơi Mercedes',
      itemId: 'TS002',
      creator: 'Admin QT',
      creatorId: '1',
      startTime: '2025-10-04 10:00',
      endTime: '2025-10-04 18:00',
      regulation: 'Đấu giá kín, đặt cọc trước',
      regulationFull: 'Quy định đầy đủ: Đấu giá kín, yêu cầu đặt cọc 10% giá khởi điểm trước khi tham gia.',
      status: 'Mở',
      statusClass: 'statusMo'
    },
    {
      id: '#PH-003',
      item: '#TS-003 - Đồng hồ Rolex',
      itemId: 'TS003',
      creator: 'Admin QT',
      creatorId: '1',
      startTime: '2025-10-01 14:00',
      endTime: '2025-10-01 16:00',
      regulation: 'Đấu giá mở, không giới hạn',
      regulationFull: 'Quy định đầy đủ: Đấu giá mở, không giới hạn số lượt bid, công bố kết quả ngay sau kết thúc.',
      status: 'Kết thúc',
      statusClass: 'statusKetthuc'
    },
    {
      id: '#PH-004',
      item: '#TS-004 - Tranh nghệ thuật',
      itemId: 'TS004',
      creator: 'Admin QT',
      creatorId: '1',
      startTime: '2025-10-05 08:00',
      endTime: '2025-10-05 12:00',
      regulation: 'Đấu giá đặc biệt',
      regulationFull: 'Quy định đầy đủ: Đấu giá đặc biệt cho nghệ thuật, kiểm tra chuyên viên trước.',
      status: 'Mở',
      statusClass: 'statusMo'
    },
    {
      id: '#PH-005',
      item: '#TS-005 - Máy ảnh Canon',
      itemId: 'TS005',
      creator: 'Admin QT',
      creatorId: '1',
      startTime: '2025-10-06 11:00',
      endTime: '2025-10-06 15:00',
      regulation: 'Đấu giá tiêu chuẩn',
      regulationFull: 'Quy định đầy đủ: Đấu giá tiêu chuẩn, bước nhảy 50.000đ.',
      status: 'Đang diễn ra',
      statusClass: 'statusDangdienra'
    },
    {
      id: '#PH-006',
      item: '#TS-006 - Điện thoại iPhone',
      itemId: 'TS006',
      creator: 'Admin QT',
      creatorId: '1',
      startTime: '2025-10-07 13:00',
      endTime: '2025-10-07 17:00',
      regulation: 'Đấu giá nhanh',
      regulationFull: 'Quy định đầy đủ: Đấu giá nhanh, thời gian ngắn 4 giờ.',
      status: 'Mở',
      statusClass: 'statusMo'
    },
    {
      id: '#PH-007',
      item: '#TS-007 - Đất nền ngoại ô',
      itemId: 'TS007',
      creator: 'Admin QT',
      creatorId: '1',
      startTime: '2025-09-30 09:00',
      endTime: '2025-09-30 13:00',
      regulation: 'Đấu giá bất động sản',
      regulationFull: 'Quy định đầy đủ: Đấu giá bất động sản, kiểm tra pháp lý trước.',
      status: 'Kết thúc',
      statusClass: 'statusKetthuc'
    },
  ];

  const applyFilters = () => {
    return sessions.filter(session => {
      const searchMatch =
        session.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.creator.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = !statusFilter || session.status.toLowerCase().includes(statusFilter.toLowerCase());
      const itemMatch = !itemFilter || session.itemId.toLowerCase().includes(itemFilter.toLowerCase());
      return searchMatch && statusMatch && itemMatch;
    });
  };

  const filteredSessions = applyFilters();
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSessions = filteredSessions.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
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

  const openSessionModal = (mode, session = null) => {
    setModalMode(mode);
    if (session) {
      setSessionForm({
        item: session.itemId,
        creator: session.creatorId,
        startTime: session.startTime.replace(' ', 'T'),
        endTime: session.endTime.replace(' ', 'T'),
        regulation: session.regulationFull,
        status: session.status === 'Mở' ? 'Mo' :
                session.status === 'Đang diễn ra' ? 'DangDienRa' : 'KetThuc'
      });
    } else {
      setSessionForm({
        item: '',
        creator: '1',
        startTime: '',
        endTime: '',
        regulation: '',
        status: 'Mo'
      });
    }
    setShowSessionModal(true);
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
  };

  const openViewModal = (session) => {
    setSelectedSession(session);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSessionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSession = () => {
    alert('Chức năng lưu chỉ là demo, không lưu thực tế.');
    closeSessionModal();
  };

  const handleDeleteSession = (session) => {
    if (window.confirm('Bạn có chắc muốn xóa phiên này?')) {
      alert('Chức năng xóa chỉ là demo, không xóa thực tế.');
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Mở': 'statusMo',
      'Đang diễn ra': 'statusDangdienra',
      'Kết thúc': 'statusKetthuc'
    };
    return statusMap[status] || 'statusMo';
  };

  const getActionButtons = (session) => {
    const buttons = [];

    buttons.push(
      <button key="edit" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openSessionModal('edit', session)}>
        <i className="fa fa-pencil" aria-hidden="true"></i>
      </button>
    );
    buttons.push(
      <button key="delete" className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteSession(session)}>
        <i className="fa fa-trash" aria-hidden="true"></i>
      </button>
    );
    buttons.push(
      <button key="view" className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => openViewModal(session)}>
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
            placeholder="Tìm kiếm phiên đấu giá..."
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

      <h1 className={styles.pageTitle}>Quản Lý Phiên Đấu Giá</h1>
      <p className={styles.pageSubtitle}>Quản lý và theo dõi các phiên đấu giá đang diễn ra</p>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select className={styles.filterSelect} value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="">Tất cả trạng thái</option>
            <option value="Mở">Mở</option>
            <option value="Đang diễn ra">Đang diễn ra</option>
            <option value="Kết thúc">Kết thúc</option>
          </select>
          <select className={styles.filterSelect} value={itemFilter} onChange={handleItemFilterChange}>
            <option value="">Tất cả tài sản</option>
            <option value="TS001">Bất động sản quận 1</option>
            <option value="TS002">Xe hơi Mercedes</option>
            <option value="TS003">Đồng hồ Rolex</option>
            <option value="TS004">Tranh nghệ thuật</option>
            <option value="TS005">Máy ảnh Canon</option>
            <option value="TS006">Điện thoại iPhone</option>
            <option value="TS007">Đất nền ngoại ô</option>
          </select>
        </div>
        <button className={styles.addBtn} onClick={() => openSessionModal('add')}>
          <i className="fas fa-plus"></i>
          Thêm phiên mới
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Mã Phiên</th>
            <th>Tài sản</th>
            <th>Người tạo</th>
            <th>Thời gian bắt đầu</th>
            <th>Thời gian kết thúc</th>
            <th>Quy định</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentSessions.map(session => (
            <tr key={session.id}>
              <td data-label="Mã Phiên">{session.id}</td>
              <td data-label="Tài sản">{session.item}</td>
              <td data-label="Người tạo">{session.creator}</td>
              <td data-label="Thời gian bắt đầu">{session.startTime}</td>
              <td data-label="Thời gian kết thúc">{session.endTime}</td>
              <td data-label="Quy định">{session.regulation}</td>
              <td data-label="Trạng thái">
                <span className={`${styles.statusBadge} ${styles[getStatusClass(session.status)]}`}>{session.status}</span>
              </td>
              <td data-label="Hành động">
                <div className={styles.actionButtons}>
                  {getActionButtons(session)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        {renderPagination()}
      </div>

      {/* Add/Edit Session Modal */}
      {showSessionModal && (
        <div className={styles.modal} onClick={closeSessionModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa phiên đấu giá' : 'Thêm phiên đấu giá mới'}
              </h2>
              <span className={styles.modalClose} onClick={closeSessionModal}>×</span>
            </div>
            <div className={styles.modalBody}>
              <div>
                <label htmlFor="item">Tài sản (ID)</label>
                <select
                  id="item"
                  name="item"
                  value={sessionForm.item}
                  onChange={handleFormChange}
                >
                  <option value="">Chọn tài sản</option>
                  <option value="TS001">TS001 - Bất động sản quận 1</option>
                  <option value="TS002">TS002 - Xe hơi Mercedes</option>
                  <option value="TS003">TS003 - Đồng hồ Rolex</option>
                  <option value="TS004">TS004 - Tranh nghệ thuật</option>
                  <option value="TS005">TS005 - Máy ảnh Canon</option>
                  <option value="TS006">TS006 - Điện thoại iPhone</option>
                  <option value="TS007">TS007 - Đất nền ngoại ô</option>
                </select>
              </div>
              <div>
                <label htmlFor="creator">Người tạo (ID User)</label>
                <input
                  type="number"
                  id="creator"
                  name="creator"
                  placeholder="Nhập ID người tạo"
                  value={sessionForm.creator}
                  onChange={handleFormChange}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="startTime">Thời gian bắt đầu</label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={sessionForm.startTime}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="endTime">Thời gian kết thúc</label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  value={sessionForm.endTime}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="regulation">Quy định</label>
                <textarea
                  id="regulation"
                  name="regulation"
                  placeholder="Nhập quy định phiên đấu giá"
                  value={sessionForm.regulation}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="status">Trạng thái</label>
                <select
                  id="status"
                  name="status"
                  value={sessionForm.status}
                  onChange={handleFormChange}
                >
                  <option value="Mo">Mở</option>
                  <option value="DangDienRa">Đang diễn ra</option>
                  <option value="KetThuc">Kết thúc</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveSession}>Lưu</button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeSessionModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* View Session Modal */}
      {showViewModal && selectedSession && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Phiên Đấu Giá</h2>
              <span className={styles.modalClose} onClick={closeViewModal}>×</span>
            </div>
            <div className={styles.modalBody}>
              <p><strong>Mã phiên:</strong> {selectedSession.id}</p>
              <p><strong>Tài sản:</strong> {selectedSession.item}</p>
              <p><strong>Người tạo:</strong> {selectedSession.creator}</p>
              <p><strong>Thời gian bắt đầu:</strong> {selectedSession.startTime}</p>
              <p><strong>Thời gian kết thúc:</strong> {selectedSession.endTime}</p>
              <p><strong>Trạng thái:</strong> {selectedSession.status}</p>
              <p><strong>Quy định:</strong> {selectedSession.regulationFull}</p>
              <div className={styles.orderHistory}>
                <h3>Lịch sử lượt bid (demo)</h3>
                <table className={styles.orderTable}>
                  <thead>
                    <tr>
                      <th>Mã bid</th>
                      <th>Người bid</th>
                      <th>Giá bid</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>BID001</td>
                      <td>User 1</td>
                      <td>2.600.000.000đ</td>
                      <td>2025-10-03 10:00</td>
                    </tr>
                    <tr>
                      <td>BID002</td>
                      <td>User 2</td>
                      <td>2.700.000.000đ</td>
                      <td>2025-10-03 11:00</td>
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

export default AuctionSession;
