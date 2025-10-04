import React, { useState, useEffect } from 'react';
import styles from './Payment.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Payment() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    contract: '',
    method: 'ChuyenKhoan',
    amount: '',
    date: '',
    status: 'ChoXuLy'
  });

  const itemsPerPage = 5;

  const payments = [
    {
      id: '#PT-001',
      contractId: '#HD-001',
      contractIdValue: 'HD001',
      method: 'Chuyển khoản',
      methodValue: 'ChuyenKhoan',
      amount: '2.700.000.000đ',
      amountValue: 2700000000,
      date: '2025-10-03 19:00',
      status: 'Hoàn tất',
      statusClass: 'statusHoantat'
    },
    {
      id: '#PT-002',
      contractId: '#HD-002',
      contractIdValue: 'HD002',
      method: 'VÍ điện tử',
      methodValue: 'ViDienTu',
      amount: '1.300.000.000đ',
      amountValue: 1300000000,
      date: '2025-10-04 20:00',
      status: 'Chờ xử lý',
      statusClass: 'statusChoxuly'
    },
    {
      id: '#PT-003',
      contractId: '#HD-003',
      contractIdValue: 'HD003',
      method: 'Thẻ',
      methodValue: 'The',
      amount: '200.000.000đ',
      amountValue: 200000000,
      date: '2025-10-01 17:30',
      status: 'Thất bại',
      statusClass: 'statusThatbai'
    },
    {
      id: '#PT-004',
      contractId: '#HD-004',
      contractIdValue: 'HD004',
      method: 'Tiền mặt',
      methodValue: 'TienMat',
      amount: '600.000.000đ',
      amountValue: 600000000,
      date: '2025-10-05 14:00',
      status: 'Chờ xử lý',
      statusClass: 'statusChoxuly'
    },
    {
      id: '#PT-005',
      contractId: '#HD-005',
      contractIdValue: 'HD005',
      method: 'Chuyển khoản',
      methodValue: 'ChuyenKhoan',
      amount: '100.000.000đ',
      amountValue: 100000000,
      date: '2025-10-06 17:00',
      status: 'Hoàn tất',
      statusClass: 'statusHoantat'
    },
    {
      id: '#PT-006',
      contractId: '#HD-006',
      contractIdValue: 'HD006',
      method: 'VÍ điện tử',
      methodValue: 'ViDienTu',
      amount: '50.000.000đ',
      amountValue: 50000000,
      date: '2025-10-07 19:00',
      status: 'Thất bại',
      statusClass: 'statusThatbai'
    },
    {
      id: '#PT-007',
      contractId: '#HD-007',
      contractIdValue: 'HD007',
      method: 'Thẻ',
      methodValue: 'The',
      amount: '900.000.000đ',
      amountValue: 900000000,
      date: '2025-09-30 15:00',
      status: 'Hoàn tất',
      statusClass: 'statusHoantat'
    },
  ];

  const applyFilters = () => {
    return payments.filter(payment => {
      const searchMatch =
        payment.contractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.method.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = !statusFilter || payment.status.toLowerCase().includes(statusFilter.toLowerCase());
      const contractMatch = !contractFilter || payment.contractIdValue.toLowerCase().includes(contractFilter.toLowerCase());
      return searchMatch && statusMatch && contractMatch;
    });
  };

  const filteredPayments = applyFilters();
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, contractFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleContractFilterChange = (e) => {
    setContractFilter(e.target.value);
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

  const openPaymentModal = (mode, payment = null) => {
    setModalMode(mode);
    if (payment) {
      setPaymentForm({
        contract: payment.contractIdValue,
        method: payment.methodValue,
        amount: payment.amountValue.toString(),
        date: payment.date.slice(0, 16).replace(' ', 'T'),
        status: payment.status === 'Chờ xử lý' ? 'ChoXuLy' : payment.status === 'Hoàn tất' ? 'HoanTat' : 'ThatBai'
      });
    } else {
      setPaymentForm({
        contract: '',
        method: 'ChuyenKhoan',
        amount: '',
        date: '',
        status: 'ChoXuLy'
      });
    }
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const openViewModal = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSavePayment = () => {
    alert('Chức năng lưu chỉ là demo, không lưu thực tế.');
    closePaymentModal();
  };

  const handleDeletePayment = (payment) => {
    if (window.confirm('Bạn có chắc muốn xóa thanh toán này?')) {
      alert('Chức năng xóa chỉ là demo, không xóa thực tế.');
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Chờ xử lý': 'statusChoxuly',
      'Hoàn tất': 'statusHoantat',
      'Thất bại': 'statusThatbai'
    };
    return statusMap[status] || 'statusChoxuly';
  };

  const demoProcessingHistory = [
    { action: 'Xử lý', processor: 'Admin QT', time: '2025-10-03 19:30', note: 'Xác nhận chuyển khoản' },
    { action: 'Hoàn tất', processor: 'Manager A', time: '2025-10-03 20:00', note: 'Cập nhật hợp đồng' }
  ];

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm thanh toán..."
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

      <h1 className={styles.pageTitle}>Quản Lý Thanh Toán</h1>
      <p className={styles.pageSubtitle}>Quản lý và theo dõi các giao dịch thanh toán hợp đồng</p>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select className={styles.filterSelect} value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Hoàn tất">Hoàn tất</option>
            <option value="Thất bại">Thất bại</option>
          </select>
          <select className={styles.filterSelect} value={contractFilter} onChange={handleContractFilterChange}>
            <option value="">Tất cả hợp đồng</option>
            <option value="HD001">#HD-001</option>
            <option value="HD002">#HD-002</option>
            <option value="HD003">#HD-003</option>
            <option value="HD004">#HD-004</option>
            <option value="HD005">#HD-005</option>
            <option value="HD006">#HD-006</option>
            <option value="HD007">#HD-007</option>
          </select>
        </div>
        <button className={styles.addBtn} onClick={() => openPaymentModal('add')}>
          <i className="fas fa-plus"></i>
          Thêm thanh toán mới
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Mã PT</th>
            <th>Hợp đồng ID</th>
            <th>Phương thức</th>
            <th>Số tiền</th>
            <th>Ngày thanh toán</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentPayments.map(payment => (
            <tr key={payment.id}>
              <td data-label="Mã PT">{payment.id}</td>
              <td data-label="Hợp đồng ID">{payment.contractId}</td>
              <td data-label="Phương thức">{payment.method}</td>
              <td data-label="Số tiền">{payment.amount}</td>
              <td data-label="Ngày thanh toán">{payment.date}</td>
              <td data-label="Trạng thái">
                <span className={`${styles.statusBadge} ${styles[getStatusClass(payment.status)]}`}>{payment.status}</span>
              </td>
              <td data-label="Hành động">
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openPaymentModal('edit', payment)}>
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeletePayment(payment)}>
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
                <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => openViewModal(payment)}>
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

      {/* Add/Edit Payment Modal */}
      {showPaymentModal && (
        <div className={styles.modal} onClick={closePaymentModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa thanh toán' : 'Thêm thanh toán mới'}
              </h2>
              <span className={styles.modalClose} onClick={closePaymentModal}>×</span>
            </div>
            <div className={styles.modalBody}>
              <div>
                <label htmlFor="contract">Hợp đồng (ID)</label>
                <select
                  id="contract"
                  name="contract"
                  value={paymentForm.contract}
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
              <div>
                <label htmlFor="method">Phương thức</label>
                <select
                  id="method"
                  name="method"
                  value={paymentForm.method}
                  onChange={handleFormChange}
                >
                  <option value="ChuyenKhoan">Chuyển khoản</option>
                  <option value="ViDienTu">VÍ điện tử</option>
                  <option value="The">Thẻ</option>
                  <option value="TienMat">Tiền mặt</option>
                </select>
              </div>
              <div>
                <label htmlFor="amount">Số tiền (VND)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  placeholder="Nhập số tiền"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="date">Ngày thanh toán</label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={paymentForm.date}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="status">Trạng thái</label>
                <select
                  id="status"
                  name="status"
                  value={paymentForm.status}
                  onChange={handleFormChange}
                >
                  <option value="ChoXuLy">Chờ xử lý</option>
                  <option value="HoanTat">Hoàn tất</option>
                  <option value="ThatBai">Thất bại</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSavePayment}>Lưu</button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closePaymentModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* View Payment Modal */}
      {showViewModal && selectedPayment && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Thanh Toán</h2>
              <span className={styles.modalClose} onClick={closeViewModal}>×</span>
            </div>
            <div className={styles.modalBody}>
              <p><strong>Mã thanh toán:</strong> {selectedPayment.id}</p>
              <p><strong>Hợp đồng ID:</strong> {selectedPayment.contractId}</p>
              <p><strong>Phương thức:</strong> {selectedPayment.method}</p>
              <p><strong>Số tiền:</strong> {selectedPayment.amount}</p>
              <p><strong>Ngày thanh toán:</strong> {selectedPayment.date}</p>
              <p><strong>Trạng thái:</strong> {selectedPayment.status}</p>
              <div className={styles.orderHistory}>
                <h3>Lịch sử xử lý thanh toán (demo)</h3>
                <table className={styles.orderTable}>
                  <thead>
                    <tr>
                      <th>Hành động</th>
                      <th>Người xử lý</th>
                      <th>Thời gian</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoProcessingHistory.map((processing, index) => (
                      <tr key={index}>
                        <td>{processing.action}</td>
                        <td>{processing.processor}</td>
                        <td>{processing.time}</td>
                        <td>{processing.note}</td>
                      </tr>
                    ))}
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

export default Payment;
