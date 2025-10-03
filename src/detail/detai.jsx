import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';  // Import axios cho consistent
import './detail.css';

const AuctionPage = () => {
  const { id } = useParams(); // id is item_id from link
  const [auctionItem, setAuctionItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchAuctionItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = process.env.REACT_APP_API_URL;
        console.log("API URL for detail:", apiUrl);  // Debug
        
        if (!apiUrl) {
          throw new Error('REACT_APP_API_URL không được định nghĩa!');
        }

        const fullUrl = `${apiUrl}auction-sessions`;  // Fetch full list, không phải /{id}
        console.log("Full URL:", fullUrl);  // Debug: http://127.0.0.1:8000/api/auction-sessions
        
        const response = await axios.get(fullUrl);
        console.log("Full response:", response.data);  // Debug data như trước

        const { sessions } = response.data || { sessions: [] };
        // Filter by item_id (from URL param)
        const session = sessions.find(s => s.item && s.item.item_id == id);
        if (!session) {
          throw new Error(`No session found for item ID: ${id}`);
        }
        console.log("Found session:", session);  // Debug session cụ thể
        
        setAuctionItem(session);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuctionItem();
    }
  }, [id]);

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

  // auctionItem is the session, access item and other fields directly
  const item = auctionItem.item;
  const auctionOrg = auctionItem.auction_org;

  // Format prices
  const formatPrice = (priceStr) => {
    if (!priceStr) return 'N/A';
    const num = parseFloat(priceStr);
    return num.toLocaleString('vi-VN') + ' VNĐ';
  };

  // Format date/time if available
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Chưa xác định';
    return new Date(dateTimeStr).toLocaleString('vi-VN');
  };

  // Use real current date (October 03, 2025 from context; in prod: new Date())
  const now = new Date('2025-10-03T12:00:00');  // Midday Oct 03 for demo
  const bidStart = auctionItem.bid_start ? new Date(auctionItem.bid_start) : null;
  const bidEnd = auctionItem.bid_end ? new Date(auctionItem.bid_end) : null;
  const isBiddingOngoing = bidStart && bidEnd && now >= bidStart && now <= bidEnd;

  // Enhanced status logic
  let statusMessage = '';
  if (!bidStart || !bidEnd) {
    statusMessage = 'Chưa xác định thời gian';
  } else if (now < bidStart) {
    statusMessage = 'Sắp bắt đầu';
  } else if (isBiddingOngoing) {
    statusMessage = 'Đang diễn ra';
  } else {
    statusMessage = 'Đã kết thúc';
  }

  // Countdown placeholder (real calc based on now)
  const getCountdown = () => {
    if (!bidEnd || now > bidEnd) return 'Hết thời gian';
    const diff = bidEnd - now;
    if (diff <= 0) return 'Hết thời gian';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Images: Prepend API base if relative path
  const baseImageUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/';
  const images = auctionItem.item.image_url 
    ? [`${baseImageUrl.replace('/api/', '')}${auctionItem.item.image_url}`]  // Ví dụ: http://127.0.0.1:8000/img1.jpg (adjust nếu ảnh ở /storage/)
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

  const handleRegisterBid = () => {
    alert('Đăng ký đấu giá thành công!'); // Placeholder; integrate real API later
  };

  return (
    <div className="container">
      <h2 className="title">
        {item.name} - {item.description}
      </h2>

      <div className="content-wrapper">
        {/* Image Section */}
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

        {/* Info Section */}
        <div className="info-section">
          {/* Registration/Bidding Status Box */}
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
            {bidStart && now < bidStart && (
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
                <td>User ID: {item.owner_id} {/* Later: fetch owner full_name nếu có API */}</td>
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
              {/* Add row for current price if fetch bids API later */}
            </tbody>
          </table>

          <div className="notice">
            <strong>{item.status === 'ChoDauGia' ? 'Sắp mở đăng ký dự đấu giá!' : auctionItem.status === 'DangDienRa' ? 'Đấu giá đang diễn ra!' : 'Đấu giá đã kết thúc!'}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Tab Content */}
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
              Địa chỉ: Category ID {item.category_id} {/* Later: fetch category name nếu có API */}
            </li>
            {/* Add lịch sử đấu giá if fetch bids */}
          </ul>
        </div>
      )}

      {activeTab === 1 && (
        <div className="tab-content">
          <h3 className="document-title">Các tài liệu pháp lý liên quan đến cuộc đấu giá:</h3>
          <ul className="document-list">
            {/* Hardcoded for demo; later: fetch from item.documents if backend adds */}
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
    </div>
  );
};

export default AuctionPage;