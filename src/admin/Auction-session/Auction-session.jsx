import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Auction-session.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useUser } from '../../UserContext';
import moment from 'moment-timezone';

function AuctionSession() {
  const { token } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemFilter, setItemFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [products, setProducts] = useState([]);
  const [sessionForm, setSessionForm] = useState({
    item: '',
    creator: '',
    startTime: '',
    endTime: '',
    regulation: '',
    status: 'Mo',
    method: 'Đấu giá tự do',
    auctionOrgId: '',
    registerStart: '',
    registerEnd: '',
    checkinTime: '',
    bidStart: '',
    bidEnd: '',
    bidStep: '',
    highestBid: '',
    currentWinnerId: '',
  });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  const API_URL = process.env.REACT_APP_API_URL;

  // Log token để debug
  useEffect(() => {
    console.log('Initial Auth Token:', token);
  }, [token]);

  const getAuctionStatus = (session) => {
    if (!session || !session.bid_start || !session.bid_end) {
      return "Chưa bắt đầu";
    }

    const now = moment.tz('Asia/Ho_Chi_Minh');
    const bidStart = moment.tz(session.bid_start, 'Asia/Ho_Chi_Minh');
    const bidEnd = moment.tz(session.bid_end, 'Asia/Ho_Chi_Minh');

    console.log('Debug - Now:', now.format('YYYY-MM-DD HH:mm:ss Z'));
    console.log('Debug - Bid Start:', bidStart.format('YYYY-MM-DD HH:mm:ss Z'));
    console.log('Debug - Bid End:', bidEnd.format('YYYY-MM-DD HH:mm:ss Z'));

    if (now.isBefore(bidStart)) {
      return "Chưa bắt đầu";
    } else if (now.isSameOrAfter(bidStart) && now.isSameOrBefore(bidEnd)) {
      return "Đang diễn ra";
    } else {
      return "Kết thúc";
    }
  };

  const transformSession = (session) => {
    const winnerProfile = session.profiles.find(profile => profile.user.user_id === session.current_winner_id);
    const winnerName = winnerProfile ? winnerProfile.user.full_name : 'Chưa có';
    const highestBid = session.highest_bid ? Number(session.highest_bid).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : 'Chưa có';
    const bidStep = session.bid_step ? Number(session.bid_step).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : 'Chưa có';

    // Convert UTC timestamps to UTC+7
    const startTime = moment.tz(session.start_time, 'UTC').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm');
    const endTime = moment.tz(session.end_time, 'UTC').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm');
    const registerStart = moment.tz(session.register_start, 'UTC').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm');
    const registerEnd = moment.tz(session.register_end, 'UTC').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm');
    const checkinTime = moment.tz(session.checkin_time, 'UTC').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm');
    const bidStart = moment.tz(session.bid_start, 'UTC').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm');
    const bidEnd = moment.tz(session.bid_end, 'UTC').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm');

    const status = getAuctionStatus({ ...session, bid_start: bidStart, bid_end: bidEnd });
    const statusClass = status === 'Chưa bắt đầu' ? 'Mo' :
                       status === 'Đang diễn ra' ? 'Dangdienra' : 'Ketthuc';

    return {
      id: session.session_id,
      item: session.item.name,
      itemId: session.item_id,
      creator: session.auction_org.full_name,
      creatorId: session.created_by,
      startTime,
      endTime,
      regulation: session.regulation,
      status,
      statusClass,
      method: session.method,
      auctionOrgId: session.auction_org_id,
      registerStart,
      registerEnd,
      checkinTime,
      bidStart,
      bidEnd,
      bidStep,
      highestBid,
      currentWinnerId: session.current_winner_id || 'Chưa có',
      auctionOrgName: session.auction_org.full_name,
      winnerName,
      profiles: session.profiles,
    };
  };

  const fetchBids = async (sessionId) => {
    try {
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
      }
      const response = await axios.get(`${API_URL}bids/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.status && Array.isArray(response.data.bids)) {
        const sessionResponse = await axios.get(`${API_URL}auction-sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profiles = sessionResponse.data.session.profiles || [];

        const bidsWithNames = await Promise.all(response.data.bids.map(async (bid) => {
          const profile = profiles.find(p => p.user_id === bid.user_id);
          const userName = profile ? profile.user.full_name : 'Không xác định';
          return {
            id: bid.id,
            userId: bid.user_id,
            amount: Number(bid.amount).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
            createdAt: bid.bid_time
              ? moment.tz(bid.bid_time, 'UTC').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm')
              : 'Không có thời gian',
            userName,
            originalAmount: Number(bid.amount),
          };
        }));
        return bidsWithNames.sort((a, b) => b.originalAmount - a.originalAmount);
      }
      return [];
    } catch (error) {
      console.error('Error fetching bids:', error);
      if (error.response && error.response.status === 401) {
        alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      } else if (error.response && error.response.status === 403) {
        alert('Bạn không có quyền truy cập. Vui lòng liên hệ admin để kiểm tra vai trò (DauGiaVien hoặc Administrator).');
      }
      return [];
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
      }
      const response = await axios.get(`${API_URL}auction-sessions`, {
        params: { search: searchTerm, status: statusFilter, item: itemFilter },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data.sessions)) {
        const transformedSessions = response.data.sessions.map(transformSession);
        setSessions(transformedSessions);
        setTotalPages(Math.ceil(transformedSessions.length / itemsPerPage));
      } else {
        console.error('Unexpected API response structure:', response.data);
        setSessions([]);
        setError('Dữ liệu từ API không đúng định dạng.');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      if (error.response && error.response.status === 401) {
        alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      } else if (error.response && error.response.status === 403) {
        alert('Bạn không có quyền truy cập. Vui lòng liên hệ admin để kiểm tra vai trò (DauGiaVien hoặc Administrator).');
      } else {
        setError('Không thể tải danh sách phiên đấu giá: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
      }
      const response = await axios.get(`${API_URL}products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && Array.isArray(response.data.data)) {
        const filteredProducts = response.data.data.filter(product => product.status === 'ChoDauGia');
        setProducts(filteredProducts);
      } else {
        setError('Dữ liệu sản phẩm không đúng định dạng.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response && error.response.status === 401) {
        alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      } else if (error.response && error.response.status === 403) {
        alert('Bạn không có quyền truy cập. Vui lòng liên hệ admin để kiểm tra vai trò (DauGiaVien hoặc Administrator).');
      } else {
        setError('Không thể tải danh sách sản phẩm: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSessions();
      fetchProducts();
    } else {
      setError('Vui lòng đăng nhập để xem danh sách phiên đấu giá.');
      window.location.href = '/login';
    }
  }, [searchTerm, statusFilter, itemFilter, token]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSessions = sessions.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleItemFilterChange = (e) => {
    setItemFilter(e.target.value);
    setCurrentPage(1);
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
    if (mode === 'edit' && session && session.status !== 'Chưa bắt đầu') {
      alert('Chỉ có thể chỉnh sửa phiên đấu giá ở trạng thái Chưa bắt đầu.');
      return;
    }
    if (!token) {
      alert('Vui lòng đăng nhập để thực hiện hành động này.');
      window.location.href = '/login';
      return;
    }
    setModalMode(mode);
    if (session) {
      setSessionForm({
        item: session.itemId,
        creator: session.creatorId,
        startTime: moment.tz(session.startTime, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
        endTime: moment.tz(session.endTime, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
        regulation: session.regulation,
        status: session.status === 'Chưa bắt đầu' ? 'Mo' :
                session.status === 'Đang diễn ra' ? 'DangDienRa' : 'KetThuc',
        method: session.method,
        auctionOrgId: session.auctionOrgId,
        registerStart: moment.tz(session.registerStart, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
        registerEnd: moment.tz(session.registerEnd, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
        checkinTime: moment.tz(session.checkinTime, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
        bidStart: moment.tz(session.bidStart, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
        bidEnd: moment.tz(session.bidEnd, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
        bidStep: session.bidStep.replace(/[^\d]/g, ''),
        highestBid: session.highestBid.replace(/[^\d]/g, ''),
        currentWinnerId: '',
      });
      setSelectedSession(session);
    } else {
      setSessionForm({
        item: '',
        creator: '',
        startTime: '',
        endTime: '',
        regulation: '',
        status: 'Mo',
        method: 'Đấu giá tự do',
        auctionOrgId: '',
        registerStart: '',
        registerEnd: '',
        checkinTime: '',
        bidStart: '',
        bidEnd: '',
        bidStep: '',
        highestBid: '',
        currentWinnerId: '',
      });
      setSelectedSession(null);
    }
    setShowSessionModal(true);
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
  };

  const openViewModal = async (sessionId) => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
      }
      const [sessionResponse, bidsResponse] = await Promise.all([
        axios.get(`${API_URL}auction-sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetchBids(sessionId),
      ]);

      if (sessionResponse.data && sessionResponse.data.status && sessionResponse.data.session) {
        const session = sessionResponse.data.session;
        const transformedSession = transformSession(session);
        transformedSession.bids = bidsResponse;
        setSelectedSession(transformedSession);
        setShowViewModal(true);
      } else {
        setError('Không tìm thấy phiên đấu giá hoặc dữ liệu không hợp lệ.');
      }
    } catch (error) {
      console.error('Error fetching session details or bids:', error);
      if (error.response && error.response.status === 401) {
        alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      } else if (error.response && error.response.status === 403) {
        alert('Bạn không có quyền truy cập. Vui lòng liên hệ admin để kiểm tra vai trò (DauGiaVien hoặc Administrator).');
      } else {
        setError('Không thể tải chi tiết phiên đấu giá hoặc lượt bid: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSessionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSession = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
      }
      console.log('Auth Token:', token);
      console.log('Request URL:', modalMode === 'edit' && selectedSession ? `${API_URL}auction-sessions/${selectedSession.id}` : `${API_URL}auction-sessions`);
      const formData = {
        item_id: sessionForm.item,
        created_by: sessionForm.creator,
        start_time: moment.tz(sessionForm.startTime, 'Asia/Ho_Chi_Minh').toISOString(),
        end_time: moment.tz(sessionForm.endTime, 'Asia/Ho_Chi_Minh').toISOString(),
        regulation: sessionForm.regulation,
        status: sessionForm.status,
        method: sessionForm.method,
        auction_org_id: sessionForm.auctionOrgId,
        register_start: moment.tz(sessionForm.registerStart, 'Asia/Ho_Chi_Minh').toISOString(),
        register_end: moment.tz(sessionForm.registerEnd, 'Asia/Ho_Chi_Minh').toISOString(),
        checkin_time: moment.tz(sessionForm.checkinTime, 'Asia/Ho_Chi_Minh').toISOString(),
        bid_start: moment.tz(sessionForm.bidStart, 'Asia/Ho_Chi_Minh').toISOString(),
        bid_end: moment.tz(sessionForm.bidEnd, 'Asia/Ho_Chi_Minh').toISOString(),
        bid_step: sessionForm.bidStep,
        highest_bid: sessionForm.highestBid || null,
        current_winner_id: null,
      };

      console.log('Request Data:', formData);

      let response;
      if (modalMode === 'edit' && selectedSession) {
        response = await axios.put(`${API_URL}auction-sessions/${selectedSession.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Cập nhật phiên đấu giá thành công!');
      } else {
        response = await axios.post(`${API_URL}auction-sessions`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Tạo phiên đấu giá thành công!');
      }
      fetchSessions();
      closeSessionModal();
    } catch (error) {
      console.error('Error saving session:', error);
      console.error('Error Response:', error.response?.data);
      if (error.response && error.response.status === 401) {
        alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      } else if (error.response && error.response.status === 403) {
        alert('Bạn không có quyền truy cập. Vui lòng liên hệ admin để kiểm tra vai trò (DauGiaVien hoặc Administrator). Vai trò hiện tại của bạn có thể không được cấp phép.');
      } else {
        alert('Có lỗi xảy ra khi lưu phiên đấu giá: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Bạn có chắc muốn xóa phiên này?')) {
      setLoading(true);
      try {
        if (!token) {
          throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
        }
        console.log('Auth Token for Delete:', token);
        console.log('Delete URL:', `${API_URL}auction-sessions/${sessionId}`);
        await axios.delete(`${API_URL}auction-sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Xóa phiên đấu giá thành công!');
        fetchSessions();
      } catch (error) {
        console.error('Error deleting session:', error);
        console.error('Error Response:', error.response?.data);
        if (error.response && error.response.status === 401) {
          alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
          window.location.href = '/login';
        } else if (error.response && error.response.status === 403) {
          alert('Bạn không có quyền truy cập. Vui lòng liên hệ admin để kiểm tra vai trò (DauGiaVien hoặc Administrator).');
        } else {
          alert('Có lỗi xảy ra khi xóa phiên đấu giá: ' + (error.response?.data?.message || error.message));
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Chưa bắt đầu': 'statusMo',
      'Đang diễn ra': 'statusDangdienra',
      'Kết thúc': 'statusKetthuc',
    };
    return statusMap[status] || 'statusMo';
  };

  const getActionButtons = (session) => {
    const buttons = [];
    if (session.status === 'Chưa bắt đầu') {
      buttons.push(
        <button
          key="edit"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => openSessionModal('edit', session)}
        >
          <i className="fa fa-pencil" aria-hidden="true"></i>
        </button>
      );
    }
    buttons.push(
      <button
        key="delete"
        className={`${styles.btn} ${styles.btnDanger}`}
        onClick={() => handleDeleteSession(session.id)}
      >
        <i className="fa fa-trash" aria-hidden="true"></i>
      </button>
    );
    buttons.push(
      <button
        key="view"
        className={`${styles.btn} ${styles.btnSuccess}`}
        onClick={() => openViewModal(session.id)}
      >
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
            <option value="Mo">Chưa bắt đầu</option>
            <option value="DangDienRa">Đang diễn ra</option>
            <option value="KetThuc">Kết thúc</option>
          </select>
          <select className={styles.filterSelect} value={itemFilter} onChange={handleItemFilterChange}>
            <option value="">Tất cả tài sản</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {`${product.id} - ${product.name}`}
              </option>
            ))}
          </select>
        </div>
        <button className={styles.addBtn} onClick={() => openSessionModal('add')}>
          <i className="fa fa-plus"></i>
          Thêm phiên mới
        </button>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : currentSessions.length === 0 ? (
        <p>Không có phiên đấu giá nào.</p>
      ) : (
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
              <th>Phương thức</th>
              <th>Giá cao nhất</th>
              <th>Người thắng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentSessions.map((session) => (
              <tr key={session.id}>
                <td data-label="Mã Phiên">{session.id}</td>
                <td data-label="Tài sản">{session.item}</td>
                <td data-label="Người tạo">{session.creator}</td>
                <td data-label="Thời gian bắt đầu">{session.startTime}</td>
                <td data-label="Thời gian kết thúc">{session.endTime}</td>
                <td data-label="Quy định">{session.regulation}</td>
                <td data-label="Trạng thái">
                  <span className={`${styles.statusBadge} ${styles[session.statusClass]}`}>
                    {session.status}
                  </span>
                </td>
                <td data-label="Phương thức">{session.method}</td>
                <td data-label="Giá cao nhất">{session.highestBid}</td>
                <td data-label="Người thắng">
                  {session.status === 'Kết thúc' && session.currentWinnerId !== 'Chưa có' ? session.winnerName : 'Chưa có'}
                </td>
                <td data-label="Hành động">
                  <div className={styles.actionButtons}>{getActionButtons(session)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.pagination}>{renderPagination()}</div>

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
                <select id="item" name="item" value={sessionForm.item} onChange={handleFormChange}>
                  <option value="">Chọn tài sản</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {`${product.id} - ${product.name}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="creator">Người tạo (ID)</label>
                <input
                  type="number"
                  id="creator"
                  name="creator"
                  placeholder="Nhập ID người tạo"
                  value={sessionForm.creator}
                  onChange={handleFormChange}
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
                <select id="status" name="status" value={sessionForm.status} onChange={handleFormChange}>
                  <option value="Mo">Chưa bắt đầu</option>
                  <option value="DangDienRa">Đang diễn ra</option>
                  <option value="KetThuc">Kết thúc</option>
                </select>
              </div>
              <div>
                <label htmlFor="method">Phương thức</label>
                <select id="method" name="method" value={sessionForm.method} onChange={handleFormChange}>
                  <option value="Đấu giá tự do">Đấu giá tự do</option>
                </select>
              </div>
              <div>
                <label htmlFor="auctionOrgId">ID Tổ chức đấu giá</label>
                <input
                  type="number"
                  id="auctionOrgId"
                  name="auctionOrgId"
                  placeholder="Nhập ID tổ chức"
                  value={sessionForm.auctionOrgId}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="registerStart">Thời gian đăng ký bắt đầu</label>
                <input
                  type="datetime-local"
                  id="registerStart"
                  name="registerStart"
                  value={sessionForm.registerStart}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="registerEnd">Thời gian đăng ký kết thúc</label>
                <input
                  type="datetime-local"
                  id="registerEnd"
                  name="registerEnd"
                  value={sessionForm.registerEnd}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="checkinTime">Thời gian check-in</label>
                <input
                  type="datetime-local"
                  id="checkinTime"
                  name="checkinTime"
                  value={sessionForm.checkinTime}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="bidStart">Thời gian đấu giá bắt đầu</label>
                <input
                  type="datetime-local"
                  id="bidStart"
                  name="bidStart"
                  value={sessionForm.bidStart}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="bidEnd">Thời gian đấu giá kết thúc</label>
                <input
                  type="datetime-local"
                  id="bidEnd"
                  name="bidEnd"
                  value={sessionForm.bidEnd}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="bidStep">Bước giá (VND)</label>
                <input
                  type="number"
                  id="bidStep"
                  name="bidStep"
                  placeholder="Nhập bước giá"
                  value={sessionForm.bidStep}
                  onChange={handleFormChange}
                />
              </div>
              {modalMode === 'edit' && (
                <div>
                  <label htmlFor="highestBid">Giá cao nhất (VND)</label>
                  <input
                    type="number"
                    id="highestBid"
                    name="highestBid"
                    placeholder="Nhập giá cao nhất"
                    value={sessionForm.highestBid}
                    onChange={handleFormChange}
                  />
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveSession}>
                Lưu
              </button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeSessionModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

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
              <p><strong>Tổ chức đấu giá:</strong> {selectedSession.auctionOrgName}</p>
              <p><strong>Thời gian bắt đầu:</strong> {selectedSession.startTime}</p>
              <p><strong>Thời gian kết thúc:</strong> {selectedSession.endTime}</p>
              <p><strong>Trạng thái:</strong> {selectedSession.status}</p>
              <p><strong>Phương thức:</strong> {selectedSession.method}</p>
              <p><strong>ID Tổ chức đấu giá:</strong> {selectedSession.auctionOrgId}</p>
              <p><strong>Thời gian đăng ký bắt đầu:</strong> {selectedSession.registerStart}</p>
              <p><strong>Thời gian đăng ký kết thúc:</strong> {selectedSession.registerEnd}</p>
              <p><strong>Thời gian check-in:</strong> {selectedSession.checkinTime}</p>
              <p><strong>Thời gian đấu giá bắt đầu:</strong> {selectedSession.bidStart}</p>
              <p><strong>Thời gian đấu giá kết thúc:</strong> {selectedSession.bidEnd}</p>
              <p><strong>Bước giá:</strong> {selectedSession.bidStep} VND</p>
              <p><strong>Giá cao nhất:</strong> {selectedSession.highestBid} VND</p>
              {selectedSession.status === 'Kết thúc' && (
                <p><strong>Người thắng:</strong> {selectedSession.currentWinnerId === 'Chưa có' ? 'Chưa có' : selectedSession.winnerName}</p>
              )}
              <p><strong>Quy định:</strong> {selectedSession.regulation}</p>
              <div className={styles.orderHistory}>
                <h3>Hồ sơ đấu giá</h3>
                <table className={styles.orderTable}>
                  <thead>
                    <tr>
                      <th>Mã hồ sơ</th>
                      <th>Người tham gia</th>
                      <th>Số tiền đặt cọc</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSession.profiles.map((profile, index) => (
                      <tr key={index}>
                        <td>HS{profile.profile_id}</td>
                        <td>{profile.user.full_name}</td>
                        <td>{Number(profile.deposit_amount).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} VND</td>
                        <td>{moment.tz(profile.created_at, 'UTC').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedSession.bids && selectedSession.bids.length > 0 && (
                <div className={styles.orderHistory}>
                  <h3>Lượt đấu giá</h3>
                  <table className={styles.orderTable}>
                    <thead>
                      <tr>
                        <th>Mã lượt bid</th>
                        <th>Người đấu giá</th>
                        <th>Giá bid</th>
                        <th>Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSession.bids.map((bid, index) => (
                        <tr key={index}>
                          <td>BID{bid.id}</td>
                          <td>{bid.userName}</td>
                          <td>{bid.amount} VND</td>
                          <td>{bid.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeViewModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuctionSession;