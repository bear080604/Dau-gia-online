import styles from './register-auction.module.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faUndo } from '@fortawesome/free-solid-svg-icons';
import NotificationBell from "../NotificationBell";
import io from 'socket.io-client'; // <-- Thêm

const AdminPanel = () => {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [users, setUsers] = useState({});
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [justUpdated, setJustUpdated] = useState(null); // <-- Highlight
  const [notifications, setNotifications] = useState([]); // <-- Cho NotificationBell

  const socketRef = useRef(null);
  const tableRef = useRef(null);

  const togglePopup = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const statusMap = {
    DaDuyet: 'Đã Duyệt',
    BiTuChoi: 'Bị Từ Chối',
    ChoDuyet: 'Chờ Duyệt',
    'Đã Thanh Toán': 'Đã Thanh Toán',
  };

  const reverseStatusMap = {
    'Đã Duyệt': 'DaDuyet',
    'Bị Từ Chối': 'BiTuChoi',
    'Chờ Duyệt': 'ChoDuyet',
    'Đã Thanh Toán': 'Đã Thanh Toán',
  };

  const fileurl = `${process.env.REACT_APP_BASE_URL}/storage/auction_files/`;

  // === SOCKET.IO REALTIME ===
  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:6001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO kết nối:', socket.id);
      socket.emit('join.channel', 'auction-profiles');
    });

    socket.on('profile.updated', (payload) => {
      const profile = payload.profile;
      if (!profile?.profile_id) return;

      console.log('Realtime cập nhật:', profile);

      // Cập nhật danh sách
      setRegistrations((prev) => {
        const exists = prev.some(p => p.profile_id === profile.profile_id);
        if (exists) {
          return prev.map(p => p.profile_id === profile.profile_id ? { ...p, ...profile } : p);
        } else {
          return [profile, ...prev];
        }
      });

      // Highlight + scroll
      setJustUpdated(profile.profile_id);
      setTimeout(() => setJustUpdated(null), 2000);

      // Thông báo
      const user = users[profile.user_id];
      const sessionName = getSessionName(profile.session_id);
      addNotification({
        title: 'Hồ sơ cập nhật',
        message: `${user?.full_name || 'User'} - ${sessionName} → ${statusMap[profile.status] || profile.status}`,
        time: new Date().toLocaleTimeString(),
        type: 'info'
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO ngắt kết nối');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [users, sessions]);

  // === SCROLL TO UPDATED ROW ===
  useEffect(() => {
    if (justUpdated && tableRef.current) {
      const row = tableRef.current.querySelector(`tr[data-id="${justUpdated}"]`);
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [justUpdated]);

  // === ADD NOTIFICATION ===
  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev].slice(0, 10));
  };

  // === FETCH DATA ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');

        // Hồ sơ
        const profilesRes = await axios.get(`${process.env.REACT_APP_API_URL}auction-profiles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRegistrations(profilesRes.data.profiles || []);

        // Users
        const usersRes = await axios.get(`${process.env.REACT_APP_API_URL}showuser`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersMap = usersRes.data.users.reduce((acc, u) => {
          acc[u.user_id] = u;
          return acc;
        }, {});
        setUsers(usersMap);

        // Sessions
        const sessionsRes = await axios.get(`${process.env.REACT_APP_API_URL}auction-sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sessionsMap = (sessionsRes.data.sessions || []).reduce((acc, s) => {
          acc[s.session_id] = {
            sessionName: s.item?.name || `Phiên ${s.session_id}`,
            item: s.item
          };
          return acc;
        }, {});
        setSessions(sessionsMap);

      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSessionName = (id) => sessions[id]?.sessionName || `Phiên ${id}`;
  const getSessionDetails = (id) => sessions[id] || null;

  const updateStatus = async (id, newStatus, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const apiStatus = reverseStatusMap[newStatus] || newStatus;
      const payload = { status: apiStatus };
      if (reason) payload.reject_reason = reason;

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}auction-profiles/${id}/status`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRegistrations(prev => prev.map(reg =>
        reg.profile_id === id ? { ...reg, status: apiStatus, reject_reason: reason || null } : reg
      ));

      alert(res.data.message || `Cập nhật thành công: ${newStatus}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
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
    if (!rejectReason.trim()) return alert('Nhập lý do!');
    updateStatus(currentId, 'Bị Từ Chối', rejectReason);
    closeRejectModal();
  };

  const openDetailModal = (id) => {
    const reg = registrations.find(r => r.profile_id === id);
    if (!reg) return;

    const user = users[reg.user_id] || {};
    const sessionDetails = getSessionDetails(reg.session_id);

    setPaymentDetails({
      id: reg.profile_id,
      auction: sessionDetails?.sessionName || `Phiên ${reg.session_id}`,
      documentUrl: reg.document_url ? `${fileurl}${reg.document_url}` : null,
      user: user.full_name || `user${reg.user_id}@example.com`,
      deposit: reg.deposit_amount,
      status: statusMap[reg.status] || 'Chờ Duyệt',
      rejectReason: reg.reject_reason || 'Không có',
      paymentMethod: 'Chuyển Khoản',
      paymentDate: '2025-10-10',
      paymentStatus: 'Chưa Hoàn Tiền',
      paymentId: 1,
      sessionDetails
    });
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setPaymentDetails(null);
  };

  const refundPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}auction-profiles/${currentId}/refund`,
        { payment_id: paymentDetails.paymentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentDetails(prev => ({ ...prev, paymentStatus: 'Đã Hoàn Tiền' }));
      alert('Hoàn tiền thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi hoàn tiền');
    }
  };

  const handleBackdropClick = (e, type) => {
    if (e.target.id === 'rejectModal' && type === 'reject') closeRejectModal();
    if (e.target.id === 'detailModal' && type === 'detail') closeDetailModal();
  };

  const handleStatusChange = (id, newStatus) => {
    if (newStatus === 'Bị Từ Chối') openRejectModal(id);
    else updateStatus(id, newStatus);
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Tìm kiếm phiên đấu giá..." />
        </div>
      
      </div>

      <h1 className={styles.h1Title}>Quản Lý Hồ Sơ Đăng Ký Đấu Giá</h1>
      <p className={styles.pageSubtitle}>Quản lý hồ sơ yêu cầu tham gia đấu giá tài sản</p>

      {/* FILTER & SORT */}
      <div className={styles.head}>
        <div className={styles.filter}>
          <select><option>Trạng thái</option></select>
        </div>
        <div className={styles.sort}>
          <select><option>Mới nhất</option></select>
        </div>
      </div>

      {/* TABLE */}
      <div ref={tableRef} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <table id="registrationTable" className={styles.table}>
          <thead>
            <tr>
              <th>Phiên Đấu Giá</th>
              <th>Tài Liệu</th>
              <th>Người yêu cầu</th>
              <th>Tiền Đặt Trước</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map(reg => (
              <tr
                key={reg.profile_id}
                data-id={reg.profile_id}
                className={justUpdated === reg.profile_id ? styles.justUpdated : ''}
              >
                <td>{getSessionName(reg.session_id)}</td>
                <td>
                  {reg.document_url ? (
                    <a href={`${fileurl}${reg.document_url}`} download target="_blank" rel="noopener noreferrer">
                      Tải tài liệu
                    </a>
                  ) : 'Không có'}
                </td>
                <td>{users[reg.user_id]?.full_name || `user${reg.user_id}`}</td>
                <td>{Number(reg.deposit_amount).toLocaleString('vi-VN')} ₫</td>
                <td>
                  <select
                    value={statusMap[reg.status] || 'Chờ Duyệt'}
                    onChange={(e) => handleStatusChange(reg.profile_id, e.target.value)}
                    className={styles.statusSelect}
                  >
                    <option>Chờ Duyệt</option>
                    <option>Đã Duyệt</option>
                    <option>Bị Từ Chối</option>
                    <option>Đã Thanh Toán</option>
                  </select>
                </td>
                <td className={styles.actions}>
                  <button className={styles.detail} onClick={() => openDetailModal(reg.profile_id)}>
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REJECT MODAL */}
      {isRejectModalOpen && (
        <div id="rejectModal" className={styles.modal} onClick={(e) => handleBackdropClick(e, 'reject')}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={closeRejectModal}>×</span>
            <p>Nhập lý do từ chối:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Lý do..."
              rows="4"
            />
            <div className={styles.modalActions}>
              <button className={styles.cancel} onClick={closeRejectModal}>Hủy</button>
              <button className={styles.confirm} onClick={submitReject}>Xác Nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {isDetailModalOpen && paymentDetails && (
        <div id="detailModal" className={styles.modal} onClick={(e) => handleBackdropClick(e, 'detail')}>
          <div className={styles.modalContent}>
            <h2>Chi Tiết Thanh Toán</h2>
            <div className={styles.detailContent}>
              <div><label>Phiên:</label> <span>{paymentDetails.auction}</span></div>
              {paymentDetails.sessionDetails?.item && (
                <>
                  <div><label>Mô tả:</label> <span>{paymentDetails.sessionDetails.item.description}</span></div>
                  <div><label>Giá khởi điểm:</label> 
                    <span>{Number(paymentDetails.sessionDetails.item.starting_price).toLocaleString('vi-VN')} ₫</span>
                  </div>
                </>
              )}
              <div><label>Tài liệu:</label>{' '}
                {paymentDetails.documentUrl ? (
                  <a href={paymentDetails.documentUrl} download target="_blank" rel="noopener noreferrer">
                    Tải tài liệu
                  </a>
                ) : 'Không có'}
              </div>
              <div><label>User:</label> <span>{paymentDetails.user}</span></div>
              <div><label>Tiền đặt:</label> <span>{Number(paymentDetails.deposit).toLocaleString('vi-VN')} đ</span></div>
              <div><label>Trạng thái:</label> <span>{paymentDetails.status}</span></div>
              <div><label>Lý do từ chối:</label> <span>{paymentDetails.rejectReason}</span></div>
              <div><label>Hoàn tiền:</label> <span>{paymentDetails.paymentStatus}</span></div>
              <div className={styles.modalActions}>
                <button
                  className={styles.refund}
                  onClick={refundPayment}
                  disabled={paymentDetails.paymentStatus === 'Đã Hoàn Tiền'}
                >
                  <FontAwesomeIcon icon={faUndo} /> Hoàn Tiền
                </button>
                <span className={styles.close} onClick={closeDetailModal}>×</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;    