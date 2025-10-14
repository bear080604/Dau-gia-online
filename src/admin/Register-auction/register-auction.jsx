import styles from './register-auction.module.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faUndo } from '@fortawesome/free-solid-svg-icons';

const AdminPanel = () => {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusMap = {
    DaDuyet: 'Đã Duyệt',
    BiTuChoi: 'Bị Từ Chối',
    'Chờ Duyệt': 'Chờ Duyệt',
    'Đã Thanh Toán': 'Đã Thanh Toán',
  };
  const reverseStatusMap = {
    'Đã Duyệt': 'DaDuyet',
    'Bị Từ Chối': 'BiTuChoi',
    'Chờ Duyệt': 'Chờ Duyệt',
    'Đã Thanh Toán': 'Đã Thanh Toán',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          return;
        }

        const profilesUrl = `${process.env.REACT_APP_API_URL}auction-profiles`;
        console.log('Request URL (Profiles):', profilesUrl);
        const profilesResponse = await axios.get(profilesUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response (Profiles):', profilesResponse.data);
        const profilesData = profilesResponse.data.profiles || [];
        setRegistrations(profilesData);

        const usersUrl = `${process.env.REACT_APP_API_URL}showuser`;
        console.log('Request URL (Users):', usersUrl);
        const usersResponse = await axios.get(usersUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response (Users):', usersResponse.data);
        const usersData = usersResponse.data.users.reduce((acc, user) => {
          acc[user.user_id] = user;
          return acc;
        }, {});
        setUsers(usersData);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateStatus = async (id, newStatus, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const apiStatus = reverseStatusMap[newStatus] || newStatus;
      const url = `${process.env.REACT_APP_API_URL}auction-profiles/${id}/status`;
      const payload = { status: apiStatus };
      if (reason) payload.reject_reason = reason;
      const response = await axios.put(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegistrations(prev => prev.map(reg =>
        reg.profile_id === id ? { ...reg, status: apiStatus, reject_reason: reason || null } : reg
      ));
      alert(response.data.message || `Đã cập nhật trạng thái thành ${newStatus}${reason ? ` với lý do: ${reason}` : ''}`);
    } catch (err) {
      console.error('Update Error:', err);
      alert(err.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const openRejectModal = (id) => {
    setCurrentId(id);
    setIsRejectModalOpen(true);
    setRejectReason('');
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectReason('');
  };

  const submitReject = () => {
    if (rejectReason.trim() === '') {
      alert('Vui lòng nhập lý do!');
      return;
    }
    updateStatus(currentId, 'Bị Từ Chối', rejectReason);
    closeRejectModal();
  };

  const openDetailModal = (id) => {
    const reg = registrations.find((r) => r.profile_id === id);
    if (reg) {
      const user = users[reg.user_id] || {};
      setCurrentId(id);
      setPaymentDetails({
        id: reg.profile_id,
        auction: reg.session_id ? `Phiên ${reg.session_id}` : 'Không xác định',
        documentUrl: reg.document_url || '#',
        user: user.full_name || `user${reg.user_id}@example.com`,
        deposit: `${reg.deposit_amount} VND`,
        status: statusMap[reg.status] || 'Chờ Duyệt',
        rejectReason: reg.reject_reason || 'Không có lý do',
        paymentMethod: 'Chuyển Khoản Ngân Hàng',
        paymentDate: '2025-10-10',
        paymentStatus: 'Chưa Hoàn Tiền',
        paymentId: 1,
      });
      setIsDetailModalOpen(true);
    } else {
      console.error('Không tìm thấy đăng ký với ID:', id);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setPaymentDetails(null);
  };

  const refundPayment = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      // Placeholder for refund API call (replace with actual endpoint)
      const url = `${process.env.REACT_APP_API_URL}/auction-profiles/${currentId}/refund`;
      await axios.post(url, { payment_id: paymentId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentDetails((prev) =>
        prev ? { ...prev, paymentStatus: 'Đã Hoàn Tiền' } : prev
      );
      alert(`Đã hoàn tiền cho thanh toán ID: ${paymentId} thuộc hồ sơ ${currentId}`);
    } catch (err) {
      console.error('Refund Error:', err);
      alert(err.response?.data?.message || 'Hoàn tiền thất bại');
    }
  };

  const handleBackdropClick = (e, modalType) => {
    if (e.target.id === 'rejectModal' || e.target.id === 'detailModal') {
      if (modalType === 'reject') {
        closeRejectModal();
      } else if (modalType === 'detail') {
        closeDetailModal();
      }
    }
  };

  const handleStatusChange = (id, newStatus) => {
    if (newStatus === 'Bị Từ Chối') {
      openRejectModal(id);
    } else {
      updateStatus(id, newStatus);
    }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.container}>
      <h1>Quản Lý Hồ Sơ Đăng Ký Đấu Giá</h1>

      <div className={styles.head}>
        <div className={styles.filter}>
          <select>
            <option value="">Trạng thái</option>
            <option value="">Chờ duyệt</option>
            <option value="">Đã duyệt</option>
            <option value="">Từ chối</option>
          </select>
        </div>
        <div className={styles.sort}>
          <select>
            <option value="">Sắp xếp theo:</option>
            <option value="">Mới nhất</option>
            <option value="">Cũ nhất</option>
          </select>
        </div>
      </div>

      <table id="registrationTable" className={styles.table}>
        <thead>
          <tr>
            <th>Phiên Đấu Giá</th>
            <th>Tài Liệu Liên Quan</th>
            <th>User</th>
            <th>Tiền Đặt Trước</th>
            <th>Trạng Thái</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(registrations) ? (
            registrations.map((reg) => (
              <tr key={reg.profile_id} data-id={reg.profile_id}>
                <td>{reg.session_id ? `Phiên ${reg.session_id}` : 'Không xác định'}</td>
                <td>
                  {reg.document_url ? (
                    <a href={reg.document_url} target="_blank" rel="noopener noreferrer">
                      {reg.document_url}
                    </a>
                  ) : (
                    'Không có tài liệu'
                  )}
                </td>
                <td>{users[reg.user_id]?.full_name || `user${reg.user_id}@example.com`}</td>
                <td>{`${reg.deposit_amount} VND`}</td>
                <td>
                  <select
                    value={statusMap[reg.status] || 'Chờ Duyệt'}
                    onChange={(e) => handleStatusChange(reg.profile_id, e.target.value)}
                    className={styles.statusSelect}
                  >
                    <option value="Chờ Duyệt">Chờ Duyệt</option>
                    <option value="Đã Duyệt">Đã Duyệt</option>
                    <option value="Bị Từ Chối">Bị Từ Chối</option>
                    <option value="Đã Thanh Toán">Đã Thanh Toán</option>
                  </select>
                </td>
                <td className={styles.actions}>
                  <button
                    className={styles.detail}
                    onClick={() => openDetailModal(reg.profile_id)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6">Dữ liệu không hợp lệ</td></tr>
          )}
        </tbody>
      </table>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div
          id="rejectModal"
          className={styles.modal}
          onClick={(e) => handleBackdropClick(e, 'reject')}
        >
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={closeRejectModal}>&times;</span>
            <p>Nhập lý do từ chối:</p>
            <textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            />
            <div className={styles.modalActions}>
              <button className={styles.cancel} onClick={closeRejectModal}>
                Hủy
              </button>
              <button className={styles.confirm} onClick={submitReject}>
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && paymentDetails && (
        <div
          id="detailModal"
          className={styles.modal}
          onClick={(e) => handleBackdropClick(e, 'detail')}
        >
          <div className={styles.modalContent}>
            <h2>Chi Tiết Thanh Toán</h2>
            <div className={styles.detailContent}>
              <div><label>Phiên Đấu Giá:</label> <span>{paymentDetails.auction}</span></div>
              <div>
                <label>Tài Liệu Liên Quan:</label>
                {paymentDetails.documentUrl ? (
                  <a href={paymentDetails.documentUrl} target="_blank" rel="noopener noreferrer">
                    {paymentDetails.documentUrl}
                  </a>
                ) : (
                  'Không có tài liệu'
                )}
              </div>
              <div><label>User:</label> <span>{paymentDetails.user}</span></div>
              <div><label>Tiền Đặt Trước:</label> <span>{paymentDetails.deposit}</span></div>
              <div><label>Trạng Thái Hồ Sơ:</label> <span>{paymentDetails.status}</span></div>
              <div><label>Lý Do Từ Chối:</label> <span>{paymentDetails.rejectReason}</span></div>
              <div><label>Phương Thức Thanh Toán:</label> <span>{paymentDetails.paymentMethod}</span></div>
              <div><label>Ngày Thanh Toán:</label> <span>{paymentDetails.paymentDate}</span></div>
              <div><label>Trạng Thái Hoàn Tiền:</label> <span>{paymentDetails.paymentStatus}</span></div>
              <div className={styles.modalActions}>
                <button
                  className={styles.refund}
                  onClick={() => refundPayment(paymentDetails.paymentId)}
                  disabled={paymentDetails.paymentStatus === 'Đã Hoàn Tiền'}
                >
                  <FontAwesomeIcon icon={faUndo} /> Hoàn Tiền
                </button>
                <span className={styles.close} onClick={closeDetailModal}>&times;</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;