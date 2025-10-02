import React, { useState } from 'react';
import './detail.css';

const AuctionPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  const images = [
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

  return (
    <div className="container">
      <h2 className="title">
        01 (một) xe ô tô nhãn hiệu KIA MORNING màu xanh, đã qua sử dụng biển kiểm soát 34A-253.97
      </h2>

      <div className="content-wrapper">
        {/* Image Section */}
        <div className="image-section">
          <img
            src="/public/assets/img/xe.png"
            alt="KIA Morning Dashboard"
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
                  className="thumbnail"
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
          <div className="status-box">
            <div className="status-title">Cuộc đấu giá sắp diễn ra, còn :</div>
            <div className="status-message">Hết thời gian đăng ký</div>
          </div>

          <table className="details-table">
            <tbody>
              <tr>
                <td>Mã tài sản:</td>
                <td>MTS-RGV82A</td>
              </tr>
              <tr>
                <td>Người có tài sản:</td>
                <td>Nguyễn An Sơn</td>
              </tr>
              <tr>
                <td>Tổ chức đấu giá tài sản:</td>
                <td>Công ty đấu giá hợp danh trực tuyến toàn cầu</td>
              </tr>
              <tr>
                <td>Phương thức đấu giá:</td>
                <td>Đấu giá tự do</td>
              </tr>
              <tr>
                <td>Thời gian mở đăng kí:</td>
                <td>14/08/2023 09:19:51</td>
              </tr>
              <tr>
                <td>Thời gian kết thúc đăng kí:</td>
                <td>14/08/2023 11:10:51</td>
              </tr>
              <tr>
                <td>Thời gian diễm danh:</td>
                <td>14/08/2023 11:11:51</td>
              </tr>
              <tr>
                <td>Thời gian bắt đầu trả giá:</td>
                <td className="price-highlight">14/08/2023 11:14:51</td>
              </tr>
              <tr>
                <td>Thời gian kết thúc trả giá:</td>
                <td>15/08/2023 09:10:51</td>
              </tr>
              <tr>
                <td>Bước giá:</td>
                <td>5,000,000 VNĐ</td>
              </tr>
              <tr>
                <td>Giá khởi điểm:</td>
                <td className="price-highlight">92,365,000 VNĐ</td>
              </tr>
            </tbody>
          </table>

          <div className="notice">
            <strong>Không trong thời gian đăng ký dự đấu giá!</strong>
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
              Tên tổ chức: <a href="#" className="organizer">Công ty đấu giá hợp danh An Việt</a>
            </li>
            <li>
              Đấu giá viên: <span className="auctioneer">Ngô Thị Lưu</span>
            </li>
            <li className="location">
              Địa chỉ: Số OV14-1, Khu chức năng đô thị Xuân Phương, phường Xuân Phương, quận Nam Từ Liêm, Hà Nội
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
              <small>Mô tả: Quyết định phê duyệt thanh lý xe ô tô KIA MORNING, biển 34A-253.97.</small><br />
              <a href="/public/docs/QC130-16690849166.pdf" download className="download-link">
                Tải về (PDF)
              </a>
            </li>
            <li className="document-item">
              <strong>2. Biên bản kiểm kê tài sản (Tb13-16690888292.pdf)</strong><br />
              <small>Mô tả: Biên bản kiểm kê tình trạng xe, giá trị ước tính và các giấy tờ liên quan.</small><br />
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