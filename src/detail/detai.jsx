import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './detail.css';
import { UserContext } from '../UserContext';

const AuctionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);

  // States
  const [auctionItem, setAuctionItem] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState({ message: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [deposit, setDeposit] = useState('');
  const [depositError, setDepositError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const isMounted = useRef(true);

  // ⭐ KEY FIX: Dùng ref để track status đã toast
  const lastToastedStatus = useRef(localStorage.getItem(`profileStatus_${id}`) || null);
  const hasShownToast = useRef(false); // Prevent duplicate toast trong cùng 1 session

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    isMounted.current = true;
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  // Hàm hiển thị toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      if (isMounted.current) setToast({ message: '', type: '' });
    }, 5000);
  };

  // ⭐ Fetch profile với logic toast chặt chẽ
  const fetchProfile = async () => {
    if (!user || !user.user_id || !id) return;
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}auction-profiles?session_id=${id}&user_id=${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myProfiles = response.data.profiles?.filter(p => p.user_id === user.user_id) || [];
      const newProfile = myProfiles[0] || null;

      if (isMounted.current) {
        const currentStatus = newProfile?.status || null;
        const previousStatus = lastToastedStatus.current;

        // ⭐ CHỈ toast khi status THỰC SỰ thay đổi và chưa toast lần này
        if (currentStatus !== previousStatus && !hasShownToast.current) {
          if (currentStatus === 'pending') {
            showToast('📋 Hồ sơ của bạn đang chờ duyệt!', 'warning');
            hasShownToast.current = true;
          } else if (currentStatus === 'DaDuyet') {
            showToast('✅ Hồ sơ đã được duyệt! Bạn có thể tham gia đấu giá.', 'success');
            hasShownToast.current = true;
          } else if (currentStatus === 'TuChoi') {
            showToast('❌ Hồ sơ bị từ chối. Vui lòng liên hệ quản trị viên.', 'error');
            hasShownToast.current = true;
          }

          // Cập nhật ref và localStorage
          lastToastedStatus.current = currentStatus;
          if (currentStatus) {
            localStorage.setItem(`profileStatus_${id}`, currentStatus);
          } else {
            localStorage.removeItem(`profileStatus_${id}`);
          }

          // Reset flag sau 2s để cho phép toast lần sau (nếu status thay đổi tiếp)
          setTimeout(() => {
            hasShownToast.current = false;
          }, 2000);
        }

        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      if (isMounted.current) setProfile(null);
      if (err.response?.status === 401) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
        navigate('/login');
      }
    }
  };

  // Fetch auction item với retry
  const fetchAuctionItem = async (retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = process.env.REACT_APP_API_URL;
        if (!apiUrl) throw new Error('REACT_APP_API_URL không được định nghĩa!');
        const response = await axios.get(`${apiUrl}auction-sessions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const session = response.data.session;
        if (!session) throw new Error(`No session found for session ID: ${id}`);
        if (isMounted.current) setAuctionItem(session);
        return;
      } catch (err) {
        console.error(`Fetch auction item error (attempt ${i + 1}/${retries}):`, err);
        if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, delay));
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }
    if (isMounted.current) setError('Không thể tải dữ liệu phiên đấu giá sau nhiều lần thử.');
  };

  // ⭐ Polling với interval thông minh
  useEffect(() => {
    isMounted.current = true;
    
    // Load ban đầu
    fetchAuctionItem();
    fetchProfile();

    // Polling interval - giảm xuống nếu không cần real-time cao
    const pollingInterval = setInterval(() => {
      if (user && user.user_id) {
        fetchProfile(); // Check profile status
      }
      fetchAuctionItem(); // Check auction status
    }, 20000); // 20 giây thay vì 15s

    return () => {
      isMounted.current = false;
      clearInterval(pollingInterval);
    };
  }, [id, user, token]);

  // Format số tiền
  const formatNumberWithDots = (numStr) => {
    const num = parseFloat(numStr.replace(/\./g, '')) || 0;
    return num.toLocaleString('vi-VN');
  };

  const formatPrice = (priceStr) => {
    if (!priceStr) return 'N/A';
    const num = parseFloat(priceStr);
    return num.toLocaleString('vi-VN') + ' VNĐ';
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Chưa xác định';
    return new Date(dateTimeStr).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  };

  // Tìm sự kiện tiếp theo
  const getNextEventTime = () => {
    if (!auctionItem) return null;
    const now = currentTime;
    const times = [
      { key: 'register_start', time: new Date(auctionItem.register_start) },
      { key: 'register_end', time: new Date(auctionItem.register_end) },
      { key: 'checkin_time', time: new Date(auctionItem.checkin_time) },
      { key: 'bid_start', time: new Date(auctionItem.bid_start) },
      { key: 'bid_end', time: new Date(auctionItem.bid_end) },
    ].filter(t => t.time && !isNaN(t.time.getTime()));
    const futureTimes = times.filter(t => t.time > now);
    return futureTimes.length > 0 ? futureTimes[0].time : null;
  };

  // Đồng hồ đếm ngược
  const getCountdown = () => {
    const nextTime = getNextEventTime();
    if (!nextTime) return 'Hết thời gian';
    const diff = nextTime - currentTime;
    if (diff <= 0) return 'Hết thời gian';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Validate deposit
  const validateDeposit = (value) => {
    if (!auctionItem || !auctionItem.item) return false;
    const startingPrice = parseFloat(auctionItem.item.starting_price) || 0;
    const minDeposit = startingPrice * 0.05;
    const maxDeposit = startingPrice * 0.20;
    const depositValue = parseFloat(value.replace(/\./g, '')) || 0;

    if (depositValue < minDeposit) {
      setDepositError(`Đặt cọc quá thấp. Tối thiểu: ${formatPrice(minDeposit.toString())} (5%)`);
      return false;
    } else if (depositValue > maxDeposit) {
      setDepositError(`Đặt cọc quá cao. Tối đa: ${formatPrice(maxDeposit.toString())} (20%)`);
      return false;
    } else {
      setDepositError('');
      return true;
    }
  };

  const handleDepositChange = (e) => {
    const rawValue = e.target.value.replace(/\./g, '');
    const formattedValue = formatNumberWithDots(rawValue);
    setDeposit(formattedValue);
    validateDeposit(formattedValue);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleRegisterBid = () => {
    console.log('Click Đăng ký đấu giá - User:', user);
    if (!user || !user.user_id) {
      setShowLoginPrompt(true);
      return;
    }
    if (profile && profile.user_id === user.user_id) {
      if (profile.status === 'DaDuyet') {
        showToast('Hồ sơ đã được duyệt!', 'success');
        return;
      } else if (profile.status === 'pending') {
        showToast('Bạn đã đăng ký, chờ duyệt!', 'warning');
        return;
      }
    }
    setShowModal(true);
    setDeposit('');
    setDepositError('');
    setSelectedFiles([]);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const rawDeposit = deposit.replace(/\./g, '');
    if (!validateDeposit(deposit)) return;

    if (!user || !user.user_id) {
      showToast('Session hết hạn! Vui lòng đăng nhập lại.', 'error');
      setShowModal(false);
      navigate('/login');
      return;
    }

    const profileId = Date.now().toString();
    const formDataToSend = new FormData();
    formDataToSend.append('profile_id', profileId);
    formDataToSend.append('user_id', user.user_id);
    formDataToSend.append('session_id', id);
    formDataToSend.append('deposit_amount', rawDeposit);
    selectedFiles.forEach(file => formDataToSend.append('document_url', file));

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}auction-profiles`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setShowModal(false);
      setSuccessMessage('Đăng ký thành công! Chờ duyệt.');
      
      // Reset toast flag để cho phép toast status mới
      hasShownToast.current = false;
      
      setTimeout(() => {
        if (isMounted.current) {
          fetchProfile();
          setSuccessMessage(false);
        }
      }, 2000);
    } catch (err) {
      console.error('Lỗi API đăng ký:', err);
      if (err.response?.status === 401) {
        showToast('Unauthorized – Vui lòng đăng nhập lại.', 'error');
        navigate('/login');
      } else {
        showToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
      }
    }
  };

  const handleCheckin = () => {
    setCheckinSuccess(true);
    setTimeout(() => {
      if (isMounted.current) setCheckinSuccess(false);
    }, 5000);
  };

  const handleLoginPrompt = () => {
    navigate('/login');
  };

  const handlePlaceBid = () => {
    navigate(`/auction/${id}`);
  };

  // Logic trạng thái
  const registerStart = auctionItem?.register_start ? new Date(auctionItem.register_start) : null;
  const registerEnd = auctionItem?.register_end ? new Date(auctionItem.register_end) : null;
  const checkinTime = auctionItem?.checkin_time ? new Date(auctionItem.checkin_time) : null;
  const bidStart = auctionItem?.bid_start ? new Date(auctionItem.bid_start) : null;
  const bidEnd = auctionItem?.bid_end ? new Date(auctionItem.bid_end) : null;

  const isRegistrationOpen = registerStart && registerEnd && currentTime >= registerStart && currentTime <= registerEnd;
  const isCheckinTime = checkinTime && bidStart && currentTime >= checkinTime && currentTime < bidStart;
  const isBiddingOngoing = bidStart && bidEnd && currentTime >= bidStart && currentTime <= bidEnd;

  const isProfileApproved = profile && profile.status === 'DaDuyet';
  const canRegister = !profile || profile.status !== 'DaDuyet';
  const canBid = isProfileApproved && isBiddingOngoing;
  const canCheckin = isProfileApproved && isCheckinTime;

  const statusMessage = useMemo(() => {
    let message = '';
    if (!registerStart || !registerEnd || !bidStart || !bidEnd) {
      message = 'Chưa xác định thời gian';
    } else if (currentTime < registerStart) {
      message = 'Chưa mở đăng ký';
    } else if (isRegistrationOpen) {
      message = 'Mở đăng ký dự đấu giá';
    } else if (isCheckinTime) {
      message = 'Thời gian điểm danh';
    } else if (currentTime < bidStart) {
      message = 'Chờ bắt đầu đấu giá';
    } else if (isBiddingOngoing) {
      message = 'Đang diễn ra';
    } else {
      message = 'Đã kết thúc';
    }

    if (profile) {
      if (profile.status === 'pending') {
        message += ' | Hồ sơ: Chờ duyệt';
      } else if (profile.status === 'DaDuyet') {
        message += ' | Hồ sơ: Đã duyệt';
      } else {
        message += ' | Hồ sơ: Chưa được duyệt';
      }
    }
    return message;
  }, [currentTime, registerStart, registerEnd, checkinTime, bidStart, bidEnd, profile]);

  const noticeMessage = useMemo(() => {
    let message = '';
    if (!registerStart || !registerEnd || !bidStart || !bidEnd) {
      message = 'Chưa xác định thời gian';
    } else if (currentTime < registerStart) {
      message = 'Sắp mở đăng ký dự đấu giá!';
    } else if (isRegistrationOpen) {
      message = 'Sắp dự đấu giá!';
    } else if (isCheckinTime) {
      message = 'Thời gian điểm danh!';
    } else if (currentTime < bidStart) {
      message = 'Sắp bắt đầu đấu giá!';
    } else if (isBiddingOngoing) {
      message = 'Đang đấu giá!';
    } else {
      message = 'Kết thúc thời gian đấu giá!';
    }

    if (profile) {
      if (profile.status === 'pending') {
        message += ' | Hồ sơ: Chờ duyệt';
      } else if (profile.status === 'DaDuyet') {
        message += ' | Hồ sơ: Đã duyệt';
      } else {
        message += ' | Hồ sơ: Chưa được duyệt';
      }
    }
    return message;
  }, [currentTime, registerStart, registerEnd, checkinTime, bidStart, bidEnd, profile]);

  // Xử lý hình ảnh
  const baseImageUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/';
  const images = auctionItem?.item?.image_url
    ? [`${baseImageUrl.replace('/api/', '')}${auctionItem.item.image_url}`]
    : ['/public/assets/img/xe.png'];

  const changeImage = (index) => setCurrentImageIndex(index);
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  // Inline styles (giữ nguyên như cũ)
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
  };

  const formGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
  const errorStyle = { color: 'red', fontSize: '0.9em', display: 'block', marginTop: '5px' };
  const formActionsStyle = { display: 'flex', justifyContent: 'space-between', marginTop: '20px' };
  const buttonStyle = { padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' };
  const cancelButtonStyle = { ...buttonStyle, backgroundColor: '#ccc', color: 'black' };
  const submitButtonStyle = { ...buttonStyle, backgroundColor: '#007bff', color: 'white' };
  const successOverlayStyle = { ...modalOverlayStyle };
  const successBoxStyle = {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '400px',
  };
  const checkinButtonStyle = { ...buttonStyle, backgroundColor: '#28a745', color: 'white', marginTop: '10px' };
  const loginPromptStyle = {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '400px',
  };

  return (
    <div className="container">
      {/* Toast Notification */}
      {toast.message && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px',
          borderRadius: '4px',
          color: 'white',
          backgroundColor: toast.type === 'success' ? '#28a745' : toast.type === 'warning' ? '#ffc107' : '#dc3545',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease-out',
        }}>
          {toast.message}
        </div>
      )}

   

      {auctionItem && auctionItem.item && (
        <>
          <h2 className="title">{auctionItem.item.name} - {auctionItem.item.description}</h2>
          <div className="content-wrapper">
            {/* Image Section */}
            <div className="image-section">
              <img
                src={images[currentImageIndex]}
                alt={`${auctionItem.item.name} - ${auctionItem.item.description}`}
                className="main-image"
              />
              <div className="thumbnail-container">
                <button className="nav-button" onClick={prevImage}>‹</button>
                <div className="thumbnails">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                      onClick={() => changeImage(index)}
                    />
                  ))}
                </div>
                <button className="nav-button" onClick={nextImage}>›</button>
              </div>
              <button className="view-images-btn">Hình ảnh</button>
            </div>

            {/* Info Section */}
            <div className="info-section">
              <div className={`status-box ${isBiddingOngoing ? 'bidding-status' : ''}`}>
                <div className="status-title">
                  {isBiddingOngoing ? 'Đang diễn ra đấu giá, còn:' : 'Trạng thái đấu giá:'}
                </div>
                <div className={`status-message ${isBiddingOngoing ? 'bidding' : ''}`}>
                  {statusMessage}
                </div>
                <div className="bidding-countdown">
                  <span>Sự kiện tiếp theo: {getCountdown()}</span>
                </div>
                {user && canRegister && isRegistrationOpen && (
                  <button className="register-bid-btn" onClick={handleRegisterBid}>
                    Đăng ký đấu giá
                  </button>
                )}
                {user && canCheckin && (
                  <button className="checkin-btn" onClick={handleCheckin} style={checkinButtonStyle}>
                    Điểm danh
                  </button>
                )}
                {user && canBid && (
                  <button className="place-bid-btn" onClick={handlePlaceBid}>
                    Đấu giá ngay
                  </button>
                )}
                {!user && isRegistrationOpen && (
                  <button className="register-bid-btn" onClick={handleRegisterBid}>
                    Đăng ký đấu giá
                  </button>
                )}
              </div>
              <table className="details-table">
                <tbody>
                  <tr><td>Mã tài sản:</td><td>{auctionItem.item.item_id}</td></tr>
                  <tr><td>Người có tài sản:</td><td>{auctionItem.item.owner?.full_name || `User ID: ${auctionItem.item.owner_id}`}</td></tr>
                  <tr><td>Tổ chức đấu giá tài sản:</td><td>{auctionItem.auction_org?.full_name || 'N/A'}</td></tr>
                  <tr><td>Phương thức đấu giá:</td><td>{auctionItem.method || 'N/A'}</td></tr>
                  <tr><td>Thời gian mở đăng ký:</td><td>{formatDateTime(auctionItem.register_start)}</td></tr>
                  <tr><td>Thời gian kết thúc đăng ký:</td><td>{formatDateTime(auctionItem.register_end)}</td></tr>
                  <tr><td>Thời gian điểm danh:</td><td>{formatDateTime(auctionItem.checkin_time)}</td></tr>
                  <tr><td>Thời gian bắt đầu trả giá:</td><td className="price-highlight">{formatDateTime(auctionItem.bid_start)}</td></tr>
                  <tr><td>Thời gian kết thúc trả giá:</td><td>{formatDateTime(auctionItem.bid_end)}</td></tr>
                  <tr><td>Bước giá:</td><td>{formatPrice(auctionItem.bid_step)}</td></tr>
                  <tr><td>Giá khởi điểm:</td><td className="price-highlight">{formatPrice(auctionItem.item.starting_price)}</td></tr>
                </tbody>
              </table>
              <div className="notice"><strong>{noticeMessage}</strong></div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
              Thông tin đấu giá
            </button>
            <button className={`tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
              Hồ sơ pháp lý liên quan
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 0 && (
            <div className="tab-content">
              <ul>
                <li>Tên tổ chức: <a href="#" className="organizer">{auctionItem.auction_org?.full_name || 'N/A'}</a></li>
                <li>Đấu giá viên: <span className="auctioneer">TBD</span></li>
                <li className="location">Địa chỉ: Category ID {auctionItem.item.category_id}</li>
              </ul>
            </div>
          )}
          {activeTab === 1 && (
            <div className="tab-content">
              <h3 className="document-title">Các tài liệu pháp lý liên quan đến cuộc đấu giá:</h3>
              <ul className="document-list">
                <li className="document-item">
                  <strong>1. Quyết định thanh lý tài sản (QC130-16690849166.pdf)</strong><br />
                  <small>Mô tả: Quyết định phê duyệt thanh lý {auctionItem.item.name}.</small><br />
                  <a href="/public/docs/QC130-16690849166.pdf" download className="download-link">Tải về (PDF)</a>
                </li>
                <li className="document-item">
                  <strong>2. Biên bản kiểm kê tài sản (Tb13-16690888292.pdf)</strong><br />
                  <small>Mô tả: Biên bản kiểm kê tình trạng Category {auctionItem.item.category_id}, giá trị ước tính.</small><br />
                  <a href="/public/docs/Tb13-16690888292.pdf" download className="download-link">Tải về (PDF)</a>
                </li>
              </ul>
              <div className="notice document-notice">
                <strong>Lưu ý: Vui lòng kiểm tra kỹ tài liệu trước khi tham gia đấu giá. Liên hệ tổ chức đấu giá nếu cần hỗ trợ.</strong>
              </div>
            </div>
          )}

          {/* Success Message for Registration */}
          {successMessage && (
            <div style={successOverlayStyle}>
              <div style={successBoxStyle}>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          {/* Success Message for Check-in */}
          {checkinSuccess && (
            <div style={successOverlayStyle}>
              <div style={successBoxStyle}>
                <p>Điểm danh thành công!</p>
              </div>
            </div>
          )}

          {/* Login Prompt Modal */}
          {showLoginPrompt && (
            <div style={modalOverlayStyle}>
              <div style={modalStyle}>
                <h3>Vui lòng đăng nhập</h3>
                <div style={loginPromptStyle}>
                  <p>Để đăng ký dự đấu giá, bạn cần đăng nhập tài khoản.</p>
                  <button onClick={handleLoginPrompt} style={submitButtonStyle}>Đăng nhập ngay</button>
                  <button onClick={() => setShowLoginPrompt(false)} style={cancelButtonStyle}>Hủy</button>
                </div>
              </div>
            </div>
          )}

          {/* Registration Modal */}
          {showModal && (
            <div style={modalOverlayStyle}>
              <div style={modalStyle}>
                <h3>Form Đăng Ký Dự Đấu Giá</h3>
                <form onSubmit={handleSubmitForm}>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Đặt Cọc (VNĐ):</label>
                    <input
                      type="text"
                      value={deposit}
                      onChange={handleDepositChange}
                      placeholder="Nhập số tiền đặt cọc (ví dụ: 100000000)"
                      required
                      style={inputStyle}
                    />
                    {depositError && <span style={errorStyle}>{depositError}</span>}
                    <small style={{ display: 'block', marginTop: '5px' }}>
                      Phải từ 5% đến 20% giá khởi điểm ({formatPrice(auctionItem.item.starting_price)})
                    </small>
                  </div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Tài Liệu Pháp Lý (Upload mới hoặc sử dụng hiện tại):</label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      style={{ ...inputStyle, padding: '5px' }}
                    />
                    <small style={{ display: 'block', marginTop: '5px' }}>Chọn file để upload (tùy chọn)</small>
                    {selectedFiles.length > 0 && (
                      <p style={{ marginTop: '5px' }}>Đã chọn {selectedFiles.length} file(s)</p>
                    )}
                  </div>
                  <div style={formActionsStyle}>
                    <button type="button" onClick={() => setShowModal(false)} style={cancelButtonStyle}>Hủy</button>
                    <button type="submit" style={submitButtonStyle}>Submit</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default AuctionPage;