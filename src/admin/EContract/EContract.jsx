import React, { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './EContract.module.css';

function EContract() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEContract, setSelectedEContract] = useState(null);
  const [formData, setFormData] = useState({
    econtractType: 'DichVuDauGia',
    fileUrl: '',
    signedBy: '',
    signedDate: '',
    sessionId: '',
    contractId: ''
  });

  const itemsPerPage = 5;

  const econtracts = [
    {
      id: '#HDĐT-001',
      type: 'Dịch vụ đấu giá',
      typeClass: 'typeDichvudaugia',
      fileUrl: 'https://example.com/econtract1.pdf',
      signedBy: 'Admin QT (ID: 1)',
      signedDate: '2025-10-01 10:00',
      sessionId: '#PH-001',
      contractId: '#HD-001',
      signedById: '1',
      sessionIdShort: 'PH001',
      contractIdShort: 'HD001'
    },
    {
      id: '#HDĐT-002',
      type: 'Mua bán tài sản',
      typeClass: 'typeMuabantaisan',
      fileUrl: 'https://example.com/econtract2.pdf',
      signedBy: 'Nguyễn Văn A (ID: 2)',
      signedDate: '2025-10-02 14:30',
      sessionId: '#PH-002',
      contractId: '#HD-002',
      signedById: '2',
      sessionIdShort: 'PH002',
      contractIdShort: 'HD002'
    },
    {
      id: '#HDĐT-003',
      type: 'Dịch vụ đấu giá',
      typeClass: 'typeDichvudaugia',
      fileUrl: 'https://example.com/econtract3.pdf',
      signedBy: 'Trần Thị B (ID: 3)',
      signedDate: '2025-09-30 16:00',
      sessionId: '#PH-003',
      contractId: '#HD-003',
      signedById: '3',
      sessionIdShort: 'PH003',
      contractIdShort: 'HD003'
    },
    {
      id: '#HDĐT-004',
      type: 'Mua bán tài sản',
      typeClass: 'typeMuabantaisan',
      fileUrl: 'https://example.com/econtract4.pdf',
      signedBy: 'Lê Văn C (ID: 4)',
      signedDate: '2025-10-03 11:45',
      sessionId: '#PH-004',
      contractId: '#HD-004',
      signedById: '4',
      sessionIdShort: 'PH004',
      contractIdShort: 'HD004'
    },
    {
      id: '#HDĐT-005',
      type: 'Dịch vụ đấu giá',
      typeClass: 'typeDichvudaugia',
      fileUrl: 'https://example.com/econtract5.pdf',
      signedBy: 'Phạm Thị D (ID: 5)',
      signedDate: '2025-10-04 13:20',
      sessionId: '#PH-005',
      contractId: '#HD-005',
      signedById: '5',
      sessionIdShort: 'PH005',
      contractIdShort: 'HD005'
    },
    {
      id: '#HDĐT-006',
      type: 'Mua bán tài sản',
      typeClass: 'typeMuabantaisan',
      fileUrl: 'https://example.com/econtract6.pdf',
      signedBy: 'Hoàng Văn E (ID: 6)',
      signedDate: '2025-10-05 15:50',
      sessionId: '#PH-006',
      contractId: '#HD-006',
      signedById: '6',
      sessionIdShort: 'PH006',
      contractIdShort: 'HD006'
    },
    {
      id: '#HDĐT-007',
      type: 'Dịch vụ đấu giá',
      typeClass: 'typeDichvudaugia',
      fileUrl: 'https://example.com/econtract7.pdf',
      signedBy: 'Vũ Thị F (ID: 7)',
      signedDate: '2025-09-29 12:10',
      sessionId: '#PH-007',
      contractId: '#HD-007',
      signedById: '7',
      sessionIdShort: 'PH007',
      contractIdShort: 'HD007'
    }
  ];

  const applyFilters = () => {
    return econtracts.filter(econtract => {
      const searchMatch = econtract.fileUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         econtract.signedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         econtract.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         econtract.contractId.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = !typeFilter || econtract.type.toLowerCase().includes(typeFilter.toLowerCase());
      const sessionMatch = !sessionFilter || econtract.sessionId.toLowerCase().includes(sessionFilter.toLowerCase());
      return searchMatch && typeMatch && sessionMatch;
    });
  };

  const filteredEContracts = applyFilters();
  const totalPages = Math.ceil(filteredEContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEContracts = filteredEContracts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, sessionFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  const handleSessionFilterChange = (e) => {
    setSessionFilter(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openAddModal = () => {
    setFormData({
      econtractType: 'DichVuDauGia',
      fileUrl: '',
      signedBy: '',
      signedDate: '',
      sessionId: '',
      contractId: ''
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const openEditModal = (econtract) => {
    setFormData({
      econtractType: econtract.type === 'Dịch vụ đấu giá' ? 'DichVuDauGia' : 'MuaBanTaiSan',
      fileUrl: econtract.fileUrl,
      signedBy: econtract.signedById,
      signedDate: econtract.signedDate.slice(0, 16).replace(' ', 'T'),
      sessionId: econtract.sessionIdShort,
      contractId: econtract.contractIdShort
    });
    setShowAddModal(true);
  };

  const openViewModal = (econtract) => {
    setSelectedEContract(econtract);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedEContract(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    alert('Chức năng lưu chỉ là demo, không lưu thực tế.');
    closeAddModal();
  };

  const handleDelete = (econtract) => {
    if (window.confirm('Bạn có chắc muốn xóa hợp đồng điện tử này?')) {
      alert('Chức năng xóa chỉ là demo, không xóa thực tế.');
    }
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      alert('Không có file để tải.');
    }
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

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm hợp đồng điện tử..."
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

      <h1 className={styles.pageTitle}>Quản Lý Hợp Đồng Điện Tử</h1>
      <p className={styles.pageSubtitle}>Quản lý và theo dõi các hợp đồng điện tử đã ký</p>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={typeFilter}
            onChange={handleTypeFilterChange}
          >
            <option value="">Tất cả loại</option>
            <option value="Dịch vụ đấu giá">Dịch vụ đấu giá</option>
            <option value="Mua bán tài sản">Mua bán tài sản</option>
          </select>
          <select
            className={styles.filterSelect}
            value={sessionFilter}
            onChange={handleSessionFilterChange}
          >
            <option value="">Tất cả phiên</option>
            <option value="PH001">#PH-001</option>
            <option value="PH002">#PH-002</option>
            <option value="PH003">#PH-003</option>
          </select>
        </div>
        <button className={styles.addBtn} onClick={openAddModal}>
          <i className="fas fa-plus"></i>
          Thêm hợp đồng điện tử mới
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Mã HDĐT</th>
            <th>Loại hợp đồng</th>
            <th>File URL</th>
            <th>Người ký (ID)</th>
            <th>Ngày ký</th>
            <th>Phiên ID</th>
            <th>Hợp đồng ID</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentEContracts.map((econtract, index) => (
            <tr key={index}>
              <td data-label="Mã HDĐT">{econtract.id}</td>
              <td data-label="Loại hợp đồng">
                <span className={`${styles.statusBadge} ${styles[econtract.typeClass]}`}>
                  {econtract.type}
                </span>
              </td>
              <td data-label="File URL">
                <a href={econtract.fileUrl} target="_blank">{econtract.fileUrl.split('/').pop()}</a>
              </td>
              <td data-label="Người ký (ID)">{econtract.signedBy}</td>
              <td data-label="Ngày ký">{econtract.signedDate}</td>
              <td data-label="Phiên ID">{econtract.sessionId}</td>
              <td data-label="Hợp đồng ID">{econtract.contractId}</td>
              <td data-label="Hành động">
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => openEditModal(econtract)}
                  title="Chỉnh sửa hợp đồng điện tử"
                >
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
                <button
                  className={`${styles.btn} ${styles.btnSuccess}`}
                  onClick={() => handleDownload(econtract.fileUrl)}
                  title="Tải file"
                >
                  <i className="fa fa-download" aria-hidden="true"></i>
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleDelete(econtract)}
                  title="Xóa hợp đồng điện tử"
                >
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
                <button
                  className={`${styles.btn} ${styles.btnSuccess}`}
                  onClick={() => openViewModal(econtract)}
                  title="Xem chi tiết hợp đồng điện tử"
                >
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

      {/* Add/Edit Modal */}
      <div className={`${styles.modal} ${showAddModal ? styles.show : ''}`}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Thêm Hợp Đồng Điện Tử Mới</h2>
            <span className={styles.modalClose} onClick={closeAddModal}>×</span>
          </div>
          <div className={styles.modalBody}>
            <div>
              <label htmlFor="econtractType">Loại hợp đồng</label>
              <select
                id="econtractType"
                name="econtractType"
                value={formData.econtractType}
                onChange={handleFormChange}
              >
                <option value="DichVuDauGia">Dịch vụ đấu giá</option>
                <option value="MuaBanTaiSan">Mua bán tài sản</option>
              </select>
            </div>
            <div>
              <label htmlFor="fileUrl">File URL</label>
              <input
                type="url"
                id="fileUrl"
                name="fileUrl"
                placeholder="Nhập URL file hợp đồng"
                value={formData.fileUrl}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <label htmlFor="signedBy">Người ký (ID User)</label>
              <input
                type="number"
                id="signedBy"
                name="signedBy"
                placeholder="Nhập ID người ký"
                value={formData.signedBy}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <label htmlFor="signedDate">Ngày ký</label>
              <input
                type="datetime-local"
                id="signedDate"
                name="signedDate"
                value={formData.signedDate}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <label htmlFor="sessionId">Phiên ID</label>
              <select
                id="sessionId"
                name="sessionId"
                value={formData.sessionId}
                onChange={handleFormChange}
              >
                <option value="">Chọn phiên</option>
                <option value="PH001">#PH-001</option>
                <option value="PH002">#PH-002</option>
                <option value="PH003">#PH-003</option>
                <option value="PH004">#PH-004</option>
                <option value="PH005">#PH-005</option>
                <option value="PH006">#PH-006</option>
                <option value="PH007">#PH-007</option>
              </select>
            </div>
            <div>
              <label htmlFor="contractId">Hợp đồng ID</label>
              <select
                id="contractId"
                name="contractId"
                value={formData.contractId}
                onChange={handleFormChange}
              >
                <option value="">Chọn hợp đồng</option>
                <option value="HD001">#HD-001</option>
                <option value="HD002">#HD-002</option>
                <option value="HD003">#HD-003</option>
                <option value="HD004">#HD-004</option>
                <option value="HD005">#HD-005</option>
                <option value="HD006">#HD-006</option>
                <option value="HD007">#HD-007</option>
              </select>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>
              Lưu
            </button>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeAddModal}>
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <div className={`${styles.modal} ${showViewModal ? styles.show : ''}`}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Chi Tiết Hợp Đồng Điện Tử</h2>
            <span className={styles.modalClose} onClick={closeViewModal}>×</span>
          </div>
          <div className={styles.modalBody}>
            {selectedEContract && (
              <>
                <p><strong>Mã hợp đồng điện tử:</strong> {selectedEContract.id}</p>
                <p><strong>Loại hợp đồng:</strong> {selectedEContract.type}</p>
                <p><strong>File URL:</strong> <a id="viewFileUrl" href={selectedEContract.fileUrl} target="_blank">{selectedEContract.fileUrl.split('/').pop()}</a></p>
                <p><strong>Người ký:</strong> {selectedEContract.signedBy}</p>
                <p><strong>Ngày ký:</strong> {selectedEContract.signedDate}</p>
                <p><strong>Phiên ID:</strong> {selectedEContract.sessionId}</p>
                <p><strong>Hợp đồng ID:</strong> {selectedEContract.contractId}</p>
                <div className={styles.orderHistory}>
                  <h3>Lịch sử ký hợp đồng (demo)</h3>
                  <table className={styles.orderTable}>
                    <thead>
                      <tr>
                        <th>Hành động</th>
                        <th>Người thực hiện</th>
                        <th>Thời gian</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Ký</td>
                        <td>Admin QT</td>
                        <td>2025-10-01 10:30</td>
                        <td>Xác nhận chữ ký số</td>
                      </tr>
                      <tr>
                        <td>Xác thực</td>
                        <td>Hệ thống</td>
                        <td>2025-10-01 10:35</td>
                        <td>Hợp đồng hợp lệ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <div className={styles.modalFooter}>
            <button
              className={`${styles.btn} ${styles.btnSuccess}`}
              onClick={() => handleDownload(selectedEContract?.fileUrl)}
            >
              Tải file
            </button>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeViewModal}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EContract;
