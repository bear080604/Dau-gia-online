import React, { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './Contract.module.css';

function Contract() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [formData, setFormData] = useState({
    contractSession: '',
    contractWinner: '',
    finalPrice: '',
    signedDate: '',
    contractManager: '',
    contractStatus: 'ChoThanhToan'
  });

  const itemsPerPage = 5;

  // Fetch contracts from the backend
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch('/contracts'); // Adjust URL based on your API setup
        const data = await response.json();
        if (data.status) {
          // Transform backend data to match frontend structure
          const transformedContracts = data.contracts.map(contract => ({
            id: `#HD-${contract.contract_id.toString().padStart(3, '0')}`,
            sessionId: `#PH-${contract.session_id.toString().padStart(3, '0')}`,
            sessionIdShort: `PH${contract.session_id.toString().padStart(3, '0')}`,
            winner: `${contract.winner.full_name} (ID: ${contract.winner_id})`,
            winnerId: contract.winner_id.toString(),
            finalPrice: new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(contract.final_price),
            signedDate: new Date(contract.signed_date).toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
            manager: contract.session.created_by
              ? `Admin QT (ID: ${contract.session.created_by})`
              : 'Unknown',
            managerId: contract.session.created_by?.toString() || '1',
            status: contract.status === 'ChoThanhToan' ? 'Chờ thanh toán' :
                    contract.status === 'DaThanhToan' ? 'Đã thanh toán' : 'Hủy',
            statusClass: contract.status === 'ChoThanhToan' ? 'statusChothanhtoan' :
                         contract.status === 'DaThanhToan' ? 'statusDathanhtoan' : 'statusHuy',
            paymentStatus: contract.status
          }));
          setContracts(transformedContracts);
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
      }
    };
    fetchContracts();
  }, []);

  const applyFilters = () => {
    return contracts.filter(contract => {
      const searchMatch = contract.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.winner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.manager.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = !statusFilter || contract.status.toLowerCase().includes(statusFilter.toLowerCase());
      const sessionMatch = !sessionFilter || contract.sessionId.toLowerCase().includes(sessionFilter.toLowerCase());
      return searchMatch && statusMatch && sessionMatch;
    });
  };

  const filteredContracts = applyFilters();
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContracts = filteredContracts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sessionFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSessionFilterChange = (e) => {
    setSessionFilter(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openAddModal = () => {
    setFormData({
      contractSession: '',
      contractWinner: '',
      finalPrice: '',
      signedDate: '',
      contractManager: '',
      contractStatus: 'ChoThanhToan'
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const openEditModal = (contract) => {
    setFormData({
      contractSession: contract.sessionIdShort,
      contractWinner: contract.winnerId,
      finalPrice: contract.finalPrice.replace(/[^\d]/g, ''),
      signedDate: contract.signedDate.replace(' ', 'T').slice(0, 16),
      contractManager: contract.managerId,
      contractStatus: contract.status === 'Chờ thanh toán' ? 'ChoThanhToan' :
                      contract.status === 'Đã thanh toán' ? 'DaThanhToan' : 'Hủy'
    });
    setShowAddModal(true);
  };

  const openViewModal = async (contract) => {
    try {
      const contractId = contract.id.replace('#HD-', '');
      const response = await fetch(`/contracts/${contractId}`); // Fetch single contract
      const data = await response.json();
      if (data.status) {
        const transformedContract = {
          id: `#HD-${data.contract.contract_id.toString().padStart(3, '0')}`,
          sessionId: `#PH-${data.contract.session_id.toString().padStart(3, '0')}`,
          sessionIdShort: `PH${data.contract.session_id.toString().padStart(3, '0')}`,
          winner: `${data.contract.winner.full_name} (ID: ${data.contract.winner_id})`,
          winnerId: data.contract.winner_id.toString(),
          finalPrice: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(data.contract.final_price),
          signedDate: new Date(data.contract.signed_date).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          manager: data.contract.session.created_by
            ? `Admin QT (ID: ${data.contract.session.created_by})`
            : 'Unknown',
          managerId: data.contract.session.created_by?.toString() || '1',
          status: data.contract.status === 'ChoThanhToan' ? 'Chờ thanh toán' :
                  data.contract.status === 'DaThanhToan' ? 'Đã thanh toán' : 'Hủy',
          statusClass: data.contract.status === 'ChoThanhToan' ? 'statusChothanhtoan' :
                       data.contract.status === 'DaThanhToan' ? 'statusDathanhtoan' : 'statusHuy',
          paymentStatus: data.contract.status
        };
        setSelectedContract(transformedContract);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching contract details:', error);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedContract(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Simulate API call to save contract
      const response = await fetch('/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: formData.contractSession.replace('PH', ''),
          winner_id: formData.contractWinner,
          final_price: formData.finalPrice,
          signed_date: formData.signedDate,
          status: formData.contractStatus,
          created_by: formData.contractManager
        })
      });
      if (response.ok) {
        alert('Hợp đồng đã được lưu (demo).');
        closeAddModal();
        // Refetch contracts to update the list
        const fetchResponse = await fetch('/contracts');
        const data = await fetchResponse.json();
        if (data.status) {
          const transformedContracts = data.contracts.map(contract => ({
            id: `#HD-${contract.contract_id.toString().padStart(3, '0')}`,
            sessionId: `#PH-${contract.session_id.toString().padStart(3, '0')}`,
            sessionIdShort: `PH${contract.session_id.toString().padStart(3, '0')}`,
            winner: `${contract.winner.full_name} (ID: ${contract.winner_id})`,
            winnerId: contract.winner_id.toString(),
            finalPrice: new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(contract.final_price),
            signedDate: new Date(contract.signed_date).toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
            manager: contract.session.created_by
              ? `Admin QT (ID: ${contract.session.created_by})`
              : 'Unknown',
            managerId: contract.session.created_by?.toString() || '1',
            status: contract.status === 'ChoThanhToan' ? 'Chờ thanh toán' :
                    contract.status === 'DaThanhToan' ? 'Đã thanh toán' : 'Hủy',
            statusClass: contract.status === 'ChoThanhToan' ? 'statusChothanhtoan' :
                         contract.status === 'DaThanhToan' ? 'statusDathanhtoan' : 'statusHuy',
            paymentStatus: contract.status
          }));
          setContracts(transformedContracts);
        }
      } else {
        alert('Lỗi khi lưu hợp đồng.');
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      alert('Lỗi khi lưu hợp đồng.');
    }
  };

  const handleDelete = async (contract) => {
    if (window.confirm('Bạn có chắc muốn xóa hợp đồng này?')) {
      try {
        const contractId = contract.id.replace('#HD-', '');
        const response = await fetch(`/contracts/${contractId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert('Hợp đồng đã được xóa (demo).');
          // Refetch contracts to update the list
          const fetchResponse = await fetch('/contracts');
          const data = await fetchResponse.json();
          if (data.status) {
            const transformedContracts = data.contracts.map(contract => ({
              id: `#HD-${contract.contract_id.toString().padStart(3, '0')}`,
              sessionId: `#PH-${contract.session_id.toString().padStart(3, '0')}`,
              sessionIdShort: `PH${contract.session_id.toString().padStart(3, '0')}`,
              winner: `${contract.winner.full_name} (ID: ${contract.winner_id})`,
              winnerId: contract.winner_id.toString(),
              finalPrice: new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(contract.final_price),
              signedDate: new Date(contract.signed_date).toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }),
              manager: contract.session.created_by
                ? `Admin QT (ID: ${contract.session.created_by})`
                : 'Unknown',
              managerId: contract.session.created_by?.toString() || '1',
              status: contract.status === 'ChoThanhToan' ? 'Chờ thanh toán' :
                      contract.status === 'DaThanhToan' ? 'Đã thanh toán' : 'Hủy',
              statusClass: contract.status === 'ChoThanhToan' ? 'statusChothanhtoan' :
                           contract.status === 'DaThanhToan' ? 'statusDathanhtoan' : 'statusHuy',
              paymentStatus: contract.status
            }));
            setContracts(transformedContracts);
          }
        } else {
          alert('Lỗi khi xóa hợp đồng.');
        }
      } catch (error) {
        console.error('Error deleting contract:', error);
        alert('Lỗi khi xóa hợp đồng.');
      }
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
            placeholder="Tìm kiếm hợp đồng..."
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

      <h1 className={styles.pageTitle}>Quản Lý Hợp Đồng</h1>
      <p className={styles.pageSubtitle}>Quản lý và theo dõi các hợp đồng sau đấu giá</p>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ thanh toán">Chờ thanh toán</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
            <option value="Hủy">Hủy</option>
          </select>
          <select
            className={styles.filterSelect}
            value={sessionFilter}
            onChange={handleSessionFilterChange}
          >
            <option value="">Tất cả phiên</option>
            {[...new Set(contracts.map(c => c.sessionId))].map(sessionId => (
              <option key={sessionId} value={sessionId}>{sessionId}</option>
            ))}
          </select>
        </div>
        <button className={styles.addBtn} onClick={openAddModal}>
          <i className="fas fa-plus"></i>
          Thêm hợp đồng mới
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Mã HD</th>
            <th>Phiên ID</th>
            <th>Người thắng (ID)</th>
            <th>Giá cuối</th>
            <th>Ngày ký</th>
            <th>Người quản lý</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentContracts.map((contract, index) => (
            <tr key={index}>
              <td data-label="Mã HD">{contract.id}</td>
              <td data-label="Phiên ID">{contract.sessionId}</td>
              <td data-label="Người thắng (ID)">{contract.winner}</td>
              <td data-label="Giá cuối">{contract.finalPrice}</td>
              <td data-label="Ngày ký">{contract.signedDate}</td>
              <td data-label="Người quản lý">{contract.manager}</td>
              <td data-label="Trạng thái">
                <span className={`${styles.statusBadge} ${styles[contract.statusClass]}`}>
                  {contract.status}
                </span>
              </td>
              <td data-label="Hành động">
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => openEditModal(contract)}
                  title="Chỉnh sửa hợp đồng"
                >
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleDelete(contract)}
                  title="Xóa hợp đồng"
                >
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
                <button
                  className={`${styles.btn} ${styles.btnSuccess}`}
                  onClick={() => openViewModal(contract)}
                  title="Xem chi tiết hợp đồng"
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
            <h2 className={styles.modalTitle}>Thêm Hợp Đồng Mới</h2>
            <span className={styles.modalClose} onClick={closeAddModal}>×</span>
          </div>
          <div className={styles.modalBody}>
            <div>
              <label htmlFor="contractSession">Phiên ID</label>
              <select
                id="contractSession"
                name="contractSession"
                value={formData.contractSession}
                onChange={handleFormChange}
              >
                <option value="">Chọn phiên</option>
                {[...new Set(contracts.map(c => c.sessionIdShort))].map(sessionId => (
                  <option key={sessionId} value={sessionId}>{`#${sessionId}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="contractWinner">Người thắng (ID User)</label>
              <input
                type="number"
                id="contractWinner"
                name="contractWinner"
                placeholder="Nhập ID người thắng"
                value={formData.contractWinner}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <label htmlFor="finalPrice">Giá cuối (VND)</label>
              <input
                type="number"
                id="finalPrice"
                name="finalPrice"
                placeholder="Nhập giá cuối"
                step="0.01"
                value={formData.finalPrice}
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
              <label htmlFor="contractManager">Người quản lý (ID User)</label>
              <input
                type="number"
                id="contractManager"
                name="contractManager"
                placeholder="Nhập ID người quản lý"
                value={formData.contractManager}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <label htmlFor="contractStatus">Trạng thái</label>
              <select
                id="contractStatus"
                name="contractStatus"
                value={formData.contractStatus}
                onChange={handleFormChange}
              >
                <option value="ChoThanhToan">Chờ thanh toán</option>
                <option value="DaThanhToan">Đã thanh toán</option>
                <option value="Hủy">Hủy</option>
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
            <h2 className={styles.modalTitle}>Chi Tiết Hợp Đồng</h2>
            <span className={styles.modalClose} onClick={closeViewModal}>×</span>
          </div>
          <div className={styles.modalBody}>
            {selectedContract && (
              <>
                <p><strong>Mã hợp đồng:</strong> {selectedContract.id}</p>
                <p><strong>Phiên ID:</strong> {selectedContract.sessionId}</p>
                <p><strong>Người thắng:</strong> {selectedContract.winner}</p>
                <p><strong>Giá cuối:</strong> {selectedContract.finalPrice}</p>
                <p><strong>Ngày ký:</strong> {selectedContract.signedDate}</p>
                <p><strong>Người quản lý:</strong> {selectedContract.manager}</p>
                <p><strong>Trạng thái:</strong> {selectedContract.status}</p>
                <div className={styles.orderHistory}>
                  <h3>Lịch sử thanh toán (demo)</h3>
                  <table className={styles.orderTable}>
                    <thead>
                      <tr>
                        <th>Mã PT</th>
                        <th>Phương thức</th>
                        <th>Số tiền</th>
                        <th>Ngày thanh toán</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>PT001</td>
                        <td>ChuyenKhoan</td>
                        <td>2.700.000.000đ</td>
                        <td>2025-10-03 19:00</td>
                        <td>HoanTat</td>
                      </tr>
                      <tr>
                        <td>PT002</td>
                        <td>The</td>
                        <td>1.300.000.000đ</td>
                        <td>2025-10-04 20:00</td>
                        <td>ChoXuLy</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <div className={styles.modalFooter}>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeViewModal}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Contract;
