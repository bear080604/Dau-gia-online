import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './detail.css';
import { UserContext } from '../UserContext';

const AuctionPage = () => {
  const { id } = useParams(); // id is session_id from link
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);

  // Debug: Log user state when component mounts
  console.log('User từ Context ở AuctionPage:', user);
  console.log('Có tài khoản?', !!user);
  console.log('User ID?', user?.user_id);

  const [auctionItem, setAuctionItem] = useState(null);
  const [profile, setProfile] = useState(null); // User's profile for this session
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date()); // Real-time clock for dynamic updates
  const [showModal, setShowModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // Modal for login prompt
  const [deposit, setDeposit] = useState('');
  const [depositError, setDepositError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  // Update current time every second for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch auction item
  const fetchAuctionItem = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.REACT_APP_API_URL;
      console.log("API URL for detail:", apiUrl);

      if (!apiUrl) {
        throw new Error('REACT_APP_API_URL không được định nghĩa!');
      }
      const fullUrl = `${apiUrl}auction-sessions/${id}`;
      console.log("Full URL:", fullUrl);

      const response = await axios.get(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log("Full response:", response.data);

      const session = response.data.session;
      if (!session) {
        throw new Error(`No session found for session ID: ${id}`);
      }
      console.log("Found session:", session);
      setAuctionItem(session);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile status if user is logged in
  const fetchProfile = async () => {
    if (!user || !user.user_id || !id) return;
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const fullUrl = `${apiUrl}auction-profiles?session_id=${id}&user_id=${user.user_id}`;
      const response = await axios.get(fullUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const myProfiles = response.data.profiles?.filter(p => p.user_id === user.user_id) || [];
      setProfile(myProfiles[0] || null);
    } catch (err) {
      console.error('Fetch profile error:', err);
      setProfile(null);
    }
  };

  // Initial fetch and polling for auction item and profile
  useEffect(() => {
    if (id) {
      fetchAuctionItem();
      fetchProfile();
    }

    // Set up polling every 10 seconds
    const pollingInterval = setInterval(() => {
      fetchAuctionItem();
      if (user && user.user_id) {
        fetchProfile();
      }
    }, 10000); // Poll every 10 seconds

    // Cleanup polling interval
    return () => clearInterval(pollingInterval);
  }, [id, user, token]);

  // Format number with dots for Vietnamese currency
  const formatNumberWithDots = (numStr) => {
    const num = parseFloat(numStr.replace(/\./g, '')) || 0;
    return num.toLocaleString('vi-VN');
  };

  // Validate deposit amount (5-20% of starting_price)
  const validateDeposit = (value) => {
    if (!auctionItem || !auctionItem.item) return;
    const startingPrice = parseFloat(auctionItem.item.starting_price) || 0;
    const minDeposit = startingPrice * 0.05;
    const maxDeposit = startingPrice * 0.20;
    const depositValue = parseFloat(value.replace(/\./g, '')) || 0;

    if (depositValue < minDeposit) {
      setDepositError(`Đặt cọc quá thấp. Tối thiểu: ${formatNumberWithDots(minDeposit.toString())} VNĐ (5%)`);
      return false;
    } else if (depositValue > maxDeposit) {
      setDepositError(`Đặt cọc quá cao. Tối đa: ${formatNumberWithDots(maxDeposit.toString())} VNĐ (20%)`);
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
    console.log('Click - Có user?', !!user);
    console.log('Click - Có user.user_id?', !!user?.user_id);

    console.log('Button clicked, checking login...');
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (!user.user_id) {
      console.error('User logged in but no user_id – refetch or logout');
      setShowLoginPrompt(true);
      return;
    }
    if (profile && profile.user_id === user.user_id) {
      if (profile.status === 'DaDuyet') {
        alert('Hồ sơ đã được duyệt!');
        return;
      } else if (profile.status === 'pending') {
        alert('Bạn đã đăng ký, chờ duyệt!');
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
    if (!validateDeposit(deposit)) {
      return;
    }

    if (!user || !user.user_id) {
      alert('Session hết hạn! Vui lòng đăng nhập lại.');
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
    selectedFiles.forEach(file => {
      formDataToSend.append('document_url', file);
    });

    console.log('Data gửi đến /auction-profiles:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error('REACT_APP_API_URL không được định nghĩa!');
      }
      const fullUrl = `${apiUrl}auction-profiles`;
      const response = await axios.post(fullUrl, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log('Đăng ký thành công:', response.data);
      setShowModal(false);
      setSuccessMessage('Đăng ký thành công! Chờ duyệt.');
      setTimeout(() => {
        fetchProfile();
        setSuccessMessage(false);
      }, 2000);
    } catch (err) {
      console.error('Lỗi API đăng ký:', err);
      if (err.response?.status === 401) {
        alert('Unauthorized – Vui lòng đăng nhập lại.');
        navigate('/login');
      } else if (err.response?.status === 422) {
        alert('Validation lỗi: ' + (err.response?.data?.message || 'Dữ liệu không hợp lệ'));
      } else {
        alert('Lỗi kết nối: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCheckin = () => {
    setCheckinSuccess(true);
    setTimeout(() => setCheckinSuccess(false), 5000);
  };

  const handleLoginPrompt = () => {
    navigate('/login');
  };

  if (loading) {
    return <div className="container">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <h2>Lỗi tải thông tin đấu giá</h2>
        <p>{error}</p>
        <p>Kiểm tra console để biết chi tiết. Có thể: ID không hợp lệ, API lỗi, hoặc server trả HTML (ví dụ: 404).</p>
      </div>
    );
  }

  if (!auctionItem || !auctionItem.item) {
    return <div className="container">Không tìm thấy thông tin đấu giá</div>;
  }

  const item = auctionItem.item;
  const auctionOrg = auctionItem.auction_org;

  const formatPrice = (priceStr) => {
    if (!priceStr) return 'N/A';
    const num = parseFloat(priceStr);
    return num.toLocaleString('vi-VN') + ' VNĐ';
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Chưa xác định';
    return new Date(dateTimeStr).toLocaleString('vi-VN');
  };

  const registerStart = auctionItem.register_start ? new Date(auctionItem.register_start) : null;
  const registerEnd = auctionItem.register_end ? new Date(auctionItem.register_end) : null;
  const checkinTime = auctionItem.checkin_time ? new Date(auctionItem.checkin_time) : null;
  const bidStart = auctionItem.bid_start ? new Date(auctionItem.bid_start) : null;
  const bidEnd = auctionItem.bid_end ? new Date(auctionItem.bid_end) : null;

  const isRegistrationOpen = registerStart && registerEnd && currentTime >= registerStart && currentTime <= registerEnd;
  const isCheckinTime = checkinTime && bidStart && currentTime >= checkinTime && currentTime < bidStart;
  const isBiddingOngoing = bidStart && bidEnd && currentTime >= bidStart && currentTime <= bidEnd;

  console.log('isRegistrationOpen:', isRegistrationOpen);
  console.log('isCheckinTime:', isCheckinTime);
  console.log('registerStart:', registerStart, 'registerEnd:', registerEnd, 'checkinTime:', checkinTime, 'bidStart:', bidStart, 'currentTime:', currentTime);

  let profileStatusMessage = '';
  const isProfileApproved = profile && profile.status === 'DaDuyet';
  const canRegister = !profile || profile.status !== 'DaDuyet';
  const canBid = isProfileApproved && isBiddingOngoing;
  const canCheckin = isProfileApproved && isCheckinTime;

  if (user) {
    if (!profile) {
      profileStatusMessage = '';
    } else if (profile.status === 'pending') {
      profileStatusMessage = 'Chờ duyệt hồ sơ';
    } else if (profile.status === 'DaDuyet') {
      profileStatusMessage = 'Đã duyệt, chờ đấu giá';
    } else {
      profileStatusMessage = 'Hồ sơ chưa được duyệt';
    }
  }

  let statusMessage = '';
  if (!registerStart || !registerEnd || !bidStart || !bidEnd) {
    statusMessage = 'Chưa xác định thời gian';
  } else if (currentTime < registerStart) {
    statusMessage = 'Chưa mở đăng ký';
  } else if (isRegistrationOpen) {
    statusMessage = 'Mở đăng ký dự đấu giá';
  } else if (isCheckinTime) {
    statusMessage = 'Thời gian điểm danh';
  } else if (currentTime < bidStart) {
    statusMessage = 'Chờ bắt đầu đấu giá';
  } else if (isBiddingOngoing) {
    statusMessage = 'Đang diễn ra';
  } else {
    statusMessage = 'Đã kết thúc';
  }

  if (profileStatusMessage) {
    statusMessage += ` | Hồ sơ: ${profileStatusMessage}`;
  }

  let noticeMessage = '';
  if (!registerStart || !registerEnd || !bidStart || !bidEnd) {
    noticeMessage = 'Chưa xác định thời gian';
  } else if (currentTime < registerStart) {
    noticeMessage = 'Sắp mở đăng ký dự đấu giá!';
  } else if (isRegistrationOpen) {
    noticeMessage = 'Sắp dự đấu giá!';
  } else if (isCheckinTime) {
    noticeMessage = 'Thời gian điểm danh!';
  } else if (currentTime < bidStart) {
    noticeMessage = 'Sắp bắt đầu đấu giá!';
  } else if (isBiddingOngoing) {
    noticeMessage = 'Đang đấu giá!';
  } else {
    noticeMessage = 'Kết thúc thời gian đấu giá!';
  }

  if (profileStatusMessage) {
    noticeMessage += ` | ${profileStatusMessage}`;
  }

  const getCountdown = () => {
    if (!bidEnd || currentTime > bidEnd) return 'Hết thời gian';
    const diff = bidEnd - currentTime;
    if (diff <= 0) return 'Hết thời gian';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const baseImageUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/';
  const images = auctionItem.item.image_url
    ? [`${baseImageUrl.replace('/api/', '')}${auctionItem.item.image_url}`]
    : [
        '/public/assets/img/2.jpg',
        '/public/assets/img/3.jpg',
        '/public/assets/img/4.jpg'
      ];

  const changeImage = (index) => {
    setCurrentImageIndex(index);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handlePlaceBid = () => {
    navigate(`/auction/${id}`);
  };

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
    zIndex: 1000
  };

  const modalStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto'
  };

  const formGroupStyle = {
    marginBottom: '15px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box'
  };

  const errorStyle = {
    color: 'red',
    fontSize: '0.9em',
    display: 'block',
    marginTop: '5px'
  };

  const formActionsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ccc',
    color: 'black'
  };

  const submitButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white'
  };

  const successOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const successBoxStyle = {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '400px'
  };

  const checkinButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    color: 'white',
    marginTop: '10px'
  };

  const loginPromptStyle = {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '400px'
  };

  return (
    <div className="container">
      <h2 className="title">
        {item.name} - {item.description}
      </h2>

      <div className="content-wrapper">
        <div className="image-section">
          <img
            src={images[currentImageIndex] || '/public/assets/img/xe.png'}
            alt={`${item.name} - ${item.description}`}
            className="main-image"
          />
          <div className="thumbnail-container">
            <button className="nav-button" onClick={prevImage}>
              ‹
            </button>
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
            <button className="nav-button" onClick={nextImage}>
              ›
            </button>
          </div>
          <button className="view-images-btn">Hình ảnh</button>
        </div>

        <div className="info-section">
          <div className={`status-box ${isBiddingOngoing ? 'bidding-status' : ''}`}>
            <div className="status-title">
              {isBiddingOngoing ? 'Đang diễn ra đấu giá, còn :' : 'Trạng thái đấu giá: '}
            </div>
            <div className={`status-message ${isBiddingOngoing ? 'bidding' : ''}`}>
              {statusMessage}
            </div>
            {isBiddingOngoing && (
              <div className="bidding-countdown">
                <span>{getCountdown()}</span>
              </div>
            )}
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
              <tr>
                <td>Mã tài sản:</td>
                <td>{item.item_id}</td>
              </tr>
              <tr>
                <td>Người có tài sản:</td>
                <td>{item.owner ? item.owner.full_name : `User ID: ${item.owner_id}`}</td>
              </tr>
              <tr>
                <td>Tổ chức đấu giá tài sản:</td>
                <td>{auctionOrg ? auctionOrg.full_name : 'N/A'}</td>
              </tr>
              <tr>
                <td>Phương thức đấu giá:</td>
                <td>{auctionItem.method || 'N/A'}</td>
              </tr>
              <tr>
                <td>Thời gian mở đăng kí:</td>
                <td>{formatDateTime(auctionItem.register_start)}</td>
              </tr>
              <tr>
                <td>Thời gian kết thúc đăng kí:</td>
                <td>{formatDateTime(auctionItem.register_end)}</td>
              </tr>
              <tr>
                <td>Thời gian diễm danh:</td>
                <td>{formatDateTime(auctionItem.checkin_time)}</td>
              </tr>
              <tr>
                <td>Thời gian bắt đầu trả giá:</td>
                <td className="price-highlight">{formatDateTime(auctionItem.bid_start)}</td>
              </tr>
              <tr>
                <td>Thời gian kết thúc trả giá:</td>
                <td>{formatDateTime(auctionItem.bid_end)}</td>
              </tr>
              <tr>
                <td>Bước giá:</td>
                <td>{formatPrice(auctionItem.bid_step)}</td>
              </tr>
              <tr>
                <td>Giá khởi điểm:</td>
                <td className="price-highlight">{formatPrice(item.starting_price)}</td>
              </tr>
            </tbody>
          </table>

          <div className="notice">
            <strong>{noticeMessage}</strong>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 0 ? 'active' : ''}`}
          onClick={() => setActiveTab(0)}
        >
          Thông tin đấu giá
        </button>
        <button
          className={`tab ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => setActiveTab(1)}
        >
          Hồ sơ pháp lý liên quan
        </button>
      </div>

      {activeTab === 0 && (
        <div className="tab-content">
          <ul>
            <li>
              Tên tổ chức: <a href="#" className="organizer">{auctionOrg ? auctionOrg.full_name : 'N/A'}</a>
            </li>
            <li>
              Đấu giá viên: <span className="auctioneer">TBD</span>
            </li>
            <li className="location">
              Địa chỉ: Category ID {item.category_id}
            </li>
          </ul>
        </div>
      )}

      {activeTab === 1 && (
        <div className="tab-content">
          <h3 className="document-title">Các tài liệu pháp lý liên quan đến cuộc đấu giá:</h3>
          <ul className="document-list">
            <li className="document-item">
              <strong>1. Quyết định thanh lý tài sản (QC130-16690849166.pdf)</strong><br />
              <small>Mô tả: Quyết định phê duyệt thanh lý {item.name}.</small><br />
              <a href="/public/docs/QC130-16690849166.pdf" download className="download-link">
                Tải về (PDF)
              </a>
            </li>
            <li className="document-item">
              <strong>2. Biên bản kiểm kê tài sản (Tb13-16690888292.pdf)</strong><br />
              <small>Mô tả: Biên bản kiểm kê tình trạng Category {item.category_id}, giá trị ước tính.</small><br />
              <a href="/public/docs/Tb13-16690888292.pdf" download className="download-link">
                Tải về (PDF)
              </a>
            </li>
          </ul>
          <div className="notice document-notice">
            <strong>Lưu ý: Vui lòng kiểm tra kỹ tài liệu trước khi tham gia đấu giá. Liên hệ tổ chức đấu giá nếu cần hỗ trợ.</strong>
          </div>
        </div>
      )}

      {successMessage && (
        <div style={successOverlayStyle}>
          <div style={successBoxStyle}>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {checkinSuccess && (
        <div style={successOverlayStyle}>
          <div style={successBoxStyle}>
            <p>Điểm danh thành công!</p>
          </div>
        </div>
      )}

      {showLoginPrompt && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Vui lòng đăng nhập</h3>
            <div style={loginPromptStyle}>
              <p>Để đăng ký dự đấu giá, bạn cần đăng nhập tài khoản.</p>
              <button onClick={handleLoginPrompt} style={submitButtonStyle}>
                Đăng nhập ngay
              </button>
              <button onClick={() => setShowLoginPrompt(false)} style={cancelButtonStyle}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

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
                <small style={{display: 'block', marginTop: '5px'}}>Phải từ 5% đến 20% giá khởi điểm ({formatPrice(item.starting_price)})</small>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Tài Liệu Pháp Lý (Upload mới hoặc sử dụng hiện tại):</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{...inputStyle, padding: '5px'}}
                />
                <small style={{display: 'block', marginTop: '5px'}}>Chọn file để upload (tùy chọn)</small>
                {selectedFiles.length > 0 && (
                  <p style={{marginTop: '5px'}}>Đã chọn {selectedFiles.length} file(s)</p>
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
    </div>
  );
};

export default AuctionPage;