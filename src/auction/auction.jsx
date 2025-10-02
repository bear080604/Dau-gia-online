import React, { useState } from 'react';
import styles from './auction.module.css';

const AuctionPage = () => {
  const [bidValue, setBidValue] = useState(490000000);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setBidValue(value);
  };

  const updateSliderBackground = (slider) => {
    const min = slider.min;
    const max = slider.max;
    const val = slider.value;
    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #2772BA 0%, #2772BA ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
  };

  const handleInput = (e) => {
    handleSliderChange(e);
    updateSliderBackground(e.target);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Phiên đấu giá đồng điện rã</div>
      
      <div className={styles.timer}>00:00</div>
      
      <div className={styles['lot-numbers']}>
        <div className={styles['lot-number']}>14</div>
        <div className={styles['lot-number']}>17</div>
        <div className={styles['lot-number']}>18</div>
        <div className={styles['lot-number']}>27</div>
      </div>

      <div className={styles.content}>
        <div className={styles['left-section']}>
          <div className={styles['section-title']}>THÔNG TIN TÀI SẢN</div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Mã lô sản:</div>
            <div className={styles['info-value']}>D401-22-01-BTN</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Loại tài sản:</div>
            <div className={styles['info-value']}>Khác</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Người có tài sản:</div>
            <div className={styles['info-value']}>Công ty TNHH Nicehustom</div>
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
            <div className={styles['info-label']}>Tổ chức đấu giá tài sản:</div>
            <div className={styles['info-value']}>Công ty đấu giá hợp danh Hoàn Cầu</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Phương thức đấu giá:</div>
            <div className={styles['info-value']}>Trực tiếp</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Thời gian mở đăng ký:</div>
            <div className={styles['info-value']}>17/12/2021 08:00:00</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Thời gian kết thúc đăng ký:</div>
            <div className={styles['info-value']}>30/12/2021 16:30:00</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Thời gian bắt đầu trả giá:</div>
            <div className={styles['info-value']}>04/01/2022 10:00:00</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Tiền hồ sơ:</div>
            <div className={styles['info-value']}>500,000 VNĐ</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Tiền đặt trước:</div>
            <div className={styles['info-value']}>3,000,000 VNĐ</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Giá khởi điểm:</div>
            <div className={styles['info-value']}>4,000,000,000 VNĐ</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Giá hiện tại:</div>
            <div className={styles['info-value']}>4,000,000,000 VNĐ</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Số lượt yêu cầu đấu giá:</div>
            <div className={styles['info-value']}>4</div>
          </div>
        </div>

        <div className={styles['right-section']}>
          <div className={styles['participants-section']}>
            <div className={styles['section-title']}>THÀNH PHẦN THAM DỰ</div>
            <div className={styles['info-row']}>
              <div className={styles['info-label']}>Thư ký phiên đấu giá:</div>
              <div className={styles['info-value']}>Nguyễn Văn A</div>
            </div>
            <div className={styles['info-row']}>
              <div className={styles['info-label']}>Đại diện bên có tài sản:</div>
              <div className={styles['info-value']}>Nguyễn Văn B</div>
            </div>
            <div className={styles['info-row']}>
              <div className={styles['info-label']}>Đấu giá viên:</div>
              <div className={styles['info-value']}>Nguyễn Văn D</div>
            </div>
            <div className={styles['info-row']}>
              <div className={styles['info-label']}>Đại diện người tham gia đấu giá:</div>
              <div className={styles['info-value']}>Nguyễn Văn D</div>
            </div>
          </div>

          <div className={styles['bid-section']}>
            <div className={styles['section-title']}>THAM GIA ĐẤU GIÁ</div>
            <div className={styles['bid-info']}>
              <input
                type="range"
                min="490000000"
                max="5000000000"
                value={bidValue}
                step="10000000"
                onChange={handleInput}
                className={styles.slider}
              />
              <div>Số tiền đấu giá</div>
              <div className={styles['bid-amount']}>
                {formatNumber(bidValue)}<br />VNĐ
              </div>
              <div style={{ fontSize: '12px', color: '#2772BA' }}>
                Số tiền đấu giá = Số tiền hiện tại + Bước giá
              </div>
            </div>
            <button className={styles['bid-button']}>Đấu giá</button>
          </div>
        </div>
      </div>

      <div className={styles['participants-table']}>
        <div className={styles['table-title']}>DANH SÁCH NGƯỜI ĐĂNG KÝ ĐẤU GIÁ</div>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th></th>
              <th>Họ và Tên</th>
              <th>Tiền hồ sơ</th>
              <th>Tiền đặt trước</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><span className={`${styles['user-icon']} ${styles.green}`}></span></td>
              <td>Bùi Thị B</td>
              <td>400,000</td>
              <td>500,000</td>
            </tr>
            <tr>
              <td>2</td>
              <td><span className={`${styles['user-icon']} ${styles.pink}`}></span></td>
              <td>Bùi Thị E</td>
              <td>400,000</td>
              <td>500,000</td>
            </tr>
            <tr>
              <td>3</td>
              <td><span className={`${styles['user-icon']} ${styles.pink}`}></span></td>
              <td>Bùi Thị P</td>
              <td>400,000</td>
              <td>500,000</td>
            </tr>
            <tr>
              <td>4</td>
              <td><span className={`${styles['user-icon']} ${styles.pink}`}></span></td>
              <td>Bùi Thị F</td>
              <td>400,000</td>
              <td>500,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuctionPage;