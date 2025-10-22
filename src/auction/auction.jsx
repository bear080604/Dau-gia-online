import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import styles from './auction.module.css';
import { UserContext } from '../UserContext';
import '@fortawesome/fontawesome-free/css/all.min.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, bidAmount }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Xác nhận đặt giá</h3>
        <p>Bạn có muốn đặt giá: {bidAmount}?</p>
        <div className={styles.modalButtons}>
          <button className={styles.confirmButton} onClick={onConfirm}>
            Xác nhận
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const AuctionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);
  const [auctionItem, setAuctionItem] = useState(null);
  const [paused, setPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState(null);
  const [bidders, setBidders] = useState([]);
  const [bids, setBids] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [displayValue, setDisplayValue] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [toast, setToast] = useState({ message: '', type: '', show: false });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingBid, setPendingBid] = useState(null);
  const [sliderSteps, setSliderSteps] = useState(0); // State cho số bước giá trên slider
  const socketRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL;

  const now = paused ? pausedTime : currentTime;
  const bidStart = auctionItem?.bid_start ? new Date(auctionItem.bid_start) : null;
  const bidEnd = auctionItem?.bid_end ? new Date(auctionItem.bid_end) : null;
  const isBiddingOngoing = bidStart && bidEnd && now >= bidStart && now <= bidEnd;
  const isAuctionEnded = bidEnd && now > bidEnd;
  const isAuctionNotStarted = bidStart && now < bidStart;

  const showToast = (message, type = 'success') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: '', type: '', show: false }), 5000);
  };

  // Kết nối Socket.io
  useEffect(() => {
    console.log('🆔 ID từ URL:', id);
    console.log('🔑 Token:', token ? 'Có token' : 'Không có token');
    const socket = io(process.env.REACT_APP_SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Kết nối Socket.io thành công, Socket ID:', socket.id);
      socket.emit('join.channel', `auction-session.${id}`);
      socket.emit('join.channel', 'auction-profiles');
      console.log(`👥 Đã join channel: auction-session.${id}`);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`🔄 Reconnect thành công sau ${attempt} lần`);
      socket.emit('join.channel', `auction-session.${id}`);
      socket.emit('join.channel', 'auction-profiles');
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Lỗi kết nối Socket.io:', err.message);
      showToast('Lỗi kết nối Socket.io', 'error');
    });

    socket.onAny((event, ...args) => {
      console.log(`📡 Nhận sự kiện Socket.io: ${event}`, args);
    });

    socket.on('auction.session.updated', (updatedData) => {
      console.log('🔄 Cập nhật phiên đấu giá realtime:', updatedData);
      const updatedSession = updatedData.session || updatedData;
      if (updatedSession.session_id === parseInt(id)) {
        console.log('⏰ Thời gian mới:', {
          register_start: updatedSession.register_start,
          register_end: updatedSession.register_end,
          checkin_time: updatedSession.checkin_time,
          bid_start: updatedSession.bid_start,
          bid_end: updatedSession.bid_end,
        });
        setAuctionItem((prev) => ({
          ...prev,
          ...updatedSession,
          item: { ...prev?.item, ...updatedSession.item },
        }));
        if (updatedSession.paused !== paused) {
          setPaused(updatedSession.paused ?? false);
          if (!updatedSession.paused) {
            setPausedTime(null);
          }
          showToast(
            updatedSession.paused
              ? '🔴 Phiên đấu giá đã bị tạm dừng!'
              : '🟢 Phiên đấu giá đã được tiếp tục!',
            updatedSession.paused ? 'warning' : 'success'
          );
        }
      }
    });

    socket.on('bid.placed', async (bidData) => {
      console.log('💸 Giá thầu mới (bid.placed):', bidData);
      const newBid = bidData.bid || bidData;
      console.log('🔍 Kiểm tra session_id:', newBid.session_id, 'vs', parseInt(id));
      if (newBid.session_id === parseInt(id)) {
        newBid.id = newBid.bid_id;

        let userFullName = 'N/A';
        if (newBid.user_id) {
          try {
            console.log(`📞 Gọi API lấy tất cả users: ${API_URL}showuser`);
            const response = await axios.get(`${API_URL}showuser`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log('📋 Response users:', response.data);

            if (response.data.users && Array.isArray(response.data.users)) {
              const foundUser = response.data.users.find(u => u.user_id === newBid.user_id);
              if (foundUser) {
                userFullName = foundUser.full_name || 'N/A';
                console.log('✅ Tìm thấy user:', foundUser);
              } else {
                console.warn(`⚠️ Không tìm thấy user_id ${newBid.user_id} trong danh sách`);
              }
            }
          } catch (err) {
            console.error('❌ Lỗi fetch users:', err.message, err.response?.data);
            userFullName = newBid.user?.full_name || 'N/A';
          }
        } else {
          userFullName = newBid.user?.full_name || 'N/A';
        }

        const formattedAmount = parseFloat(newBid.amount).toLocaleString('vi-VN') + ' VNĐ';

        setBids((prev) => {
          if (prev.some((b) => b.id === newBid.id)) {
            console.log(`⚠️ Giá thầu ${newBid.id} đã tồn tại, bỏ qua`);
            return prev;
          }
          const bidWithUser = {
            ...newBid,
            user: {
              full_name: userFullName,
              user_id: newBid.user_id
            }
          };
          console.log('📝 Bid mới với user:', bidWithUser);
          const updatedBids = [bidWithUser, ...prev];
          const maxAmount = Math.max(...updatedBids.map((b) => parseFloat(b.amount)));
          setCurrentPrice(maxAmount);
          return updatedBids;
        });

        showToast(`💰 Giá thầu mới: ${formattedAmount} từ ${userFullName}`, 'success');
      }
    });

    socket.on('profile.updated', (profileData) => {
      console.log('🔄 Cập nhật hồ sơ:', profileData);
      const updatedProfile = profileData.profile || profileData;
      if (updatedProfile.session_id === parseInt(id) && (updatedProfile.status === 'DaDuyet' || updatedProfile.status === 'pending')) {
        setBidders((prev) => {
          if (prev.some((b) => b.profile_id === updatedProfile.profile_id)) {
            return prev.map((b) =>
              b.profile_id === updatedProfile.profile_id ? { ...b, ...updatedProfile } : b
            );
          }
          return [...prev, updatedProfile];
        });
        showToast(`🆕 Người tham gia mới: ${updatedProfile.user?.full_name || 'N/A'}`, 'success');
      }
    });

    socket.on('error', (err) => {
      console.error('❌ Lỗi Socket.io:', err);
      showToast('Lỗi kết nối Socket.io', 'error');
    });

    return () => {
      socket.emit('leave.channel', `auction-session.${id}`);
      socket.emit('leave.channel', 'auction-profiles');
      socket.offAny();
      socket.off('auction.session.updated');
      socket.off('bid.placed');
      socket.off('profile.updated');
      socket.off('error');
      socket.disconnect();
    };
  }, [id, paused, token, API_URL]);

  // Update time every second
  useEffect(() => {
    let interval;
    if (!paused) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    } else {
      setPausedTime(new Date());
    }
    return () => clearInterval(interval);
  }, [paused]);

  // Fetch auction item
  useEffect(() => {
    const fetchAuctionItem = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!API_URL) {
          throw new Error('REACT_APP_API_URL không được định nghĩa!');
        }
        const fullUrl = `${API_URL}auction-sessions/${id}`;
        console.log('📞 Gọi API auction item:', fullUrl);
        const response = await axios.get(fullUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('📋 Response auction item:', response.data);
        const data = response.data;
        const session = data.session;
        if (!session) {
          throw new Error(`Không tìm thấy phiên đấu giá với ID: ${id}`);
        }
        setAuctionItem(session);
        setPaused(session.paused ?? false);
        setCurrentPrice(parseFloat(session.item?.starting_price) || 0);
      } catch (err) {
        console.error('❌ Lỗi fetch auction item:', err.message, err.response?.data);
        setError(err.response?.data?.message || err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchAuctionItem();
    } else {
      setError('Vui lòng đăng nhập để xem thông tin đấu giá');
      setLoading(false);
    }
  }, [id, token]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fullUrl = `${API_URL}categories`;
        console.log('📞 Gọi API categories:', fullUrl);
        const response = await axios.get(fullUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('📋 Response categories:', response.data);
        const data = response.data;
        if (data.status && data.data) {
          setCategories(data.data);
        } else {
          throw new Error(data.message || 'Không thể lấy danh sách danh mục');
        }
      } catch (err) {
        console.error('❌ Lỗi fetch categories:', err.message, err.response?.data);
        setCategories([]);
        showToast('Không thể tải danh sách danh mục', 'error');
      }
    };

    if (token) {
      fetchCategories();
    }
  }, [token]);

  // Fetch bidders
  const fetchBidders = async () => {
    if (!id || !token) {
      console.log('⚠️ Không fetch bidders: id hoặc token thiếu', { id, token });
      return;
    }
    try {
      const fullUrl = `${API_URL}auction-profiles?session_id=${id}`;
      console.log('📞 Gọi API bidders:', fullUrl);
      const response = await axios.get(fullUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('📋 Response bidders:', response.data);
      const data = response.data;
      const profiles = data.profiles || [];
      const filteredBidders = profiles.filter(
        (p) => (p.status === 'DaDuyet' || p.status === 'pending') && p.session_id === parseInt(id)
      );
      setBidders(filteredBidders);
    } catch (err) {
      console.error('❌ Lỗi fetch bidders:', err.message, err.response?.data);
      setBidders([]);
      showToast('Không thể tải danh sách người tham gia', 'error');
    }
  };

  // Fetch bids
  const fetchBids = async () => {
    if (!id || !token) {
      console.log('⚠️ Không fetch bids: id hoặc token thiếu', { id, token });
      return;
    }
    try {
      const fullUrl = `${API_URL}bids/${id}`;
      console.log('📞 Gọi API bids:', fullUrl);
      const response = await axios.get(fullUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('📋 Response bids:', response.data);
      const data = response.data;
      if (!data.bids) {
        console.warn('⚠️ Response bids không có data.bids:', data);
        setBids([]);
      } else {
        setBids(data.bids);
        let highest = parseFloat(auctionItem?.item?.starting_price) || 0;
        if (data.bids.length > 0) {
          const maxAmount = Math.max(...data.bids.map((b) => parseFloat(b.amount)));
          if (maxAmount > highest) highest = maxAmount;
        }
        setCurrentPrice(highest);
      }
    } catch (err) {
      console.error('❌ Lỗi fetch bids:', err.message, err.response?.data);
      setBids([]);
      showToast(`Không thể tải danh sách giá thầu: ${err.message}`, 'error');
    }
  };

  // Fetch initial bidders and bids
  useEffect(() => {
    if (auctionItem) {
      console.log('🚀 Fetching bidders and bids for auctionItem:', auctionItem);
      fetchBidders();
      fetchBids();
    }
  }, [auctionItem]);

  const closeToast = () => {
    setToast({ message: '', type: '', show: false });
  };

  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatPrice = (priceStr) => {
    if (!priceStr) return 'N/A';
    const num = parseFloat(priceStr);
    return num.toLocaleString('vi-VN') + ' VNĐ';
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    return new Date(dateTimeStr).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  };

  const calculateN = () => {
    if (!auctionItem) return 0;
    const currentBidValue = displayValue ? parseInt(displayValue.replace(/\./g, '')) : 0;
    if (currentBidValue <= currentPrice) return 0;
    const bidStep = parseFloat(auctionItem.bid_step) || 10000000;
    return Math.floor((currentBidValue - currentPrice) / bidStep);
  };

  const getCountdownParts = () => {
    const now = paused ? pausedTime : currentTime;
    if (isAuctionEnded) {
      return { hours: '00', minutes: '00', seconds: '00', status: 'ended' };
    }
    if (isAuctionNotStarted) {
      const diff = bidStart - now;
      if (diff <= 0) return { hours: '00', minutes: '00', seconds: '00', status: 'starting' };
      const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      return { hours, minutes, seconds, status: 'not_started' };
    }
    if (isBiddingOngoing) {
      const diff = bidEnd - now;
      if (diff <= 0) return { hours: '00', minutes: '00', seconds: '00', status: 'ended' };
      const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      return { hours, minutes, seconds, status: 'ongoing' };
    }
    return { hours: '00', minutes: '00', seconds: '00', status: 'invalid' };
  };

  const handleNumberInputChange = (e) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const parts = rawValue.split('.');
    if (parts.length > 1) {
      rawValue = parts[0] + '.' + parts.slice(1).join('').slice(0, 3 * (parts.length - 1));
    }
    setDisplayValue(rawValue);
    if (rawValue) {
      const value = parseInt(rawValue.replace(/\./g, '')) || 0;
      const bidStep = parseFloat(auctionItem?.bid_step) || 10000000;
      const steps = Math.floor((value - currentPrice) / bidStep);
      if (steps >= 0 && steps <= 100) {
        setSliderSteps(steps);
      }
    }
  };

  const handleBlur = () => {
    if (displayValue === '') return;
    const value = parseInt(displayValue.replace(/\./g, '')) || 0;
    setDisplayValue(formatNumber(value));
  };

  const handleSliderChange = (e) => {
    const steps = parseInt(e.target.value);
    const bidStep = parseFloat(auctionItem?.bid_step) || 10000000;
    const newBidValue = currentPrice + steps * bidStep;
    setSliderSteps(steps);
    setDisplayValue(formatNumber(newBidValue));
  };

  const handlePlaceBid = async () => {
    if (paused) {
      showToast('Phiên đấu giá đang tạm dừng, không thể đặt giá!', 'error');
      return;
    }
    if (!user || !token) {
      showToast('Vui lòng đăng nhập để đấu giá', 'error');
      navigate('/login');
      return;
    }
    if (!displayValue || displayValue.trim() === '') {
      showToast('Vui lòng nhập số tiền đấu giá!', 'error');
      return;
    }
    const currentBidValue = parseInt(displayValue.replace(/\./g, '')) || 0;
    const bidStep = parseFloat(auctionItem?.bid_step) || 10000000;
    const minBid = currentPrice + bidStep;
    const maxBid = currentPrice + 100 * bidStep; // Giới hạn tối đa 100 bước giá
    if (currentBidValue < minBid) {
      showToast(`Số tiền phải >= ${formatPrice(minBid)}!`, 'error');
      return;
    }
    if (currentBidValue > maxBid) {
      showToast(`Số tiền không được vượt quá ${formatPrice(maxBid)} (tối đa 100 bước giá)!`, 'error');
      return;
    }
    setPendingBid(currentBidValue);
    setShowConfirmModal(true);
  };

  const handleConfirmBid = async () => {
    try {
      const fullUrl = `${API_URL}bids`;
      console.log('📞 Gọi API đặt giá:', fullUrl, { session_id: id, amount: pendingBid });
      const response = await axios.post(
        fullUrl,
        {
          session_id: id,
          amount: pendingBid,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('📋 Response đặt giá:', response.data);
      const result = response.data;
      if (result.status) {
        showToast('Đặt giá thành công!', 'success');
        setDisplayValue('');
        setSliderSteps(0); // Reset slider sau khi đặt giá thành công
      } else {
        showToast(result.message || 'Lỗi đặt giá', 'error');
      }
    } catch (err) {
      console.error('❌ Lỗi đặt giá:', err.message, err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi không xác định';
      showToast(errorMsg, 'error');
    } finally {
      setShowConfirmModal(false);
      setPendingBid(null);
    }
  };

  const handleCancelBid = () => {
    setShowConfirmModal(false);
    setPendingBid(null);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.category_id === categoryId);
    return category ? category.name : 'N/A';
  };

  if (loading) {
    return <div className={styles.container}>Đang tải...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2>Lỗi tải thông tin đấu giá</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!auctionItem || !auctionItem.item) {
    return <div className={styles.container}>Không tìm thấy thông tin đấu giá</div>;
  }

  const item = auctionItem.item;
  const bidStep = parseFloat(auctionItem.bid_step) || 10000000;
  const minBid = currentPrice + bidStep;
  const maxBid = currentPrice + 100 * bidStep; // Tối đa 100 bước giá
  const n = calculateN();
  const countdown = getCountdownParts();
  const highestBid = bids.length > 0 ? Math.max(...bids.map((b) => parseFloat(b.amount))) : currentPrice;
  const winner = bids.length > 0 ? bids.reduce((a, b) => parseFloat(a.amount) > parseFloat(b.amount) ? a : b) : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>Phiên đấu giá {item.name}</div>
      {paused && (
        <div className={styles.pausedNotice}>
          ⏸ Phiên đấu giá đang tạm dừng — Vui lòng chờ đấu giá viên tiếp tục!
        </div>
      )}
      <div className={styles['lot-numbers']}>
        {countdown.status === 'not_started' ? (
          <div className={styles['countdown-label']}>Thời gian còn lại để bắt đầu:</div>
        ) : countdown.status === 'ongoing' ? (
          <div className={styles['countdown-label']}>Thời gian đấu giá còn:</div>
        ) : countdown.status === 'ended' ? (
          <div className={styles['countdown-label']}>Phiên đấu giá đã kết thúc</div>
        ) : (
          <div className={styles['countdown-label']}>Thời gian không xác định</div>
        )}
        <div className={styles['lot-number']}>{countdown.hours}</div>
        <div className={styles['lot-number']}>{countdown.minutes}</div>
        <div className={styles['lot-number']}>{countdown.seconds}</div>
      </div>
      <div className={styles.content}>
        <div className={styles['left-section']}>
          <div className={styles['section-title']}>THÔNG TIN SẢN PHẨM</div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Tên sản phẩm:</div>
            <div className={styles['info-value']}>{item.name || 'N/A'}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Tên loại tài sản:</div>
            <div className={styles['info-value']}>{getCategoryName(item.category_id)}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Người có tài sản:</div>
            <div className={styles['info-value']}>{item.owner?.full_name || 'N/A'}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Nơi có tài sản:</div>
            <div className={styles['info-value']}>Kho hàng thu mua đồi Gò Dưa phường Tân Quy Q7</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Thời gian xem tài sản:</div>
            <div className={styles['info-value']}>Giờ hành chính các ngày từ 24/12 đến 28/12/2021</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Tổ chức đấu giá:</div>
            <div className={styles['info-value']}>{auctionItem.auction_org?.full_name || 'N/A'}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Phương thức đấu giá:</div>
            <div className={styles['info-value']}>{auctionItem.method || 'Trực tiếp'}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Thời gian mở đăng ký:</div>
            <div className={styles['info-value']}>{formatDateTime(auctionItem.register_start)}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Thời gian kết thúc đăng ký:</div>
            <div className={styles['info-value']}>{formatDateTime(auctionItem.register_end)}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Thời gian bắt đầu trả giá:</div>
            <div className={styles['info-value']}>{formatDateTime(auctionItem.bid_start)}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Giá khởi điểm:</div>
            <div className={styles['info-value']}>{formatPrice(item.starting_price)}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Giá hiện tại:</div>
            <div className={styles['info-value']}>{formatPrice(currentPrice)}</div>
          </div>
        </div>
        <div className={styles['right-section']}>
          <div className={styles['participants-section']}>
            <div className={styles['section-title']}>THÀNH PHẦN THAM DỰ</div>
            <div className={styles['info-row']}>
              <div className={styles['info-label']}>Thư ký phiên đấu giá:</div>
              <div className={styles['info-value']}>{auctionItem.secretary?.full_name || 'N/A'}</div>
            </div>
            <div className={styles['info-row']}>
              <div className={styles['info-label']}>Đại diện bên có tài sản:</div>
              <div className={styles['info-value']}>{auctionItem.item?.owner?.full_name || 'N/A'}</div>
            </div>
            <div className={styles['info-row']}>
              <div className={styles['info-label']}>Đấu giá viên:</div>
              <div className={styles['info-value']}>{auctionItem.auction_org?.full_name || 'N/A'}</div>
            </div>
            <div className={styles['info-row']}>
              <div className={styles['info-label']}>Đại diện người tham gia đấu giá:</div>
              <div className={styles['info-value']}>{auctionItem.bidder_representative?.full_name || 'N/A'}</div>
            </div>
          </div>
          <div className={styles['bid-section']}>
            <div className={styles['section-title']}>
              {isAuctionEnded ? 'KẾT QUẢ ĐẤU GIÁ' : 'THAM GIA ĐẤU GIÁ'}
            </div>
            {isBiddingOngoing ? (
              <>
                <div className={styles['bid-info']}>
                  <div>Số tiền đấu giá (tối thiểu: {formatPrice(minBid)}, tối đa: {formatPrice(maxBid)})</div>
                  <input
                    type="text"
                    value={displayValue}
                    onChange={handleNumberInputChange}
                    onBlur={handleBlur}
                    placeholder="Nhập số tiền, ví dụ: 100.000.000"
                    className={styles['bid-input']}
                    disabled={paused || isAuctionEnded || !isBiddingOngoing}
                    pattern="[0-9.]*"
                    style={{ marginBottom: '10px', padding: '8px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <div className={styles['bid-amount']}>
                    {displayValue ? formatNumber(parseInt(displayValue.replace(/\./g, ''))) : '0'}<br />VNĐ
                  </div>
                  <div style={{ margin: '10px 0' }}>
                    <label>Số bước giá: {sliderSteps}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderSteps}
                      onChange={handleSliderChange}
                      disabled={paused || isAuctionEnded || !isBiddingOngoing}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: '#2772BA' }}>
                    Số tiền đấu giá = Giá hiện tại ({formatNumber(currentPrice)} VNĐ) + {n} x Bước giá (
                    {formatNumber(bidStep)} VNĐ)
                  </div>
                </div>
                <button
                  className={styles['bid-button']}
                  onClick={handlePlaceBid}
                  disabled={paused || isAuctionEnded || !isBiddingOngoing}
                >
                  {paused ? 'Tạm dừng' : 'Đấu giá'}
                </button>
              </>
            ) : isAuctionEnded ? (
              <div className={styles['bid-info']}>
                {winner ? (
                  <>
                    <div>Người thắng cuộc: {winner.user?.full_name || 'N/A'}</div>
                    <div>Số tiền thắng: {formatPrice(winner.amount)}</div>
                  </>
                ) : (
                  <div>Không có người tham gia đấu giá</div>
                )}
              </div>
            ) : (
              <button className={styles['bid-button']} disabled>
                Chưa đến giờ đấu giá
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={styles['participants-table']}>
        <div className={styles['table-title']}>DANH SÁCH LƯỢT ĐẶT GIÁ</div>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th></th>
              <th>Người đặt giá</th>
              <th>Số tiền</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {bids.length > 0 ? (
              bids.map((bid, index) => (
                <tr key={bid.id || index} className={parseFloat(bid.amount) === highestBid ? 'current-winner' : ''}>
                  <td>{index + 1}</td>
                  <td>
                    <span className={`${styles['user-icon']} ${styles.pink}`}></span>
                  </td>
                  <td>{bid.user?.full_name || 'N/A'}</td>
                  <td className="bid-amount">{formatPrice(bid.amount)}</td>
                  <td>{formatDateTime(bid.bid_time)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Chưa có lượt đặt giá</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className={styles['participants-table']}>
        <div className={styles['table-title']}>DANH SÁCH NGƯỜI ĐĂNG KÝ ĐẤU GIÁ</div>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th></th>
              <th>Họ và Tên</th>
              <th>Tiền đặt trước</th>
            </tr>
          </thead>
          <tbody>
            {bidders.length > 0 ? (
              bidders.map((bidder, index) => (
                <tr key={bidder.profile_id || index}>
                  <td>{index + 1}</td>
                  <td>
                    <span className={`${styles['user-icon']} ${styles.pink}`}></span>
                  </td>
                  <td>{bidder.user?.full_name || bidder.full_name || 'N/A'}</td>
                  <td>{formatPrice(bidder.deposit_amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">Chưa có người đăng ký</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {toast.show && (
        <div
          className={`${styles.toast} ${styles[toast.type] || ''}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            minWidth: '300px',
            padding: '16px',
            backgroundColor: toast.type === 'success' ? '#28a745' : toast.type === 'error' ? '#dc3545' : '#ffc107',
            color: toast.type === 'warning' ? '#212529' : 'white',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <i className="fas fa-info-circle" style={{ marginRight: '10px' }}></i>
          <span>{toast.message}</span>
          <span
            className={styles['close-toast']}
            onClick={closeToast}
            style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '18px' }}
          >
            &times;
          </span>
        </div>
      )}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelBid}
        onConfirm={handleConfirmBid}
        bidAmount={formatPrice(pendingBid)}
      />
    </div>
  );
};

export default AuctionPage;