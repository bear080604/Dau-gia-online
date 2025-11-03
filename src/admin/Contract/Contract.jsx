import React, { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './Contract.module.css';
import axios from 'axios';
import NotificationBell from "../NotificationBell";

function Contract() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    contractStatus: 'ChoThanhToan',
    contractFile: null,
  });
    const [open, setOpen] = useState(false);
  const togglePopup = (e) => {
    e.stopPropagation(); // tránh đóng liền sau khi mở
    setOpen((prev) => !prev);
  };
  const itemsPerPage = 5;

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

  // Fetch chỉ contracts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const contractRes = await axios.get(`${process.env.REACT_APP_API_URL}contracts`);

        // Transform hợp đồng
        const transformedContracts = contractRes.data.contracts.map((contract) => ({
          id: `#HD-${String(contract.contract_id).padStart(3, '0')}`,
          sessionName: contract.session?.item?.name || 'N/A',
          winner: contract.winner?.full_name || 'N/A',
          finalPrice: formatCurrency(contract.final_price),
          finalPriceValue: parseFloat(contract.final_price) || 0,
          signedDate: formatDate(contract.signed_date),
          rawSignedDate: contract.signed_date || '',
          paymentStatus: contract.status,
          statusClass:
            contract.status === 'ChoThanhToan'
              ? 'statusChothanhtoan'
              : contract.status === 'DaThanhToan'
              ? 'statusDathanhtoan'
              : 'statusHuy',
          rawContractId: contract.contract_id,
          fileUrl: contract.file_path ? `http://localhost:8000${contract.file_path}` : '',
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
        contract.sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.winner.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch =
        !statusFilter ||
        (contract.paymentStatus === 'ChoThanhToan' && statusFilter === 'Chờ thanh toán') ||
        (contract.paymentStatus === 'DaThanhToan' && statusFilter === 'Thành công') ||
        (contract.paymentStatus === 'Huy' && statusFilter === 'Hủy');
      const sessionMatch = !sessionFilter || contract.sessionName.toLowerCase().includes(sessionFilter.toLowerCase());
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

  const openModal = (contract) => {
    setSelectedContract(contract);
    setFormData({
      contractStatus: contract.paymentStatus,
      contractFile: null,
    });
    setShowModal(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedContract(null);
    setFormData({ contractStatus: 'ChoThanhToan', contractFile: null });
    document.body.classList.remove('modal-open');
  };

  const openViewModal = async (contract) => {
    try {
      const contractId = contract.rawContractId;
      const response = await axios.get(`${process.env.REACT_APP_API_URL}contracts/${contractId}`);
      const data = response.data.contract;
      const transformedContract = {
        id: `#HD-${String(data.contract_id).padStart(3, '0')}`,
        sessionName: data.session?.item?.name || 'N/A',
        winner: data.winner?.full_name || 'N/A',
        finalPrice: formatCurrency(data.final_price),
        finalPriceValue: parseFloat(data.final_price) || 0,
        signedDate: formatDate(data.signed_date),
        rawSignedDate: data.signed_date || '',
        paymentStatus: data.status,
        statusClass:
          data.status === 'ChoThanhToan'
            ? 'statusChothanhtoan'
            : data.status === 'DaThanhToan'
            ? 'statusDathanhtoan'
            : 'statusHuy',
        rawContractId: data.contract_id,
        fileUrl: data.file_path ? `http://localhost:8000${data.file_path}` : '',
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
    if (name === 'contractStatus') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, contractFile: e.target.files[0] }));
  };

  const handleSave = async () => {
    if (!selectedContract) return;

    try {
      const formPayload = new FormData();
      if (formData.contractFile) {
        formPayload.append('file', formData.contractFile);
      }
      formPayload.append('status', formData.contractStatus);

      await axios.post(
        `${process.env.REACT_APP_API_URL}contracts/${selectedContract.rawContractId}`,
        formPayload,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      alert('Cập nhật hợp đồng thành công!');
      // Refetch và transform
      const res = await axios.get(`${process.env.REACT_APP_API_URL}contracts`);
      const transformedContracts = res.data.contracts.map((contract) => ({
        id: `#HD-${String(contract.contract_id).padStart(3, '0')}`,
        sessionName: contract.session?.item?.name || 'N/A',
        winner: contract.winner?.full_name || 'N/A',
        finalPrice: formatCurrency(contract.final_price),
        finalPriceValue: parseFloat(contract.final_price) || 0,
        signedDate: formatDate(contract.signed_date),
        rawSignedDate: contract.signed_date || '',
        paymentStatus: contract.status,
        statusClass:
          contract.status === 'ChoThanhToan'
            ? 'statusChothanhtoan'
            : contract.status === 'DaThanhToan'
            ? 'statusDathanhtoan'
            : 'statusHuy',
        rawContractId: contract.contract_id,
        fileUrl: contract.file_path ? `http://localhost:8000${contract.file_path}` : '',
      }));
      setContracts(transformedContracts);
      closeModal();
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  // const handleDelete = async (contract) => {
  //   if (window.confirm('Bạn có chắc muốn xóa hợp đồng này?')) {
  //     try {
  //       await axios.delete(`${process.env.REACT_APP_API_URL}contracts/${contract.rawContractId}`);
  //       alert('Xóa hợp đồng thành công!');
  //       setContracts(contracts.filter((c) => c.id !== contract.id));
  //     } catch (err) {
  //       alert('Xóa thất bại: ' + err.message);
  //     }
  //   }
  // };

  const handleDelete = async (contract) => {
  if (!window.confirm('Bạn có chắc muốn xóa hợp đồng này?')) return;

  try {
    // 1. Xóa các econtracts liên quan
    await axios.delete(`${process.env.REACT_APP_API_URL}econtracts/${contract.rawContractId}`);

    // 2. Xóa hợp đồng chính
    await axios.delete(`${process.env.REACT_APP_API_URL}contracts/${contract.rawContractId}`);

    alert('Xóa hợp đồng thành công!');
    setContracts(contracts.filter((c) => c.id !== contract.id));
  } catch (err) {
    alert('Xóa thất bại: ' + err.message);
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
             <div>
                       <div onClick={togglePopup} style={{ cursor: "pointer" }}>
                         <i className="fa-solid fa-bell fa-lg"></i>
                       </div>
         
                       <NotificationBell open={open} onClose={() => setOpen(false)} />
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
            <option value="Thành công">Thành công</option>
            <option value="Hủy">Hủy</option>
          </select>
          <select
            className={styles.filterSelect}
            value={sessionFilter}
            onChange={handleSessionFilterChange}
          >
            <option value="">Tất cả phiên</option>
            {[...new Set(contracts.map((c) => c.sessionName))].map((sessionName) => (
              <option key={sessionName} value={sessionName}>
                {sessionName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Mã HD</th>
            <th>Tên phiên</th>
            <th>Người thắng</th>
            <th>Giá cuối</th>
            <th>Ngày ký</th>
            <th>Trạng thái</th>
            <th>File Hợp Đồng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentContracts.map((contract) => (
            <tr key={contract.id}>
              <td data-label="Mã HD">{contract.id}</td>
              <td data-label="Tên phiên">{contract.sessionName}</td>
              <td data-label="Người thắng">{contract.winner}</td>
              <td data-label="Giá cuối">{contract.finalPrice}</td>
              <td data-label="Ngày ký">{contract.signedDate}</td>
              <td data-label="Trạng thái">
                <span className={`${styles.statusBadge} ${styles[contract.statusClass]}`}>
                  {contract.paymentStatus === 'ChoThanhToan'
                    ? 'Chờ thanh toán'
                    : contract.paymentStatus === 'DaThanhToan'
                    ? 'Thành công'  // Updated: Hiển thị "Thành công"
                    : 'Hủy'}
                </span>
              </td>
              <td data-label="File Hợp Đồng">
                {contract.fileUrl ? (
                  <a href={contract.fileUrl} target="_blank" rel="noopener noreferrer" title="Tải file hợp đồng">
                    📄 Download
                  </a>
                ) : (
                  'N/A'
                )}
              </td>
              <td data-label="Hành động">
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => openModal(contract)}
                  title="Chỉnh sửa hợp đồng"
                  disabled={contract.paymentStatus === 'DaThanhToan'}
                >
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleDelete(contract)}
                  title="Xóa hợp đồng"
                  disabled={contract.paymentStatus === 'DaThanhToan'}  // Updated: Disable xóa nếu Thành công
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

      {/* Updated: Modal chỉnh sửa - chỉ show "Thành công" nếu DaThanhToan, ẩn input/select */}
      <div className={`${styles.modal} ${showModal ? styles.show : ''}`}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Chỉnh sửa hợp đồng</h2>
            <span className={styles.modalClose} onClick={closeModal}>×</span>
          </div>
          <div className={styles.modalBody}>
            {selectedContract && (
              <>
                {selectedContract.paymentStatus === 'DaThanhToan' ? (
                  <p className={styles.successMessage}>Thành công</p>  // Updated: Chỉ hiển thị thông báo
                ) : (
                  <>
                    <div>
                      <label>File hợp đồng</label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.png"
                      />
                      {selectedContract.fileUrl && (
                        <small>
                          File hiện tại: <a href={selectedContract.fileUrl} target="_blank">Xem</a>
                        </small>
                      )}
                    </div>
                    <div>
                      <label>Trạng thái</label>
                      <select
                        name="contractStatus"
                        value={formData.contractStatus}
                        onChange={handleFormChange}
                      >
                        <option value="ChoThanhToan">Chờ thanh toán</option>
                        <option value="DaThanhToan">Thành công</option>  // Updated: Label "Thành công"
                        <option value="Huy">Hủy</option>
                      </select>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <div className={styles.modalFooter}>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleSave}
              disabled={selectedContract?.paymentStatus === 'DaThanhToan'}  // Updated: Disable nút Lưu nếu Thành công
            >
              Lưu
            </button>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeModal}>
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Updated: View Modal - hiển thị "Thành công" cho DaThanhToan */}
      <div className={`${styles.modal} ${showViewModal ? styles.show : ''}`}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Chi Tiết Hợp Đồng</h2>
            <span className={styles.modalClose} onClick={closeViewModal}>×</span>
          </div>
          <div className={styles.modalBody}>
            {selectedContract && (
              <>
                <p><strong>Mã hợp đồng:</strong> {selectedContract.id}</p>
                <p><strong>Tên phiên:</strong> {selectedContract.sessionName}</p>
                <p><strong>Người thắng:</strong> {selectedContract.winner}</p>
                <p><strong>Giá cuối:</strong> {selectedContract.finalPrice}</p>
                <p><strong>Ngày ký:</strong> {selectedContract.signedDate}</p>
                <p><strong>Trạng thái:</strong> {selectedContract.paymentStatus === 'ChoThanhToan' ? 'Chờ thanh toán' : selectedContract.paymentStatus === 'DaThanhToan' ? 'Thành công' : 'Hủy'}</p>  {/* Updated: "Thành công" */}
                {selectedContract.fileUrl && (
                  <p><strong>File hợp đồng:</strong> <a href={selectedContract.fileUrl} target="_blank">Tải xuống</a></p>
                )}
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