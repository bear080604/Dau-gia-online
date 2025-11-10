import React, { useState, useEffect, useCallback } from 'react';  // NEW: Thêm useCallback nếu dùng debounce lib, nhưng dùng native timeout
import Swal from 'sweetalert2';
import styles from './Auction-session.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useUser } from '../../UserContext';
import moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import {
  getAuctionSessions,
  getAuctionSessionById,
  createAuctionSession,
  updateAuctionSession,
  deleteAuctionSession,
  getBidsBySessionId,
  getProducts,
  getAuctionOrganizationsAndAuctioneers,
  clearUsersCache,
  confirmWinner,
  rejectWinner,
} from '../../services/auctionSessionService';

function AuctionSession() {
  const { token, user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermDebounced, setSearchTermDebounced] = useState('');  // NEW: Debounced search
  const [statusFilter, setStatusFilter] = useState('');
  const [itemFilter, setItemFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');  
  const [selectedSession, setSelectedSession] = useState(null);
  const [originalSessions, setOriginalSessions] = useState([]);  // NEW: Sessions gốc từ API (đã transform)
  const [sessions, setSessions] = useState([]);  // NEW: Sessions đã filter để hiển thị
  const [products, setProducts] = useState([]);
  const [auctionOrgs, setAuctionOrgs] = useState([]);
  const [isLoadingAuctionOrgs, setIsLoadingAuctionOrgs] = useState(true);
  const [auctioneers, setAuctioneers] = useState([]);
  const [isAuctionOrgDisabled, setIsAuctionOrgDisabled] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    item: '',
    auctioneerId: '',
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
    starting_price: ''
  });
  const [open, setOpen] = useState(false);
  const togglePopup = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(moment.tz('Asia/Ho_Chi_Minh'));
  const itemsPerPage = 5;

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment.tz('Asia/Ho_Chi_Minh'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // NEW: Debounce cho search (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTermDebounced(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Tối ưu: Gộp fetch auctionOrgs và auctioneers cùng lúc
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        setIsLoadingAuctionOrgs(true);
        const { auctionOrgs, auctioneers } = await getAuctionOrganizationsAndAuctioneers();
        setAuctionOrgs(auctionOrgs);
        setAuctioneers(auctioneers);
      } catch (error) {
        setError(
          `Không thể tải danh sách tổ chức đấu giá: ${
            error.response?.data?.message || 'Vui lòng thử lại.'
          }`
        );
      } finally {
        setIsLoadingAuctionOrgs(false);
      }
    };
    if (token) {
      fetchAuctionData();
    }
  }, [token]);

  // Auto-select auctionOrgId based on selected product
  useEffect(() => {
    if (sessionForm.item) {
      const selectedProduct = products.find((p) => p.id.toString() === sessionForm.item);
      if (selectedProduct) {
        if (selectedProduct.auction_org_id && selectedProduct.auction_org_id !== '') {
          setSessionForm((prev) => ({
            ...prev,
            auctionOrgId: selectedProduct.auction_org_id.toString(),
          }));
          setIsAuctionOrgDisabled(true);
        } else {
          setSessionForm((prev) => ({
            ...prev,
            auctionOrgId: '',
          }));
          setIsAuctionOrgDisabled(false);
        }
      }
    } else {
      setSessionForm((prev) => ({
        ...prev,
        auctionOrgId: '',
      }));
      setIsAuctionOrgDisabled(false);
    }
  }, [sessionForm.item, products]);

  const getAuctionStatus = (session) => {
    if (!session || !session.bid_start || !session.bid_end) {
      return 'Chưa bắt đầu';
    }
    const now = moment.tz('Asia/Ho_Chi_Minh');
    const bidStart = moment.tz(session.bid_start, 'Asia/Ho_Chi_Minh');
    const bidEnd = moment.tz(session.bid_end, 'Asia/Ho_Chi_Minh');
    if (now.isBefore(bidStart)) {
      return 'Chưa bắt đầu';
    } else if (now.isSameOrAfter(bidStart) && now.isSameOrBefore(bidEnd)) {
      return 'Đang diễn ra';
    } else {
      return 'Kết thúc';
    }
  };

  const transformSession = (session) => {
    const winnerProfile = session.profiles?.find(
      (profile) => profile.user.user_id === session.current_winner_id
    );
    const winnerName = winnerProfile ? winnerProfile.user.full_name : 'Chưa có';
    const highestBid = session.highest_bid
      ? Number(session.highest_bid).toLocaleString('vi-VN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : 'Chưa có';
    const bidStep = session.bid_step
      ? Number(session.bid_step).toLocaleString('vi-VN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : 'Chưa có';
    const startTime = session.start_time
      ? moment.tz(session.start_time, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')
      : 'Chưa có';
    const endTime = session.end_time
      ? moment.tz(session.end_time, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')
      : 'Chưa có';
    const registerStart = session.register_start
      ? moment.tz(session.register_start, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')
      : 'Chưa có';
    const registerEnd = session.register_end
      ? moment.tz(session.register_end, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')
      : 'Chưa có';
    const checkinTime = session.checkin_time
      ? moment.tz(session.checkin_time, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')
      : 'Chưa có';
    const bidStart = session.bid_start
      ? moment.tz(session.bid_start, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')
      : 'Chưa có';
    const bidEnd = session.bid_end
      ? moment.tz(session.bid_end, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')
      : 'Chưa có';
    const status = getAuctionStatus({ ...session, bid_start: session.bid_start, bid_end: session.bid_end });
    const statusClass =
      status === 'Chưa bắt đầu' ? 'statusMo' : status === 'Đang diễn ra' ? 'statusDangdienra' : 'statusKetthuc';
    const auctionOrgId = session.auction_org_id?.toString();
    const auctionOrgName =
      auctionOrgId && auctionOrgs.find((org) => org.id === auctionOrgId)?.name ||
      session.auction_org?.full_name ||
      'Chưa có';
   
    const auctioneerId = session.auctioneer_id?.toString();  // FIXED: Khai báo đúng
    const auctioneerName = session.auctioneer?.full_name || 'Chưa chỉ định';

    return {
      id: session.session_id,
      item: session.item?.name || 'Chưa có',
      itemId: session.item_id?.toString(),
      creator: session.auction_org?.full_name || user?.full_name || 'Chưa có',
      creatorId: session.created_by,
      startTime,
      endTime,
      regulation: session.regulation || 'Chưa có',
      status,
      statusClass,
      method: session.method || 'Đấu giá tự do',
      auctionOrgId,
      auctionOrgName,
      auctioneerId: auctioneerId,  // FIXED: Sử dụng biến đã khai báo, không phải ''
      auctioneerName: auctioneerName,
      registerStart,
      registerEnd,
      checkinTime,
      bidStart,
      bidEnd,
      bidStep,
      highestBid,
      currentWinnerId: session.current_winner_id || 'Chưa có',
      winnerName,
      profiles: session.profiles || [],
      starting_price: session.item?.starting_price,
       confirm_winner_at: session.confirm_winner_at || null,
    reject_winner_at: session.reject_winner_at || null,
    rejected_reason: session.rejected_reason || null,  // Bonus: hiển thị lý do
      
    };
  };

  // NEW: Hàm applyFilters (client-side filter + search)
  const applyFilters = (allSessions, { search = '', status = '', item = '' } = {}) => {
    if (!Array.isArray(allSessions)) return [];

    // mapping giá trị select -> status hiển thị (theo transformSession)
    const statusMap = {
      Mo: 'Chưa bắt đầu',
      DangDienRa: 'Đang diễn ra',
      KetThuc: 'Kết thúc',
    };

    let list = allSessions.slice(); // copy

    // 1) filter theo status (UI trả về 'Mo'|'DangDienRa'|'KetThuc')
    if (status) {
      const expectedStatus = statusMap[status] || status;
      list = list.filter(s => s.status === expectedStatus);
    }

    // 2) filter theo item (so sánh itemId string)
    if (item) {
      const itemStr = item.toString();
      list = list.filter(s => (s.itemId || '').toString() === itemStr);
    }

    // 3) search (tìm trong nhiều trường: id, item name, auctionOrgName, creator, auctioneerName)
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      list = list.filter(s => {
        return (
          (s.id && s.id.toString().toLowerCase().includes(q)) ||
          (s.item && s.item.toString().toLowerCase().includes(q)) ||
          (s.auctionOrgName && s.auctionOrgName.toLowerCase().includes(q)) ||
          (s.creator && s.creator.toLowerCase().includes(q)) ||
          (s.auctioneerName && s.auctioneerName.toLowerCase().includes(q)) ||
          (s.status && s.status.toLowerCase().includes(q))
        );
      });
    }

    return list;
  };

  // Tối ưu: fetchBids nhận profiles từ session để tránh duplicate call
  const fetchBids = async (sessionId, profiles = null) => {
    try {
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
      }
      const bidsResponse = await getBidsBySessionId(sessionId);
      if (bidsResponse && bidsResponse.status && Array.isArray(bidsResponse.bids)) {
        // Nếu không có profiles, lấy từ API
        let profilesList = profiles;
        if (!profilesList) {
          const sessionResponse = await getAuctionSessionById(sessionId);
          profilesList = sessionResponse.session?.profiles || [];
        }
        
        const bidsWithNames = bidsResponse.bids.map((bid) => {
          const profile = profilesList.find((p) => p.user_id === bid.user_id);
          const userName = profile ? profile.user.full_name : 'Không xác định';
          return {
            id: bid.id,
            userId: bid.user_id,
            amount: Number(bid.amount).toLocaleString('vi-VN', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
            createdAt: bid.bid_time
              ? moment.tz(bid.bid_time, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')
              : 'Không có thời gian',
            userName,
            originalAmount: Number(bid.amount),
          };
        });
        return bidsWithNames.sort((a, b) => b.originalAmount - a.originalAmount);
      }
      return [];
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Đã được xử lý bởi interceptor
      } else if (error.response && error.response.status === 403) {
        alert('Bạn không có quyền truy cập. Vui lòng liên hệ admin để kiểm tra vai trò (DauGiaVien hoặc Administrator).');
      }
      return [];
    }
  };

  // Tối ưu: Gộp fetchSessions và fetchProducts để gọi song song và share data
  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
      }
      
      // Gọi song song để tối ưu performance
      const [productsResponse, sessionsResponse] = await Promise.all([
        getProducts(),
        getAuctionSessions(),
      ]);

      // Xử lý sessions
      if (sessionsResponse && Array.isArray(sessionsResponse.sessions)) {
        // transform raw sessions -> ui-ready sessions
        const transformed = sessionsResponse.sessions.map(transformSession);

        // Lưu session gốc (đã transform) để lọc client-side
        setOriginalSessions(transformed);

        // Áp filter ngay lần đầu theo trạng thái / item / search hiện thời
        const filtered = applyFilters(transformed, {
          search: searchTermDebounced,
          status: statusFilter,
          item: itemFilter,
        });

        setSessions(filtered);
        setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
        setCurrentPage(1);

        // Xử lý products với session data
        const sessionItemIds = sessionsResponse.sessions
          .filter((session) => session.status !== 'KetThuc' || session.current_winner_id !== null)
          .map((session) => session.item_id);
        
        if (productsResponse && Array.isArray(productsResponse.data)) {
          const filteredProducts = productsResponse.data
            .filter((product) => {
              const isValidStatus = product.status === 'ChoDauGia';
              const hasNoActiveOrWonSessions = !sessionItemIds.includes(product.id);
              return isValidStatus && hasNoActiveOrWonSessions;
            })
            .map((product) => ({
              ...product,
              auction_org_id: product.auction_org_id ? product.auction_org_id.toString() : '',
            }));
          setProducts(filteredProducts);
        } else {
          setProducts([]);
        }
      } else {
        console.error('Unexpected API response structure:', sessionsResponse);
        setOriginalSessions([]);
        setSessions([]);
        setProducts([]);
        setError('Dữ liệu từ API không đúng định dạng.');
      }
    } catch (error) {
      console.error('fetchInitialData error', error);
      if (error.response && error.response.status === 401) {
        // Đã được xử lý bởi interceptor
      } else if (error.response && error.response.status === 403) {
        alert('Bạn không có quyền truy cập. Vui lòng liên hệ admin để kiểm tra vai trò (DauGiaVien hoặc Administrator).');
      } else {
        setError('Không thể tải dữ liệu: ' + (error.response?.data?.message || error.message));
      }
      setOriginalSessions([]);
      setSessions([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Tối ưu: Hàm refresh chung để tránh duplicate calls
  const refreshData = async () => {
    try {
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
      }
      
      // Gọi song song một lần duy nhất
      const [productsResponse, sessionsResponse] = await Promise.all([
        getProducts(),
        getAuctionSessions(),
      ]);

      // Xử lý sessions
      if (sessionsResponse && Array.isArray(sessionsResponse.sessions)) {
        const transformed = sessionsResponse.sessions.map(transformSession);
        setOriginalSessions(transformed);
        const filtered = applyFilters(transformed, {
          search: searchTermDebounced,
          status: statusFilter,
          item: itemFilter,
        });
        setSessions(filtered);
        setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
        setCurrentPage(1);

        // Xử lý products với session data đã có
        const sessionItemIds = sessionsResponse.sessions
          .filter((session) => session.status !== 'KetThuc' || session.current_winner_id !== null)
          .map((session) => session.item_id);
        
        if (productsResponse && Array.isArray(productsResponse.data)) {
          const filteredProducts = productsResponse.data
            .filter((product) => {
              const isValidStatus = product.status === 'ChoDauGia';
              const hasNoActiveOrWonSessions = !sessionItemIds.includes(product.id);
              return isValidStatus && hasNoActiveOrWonSessions;
            })
            .map((product) => ({
              ...product,
              auction_org_id: product.auction_org_id ? product.auction_org_id.toString() : '',
            }));
          setProducts(filteredProducts);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error('refreshData error', error);
    }
  };

  // NEW: useEffect gọi fetch chỉ khi token thay đổi (không phụ thuộc filter)
  useEffect(() => {
    if (token) {
      fetchInitialData();
    } else {
      setError('Vui lòng đăng nhập để xem danh sách phiên đấu giá.');
      window.location.href = '/login';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // NEW: useEffect áp filter khi searchDebounced, statusFilter, itemFilter hoặc originalSessions thay đổi
  useEffect(() => {
    const filtered = applyFilters(originalSessions, {
      search: searchTermDebounced,
      status: statusFilter,
      item: itemFilter,
    });
    setSessions(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
    setCurrentPage(1);
  }, [searchTermDebounced, statusFilter, itemFilter, originalSessions]);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSessions = sessions.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);  // Reset page khi search
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
          aria-label={`Trang ${i}`}  // FIXED: Accessibility
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  // FIXED: openSessionModal (populate auctioneerId và starting_price đúng)
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
      const selectedProduct = products.find((p) => p.id.toString() === session.itemId);
      setSessionForm({
        item: session.itemId,
        creator: user.id,
        creatorName: user.full_name,
        startTime: session.startTime || '',
        endTime: session.endTime || '',
        regulation: session.regulation,
        status: 'Mo',
        method: session.method,
        auctionOrgId: session.auctionOrgId || '',
        auctioneerId: session.auctioneerId || '',  // FIXED: Populate auctioneerId
        registerStart: session.registerStart || '',
        registerEnd: session.registerEnd || '',
        checkinTime: session.checkinTime || '',
        bidStart: session.bidStart || '',
        bidEnd: session.bidEnd || '',
        bidStep: session.bidStep.replace(/[^\d]/g, '') || '',
        highestBid: session.highestBid.replace(/[^\d]/g, '') || '',
        currentWinnerId: '',
        starting_price: session.starting_price || ''  // FIXED: Từ session, không phải sessionForm cũ
      });
      setIsAuctionOrgDisabled(!!(selectedProduct && selectedProduct.auction_org_id));
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
        auctioneerId: '',
        registerStart: '',
        registerEnd: '',
        checkinTime: '',
        bidStart: '',
        bidEnd: '',
        bidStep: '',
        highestBid: '',
        currentWinnerId: '',
        starting_price: ''
      });
      setIsAuctionOrgDisabled(false);
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
      // Tối ưu: Gọi song song và pass profiles vào fetchBids để tránh duplicate call
      const [sessionResponse, bidsResponse] = await Promise.all([
        getAuctionSessionById(sessionId),
        getBidsBySessionId(sessionId),
      ]);
      
      if (sessionResponse && sessionResponse.status && sessionResponse.session) {
        const session = sessionResponse.session;
        const profiles = session.profiles || [];
        
        // Xử lý bids với profiles đã có
        let processedBids = [];
        if (bidsResponse && bidsResponse.status && Array.isArray(bidsResponse.bids)) {
          processedBids = bidsResponse.bids.map((bid) => {
            const profile = profiles.find((p) => p.user_id === bid.user_id);
            const userName = profile ? profile.user.full_name : 'Không xác định';
            return {
              id: bid.id,
              userId: bid.user_id,
              amount: Number(bid.amount).toLocaleString('vi-VN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }),
              createdAt: bid.bid_time
                ? moment.tz(bid.bid_time, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')
                : 'Không có thời gian',
              userName,
              originalAmount: Number(bid.amount),
            };
          }).sort((a, b) => b.originalAmount - a.originalAmount);
        }
        
        const transformedSession = transformSession(session);
        transformedSession.bids = processedBids;
        setSelectedSession(transformedSession);
        setShowViewModal(true);
      } else {
        setError('Không tìm thấy phiên đấu giá hoặc dữ liệu không hợp lệ.');
      }
    } catch (error) {
      console.error('Error fetching session details or bids:', error);
      if (error.response && error.response.status === 401) {
        // Đã được xử lý bởi interceptor
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
const handleConfirmWinner = async (sessionId) => {
  if (!token) {
    alert('Vui lòng đăng nhập để thực hiện hành động này.');
    return;
  }

  const result = await Swal.fire({
    title: 'Xác nhận người thắng cuộc?',
    text: 'Hành động này không thể hoàn tác.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#28a745',
  });

  if (!result.isConfirmed) return;

  try {
    setLoading(true);
    await confirmWinner(sessionId);
    Swal.fire('Thành công!', 'Người thắng cuộc đã được xác nhận.', 'success');
    await refreshData();
    closeViewModal();
  } catch (error) {
    console.error('Error confirming winner:', error);
    const msg = error.response?.data?.message || error.message || 'Không thể xác nhận.';
    Swal.fire('Lỗi!', msg, 'error');
  } finally {
    setLoading(false);
  }
};

const handleRejectWinner = async (sessionId) => {
  if (!token) {
    alert('Vui lòng đăng nhập để thực hiện hành động này.');
    return;
  }

  const { value: reason } = await Swal.fire({
    title: 'Từ chối người thắng cuộc',
    input: 'textarea',
    inputLabel: 'Lý do từ chối (bắt buộc)',
    inputPlaceholder: 'Nhập lý do chi tiết...',
    inputAttributes: {
      required: true,
    },
    showCancelButton: true,
    confirmButtonText: 'Gửi từ chối',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#dc3545',
    preConfirm: (value) => {
      const trimmed = value?.trim();
      if (!trimmed || trimmed.length < 10) {
        Swal.showValidationMessage('Lý do phải có ít nhất 10 ký tự');
        return false;
      }
      return trimmed;
    },
  });

  if (!reason) return;

  try {
    setLoading(true);
    await rejectWinner(sessionId, reason); // Gửi lý do
    Swal.fire('Thành công!', 'Đã từ chối người thắng cuộc.', 'success');
    await refreshData();
    closeViewModal();
  } catch (error) {
    console.error('Error rejecting winner:', error);
    const msg = error.response?.data?.message || error.message || 'Không thể từ chối.';
    Swal.fire('Lỗi!', msg, 'error');
  } finally {
    setLoading(false);
  }
};

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bidStep' || name === 'highestBid') {
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
      if (!sessionForm.item) {
        throw new Error('Vui lòng chọn tài sản.');
      }
      if (!sessionForm.auctionOrgId || isNaN(parseInt(sessionForm.auctionOrgId))) {
        throw new Error('Vui lòng chọn tổ chức đấu giá.');
      }
      if (!sessionForm.bidStep || isNaN(parseInt(sessionForm.bidStep.replace(/[^\d]/g, '')))) {
        throw new Error('Bước giá phải là số dương.');
      }
      const formData = {
        item_id: parseInt(sessionForm.item),
        created_by: parseInt(sessionForm.creator),
        start_time: sessionForm.startTime || null,
        end_time: sessionForm.endTime || null,
        regulation: sessionForm.regulation,
        status: 'Mo',
        method: sessionForm.method,
        auction_org_id: parseInt(sessionForm.auctionOrgId),
        auctioneer_id: sessionForm.auctioneerId ? parseInt(sessionForm.auctioneerId) : null,
        register_start: sessionForm.registerStart || null,
        register_end: sessionForm.registerEnd || null,
        checkin_time: sessionForm.checkinTime || null,
        bid_start: sessionForm.bidStart || null,
        bid_end: sessionForm.bidEnd || null,
        bid_step: sessionForm.bidStep ? Number(sessionForm.bidStep.replace(/[^\d]/g, '')) : null,
        highest_bid: sessionForm.highestBid ? Number(sessionForm.highestBid.replace(/[^\d]/g, '')) : null,
        current_winner_id: null,
        starting_price: sessionForm.starting_price
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
      if (modalMode === 'edit' && selectedSession) {
        await updateAuctionSession(selectedSession.id, formData);
        alert('Cập nhật phiên đấu giá thành công!');
      } else {
        await createAuctionSession(formData);
        alert('Tạo phiên đấu giá thành công! Hợp đồng điện tử đã được tạo tự động');
      }
      // Clear cache và refresh data
      clearUsersCache();
      await refreshData();
      closeSessionModal();
    } catch (error) {
      console.error('Error saving session:', error);
      if (error.response && error.response.status === 401) {
        // Đã được xử lý bởi interceptor
      } else if (error.response && error.response.status === 403) {
        alert('Bạn không có quyền truy cập. Vui lòng liên hệ admin để kiểm tra vai trò (DauGiaVien hoặc Administrator).');
      } else {
        alert('Có lỗi xảy ra khi lưu phiên đấu giá: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, status) => {
    // Bảo vệ: Không cho xóa nếu đang diễn ra hoặc kết thúc
    if (status === 'Đang diễn ra' || status === 'Kết thúc') {
      const warningResult = window.Swal ?
        await Swal.fire({
          icon: 'warning',
          title: 'Không thể xóa',
          text: 'Phiên đấu giá đang diễn ra hoặc đã kết thúc, không thể xóa.',
          confirmButtonText: 'Đã hiểu',
          allowOutsideClick: true,
        }) :
        { isConfirmed: window.confirm('Không thể xóa phiên đang diễn ra hoặc đã kết thúc. OK?') };
      return; // Dừng luôn, không cần confirm thêm
    }
    // Fallback nếu không dùng Swal
    const confirmResult = window.Swal ?
      await Swal.fire({
        title: 'Xác nhận xóa?',
        text: 'Phiên đấu giá và toàn bộ hợp đồng liên quan sẽ bị xóa vĩnh viễn!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa ngay',
        cancelButtonText: 'Hủy bỏ',
        confirmButtonColor: '#d33',
      }) :
      { isConfirmed: window.confirm('Bạn có chắc muốn xóa phiên này? Phiên đấu giá và toàn bộ hợp đồng liên quan sẽ bị xóa!') };
    if (!confirmResult.isConfirmed) return;
    setLoading(true);
    setError(null); // Clear error trước khi thử
    try {
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
      }
      // Xóa phiên đấu giá và các hợp đồng liên quan
      await deleteAuctionSession(sessionId);
      // Success feedback
      if (window.Swal) {
        Swal.fire({
          icon: 'success',
          title: 'Xóa thành công!',
          text: 'Phiên đấu giá và hợp đồng liên quan đã được xóa.',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        alert('Xóa phiên đấu giá thành công!');
      }
      // Clear cache và refresh data
      clearUsersCache();
      await refreshData();
    } catch (error) {
      console.error('Error deleting session:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Không thể xóa phiên đấu giá này.';
     
      if (error.response && error.response.status === 401) {
        // Đã được xử lý bởi interceptor
      } else if (error.response && error.response.status === 403) {
        alert('Bạn không có quyền truy cập. Vui lòng liên hệ admin để kiểm tra vai trò (DauGiaVien hoặc Administrator).');
      } else {
        if (window.Swal) {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi khi xóa!',
            text: errorMsg,
          });
        } else {
          alert(`Có lỗi xảy ra khi xóa phiên đấu giá: ${errorMsg}`);
        }
      }
    } finally {
      setLoading(false);
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
    const isDeletable = session.status === 'Chưa bắt đầu'; // Chỉ cho phép xóa nếu chưa bắt đầu
    if (session.status === 'Chưa bắt đầu') {
      buttons.push(
        <button
          key="edit"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => openSessionModal('edit', session)}
          aria-label="Chỉnh sửa phiên"  // FIXED: Accessibility
        >
          <i className="fa fa-pencil" aria-hidden="true"></i>
        </button>
      );
    }
    buttons.push(
      <button
        key="delete"
        className={`${styles.btn} ${styles.btnDanger}`}
        onClick={() => handleDeleteSession(session.id, session.status)} // Truyền status vào hàm
        disabled={!isDeletable}
        title={
          !isDeletable
            ? 'Không thể xóa phiên đang diễn ra hoặc đã kết thúc'
            : 'Xóa bỏ phiên đấu giá'
        }
        style={{
          opacity: !isDeletable ? 0.5 : 1,
          cursor: !isDeletable ? 'not-allowed' : 'pointer',
          pointerEvents: !isDeletable ? 'none' : 'auto', // Tăng cường disable
        }}
        aria-label={!isDeletable ? 'Nút xóa bị vô hiệu hóa' : 'Xóa phiên đấu giá'}  // FIXED: Accessibility
      >
        <i className="fa fa-trash" aria-hidden="true"></i>
      </button>
    );
    buttons.push(
      <button
        key="view"
        className={`${styles.btn} ${styles.btnSuccess}`}
        onClick={() => openViewModal(session.id)}
        aria-label="Xem chi tiết phiên"  // FIXED: Accessibility
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
        <Loading />
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
              <th>Giá khởi điểm</th>
              <th>Thời gian bắt đầu</th>
              <th>Thời gian kết thúc</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentSessions.map((session) => (
              <tr key={session.id}>
                <td data-label="Mã Phiên">{session.id}</td>
                <td data-label="Tài sản">{session.item}</td>
                <td data-label="Người tạo">{session.creator}</td>
                <td data-label="Giá khởi điểm">
                  {Number(session.starting_price).toLocaleString('vi-VN')} ₫
                </td>
                <td data-label="Thời gian bắt đầu">{session.startTime}</td>
                <td data-label="Thời gian kết thúc">{session.endTime}</td>
                <td data-label="Trạng thái">
                  <span className={`${styles.statusBadge} ${styles[session.statusClass]}`}>
                    {session.status}
                  </span>
                </td>
                <td data-label="Hành động">
                  <div className={styles.actionButtons}>
                    {getActionButtons(session)}
                    {session.status === 'Đang diễn ra' && (
                      <Link to={`../admin/showauction/${session.id}`} style={{ textDecoration: 'none' }}>
                        <button aria-label="Xem đấu giá đang diễn ra">  {/* FIXED: Accessibility */}
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
                <input type="hidden" name="creator" value={sessionForm.creator} />
              </div>
              <div>
                <label htmlFor="auctionOrgId">Tổ chức đấu giá</label>
                <select
                  id="auctionOrgId"
                  name="auctionOrgId"
                  value={sessionForm.auctionOrgId}
                  onChange={handleFormChange}
                  disabled={isAuctionOrgDisabled}
                  style={isAuctionOrgDisabled ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                >
                  <option value="">Chọn tổ chức đấu giá</option>
                  {isLoadingAuctionOrgs ? (
                    <option value="" disabled>
                      Đang tải tổ chức đấu giá...
                    </option>
                  ) : auctionOrgs.length > 0 ? (
                    auctionOrgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Không có tổ chức đấu giá
                    </option>
                  )}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Đấu giá viên:</label>
                <select
                  name="auctioneerId"
                  value={sessionForm.auctioneerId}
                  onChange={handleFormChange}
                >
                  <option value="">-- Chọn đấu giá viên --</option>
                  {auctioneers.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
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
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveSession} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>  {/* NEW: Disable khi loading */}
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
              <div className={styles.viewGroup}>
                <label>Đấu giá viên:</label>
                <p>{selectedSession.auctioneerName}</p>
              </div>
              <p><strong>Thời gian bắt đầu:</strong> {selectedSession.startTime}</p>
              <p><strong>Thời gian kết thúc:</strong> {selectedSession.endTime}</p>
              <p><strong>Trạng thái:</strong> {selectedSession.status}</p>
              <p><strong>Phương thức:</strong> {selectedSession.method}</p>
              <p><strong>Tổ chức đấu giá ID:</strong> {selectedSession.auctionOrgId || 'Chưa có'}</p>
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
              {selectedSession.status === 'Kết thúc' && selectedSession.confirm_winner_at && (
                <p><strong>Thời gian xác nhận thắng:</strong> {moment.tz(selectedSession.confirm_winner_at, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')}</p>
              )}
              {selectedSession.status === 'Kết thúc' && selectedSession.reject_winner_at && (
                <p><strong>Thời gian từ chối:</strong> {moment.tz(selectedSession.reject_winner_at, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')}</p>
              )}
              {selectedSession.status === 'Kết thúc' && selectedSession.rejected_reason && (
                <p><strong>Lý do từ chối:</strong> {selectedSession.rejected_reason}</p>
              )}
              {selectedSession.status === 'Kết thúc' &&
                selectedSession.currentWinnerId &&
                selectedSession.currentWinnerId !== 'Chưa có' &&
                !selectedSession.confirm_winner_at &&
                !selectedSession.reject_winner_at &&
                (
                  <div style={{ marginTop: '10px', marginBottom: '10px', display: 'flex', gap: '10px' }}>
                    <button
                      className={`${styles.btn} ${styles.btnSuccess}`}
                      onClick={() => handleConfirmWinner(selectedSession.id)}
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Xác nhận người thắng'}
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnDanger}`}
                      onClick={() => handleRejectWinner(selectedSession.id)}
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Từ chối người thắng'}
                    </button>
                  </div>
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