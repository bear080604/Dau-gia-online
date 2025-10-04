import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './auction.module.css';

const AuctionPage = () => {
  const { id } = useParams(); // id is item_id or session_id from link
  const navigate = useNavigate();
  const [auctionItem, setAuctionItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date()); // Real-time clock for dynamic updates
  const [bidValue, setBidValue] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0); // Will be fetched or simulated

  // Modal states if needed, but for now focus on bidding
  const [successMessage, setSuccessMessage] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  // Update current time every second for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAuctionItem = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("API URL for auction:", API_URL);  // Debug
        
        if (!API_URL) {
          throw new Error('REACT_APP_API_URL không được định nghĩa!');
        }

        const fullUrl = `${API_URL}auction-sessions`;  // Fetch full list, filter by id
        console.log("Full URL:", fullUrl);  // Debug
        
        const response = await fetch(fullUrl);
        const data = await response.json();
        console.log("Full response:", data);  // Debug data

        const { sessions } = data || { sessions: [] };
        // Filter by item_id or session_id (assuming item_id from params)
        const session = sessions.find(s => s.item && s.item.item_id == id);
        if (!session) {
          throw new Error(`No session found for item ID: ${id}`);
        }
        console.log("Found session:", session);  // Debug session cụ thể
        
        setAuctionItem(session);
        // Set initial current price (simulate or fetch from bids)
        setCurrentPrice(parseFloat(session.item.starting_price) || 0);
        // Set initial bid value to min bid: current + step
        const bidStep = parseFloat(session.bid_step) || 10000000;
        setBidValue(currentPrice + bidStep);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuctionItem();
    }
  }, [id]);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format price with VNĐ
  const formatPrice = (priceStr) => {
    if (!priceStr) return 'N/A';
    const num = parseFloat(priceStr);
    return num.toLocaleString('vi-VN') + ' VNĐ';
  };

  // Calculate N for bid formula
  const calculateN = () => {
    if (!auctionItem || bidValue <= currentPrice) return 0;
    const bidStep = parseFloat(auctionItem.bid_step) || 10000000;
    return Math.floor((bidValue - currentPrice) / bidStep);
  };

  // Time-related logic
  const bidStart = auctionItem?.bid_start ? new Date(auctionItem.bid_start) : null;
  const bidEnd = auctionItem?.bid_end ? new Date(auctionItem.bid_end) : null;
  const isBiddingOngoing = bidStart && bidEnd && currentTime >= bidStart && currentTime <= bidEnd;

  // Real-time countdown for bidding - return object for hours, minutes, seconds
  const getCountdownParts = () => {
    if (!bidEnd || currentTime > bidEnd) return { hours: '00', minutes: '00', seconds: '00' };
    const diff = bidEnd - currentTime;
    if (diff <= 0) return { hours: '00', minutes: '00', seconds: '00' };
    const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
    return { hours, minutes, seconds };
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

  const handlePlaceBid = () => {
    // Fake bid: log and show success
    console.log('Placing bid:', bidValue);
    setSuccessMessage(true);
    setTimeout(() => setSuccessMessage(false), 5000);
    // Later: API call to place bid
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
  const startingPrice = parseFloat(item.starting_price) || 0;
  const minBid = currentPrice + bidStep;
  const maxBid = startingPrice * 10; // Arbitrary max, adjust as needed
  const n = calculateN();
  const countdown = getCountdownParts();

  return (
    <div className={styles.container}>
      <div className={styles.header}>Phiên đấu giá {item.name}</div>
      
      {/* Lot Numbers Frame with Countdown */}
      <div className={styles['lot-numbers']}>
        <div className={styles['lot-number']}>{countdown.hours}</div>
        <div className={styles['lot-number']}>{countdown.minutes}</div>
        <div className={styles['lot-number']}>{countdown.seconds}</div>
      </div>

      <div className={styles.content}>
        <div className={styles['left-section']}>
          <div className={styles['section-title']}>THÔNG TIN TÀI SẢN</div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Mã lô sản:</div>
            <div className={styles['info-value']}>{item.item_id}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Loại tài sản:</div>
            <div className={styles['info-value']}>Bất động sản</div> {/* Based on category_id = 1 */}
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Người có tài sản:</div>
            <div className={styles['info-value']}>User ID: {item.owner_id}</div> {/* Fetch full name later */}
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Nơi có tài sản:</div>
            <div className={styles['info-value']}>Kho hàng thu mua đồi Gò Dưa phường Tân Quy Q7</div> {/* Fake */}
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Thời gian xem tài sản:</div>
            <div className={styles['info-value']}>Giờ hành chính các ngày từ 24/12 đến 28/12/2021</div> {/* Fake */}
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Tổ chức đấu giá tài sản:</div>
            <div className={styles['info-value']}>{auctionItem.auction_org?.full_name || 'N/A'}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Phương thức đấu giá:</div>
            <div className={styles['info-value']}>{auctionItem.method || 'Trực tiếp'}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Thời gian mở đăng ký:</div>
            <div className={styles['info-value']}>{new Date(auctionItem.register_start).toLocaleString('vi-VN')}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Thời gian kết thúc đăng ký:</div>
            <div className={styles['info-value']}>{new Date(auctionItem.register_end).toLocaleString('vi-VN')}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Thời gian bắt đầu trả giá:</div>
            <div className={styles['info-value']}>{new Date(auctionItem.bid_start).toLocaleString('vi-VN')}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Tiền hồ sơ:</div>
            <div className={styles['info-value']}>500,000 VNĐ</div> {/* Fake */}
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Tiền đặt trước:</div>
            <div className={styles['info-value']}>3,000,000 VNĐ</div> {/* Fake */}
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Giá khởi điểm:</div>
            <div className={styles['info-value']}>{formatPrice(item.starting_price)}</div>
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Giá hiện tại:</div>
            <div className={styles['info-value']}>{formatPrice(currentPrice)}</div> {/* Fetch real-time bids later */}
          </div>
          <div className={styles['info-row']}>
            <div className={styles['info-label']}>Số lượt yêu cầu đấu giá:</div>
            <div className={styles['info-value']}>4</div> {/* Fake */}
          </div>
        </div>

        <div className={styles['right-section']}>
          <div className={styles['participants-section']}>
            <div className={styles['section-title']}>THÀNH PHẦN THAM DỰ</div>
            <div className={styles['info-row']}>
              <div className={styles['info-label']}>Thư ký phiên đấu giá:</div>
              <div className={styles['info-value']}>Nguyễn Văn A</div> {/* Fake */}
            </div>
            <div className={styles['info-row']}>
              <div className={styles['info-label']}>Đại diện bên có tài sản:</div>
              <div className={styles['info-value']}>Nguyễn Văn B</div> {/* Fake */}
            </div>
            <div className={styles['info-row']}>
              <div className={styles['info-label']}>Đấu giá viên:</div>
              <div className={styles['info-value']}>Nguyễn Văn D</div> {/* Fake */}
            </div>
            <div className={styles['info-row']}>
              <div className={styles['info-label']}>Đại diện người tham gia đấu giá:</div>
              <div className={styles['info-value']}>Nguyễn Văn E</div> {/* Fake */}
            </div>
          </div>

          <div className={styles['bid-section']}>
            <div className={styles['section-title']}>THAM GIA ĐẤU GIÁ</div>
            <div className={styles['bid-info']}>
              <input
                type="range"
                min={minBid}
                max={maxBid}
                value={bidValue}
                step={bidStep}
                onChange={handleInput}
                className={styles.slider}
              />
              <div>Số tiền đấu giá</div>
              <div className={styles['bid-amount']}>
                {formatNumber(bidValue)}<br />VNĐ
              </div>
              <div style={{ fontSize: '12px', color: '#2772BA' }}>
                Số tiền đấu giá = Giá hiện tại ({formatNumber(currentPrice)} VNĐ) + {n} x Bước giá ({formatNumber(bidStep)} VNĐ)
              </div>
            </div>
            {isBiddingOngoing && (
              <button className={styles['bid-button']} onClick={handlePlaceBid}>
                Đấu giá
              </button>
            )}
            {!isBiddingOngoing && (
              <button className={styles['bid-button']} disabled>
                Chưa đến giờ đấu giá
              </button>
            )}
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
            {/* Hardcoded for demo; fetch bidders later */}
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

      {/* Success Message */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <p>Đấu giá thành công!</p>
        </div>
      )}
    </div>
  );
};

export default AuctionPage;