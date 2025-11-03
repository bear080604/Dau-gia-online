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
  const [modalMode, setModalMode] = useState('add');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    contract: '',
    method: 'VNPAY',
    amount: '',
    date: '',
    status: 'ChoXuLy'
  });

  const itemsPerPage = 5;
  const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/';

  // Get auth token from localStorage or your auth context
  const getAuthToken = () => {
    // Try different possible token storage keys
    return localStorage.getItem('token') || 
           localStorage.getItem('auth_token') || 
           localStorage.getItem('access_token') ||
           sessionStorage.getItem('token') ||
           sessionStorage.getItem('auth_token');
  };

  // Fetch payments from API
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log('Fetching from URL:', `${API_URL}payments`); // Debug log
      
      const token = getAuthToken();
      console.log('Token found:', token ? 'Yes' : 'No'); // Debug log
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}payments`, {
        method: 'GET',
        headers: headers,
      });
      
      console.log('Response status:', response.status); // Debug log
      
      if (response.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      if (!response.ok) {
        // Try to get error details from response
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Không thể tải dữ liệu thanh toán (Status: ${response.status})`);
      }
      
      const data = await response.json();
      console.log('Raw API data:', data); // Debug log
      
      // Transform API data to match component format
      const transformedPayments = data.map(payment => {
        // Parse amount to number if it's a string
        const amountValue = typeof payment.amount === 'string' 
          ? parseFloat(payment.amount) 
          : payment.amount;
        
        return {
          id: `#PT-${String(payment.payment_id).padStart(3, '0')}`,
          paymentId: payment.payment_id,
          contractId: `#HD-${String(payment.contract_id).padStart(3, '0')}`,
          contractIdValue: `HD${String(payment.contract_id).padStart(3, '0')}`,
          method: getMethodLabel(payment.method),
          methodValue: payment.method,
          amount: formatCurrency(amountValue),
          amountValue: amountValue,
          date: formatDateTime(payment.payment_date),
          status: getStatusLabel(payment.status),
          statusClass: getStatusClass(payment.status),
          senderId: payment.sender_id,
          receiverId: payment.receiver_id,
          profileId: payment.profile_id,
          // Additional data from nested objects
          contractData: payment.contract || null,
          sessionData: payment.contract?.session || null
        };
      });
      
      console.log('Transformed payments:', transformedPayments); // Debug log
      setPayments(transformedPayments);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getMethodLabel = (method) => {
    const methodMap = {
      'VNPAY': 'VNPAY',
      'ChuyenKhoan': 'Chuyển khoản',
      'ViDienTu': 'VÍ điện tử',
      'The': 'Thẻ',
      'TienMat': 'Tiền mặt',
      'MoMo': 'MoMo',
      'ZaloPay': 'ZaloPay'
    };
    return methodMap[method] || method;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'ChoXuLy': 'Chờ xử lý',
      'HoanTat': 'Hoàn tất',
      'ThatBai': 'Thất bại',
      'DaThanhToan': 'Hoàn tất'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'ChoXuLy': 'statusChoxuly',
      'HoanTat': 'statusHoantat',
      'ThatBai': 'statusThatbai',
      'DaThanhToan': 'statusHoantat',
      'Chờ xử lý': 'statusChoxuly',
      'Hoàn tất': 'statusHoantat',
      'Thất bại': 'statusThatbai'
    };
    return statusMap[status] || 'statusChoxuly';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

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
      setSelectedPayment(payment);
    } else {
      setPaymentForm({
        contract: '',
        method: 'VNPAY',
        amount: '',
        date: '',
        status: 'ChoXuLy'
      });
      setSelectedPayment(null);
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

  const handleSavePayment = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        alert('Vui lòng đăng nhập để thực hiện thao tác này');
        return;
      }
      
      const paymentData = {
        contract_id: parseInt(paymentForm.contract.replace('HD', '')),
        method: paymentForm.method,
        amount: parseFloat(paymentForm.amount),
        payment_date: paymentForm.date.replace('T', ' ') + ':00',
        status: paymentForm.status
      };

      const url = modalMode === 'edit' 
        ? `${API_URL}payments/${selectedPayment.paymentId}`
        : `${API_URL}payments`;
      
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      if (response.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      if (!response.ok) {
        throw new Error('Không thể lưu thanh toán');
      }

      alert(modalMode === 'edit' ? 'Cập nhật thanh toán thành công!' : 'Thêm thanh toán mới thành công!');
      closePaymentModal();
      fetchPayments(); // Reload data
    } catch (err) {
      alert('Lỗi: ' + err.message);
      console.error('Error saving payment:', err);
    }
  };

  const handleDeletePayment = async (payment) => {
    if (window.confirm('Bạn có chắc muốn xóa thanh toán này?')) {
      try {
        const token = getAuthToken();
        
        if (!token) {
          alert('Vui lòng đăng nhập để thực hiện thao tác này');
          return;
        }
        
        const response = await fetch(`${API_URL}payments/${payment.paymentId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          return;
        }

        if (!response.ok) {
          throw new Error('Không thể xóa thanh toán');
        }

        alert('Xóa thanh toán thành công!');
        fetchPayments(); // Reload data
      } catch (err) {
        alert('Lỗi: ' + err.message);
        console.error('Error deleting payment:', err);
      }
    }
  };

  const demoProcessingHistory = [
    { action: 'Xử lý', processor: 'Admin QT', time: '2025-10-03 19:30', note: 'Xác nhận chuyển khoản' },
    { action: 'Hoàn tất', processor: 'Manager A', time: '2025-10-03 20:00', note: 'Cập nhật hợp đồng' }
  ];

  // Get unique contract IDs for filter dropdown
  const uniqueContracts = [...new Set(payments.map(p => p.contractIdValue))];

  if (loading) {
    return (
      <div className={styles.mainContent}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#4A90E2' }}></i>
          <p style={{ marginTop: '20px', fontSize: '18px' }}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.mainContent}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#E74C3C' }}></i>
          <p style={{ marginTop: '20px', fontSize: '18px', color: '#E74C3C' }}>Lỗi: {error}</p>
          <button 
            onClick={fetchPayments}
            style={{ 
              marginTop: '20px', 
              padding: '10px 20px', 
              fontSize: '16px',
              backgroundColor: '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

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
            {uniqueContracts.map(contract => (
              <option key={contract} value={contract}>#{contract.replace('HD', 'HD-')}</option>
            ))}
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
          {currentPayments.length > 0 ? (
            currentPayments.map(payment => (
              <tr key={payment.id}>
                <td data-label="Mã PT">{payment.id}</td>
                <td data-label="Hợp đồng ID">{payment.contractId}</td>
                <td data-label="Phương thức">{payment.method}</td>
                <td data-label="Số tiền">{payment.amount}</td>
                <td data-label="Ngày thanh toán">{payment.date}</td>
                <td data-label="Trạng thái">
                  <span className={`${styles.statusBadge} ${styles[payment.statusClass]}`}>{payment.status}</span>
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
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                Không tìm thấy thanh toán nào
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 0 && (
        <div className={styles.pagination}>
          {renderPagination()}
        </div>
      )}

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
                  {uniqueContracts.map(contract => (
                    <option key={contract} value={contract}>#{contract.replace('HD', 'HD-')}</option>
                  ))}
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
                  <option value="VNPAY">VNPAY</option>
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
              <p><strong>Người gửi ID:</strong> {selectedPayment.senderId}</p>
              <p><strong>Người nhận ID:</strong> {selectedPayment.receiverId}</p>
              {selectedPayment.profileId && (
                <p><strong>Profile ID:</strong> {selectedPayment.profileId}</p>
              )}
              {selectedPayment.contractData && (
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                  <h4>Thông tin hợp đồng</h4>
                  <p><strong>Giá cuối cùng:</strong> {formatCurrency(parseFloat(selectedPayment.contractData.final_price))}</p>
                  <p><strong>Ngày ký:</strong> {selectedPayment.contractData.signed_date}</p>
                  <p><strong>Trạng thái HĐ:</strong> {getStatusLabel(selectedPayment.contractData.status)}</p>
                  {selectedPayment.sessionData && (
                    <>
                      <p><strong>Session ID:</strong> #{selectedPayment.sessionData.session_id}</p>
                      <p><strong>Item ID:</strong> #{selectedPayment.sessionData.item_id}</p>
                      <p><strong>Phương thức đấu giá:</strong> {selectedPayment.sessionData.method}</p>
                    </>
                  )}
                </div>
              )}
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