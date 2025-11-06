import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Loading from '../components/Loading';
import './detail.css';

const Detail = () => {
  // Constants
  const API_BASE = `${process.env.REACT_APP_API_URL}`;
  const { id } = useParams();
  const navigate = useNavigate();
  const DEFAULT_SESSION_ID = parseInt(id, 10);
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const PLACEHOLDER_IMAGE = '';
  const AA_STORAGE_PATH = '';  // Cleaned up from 'var aa'

  // State variables
  const [auctionItem, setAuctionItem] = useState({});
  const [imagesFromApi, setImagesFromApi] = useState([]);
  const [profile, setProfile] = useState({ status: 'ChoDuyet', id: null });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [numImages, setNumImages] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deposit, setDeposit] = useState('');
  const [hasSubmittedProfile, setHasSubmittedProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showCheckinOverlay, setShowCheckinOverlay] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  // Removed unused successMessage state
  const [countdown, setCountdown] = useState('00:00:00');
  const [nextEvent, setNextEvent] = useState({ type: '', label: '' });
  const [depositError, setDepositError] = useState('');
  const socketRef = useRef(null);

  // Utility Functions
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  }, []);

  const formatPrice = useCallback((p) => 
    isNaN(p) ? 'N/A' : Number(p).toLocaleString('vi-VN') + ' VNĐ'
  , []);

  const formatDateTime = useCallback((dt) =>
    dt
      ? new Date(dt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
      : 'Chưa xác định'
  , []);

  const formatCountdown = useCallback((seconds, label = '') => {
    if (seconds <= 0)
      return `Đã ${label ? `bắt đầu ${label}` : 'kết thúc'}!`;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (days > 0) {
      return `Còn ${days} ngày ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')} đến ${label}`;
    }
    return `Còn ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')} đến ${label}`;
  }, []);

  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = options.headers || {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    options.headers = headers;
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await res.json()
        : await res.text();
      if (!res.ok) {
        throw Object.assign(new Error('API error'), { response: res, data });
      }
      return data;
    } catch (e) {
      console.error('API Fetch Error:', e, e.response?.status, e.data);
      throw e;
    }
  }, [token]);

  // Socket.io Integration
  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join.channel', `auction-session.${DEFAULT_SESSION_ID}`);
      socket.emit('join.channel', 'auction-profiles');
    });

    socket.on('disconnect', (reason) => {
      // Optional retry logic
      setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit('join.channel', `auction-session.${DEFAULT_SESSION_ID}`);
          socketRef.current.emit('join.channel', 'auction-profiles');
        }
      }, 2000);
    });

    socket.on('profile.updated', (profileData) => {
      const updatedProfile = profileData.profile || profileData;
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (currentUser && updatedProfile.user_id === (currentUser.id || currentUser.user_id)) {
        setProfile({ id: updatedProfile.profile_id, status: updatedProfile.status });
        localStorage.setItem('profile_id', updatedProfile.profile_id.toString());
        if (updatedProfile.status === 'DaThanhToan') {
          setShowRegisterModal(true);
          showToast('Thanh toán đặt cọc thành công! Hãy hoàn tất thủ tục.', 'success');
        } else if (updatedProfile.status === 'DaDuyet') {
          showToast('Hồ sơ của bạn đã được duyệt!', 'success');
        } else if (updatedProfile.status === 'BiTuChoi' || updatedProfile.status === 'TuChoi') {
          setHasSubmittedProfile(false);
          showToast('Hồ sơ của bạn bị từ chối. Vui lòng đăng ký lại.', 'error');
        }
      }
    });

    socket.on('auction.session.updated', (updatedData) => {
      const updatedSession = updatedData.session || updatedData;
      if (updatedSession.session_id === DEFAULT_SESSION_ID) {
        setAuctionItem((prev) => ({
          ...prev,
          ...updatedSession,
          item: { ...prev?.item, ...updatedSession.item },
          profiles: updatedSession.profiles || prev?.profiles,
          documents: updatedSession.documents || prev?.documents,
        }));
        const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (currentUser && updatedSession.profiles) {
          const userId = currentUser.id || currentUser.user_id;
          const myProfile = updatedSession.profiles.find(
            (p) => p.user_id === userId || (p.user && (p.user.id === userId || p.user.user_id === userId))
          );
          if (myProfile) {
            const profileId = myProfile.profile_id ?? myProfile.id;
            const profileStatus = myProfile.status || 'ChoDuyet';
            setProfile({ id: profileId, status: profileStatus });
            if (profileId != null) {
              localStorage.setItem('profile_id', profileId.toString());
            }
            if (profileStatus === 'BiTuChoi' || profileStatus === 'TuChoi') {
              setHasSubmittedProfile(false);
              showToast('Hồ sơ của bạn bị từ chối. Vui lòng đăng ký lại.', 'error');
            } else if (profileStatus === 'DaDuyet') {
              showToast('Hồ sơ của bạn đã được duyệt!', 'success');
            }
          }
        }
      }
    });

    socket.on('error', (err) => {
      showToast('Lỗi kết nối Socket.io', 'error');
    });

    return () => {
      socket.emit('leave.channel', `auction-session.${DEFAULT_SESSION_ID}`);
      socket.emit('leave.channel', 'auction-profiles');
      socket.off('profile.updated');
      socket.off('auction.session.updated');
      socket.disconnect();
    };
  }, [DEFAULT_SESSION_ID, showToast]);

  // Auction Data Functions
  const fetchAuctionData = useCallback(async (sessionId) => {
    try {
      const data = await apiFetch(`${API_BASE}/auction-sessions/${sessionId}`, { method: 'GET' });
      return data.session ? data : { status: true, session: data };
    } catch (e) {
      console.error('❌ Lỗi fetch auction data:', e);
      return null;
    }
  }, [apiFetch]);

  const populateData = useCallback((apiData) => {
    if (!apiData || !apiData.session) return;
    
    const session = apiData.session;
    const newAuctionItem = {
      item: session.item || {},
      auction_org: session.auction_org || {},
      method: session.method || session.auction_method || '',
      register_start: session.register_start,
      register_end: session.register_end,
      checkin_time: session.checkin_time,
      bid_start: session.bid_start,
      bid_end: session.bid_end,
      bid_step: session.bid_step,
      highest_bid: session.highest_bid,
      session_status: session.status,
      session_id: session.session_id || session.id,
      profiles: session.profiles || [],
      documents: session.documents || [],
    };

    setAuctionItem(newAuctionItem);

    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUser) {
      const userId = currentUser.id || currentUser.user_id;
      const myProfile = newAuctionItem.profiles.find(
        (p) => p.user_id === userId || (p.user && (p.user.id === userId || p.user.user_id === userId))
      );

      if (myProfile) {
        const profileId = myProfile.profile_id ?? myProfile.id;
        const profileStatus = myProfile.status || 'ChoDuyet';
        setProfile({ id: profileId, status: profileStatus });
        if (profileId != null) {
          localStorage.setItem('profile_id', profileId.toString());
        }
        if (profileStatus === 'BiTuChoi' || profileStatus === 'TuChoi') {
          setHasSubmittedProfile(false);
        }
      } else {
        setProfile({ id: null, status: 'ChoDuyet' });
        setHasSubmittedProfile(false);
      }
    }

    // Removed old images logic - handled in separate useEffect now
  }, []);

  const calculateNextEvent = useCallback(() => {
    if (!auctionItem.register_start) return { time: 0, label: '', type: 'loading' };
    
    const now = Date.now() / 1000;
    const regStart = new Date(auctionItem.register_start || 0).getTime() / 1000;
    const regEnd = new Date(auctionItem.register_end || 0).getTime() / 1000;
    const checkinTime = new Date(auctionItem.checkin_time || 0).getTime() / 1000;
    const bidStart = new Date(auctionItem.bid_start || 0).getTime() / 1000;
    const bidEnd = new Date(auctionItem.bid_end || 0).getTime() / 1000;

    if (now < regStart)
      return { time: Math.max(0, regStart - now), label: 'mở đăng ký', type: 'register' };
    if (now <= regEnd)
      return { time: Math.max(0, regEnd - now), label: 'kết thúc đăng ký', type: 'register' };
    if (now < checkinTime)
      return { time: Math.max(0, checkinTime - now), label: 'điểm danh', type: 'checkin' };
    if (now < bidStart)
      return { time: Math.max(0, bidStart - now), label: 'đấu giá', type: 'bid' };
    if (now <= bidEnd)
      return { time: Math.max(0, bidEnd - now), label: 'kết thúc đấu giá', type: 'bid' };
    return { time: 0, label: '', type: 'ended' };
  }, [auctionItem]);

  useEffect(() => {
    const updateCountdown = () => {
      const next = calculateNextEvent();
      setCountdown(formatCountdown(next.time, next.label));
      setNextEvent(next);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [auctionItem, calculateNextEvent, formatCountdown]);

  const getStatusMessage = useCallback(() => {
    const now = new Date();
    const regStart = new Date(auctionItem.register_start || 0);
    const regEnd = new Date(auctionItem.register_end || 0);
    const checkin = new Date(auctionItem.checkin_time || 0);
    const bidStart = new Date(auctionItem.bid_start || 0);
    const bidEnd = new Date(auctionItem.bid_end || 0);

    let msg = '';

    if (profile.id && profile.status !== 'ChoDuyet') {
      switch (profile.status) {
        case 'DaThanhToan':
          msg = 'Đăng ký thành công: Chờ Duyệt';
          break;
        case 'DaDuyet':
          msg = 'Đã duyệt: chờ điểm danh';
          break;
        case 'BiTuChoi':
        case 'TuChoi':
          msg = 'Hồ sơ bị từ chối';
          break;
        default:
          msg = `Trạng thái hồ sơ: ${profile.status}`;
          break;
      }
    } else {
      if (now < regStart) {
        msg = 'Sắp mở đăng ký';
      } else if (now >= regStart && now <= regEnd)
        msg = 'Đang mở đăng ký';
      else if (now > regEnd && now < checkin)
        msg = 'Đã đóng đăng ký, chờ điểm danh';
      else if (now >= checkin && now < bidStart)
        msg = 'Đang điểm danh';
      else if (now >= bidStart && now <= bidEnd)
        msg = 'Đang đấu giá';
      else if (now > bidEnd)
        msg = 'Kết thúc';
    }

    return msg;
  }, [auctionItem, profile]);

  const getNoticeMessage = useCallback(() => {
    if (profile.id && profile.status !== 'ChoDuyet') {
      switch (profile.status) {
        case 'DaThanhToan':
          return 'Hồ sơ của bạn đã được nộp và thanh toán đặt cọc. Chờ chuyên viên duyệt.';
        case 'DaDuyet':
          return 'Hồ sơ đã được duyệt. Vui lòng điểm danh trước khi phiên đấu giá bắt đầu.';
        case 'BiTuChoi':
        case 'TuChoi':
          return 'Hồ sơ không đạt yêu cầu. Vui lòng kiểm tra và đăng ký lại.';
        default:
          return 'Liên hệ hỗ trợ nếu cần.';
      }
    }
    return auctionItem.item?.description || 'Vui lòng kiểm tra thông tin cẩn thận trước khi tham gia.';
  }, [auctionItem, profile]);

  const getButtonVisibility = useCallback(() => {
    const now = Date.now() / 1000;
    const regStart = new Date(auctionItem.register_start || 0).getTime() / 1000;
    const regEnd = new Date(auctionItem.register_end || 0).getTime() / 1000;
    const checkinStart = new Date(auctionItem.checkin_time || 0).getTime() / 1000;
    const bidStart = new Date(auctionItem.bid_start || 0).getTime() / 1000;
    const bidEnd = new Date(auctionItem.bid_end || 0).getTime() / 1000;

    let showRegister = false;
    if (profile.id) {
      if (profile.status === 'BiTuChoi' || profile.status === 'TuChoi') {
        showRegister = true;
      } else if (profile.status === 'DaDuyet' || profile.status === 'DaThanhToan') {
        showRegister = false;
      }
    } else {
      showRegister = now >= regStart && now <= regEnd;
    }

    let showCheckin = false;
    let showBid = false;
    if (profile.id && profile.status !== 'ChoDuyet') {
      // Chỉ hiện nút điểm danh nếu đã duyệt và trong thời gian điểm danh (trước khi đấu giá bắt đầu)
      showCheckin = profile.status === 'DaDuyet' && now >= checkinStart && now < bidStart;
      
      // Hiện nút đấu giá nếu đã duyệt và đã đến giờ đấu giá
      showBid = (profile.status === 'DaDuyet' || profile.status === 'DaHoanTat') && now >= bidStart && now <= bidEnd;
    }

    return { showRegister, showCheckin, showBid };
  }, [auctionItem, profile]);

  const { showRegister, showCheckin, showBid } = getButtonVisibility();

  const updateDepositHint = useCallback(() => {
    const startingPrice = parseFloat(auctionItem.item?.starting_price) || 0;
    const min = startingPrice * 0.05;
    const max = startingPrice * 0.2;
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  }, [auctionItem, formatPrice]);

  const validateDeposit = useCallback(
    (value) => {
      const startingPrice = parseFloat(auctionItem.item?.starting_price) || 0;
      const min = startingPrice * 0.05;
      const max = startingPrice * 0.2;
      const val = parseFloat(value.replace(/\./g, '')) || 0;
      if (val < min) {
        return `Tối thiểu: ${formatPrice(min)}`;
      }
      if (val > max) {
        return `Tối đa: ${formatPrice(max)}`;
      }
      return '';
    },
    [auctionItem, formatPrice]
  );

  const handleDepositInput = (e) => {
    const raw = e.target.value.replace(/\./g, '');
    const num = parseFloat(raw) || 0;
    const formatted = num.toLocaleString('vi-VN');
    setDeposit(formatted);
    setDepositError(validateDeposit(raw));
  };

  const submitProfile = async () => {
    if (!token) {
      showToast('Vui lòng đăng nhập trước!', 'error');
      navigate('/login');
      return;
    }

    if (selectedFiles.length === 0) {
      showToast('Vui lòng chọn 1 file hồ sơ', 'warning');
      return;
    }

    const depositAmount = deposit.replace(/\./g, '');
    const depositValidation = validateDeposit(depositAmount);
    if (depositValidation) {
      showToast('Số tiền đặt cọc không hợp lệ', 'warning');
      return;
    }

    try {
      const fd = new FormData();
      fd.append('session_id', DEFAULT_SESSION_ID.toString());
      fd.append('document_url', selectedFiles[0]);
      fd.append('deposit_amount', parseFloat(depositAmount));

      console.log('FormData contents:');
      const res = await fetch(`${API_BASE}/auction-profiles`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: fd,
      });

      const data = await res.json();
      console.log('API Response:', data);

      if (res.ok && data.status) {
        if (data.profile && data.profile.status) {
          setProfile({
            id: data.profile.profile_id || data.profile.id,
            status: data.profile.status,
          });
          localStorage.setItem('profile_id', (data.profile.profile_id || data.profile.id).toString());
        }
        setHasSubmittedProfile(true);
        showToast('Submit hồ sơ thành công! Bây giờ hãy thanh toán đặt cọc.', 'success');
        setSelectedFiles([]);
        await refreshAuctionData(DEFAULT_SESSION_ID);
      } else {
        const errorMsg =
          data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'Submit thất bại');
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('❌ Lỗi submit profile:', err, 'Status:', err.response?.status, 'Data:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi server khi submit';
      showToast(errorMsg, 'error');
    }
  };

  const payDeposit = async () => {
    if (!profile.id) {
      showToast('Bạn phải submit hồ sơ trước khi thanh toán deposit', 'warning');
      return;
    }

    const depositAmount = parseFloat(deposit.replace(/\./g, ''));
    if (isNaN(depositAmount) || depositAmount <= 0) {
      showToast('Deposit không hợp lệ', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/deposit/pay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          profile_id: profile.id,
          amount: depositAmount,
          receiver_id: auctionItem.auction_org?.user_id || 1,
          session_id: DEFAULT_SESSION_ID,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const errorDetail = data.errors
          ? Object.values(data.errors).flat().join(', ')
          : data.message;
        throw new Error(errorDetail || 'Lỗi thanh toán');
      }

      if (data.status && data.payment_url) {
        localStorage.setItem('pending_profile_id', profile.id.toString());
        window.location.href = data.payment_url;
      } else {
        throw new Error('Không lấy được URL thanh toán');
      }
    } catch (err) {
      console.error('❌ Lỗi pay deposit:', err);
      showToast(err.message, 'error');
      localStorage.removeItem('pending_profile_id');  // Clear on error
    }
  };

  const completeProcedure = async () => {
    if (!profile.id) {
      showToast('Không tìm thấy hồ sơ', 'error');
      return;
    }

    try {
      const res = await apiFetch(`${API_BASE}/auction-profiles/${profile.id}/complete`, {
        method: 'POST',
      });
      if (res.success || res.status) {
        setProfile((prev) => ({ ...prev, status: 'DaHoanTat' }));
        showToast('Hoàn tất thủ tục thành công!', 'success');
        setShowRegisterModal(false);
        setHasSubmittedProfile(false);
        await refreshAuctionData(DEFAULT_SESSION_ID);
      } else {
        throw new Error(res.message || 'Hoàn tất thất bại');
      }
    } catch (err) {
      console.error('❌ Lỗi complete procedure:', err);
      showToast(err.message || 'Lỗi hoàn tất thủ tục', 'error');
    }
  };

  // Xử lý tham gia đấu giá
  const handleJoinAuction = () => {
    if (!token) {
      showToast('Vui lòng đăng nhập trước!', 'error');
      navigate('/login');
      return;
    }

    if (!profile.id) {
      showToast('Bạn chưa đăng ký tham gia đấu giá', 'warning');
      return;
    }

    if (profile.status !== 'DaDuyet' && profile.status !== 'DaHoanTat') {
      showToast('Hồ sơ của bạn chưa được duyệt', 'warning');
      return;
    }

    // Chuyển hướng đến phòng đấu giá
    navigate(`/Auction/${DEFAULT_SESSION_ID}`);
  };

  // Xử lý điểm danh
  const handleCheckin = () => {
    if (!token) {
      showToast('Vui lòng đăng nhập trước!', 'error');
      navigate('/login');
      return;
    }

    if (!profile.id) {
      showToast('Bạn chưa đăng ký tham gia đấu giá', 'warning');
      return;
    }

    if (profile.status !== 'DaDuyet') {
      showToast('Hồ sơ của bạn chưa được duyệt', 'warning');
      return;
    }

    // Nếu đã duyệt, hiển thị overlay và chuyển hướng
    setShowCheckinOverlay(true);
    showToast('Điểm danh thành công!', 'success');
    setTimeout(() => {
      setShowCheckinOverlay(false);
      navigate(`/Auction/${DEFAULT_SESSION_ID}`);
    }, 1000);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 1) {
      showToast('Chỉ được chọn 1 file duy nhất', 'warning');
      e.target.value = '';
      setSelectedFiles([]);
      return;
    }
    const file = files[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      showToast(`File ${file.name} không hợp lệ (chỉ PDF/DOC/DOCX)`, 'warning');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast(`File ${file.name} quá lớn (>2MB)`, 'warning');
      e.target.value = '';
      return;
    }

    setSelectedFiles([file]);
  };

  // Fixed changeImage with guard
  const changeImage = (index) => {
    const safeIndex = Math.max(0, Math.min(index, numImages - 1));
    setCurrentImageIndex(safeIndex);
  };

  const refreshAuctionData = useCallback(
    async (sessionId) => {
      const data = await fetchAuctionData(sessionId);
      if (data) populateData(data);
    },
    [fetchAuctionData, populateData]
  );

  const refreshProfileStatus = useCallback(
    async (profileId) => {
      try {
        const res = await apiFetch(`${API_BASE}/auction-profiles/${profileId}`);
        if (res && res.status) {
          setProfile((prev) => ({ ...prev, status: res.status }));
          if (res.status === 'DaThanhToan' || res.status === 'DaHoanTat') {
            if (!showRegisterModal) {
              setShowRegisterModal(true);
            }
            showToast('Thanh toán thành công! Hãy hoàn tất thủ tục.', 'success');
          }
        }
      } catch (err) {
        console.error('❌ Lỗi refresh profile status:', err);
      }
    },
    [apiFetch, showRegisterModal, showToast]
  );

  // Fixed images fetch useEffect
  useEffect(() => {
    if (auctionItem?.item?.item_id) {
      fetch(`${process.env.REACT_APP_API_URL}auction-items/${auctionItem.item.item_id}/images`)
        .then((res) => res.json())
        .then((data) => {
          console.log('Images loaded:', data?.data?.length || 0);  // Debug log
          if (data?.data?.length > 0) {
            setImagesFromApi(data.data);
          } else {
            setImagesFromApi([]);
          }
        })
        .catch((err) => {
          console.error("Lỗi khi tải hình ảnh:", err);
          setImagesFromApi([]);
        });
    } else {
      setImagesFromApi([]);
    }
  }, [auctionItem?.item?.item_id]);

  // New useEffect to sync numImages
  useEffect(() => {
    let totalImages = 0;
    if (imagesFromApi.length > 0) {
      totalImages = imagesFromApi.length;
    } else {
      // Fallback: dùng auctionItem nếu API fetch empty
      const fallbackImages = auctionItem.item?.images 
        ? auctionItem.item.images.filter(img => img.url || img).length 
        : 1;  // Ít nhất 1 placeholder
      totalImages = fallbackImages;
    }
    setNumImages(totalImages);

    // Reset index nếu vượt quá (e.g., fetch thêm ảnh)
    if (currentImageIndex >= totalImages) {
      setCurrentImageIndex(0);
    }
  }, [imagesFromApi, auctionItem.item]);

  // Fixed getMainImage
  const getMainImage = () => {
    const basePath = `${process.env.REACT_APP_BASE_URL}${AA_STORAGE_PATH}`;
    if (imagesFromApi.length > 0 && imagesFromApi[currentImageIndex]) {
      return `${basePath}${imagesFromApi[currentImageIndex].image_url}`;
    }
    // Fallback: single image từ auctionItem hoặc placeholder
    const fallbackImg = auctionItem.item?.image_url || PLACEHOLDER_IMAGE;
    return `${basePath}${fallbackImg}`;
  };

  // Fixed renderThumbnails
  const renderThumbnails = () => {
    const basePath = `${process.env.REACT_APP_BASE_URL}${AA_STORAGE_PATH}`;
    if (imagesFromApi.length === 0) {
      // Fallback thumbnail nếu empty
      const fallbackImg = auctionItem.item?.image_url || PLACEHOLDER_IMAGE;
      return (
        <img
          src={`${basePath}${fallbackImg}`}
          className={`detailsp-thumbnail detailsp-active`}
          alt="Thumbnail 1"
        />
      );
    }

    return imagesFromApi.map((img, i) => (
      <img
        key={i}
        src={`${basePath}${img.image_url}`}
        className={`detailsp-thumbnail ${i === currentImageIndex ? "detailsp-active" : ""}`}
        alt={`Thumbnail ${i + 1}`}
        onClick={() => changeImage(i)}
      />
    ));
  };

  const renderDocuments = () => {
    const docs = auctionItem.documents?.length > 0 ? auctionItem.documents : auctionItem.profiles;
    if (!docs || docs.length === 0) {
      return <li>Chưa có hồ sơ khách</li>;
    }

    return docs.map((doc, i) => (
      <li key={i} className='detailsp-document-item'>
        <strong>{i + 1}. {doc.name || doc.user?.full_name || doc.user_name || 'Tài liệu'}</strong>
        <br />
        <small>
          Trạng thái: {doc.status || 'Chưa rõ'}. Đặt cọc: {formatPrice(doc.deposit_amount || 0)}
        </small>
        <br />
        {doc.document_url ? (
          <a href={`${process.env.REACT_APP_BASE_URL}${doc.document_url}`} download className='detailsp-download-link'>
            Tải hồ sơ
          </a>
        ) : doc.url ? (
          <a href={`${process.env.REACT_APP_BASE_URL}${doc.url}`} download className='detailsp-download-link'>
            Tải xuống
          </a>
        ) : null}
      </li>
    ));
  };

  // Init useEffect
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      const data = await fetchAuctionData(DEFAULT_SESSION_ID);
      if (data) {
        populateData(data);
        setError(false);
      } else {
        setError(true);
      }

      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      if (paymentStatus === 'success') {
        const profileId = localStorage.getItem('pending_profile_id') || localStorage.getItem('profile_id');
        if (profileId) {
          await refreshProfileStatus(parseInt(profileId));
          localStorage.removeItem('pending_profile_id');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'failed') {
        showToast('Thanh toán thất bại', 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      setLoading(false);
    };

    init();
  }, [DEFAULT_SESSION_ID, fetchAuctionData, populateData, refreshProfileStatus, showToast]);

  if (loading) {
    return (
      <div className='detailsp-container'>
        <div className='detailsp-loading'><Loading message="Đang tải dữ liệu..." /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='detailsp-container'>
        <div className='detailsp-error-message'>
          <p>Lỗi tải dữ liệu(có thể do CORS hoặc server không chạy). Vui lòng kiểm tra và thử lại.</p>
          <button className='detailsp-retry-btn' onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='detailsp-container'>
      {toast.show && (
        <div className={`detailsp-toast detailsp-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className='detailsp-auction-content'>
        <h2 className=''>
          {`${auctionItem.item?.name || ''}`}
        </h2>
        <p>{`${auctionItem.item?.description || ''}`}</p>
        <div className='detailsp-content-wrapper'>
          {/* Fixed Image Section JSX */}
          <div className='detailsp-image-section'>
            <img 
              className='detailsp-main-image' 
              alt={`${auctionItem.item?.name || 'Auction Item'} - Ảnh ${currentImageIndex + 1}`} 
              src={getMainImage()} 
              onError={(e) => {  // Fallback nếu load lỗi
                e.target.src = `${process.env.REACT_APP_BASE_URL}${AA_STORAGE_PATH}${PLACEHOLDER_IMAGE}`;
              }}
            />
            <div className='detailsp-thumbnail-container'>
              <button
                className='detailsp-nav-button'
                onClick={() => changeImage((currentImageIndex - 1 + numImages) % numImages)}
                aria-label="Ảnh trước"
                disabled={numImages <= 1}  // Disable nếu chỉ 1 ảnh
              >
                &lt;
              </button>
              <div className='detailsp-thumbnails'>
                {renderThumbnails()}
              </div>
              <button
                className='detailsp-nav-button'
                onClick={() => changeImage((currentImageIndex + 1) % numImages)}
                aria-label="Ảnh sau"
                disabled={numImages <= 1}
              >
                &gt;
              </button>
            </div>
          </div>

          <div className='detailsp-info-section'>
            <div className={`detailsp-status-box ${nextEvent.type === 'bid' ? 'detailsp-bidding-status' : ''}`}>
              <div className='detailsp-status-title'>Trạng thái đấu giá:</div>
              <div className={`detailsp-status-message ${nextEvent.type === 'bid' ? 'detailsp-bidding' : ''}`}>
                {getStatusMessage()}
              </div>
              <div className='detailsp-notice'>{getNoticeMessage()}</div>
              <div className={`detailsp-clock ${nextEvent.type === 'bid' ? 'detailsp-bidding-countdown' : ''}`}>
                {countdown}
              </div>

              {showRegister && (
                <button
                  className='detailsp-register-bid-btn'
                  onClick={() => {
                    if (!user) {
                      showToast('Vui lòng đăng nhập để đăng ký đấu giá', 'error');
                      navigate('/login');
                      return;
                    }
                    setHasSubmittedProfile(false);
                    setShowRegisterModal(true);
                  }}
                >
                  Đăng ký đấu giá
                </button>
              )}

              {showCheckin && (
                <button className='detailsp-checkin-btn' onClick={handleCheckin}>
                  Điểm danh
                </button>
              )}

              {showBid && (
                <button className='detailsp-bid-btn' onClick={handleJoinAuction}>
                  Tham gia đấu giá
                </button>
              )}
            </div>

            <table className='detailsp-details-table'>
              <tbody>
                <tr>
                  <td>Mã tài sản:</td>
                  <td id='detailsp-item-id'>{auctionItem.item?.item_id || auctionItem.item?.id || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Người có tài sản:</td>
                  <td id='detailsp-owner'>
                    {auctionItem.item?.owner?.full_name || auctionItem.item?.owner_name || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td>Tổ chức đấu giá tài sản:</td>
                  <td id='detailsp-auction-org'>
                    {auctionItem.auction_org?.full_name || auctionItem.auction_org?.name || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td>Phương thức đấu giá:</td>
                  <td id='detailsp-method'>{auctionItem.method || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Thời gian mở đăng ký:</td>
                  <td id='detailsp-register-start'>{formatDateTime(auctionItem.register_start)}</td>
                </tr>
                <tr>
                  <td>Thời gian kết thúc đăng ký:</td>
                  <td id='detailsp-register-end'>{formatDateTime(auctionItem.register_end)}</td>
                </tr>
                <tr>
                  <td>Thời gian điểm danh:</td>
                  <td id='detailsp-checkin-time'>{formatDateTime(auctionItem.checkin_time)}</td>
                </tr>
                <tr>
                  <td>Thời gian bắt đầu trả giá:</td>
                  <td className='detailsp-price-highlight' id='detailsp-bid-start'>
                    {formatDateTime(auctionItem.bid_start)}
                  </td>
                </tr>
                <tr>
                  <td>Thời gian kết thúc trả giá:</td>
                  <td id='detailsp-bid-end'>{formatDateTime(auctionItem.bid_end)}</td>
                </tr>
                <tr>
                  <td>Bước giá:</td>
                  <td id='detailsp-bid-step'>{formatPrice(auctionItem.bid_step)}</td>
                </tr>
                <tr>
                  <td>Giá khởi điểm:</td>
                  <td className='detailsp-price-highlight' id='detailsp-starting-price'>
                    {formatPrice(auctionItem.item?.starting_price)}
                  </td>
                </tr>
                <tr>
                  <td>Giá đấu cao nhất:</td>
                  <td className='detailsp-price-highlight' id='detailsp-highest-bid'>
                    {formatPrice(auctionItem.highest_bid)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className='detailsp-tabs'>
          <button
            className={`detailsp-tab ${activeTab === 0 ? 'detailsp-active' : ''}`}
            onClick={() => setActiveTab(0)}
          >
            Thông tin đấu giá
          </button>
          <button
            className={`detailsp-tab ${activeTab === 1 ? 'detailsp-active' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            Hồ sơ pháp lý liên quan
          </button>
        </div>

        <div className={`detailsp-tab-content ${activeTab === 0 ? 'detailsp-active' : ''}`}>
          <ul>
            <li>
              Tên tổ chức:
              <a href='#' className='detailsp-organizer'>
                {auctionItem.auction_org?.full_name || 'N/A'}
              </a>
            </li>
            <li>
              Đấu giá viên:
              <span className='detailsp-auctioneer'>{auctionItem.auction_org?.full_name || 'N/A'}</span>
            </li>
            <li className='detailsp-location'>
              Địa điểm: Phòng 2.05 Lầu 2, Số 6 Lương Định Của, phường Bình Trưng, TP.HCM
              {/* <span>{auctionItem.item?.category_id || 'N/A'}</span> */}
            </li>
          </ul>
        </div>

        <div className={`detailsp-tab-content ${activeTab === 1 ? 'detailsp-active' : ''}`}>
          <h3 className='detailsp-document-title'>Các tài liệu pháp lý liên quan đến cuộc đấu giá:</h3>
          <a className='detailsp-document-title' href={process.env.REACT_APP_BASE_URL+auctionItem.item?.url_file}>xem hồ sơ</a>
          <ul className='detailsp-document-list'>{renderDocuments()}</ul>
          <div className='detailsp-notice detailsp-document-notice'>
            <strong>
              Lưu ý: Vui lòng kiểm tra kỹ tài liệu trước khi tham gia đấu giá. Liên hệ tổ chức đấu giá nếu cần hỗ trợ.
            </strong>
          </div>
        </div>
      </div>

      {showSuccessOverlay && (
        <div className='detailsp-overlay'>
          <div className='detailsp-success-box'>
            <p>Hoàn tất thành công!</p>  {/* Hardcoded, as state was unused */}
          </div>
        </div>
      )}

      {showCheckinOverlay && (
        <div className='detailsp-overlay'>
          <div className='detailsp-success-box'>
            <p>Điểm danh thành công!</p>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className='detailsp-overlay'>
          <div className='detailsp-modal'>
            <h3>Form Đăng Ký Dự Đấu Giá</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitProfile();
              }}
            >
              <div className='detailsp-form-group'>
                <label className='detailsp-label'>Tài Liệu Pháp Lý (Upload 1 file PDF/DOC/DOCX):</label>
                <input
                  type='file'
                  accept='.pdf,.doc,.docx'
                  onChange={handleFileChange}
                  className='detailsp-input'
                />
                <small>Chọn 1 file để upload (bắt buộc, max 2MB)</small>
                <p>
                  {selectedFiles.length > 0 &&
                    `Đã chọn: ${selectedFiles[0].name} (${(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB)`}
                </p>
              </div>

              {profile.status !== 'DaHoanTat' && (
                <div className='detailsp-form-group'>
                  <label className='detailsp-label'>Đặt Cọc (VNĐ):</label>
                  <div className='detailsp-deposit-wrapper'>
                    <input
                      type='text'
                      value={deposit}
                      onChange={handleDepositInput}
                      placeholder='Nhập số tiền đặt cọc (ví dụ: 100000000)'
                      className='detailsp-input'
                      required
                    />

                    {!hasSubmittedProfile ? (
                      <button
                        type='submit'
                        className='detailsp-submit-btn'
                        disabled={selectedFiles.length === 0 || depositError}
                      >
                        Submit Hồ Sơ
                      </button>
                    ) : profile.status === 'DaThanhToan' ? (
                      <button
                        type='button'
                        className='detailsp-submit-btn'
                        onClick={completeProcedure}
                      >
                        Hoàn tất thủ tục
                      </button>
                    ) : (
                      <button
                        type='button'
                        className='detailsp-pay-btn'
                        onClick={payDeposit}
                        disabled={!!depositError}
                      >
                        Thanh toán
                      </button>
                    )}
                  </div>
                  {depositError && <span className='detailsp-error'>{depositError}</span>}
                  <small>Phải từ 5% đến 20% giá khởi điểm ({updateDepositHint()})</small>
                </div>
              )}

              <div className='detailsp-form-actions'>
                <button
                  type='button'
                  className='detailsp-cancel-btn'
                  onClick={() => setShowRegisterModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;