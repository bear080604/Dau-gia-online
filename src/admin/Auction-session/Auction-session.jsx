import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Auction-session.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useUser } from '../../UserContext';
import moment from 'moment-timezone';
import { Link } from "react-router-dom";

function AuctionSession() {
  const { token, user } = useUser(); // Lấy user để lấy id và full_name
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
    creator: user?.id || '',
    creatorName: user?.full_name || '',
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
  const [now, setNow] = useState(moment.tz('Asia/Ho_Chi_Minh'));
  const itemsPerPage = 5;

  const API_URL = process.env.REACT_APP_API_URL;

  // Cập nhật thời gian hiện tại mỗi giây
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment.tz('Asia/Ho_Chi_Minh'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Log token và user để debug
  useEffect(() => {
    console.log('Initial Auth Token:', token);
    console.log('User Info:', user);
  }, [token, user]);

  const getAuctionStatus = (session) => {
    if (!session || !session.bid_start || !session.bid_end) {
      return "Chưa bắt đầu";
    }

    const now = moment.tz('Asia/Ho_Chi_Minh');
    const bidStart = moment.tz(session.bid_start, 'Asia/Ho_Chi_Minh');
    const bidEnd = moment.tz(session.bid_end, 'Asia/Ho_Chi_Minh');

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

    const startTime = session.start_time ? moment.tz(session.start_time, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss') : 'Chưa có';
    const endTime = session.end_time ? moment.tz(session.end_time, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss') : 'Chưa có';
    const registerStart = session.register_start ? moment.tz(session.register_start, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss') : 'Chưa có';
    const registerEnd = session.register_end ? moment.tz(session.register_end, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss') : 'Chưa có';
    const checkinTime = session.checkin_time ? moment.tz(session.checkin_time, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss') : 'Chưa có';
    const bidStart = session.bid_start ? moment.tz(session.bid_start, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss') : 'Chưa có';
    const bidEnd = session.bid_end ? moment.tz(session.bid_end, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss') : 'Chưa có';

    const status = getAuctionStatus({ ...session, bid_start: session.bid_start, bid_end: session.bid_end });
    const statusClass = status === 'Chưa bắt đầu' ? 'Mo' :
                       status === 'Đang diễn ra' ? 'Dangdienra' : 'Ketthuc';

    return {
      id: session.session_id,
      item: session.item?.name || 'Chưa có',
      itemId: session.item_id,
      creator: session.auction_org?.full_name || 'Chưa có',
      creatorId: session.created_by,
      startTime,
      endTime,
      regulation: session.regulation || 'Chưa có',
      status,
      statusClass,
      method: session.method || 'Đấu giá tự do',
      auctionOrgId: session.auction_org_id,
      registerStart,
      registerEnd,
      checkinTime,
      bidStart,
      bidEnd,
      bidStep,
      highestBid,
      currentWinnerId: session.current_winner_id || 'Chưa có',
      auctionOrgName: session.auction_org?.full_name || 'Chưa có',
      winnerName,
      profiles: session.profiles || [],
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
            createdAt: bid.bid_time ? moment.tz(bid.bid_time, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss') : 'Không có thời gian',
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
        // Lọc sản phẩm có status là ChoDauGia và không có sessions
        const filteredProducts = response.data.data.filter(product => 
          product.status === 'ChoDauGia' && (!product.sessions || product.sessions.length === 0)
        );
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
    if (!token || !user) {
      alert('Vui lòng đăng nhập để thực hiện hành động này.');
      window.location.href = '/login';
      return;
    }
    setModalMode(mode);
    if (session) {
      setSessionForm({
        item: session.itemId,
        creator: user.id,
        creatorName: user.full_name,
        startTime: session.startTime || '',
        endTime: session.endTime || '',
        regulation: session.regulation,
        status: 'Mo',
        method: session.method,
        auctionOrgId: session.auctionOrgId,
        registerStart: session.registerStart || '',
        registerEnd: session.registerEnd || '',
        checkinTime: session.checkinTime || '',
        bidStart: session.bidStart || '',
        bidEnd: session.bidEnd || '',
        bidStep: session.bidStep.replace(/[^\d]/g, '') || '',
        highestBid: session.highestBid.replace(/[^\d]/g, '') || '',
        currentWinnerId: '',
      });
      setSelectedSession(session);
    } else {
      setSessionForm({
        item: '',
        creator: user.id,
        creatorName: user.full_name,
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
    if (name === 'bidStep') {
      const cleanedValue = value.replace(/[^\d]/g, '');
      setSessionForm((prev) => ({
        ...prev,
        [name]: cleanedValue ? Number(cleanedValue).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '',
      }));
    } else {
      setSessionForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveSession = async () => {
    setLoading(true);
    try {
      if (!token || !user) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
      }
      const formData = {
        item_id: sessionForm.item,
        created_by: sessionForm.creator,
        start_time: sessionForm.startTime || null,
        end_time: sessionForm.endTime || null,
        regulation: sessionForm.regulation,
        status: 'Mo',
        method: sessionForm.method,
        auction_org_id: sessionForm.auctionOrgId,
        register_start: sessionForm.registerStart || null,
        register_end: sessionForm.registerEnd || null,
        checkin_time: sessionForm.checkinTime || null,
        bid_start: sessionForm.bidStart || null,
        bid_end: sessionForm.bidEnd || null,
        bid_step: sessionForm.bidStep ? Number(sessionForm.bidStep.replace(/[^\d]/g, '')) : null,
        highest_bid: sessionForm.highestBid ? Number(sessionForm.highestBid.replace(/[^\d]/g, '')) : null,
        current_winner_id: null,
      };

      if (!formData.start_time || !formData.end_time || !formData.bid_start || !formData.bid_end) {
        throw new Error('Vui lòng nhập đầy đủ các thời gian bắt buộc.');
      }

      if (moment.tz(formData.end_time, 'Asia/Ho_Chi_Minh').isBefore(moment.tz(formData.start_time, 'Asia/Ho_Chi_Minh'))) {
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu.');
      }

      if (moment.tz(formData.bid_end, 'Asia/Ho_Chi_Minh').isBefore(moment.tz(formData.bid_start, 'Asia/Ho_Chi_Minh'))) {
        throw new Error('Thời gian đấu giá kết thúc phải sau thời gian đấu giá bắt đầu.');
      }

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
        alert('Tạo phiên đấu giá thành công! Hợp đồng điện tử đã được tạo tự động');
      }
      fetchSessions();
      fetchProducts(); // Cập nhật lại danh sách sản phẩm để loại bỏ sản phẩm vừa thêm vào phiên
      closeSessionModal();
    } catch (error) {
      console.error('Error saving session:', error);
      if (error.response && error.response.status === 401) {
        alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      } else if (error.response && error.response.status === 403) {
        alert('Bạn không có quyền truy cập. Vui lòng liên hệ admin để kiểm tra vai trò (DauGiaVien hoặc Administrator).');
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
        await axios.delete(`${API_URL}auction-sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Xóa phiên đấu giá thành công!');
        fetchSessions();
        fetchProducts(); // Cập nhật lại danh sách sản phẩm sau khi xóa phiên
      } catch (error) {
        console.error('Error deleting session:', error);
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
          <div className={styles.profileAvatar}>
            {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'QT'}
          </div>
        </div>
      </div>

      <h1 className={styles.pageTitle}>Quản Lý Phiên Đấu Giá</h1>
      <p className={styles.pageSubtitle}>Thời gian hiện tại: {now.format('YYYY-MM-DD HH:mm:ss')}</p>
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
              <th>Thời gian hiện tại</th>
              <th>Thời gian bắt đầu</th>
              <th>Thời gian kết thúc</th>
              <th>Trạng thái</th>
              <th>Phương thức</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentSessions.map((session) => (
              <tr key={session.id}>
                <td data-label="Mã Phiên">{session.id}</td>
                <td data-label="Tài sản">{session.item}</td>
                <td data-label="Người tạo">{session.creator}</td>
                <td data-label="Thời gian hiện tại">{now.format('YYYY-MM-DD HH:mm:ss')}</td>
                <td data-label="Thời gian bắt đầu">{session.startTime}</td>
                <td data-label="Thời gian kết thúc">{session.endTime}</td>
                <td data-label="Trạng thái">
                  <span className={`${styles.statusBadge} ${styles[session.statusClass]}`}>
                    {session.status}
                  </span>
                </td>
                <td data-label="Phương thức">{session.method}</td>
                <td data-label="Hành động">
                  <div className={styles.actionButtons}>
                    {getActionButtons(session)}
                    {session.status === "Đang diễn ra" && (
                      <Link to={`../admin/showauction/${session.id}`} style={{ textDecoration: 'none' }}>
                        <button>
                          <i className="fa fa-gavel" aria-hidden="true"></i> Xem đấu giá
                        </button>
                      </Link>
                    )}
                  </div>
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
                <label htmlFor="creator">Người tạo</label>
                <input
                  type="text"
                  id="creator"
                  name="creatorName"
                  value={sessionForm.creatorName}
                  disabled
                  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                />
                <input
                  type="hidden"
                  name="creator"
                  value={sessionForm.creator}
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
                <select
                  id="status"
                  name="status"
                  value={sessionForm.status}
                  disabled
                  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                >
                  <option value="Mo">Chưa bắt đầu</option>
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
                  type="text"
                  id="bidStep"
                  name="bidStep"
                  placeholder="Nhập bước giá (VD: 100.000.000)"
                  value={sessionForm.bidStep}
                  onChange={handleFormChange}
                />
              </div>

               <div>
                <label>Hợp đồng điện tử</label>
                <span
                  style={{
                    display: 'block',
                    padding: '8px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    color: '#333',
                  }}
                >
                  Dịch vụ đấu giá eContract
                </span>
              </div>
              {modalMode === 'edit' && (
                <div>
                  <label htmlFor="highestBid">Giá cao nhất (VND)</label>
                  <input
                    type="text"
                    id="highestBid"
                    name="highestBid"
                    placeholder="Nhập giá cao nhất (VD: 100.000.000)"
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
              <p><strong>Thời gian hiện tại:</strong> {now.format('YYYY-MM-DD HH:mm:ss')}</p>
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
                        <td>{profile.created_at ? moment.tz(profile.created_at, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss') : 'Chưa có'}</td>
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