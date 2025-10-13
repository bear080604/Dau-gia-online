import styles from './register-auction.module.css';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEye, faUndo } from '@fortawesome/free-solid-svg-icons';

const AdminPanel = () => {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [registrations, setRegistrations] = useState([
    {
      id: 2,
      auction: 'Phiên 002',
      documentUrl: 'document2.pdf',
      user: 'user2@example.com',
      deposit: '10,000,000 VND',
      status: 'Chờ Duyệt',
    },
  ]);

  const approveRegistration = (id) => {
    alert(`Đã duyệt hồ sơ ID: ${id}`);
    // Cập nhật trạng thái trong state thay vì DOM
    setRegistrations(prev => prev.map(reg => 
      reg.id === id ? { ...reg, status: 'Đã Duyệt' } : reg
    ));
    
    if (paymentDetails && paymentDetails.id === id) {
      setPaymentDetails(prev => prev ? { ...prev, status: 'Đã Duyệt' } : null);
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
    alert(`Đã từ chối hồ sơ ID: ${currentId} với lý do: ${rejectReason}`);
    
    // Cập nhật trạng thái trong state
    setRegistrations(prev => prev.map(reg => 
      reg.id === currentId ? { ...reg, status: 'Từ Chối' } : reg
    ));
    
    if (paymentDetails && paymentDetails.id === currentId) {
      setPaymentDetails(prev => prev ? { ...prev, status: 'Từ Chối' } : null);
    }
    
    closeRejectModal();
  };

  const openDetailModal = (id) => {
    const reg = registrations.find((r) => r.id === id);
    if (reg) {
      setCurrentId(id);
      setPaymentDetails({
        id: reg.id,
        auction: reg.auction,
        documentUrl: reg.documentUrl || '#',
        user: reg.user,
        deposit: reg.deposit,
        status: reg.status,
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

  const refundPayment = (paymentId) => {
    alert(`Đã hoàn tiền cho thanh toán ID: ${paymentId} thuộc hồ sơ ${currentId}`);
    setPaymentDetails((prev) =>
      prev ? { ...prev, paymentStatus: 'Đã Hoàn Tiền' } : prev
    );
  };

  // Hàm đóng modal khi click bên ngoài
  const handleBackdropClick = (e, modalType) => {
    if (e.target.id === 'rejectModal' || e.target.id === 'detailModal') {
      if (modalType === 'reject') {
        closeRejectModal();
      } else if (modalType === 'detail') {
        closeDetailModal();
      }
    }
  };

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
          {registrations.map((reg) => (
            <tr key={reg.id} data-id={reg.id}>
              <td>{reg.auction}</td>
              <td>
                {reg.documentUrl ? (
                  <a href={reg.documentUrl} target="_blank" rel="noopener noreferrer">
                    {reg.documentUrl}
                  </a>
                ) : (
                  'Không có tài liệu'
                )}
              </td>
              <td>{reg.user}</td>
              <td>{reg.deposit}</td>
              <td>{reg.status}</td>
              <td className={styles.actions}>
                <button 
                  className={styles.approve} 
                  onClick={() => approveRegistration(reg.id)}
                  disabled={reg.status !== 'Chờ Duyệt'}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button 
                  className={styles.reject} 
                  onClick={() => openRejectModal(reg.id)}
                  disabled={reg.status !== 'Chờ Duyệt'}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <button 
                  className={styles.detail} 
                  onClick={() => openDetailModal(reg.id)}
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Từ Chối */}
        {isRejectModalOpen && (
        <div 
            id="rejectModal" 
            className={styles.modal}
            onClick={(e) => e.target.id === 'rejectModal' && closeRejectModal()}
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
                fontSize: '14px'
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

      {/* Modal Chi Tiết Thanh Toán */}
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