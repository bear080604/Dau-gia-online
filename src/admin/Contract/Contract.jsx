import React, { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './Contract.module.css';
import axios from 'axios';

function Contract() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedContract, setSelectedContract] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState({}); // Map of user_id to full_name
  const [userList, setUserList] = useState([]); // Full user data for validation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    contractSession: '',
    contractWinner: '',
    finalPrice: '',
    signedDate: '',
    contractManager: '',
    contractStatus: 'ChoThanhToan',
  });

  const itemsPerPage = 5;

  const statusMap = {
    ChoThanhToan: 'Chờ thanh toán',
    DaThanhToan: 'Đã thanh toán',
    Huy: 'Hủy',
  };

  const formatCurrency = (amount) => {
    if (!amount || parseFloat(amount) === 0) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fetch contracts and users from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch contracts and users concurrently
        const [contractResponse, userResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}contracts`),
          axios.get(`${process.env.REACT_APP_API_URL}showuser`),
        ]);

        // Store full user data for validation
        setUserList(userResponse.data.users);

        // Create a map of user_id to full_name
        const usersData = userResponse.data.users.reduce((acc, user) => {
          acc[user.user_id] = user.full_name;
          return acc;
        }, {});
        setUsers(usersData);

        const transformedContracts = contractResponse.data.contracts.map((contract) => ({
          id: `#HD-${String(contract.contract_id).padStart(3, '0')}`,
          sessionId: `#PH-${String(contract.session_id).padStart(3, '0')}`,
          sessionIdShort: `PH${String(contract.session_id).padStart(3, '0')}`,
          winner: contract.winner
            ? `${contract.winner.full_name} (ID: ${contract.winner_id})`
            : 'N/A',
          winnerId: contract.winner_id ? String(contract.winner_id) : '',
          finalPrice: formatCurrency(contract.final_price),
          finalPriceValue: parseFloat(contract.final_price) || 0,
          signedDate: formatDate(contract.signed_date),
          rawSignedDate: contract.signed_date || '',
          manager: contract.session.created_by
            ? `${usersData[contract.session.created_by] || 'Unknown'} (ID: ${contract.session.created_by})`
            : 'Unknown',
          managerId: contract.session.created_by?.toString() || '1',
          status: statusMap[contract.status] || contract.status,
          statusClass:
            contract.status === 'ChoThanhToan'
              ? 'statusChothanhtoan'
              : contract.status === 'DaThanhToan'
              ? 'statusDathanhtoan'
              : 'statusHuy',
          paymentStatus: contract.status,
          rawContractId: contract.contract_id,
        }));

        setContracts(transformedContracts);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải dữ liệu.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const applyFilters = () => {
    return contracts.filter((contract) => {
      const searchMatch =
        contract.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.winner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.manager.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch =
        !statusFilter || contract.status.toLowerCase().includes(statusFilter.toLowerCase());
      const sessionMatch =
        !sessionFilter || contract.sessionId.toLowerCase().includes(sessionFilter.toLowerCase());
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

  const openModal = (mode, contract = null) => {
    setModalMode(mode);
    setSelectedContract(contract);
    if (contract) {
      setFormData({
        contractSession: contract.sessionIdShort,
        contractWinner: contract.winnerId,
        finalPrice: contract.finalPriceValue.toString(),
        signedDate: contract.rawSignedDate ? contract.rawSignedDate.slice(0, 16) : '',
        contractManager: contract.managerId,
        contractStatus: contract.paymentStatus,
      });
    } else {
      setFormData({
        contractSession: '',
        contractWinner: '',
        finalPrice: '',
        signedDate: '',
        contractManager: '',
        contractStatus: 'ChoThanhToan',
      });
    }
    setShowModal(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedContract(null);
    document.body.classList.remove('modal-open');
  };

  const openViewModal = async (contract) => {
    try {
      const contractId = contract.rawContractId;
      const response = await axios.get(`${process.env.REACT_APP_API_URL}contracts/${contractId}`);
      const data = response.data;
      const transformedContract = {
        id: `#HD-${String(data.contract.contract_id).padStart(3, '0')}`,
        sessionId: `#PH-${String(data.contract.session_id).padStart(3, '0')}`,
        sessionIdShort: `PH${String(data.contract.session_id).padStart(3, '0')}`,
        winner: data.contract.winner
          ? `${data.contract.winner.full_name} (ID: ${data.contract.winner_id})`
          : 'N/A',
        winnerId: data.contract.winner_id ? String(data.contract.winner_id) : '',
        finalPrice: formatCurrency(data.contract.final_price),
        finalPriceValue: parseFloat(data.contract.final_price) || 0,
        signedDate: formatDate(data.contract.signed_date),
        rawSignedDate: data.contract.signed_date || '',
        manager: data.contract.session.created_by
          ? `${users[data.contract.session.created_by] || 'Unknown'} (ID: ${data.contract.session.created_by})`
          : 'Unknown',
        managerId: data.contract.session.created_by?.toString() || '1',
        status: statusMap[data.contract.status] || data.contract.status,
        statusClass:
          data.contract.status === 'ChoThanhToan'
            ? 'statusChothanhtoan'
            : data.contract.status === 'DaThanhToan'
            ? 'statusDathanhtoan'
            : 'statusHuy',
        paymentStatus: data.contract.status,
        rawContractId: data.contract.contract_id,
      };
      setSelectedContract(transformedContract);
      setShowViewModal(true);
      document.body.classList.add('modal-open');
    } catch (err) {
      alert('Lỗi khi tải chi tiết hợp đồng: ' + err.message);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedContract(null);
    document.body.classList.remove('modal-open');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (
        !formData.contractSession ||
        !formData.contractWinner ||
        !formData.finalPrice ||
        !formData.signedDate ||
        !formData.contractManager
      ) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
      }

      // Validate winner_id
      const winnerExists = userList.some(
        (user) => user.user_id.toString() === formData.contractWinner
      );
      if (!winnerExists) {
        alert('ID người thắng không hợp lệ.');
        return;
      }

      const payload = {
        session_id: formData.contractSession.replace('PH', ''),
        winner_id: formData.contractWinner,
        final_price: parseFloat(formData.finalPrice),
        signed_date: formData.signedDate,
        status: formData.contractStatus,
        created_by: formData.contractManager,
      };

      if (modalMode === 'edit' && selectedContract) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}contracts/${selectedContract.rawContractId}`,
          payload
        );
        alert('Cập nhật hợp đồng thành công!');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}contracts`, payload);
        alert('Thêm hợp đồng thành công!');
      }

      // Refresh contracts
      const response = await axios.get(`${process.env.REACT_APP_API_URL}contracts`);
      const transformedContracts = response.data.contracts.map((contract) => ({
        id: `#HD-${String(contract.contract_id).padStart(3, '0')}`,
        sessionId: `#PH-${String(contract.session_id).padStart(3, '0')}`,
        sessionIdShort: `PH${String(contract.session_id).padStart(3, '0')}`,
        winner: contract.winner
          ? `${contract.winner.full_name} (ID: ${contract.winner_id})`
          : 'N/A',
        winnerId: contract.winner_id ? String(contract.winner_id) : '',
        finalPrice: formatCurrency(contract.final_price),
        finalPriceValue: parseFloat(contract.final_price) || 0,
        signedDate: formatDate(contract.signed_date),
        rawSignedDate: contract.signed_date || '',
        manager: contract.session.created_by
          ? `${users[contract.session.created_by] || 'Unknown'} (ID: ${contract.session.created_by})`
          : 'Unknown',
        managerId: contract.session.created_by?.toString() || '1',
        status: statusMap[contract.status] || contract.status,
        statusClass:
          contract.status === 'ChoThanhToan'
            ? 'statusChothanhtoan'
            : contract.status === 'DaThanhToan'
            ? 'statusDathanhtoan'
            : 'statusHuy',
        paymentStatus: contract.status,
        rawContractId: contract.contract_id,
      }));
      setContracts(transformedContracts);
      closeModal();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDelete = async (contract) => {
    if (window.confirm('Bạn có chắc muốn xóa hợp đồng này?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}contracts/${contract.rawContractId}`);
        alert('Xóa hợp đồng thành công!');
        setContracts(contracts.filter((c) => c.id !== contract.id));
      } catch (err) {
        alert('Xóa thất bại: ' + err.message);
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

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

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
            {[...new Set(contracts.map((c) => c.sessionId))].map((sessionId) => (
              <option key={sessionId} value={sessionId}>
                {sessionId}
              </option>
            ))}
          </select>
        </div>
        <button className={styles.addBtn} onClick={() => openModal('add')}>
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
          {currentContracts.map((contract) => (
            <tr key={contract.id}>
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
                  onClick={() => openModal('edit', contract)}
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

      <div className={styles.pagination}>{renderPagination()}</div>

      {/* Add/Edit Modal */}
      <div className={`${styles.modal} ${showModal ? styles.show : ''}`}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>
              {modalMode === 'edit' ? 'Chỉnh sửa hợp đồng' : 'Thêm hợp đồng mới'}
            </h2>
            <span className={styles.modalClose} onClick={closeModal}>
              ×
            </span>
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
                {[...new Set(contracts.map((c) => c.sessionIdShort))].map((sessionId) => (
                  <option key={sessionId} value={sessionId}>{`#${sessionId}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="contractWinner">Người thắng (ID User)</label>
              <select
                id="contractWinner"
                name="contractWinner"
                value={formData.contractWinner}
                onChange={handleFormChange}
              >
                <option value="">Chọn người thắng</option>
                {userList.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {`${user.full_name} (ID: ${user.user_id})`}
                  </option>
                ))}
              </select>
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
              <select
                id="contractManager"
                name="contractManager"
                value={formData.contractManager}
                onChange={handleFormChange}
              >
                <option value="">Chọn người quản lý</option>
                {userList
                  .filter((user) => ['Administrator', 'ChuyenVienTTC'].includes(user.role))
                  .map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {`${user.full_name} (ID: ${user.user_id})`}
                    </option>
                  ))}
              </select>
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
                <option value="Huy">Hủy</option>
              </select>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>
              Lưu
            </button>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeModal}>
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <div className={`${styles.modal} ${showViewModal ? styles.show : ''}`}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Chi Tiết Hợp Đồng</h2>
            <span className={styles.modalClose} onClick={closeViewModal}>
              ×
            </span>
          </div>
          <div className={styles.modalBody}>
            {selectedContract && (
              <>
                <p>
                  <strong>Mã hợp đồng:</strong> {selectedContract.id}
                </p>
                <p>
                  <strong>Phiên ID:</strong> {selectedContract.sessionId}
                </p>
                <p>
                  <strong>Người thắng:</strong> {selectedContract.winner}
                </p>
                <p>
                  <strong>Giá cuối:</strong> {selectedContract.finalPrice}
                </p>
                <p>
                  <strong>Ngày ký:</strong> {selectedContract.signedDate}
                </p>
                <p>
                  <strong>Người quản lý:</strong> {selectedContract.manager}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {selectedContract.status}
                </p>
                <div className={styles.orderHistory}>
                  <h3>Lịch sử thanh toán</h3>
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
                      {/* Placeholder for dynamic payment history */}
                      <tr>
                        <td colSpan="5">Chưa có dữ liệu lịch sử thanh toán</td>
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