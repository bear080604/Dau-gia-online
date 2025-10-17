import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './auction.module.css';
import { UserContext } from '../UserContext';

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

  const API_URL = process.env.REACT_APP_API_URL;

  const now = paused ? pausedTime : currentTime;
  const bidStart = auctionItem?.bid_start ? new Date(auctionItem.bid_start) : null;
  const bidEnd = auctionItem?.bid_end ? new Date(auctionItem.bid_end) : null;
  const isBiddingOngoing = bidStart && bidEnd && now >= bidStart && now <= bidEnd;
  const isAuctionEnded = bidEnd && now > bidEnd;
  const isAuctionNotStarted = bidStart && now < bidStart;

  // Update time every second
  useEffect(() => {
    let interval;

    if (!paused) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => new Date());
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
        const response = await axios.get(fullUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        const session = data.session;
        if (!session) {
          throw new Error(`Không tìm thấy phiên đấu giá với ID: ${id}`);
        }
        setPaused(session.paused ?? false);
        setAuctionItem(session);
      } catch (err) {
      
        setError(err.response?.data?.message || err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchAuctionItem();
    } else if (!token) {
      setError('Vui lòng đăng nhập để xem thông tin đấu giá');
      setLoading(false);
    }
  }, [id, token]);

  // Tự động cập nhật trạng thái phiên đấu giá
  useEffect(() => {
    if (!id || !token) return;

    const interval = setInterval(async () => {
      try {
        const fullUrl = `${API_URL}auction-sessions/${id}`;
        const response = await axios.get(fullUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const session = response.data.session;
        if (session) {
          if (session.paused !== paused) {
            setPaused(session.paused ?? false);
            if (!session.paused) {
              setPausedTime(null);
            }
            showToast(
              session.paused
                ? '🔴 Phiên đấu giá đã bị tạm dừng!'
                : '🟢 Phiên đấu giá đã được tiếp tục!',
              session.paused ? 'warning' : 'success'
            );
          }
          setAuctionItem(session);
        }
      } catch (err) {
      
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, token, paused]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fullUrl = `${API_URL}categories`;
        const response = await axios.get(fullUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        if (data.status && data.data) {
          setCategories(data.data);
        } else {
          throw new Error(data.message || 'Không thể lấy danh sách danh mục');
        }
      } catch (err) {
        setCategories([]);
        showToast('Không thể tải danh sách danh mục', 'error');
      }
    };

    if (token) {
      fetchCategories();
    }
  }, [token]);

  // Hàm ánh xạ category_id với tên danh mục
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    return category ? category.name : 'N/A';
  };

  const fetchBidders = async () => {
    if (!id || !token) return;
   
    try {
      const fullUrl = `${API_URL}auction-profiles?session_id=${id}`;
      const response = await axios.get(fullUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
   
      const profiles = data.profiles || [];
      const filteredBidders = profiles.filter(p => 
        (p.status === 'DaDuyet' || p.status === 'pending') && 
        p.session_id === parseInt(id)
      );

      setBidders(filteredBidders);
    } catch (err) {
      
      setBidders([]);
    }
  };

  // Fetch bids and update current price
  const fetchBids = async () => {
    if (!id || !token) return;
    try {
      const fullUrl = `${API_URL}bids/${id}`;
      const response = await axios.get(fullUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setBids(data.bids || []);
      let highest = parseFloat(auctionItem?.item?.starting_price) || 0;
      if (data.bids && data.bids.length > 0) {
        const maxAmount = Math.max(...data.bids.map(b => parseFloat(b.amount)));
        if (maxAmount > highest) highest = maxAmount;
      }
      setCurrentPrice(highest);
    } catch (err) {
     
      setBids([]);
    }
  };

  // Poll bids every 3 seconds if bidding is ongoing
  useEffect(() => {
    if (auctionItem) {
      fetchBidders();
      fetchBids();
    }
  }, [auctionItem]);

  useEffect(() => {
    let interval;
    if (auctionItem && isBiddingOngoing && token) {
      interval = setInterval(fetchBids, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [auctionItem, isBiddingOngoing, token]);

  // Show toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: '', type: '', show: false }), 5000);
  };

  const closeToast = () => {
    setToast({ message: '', type: '', show: false });
  };

  // Format numbers and prices
  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

  // Calculate bid steps (N)
  const calculateN = () => {
    if (!auctionItem) return 0;
    const currentBidValue = displayValue ? parseInt(displayValue.replace(/\./g, '')) : 0;
    if (currentBidValue <= currentPrice) return 0;
    const bidStep = parseFloat(auctionItem.bid_step) || 10000000;
    return Math.floor((currentBidValue - currentPrice) / bidStep);
  };

  // Calculate countdown
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

  // Handle bid input
  const handleNumberInputChange = (e) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const parts = rawValue.split('.');
    if (parts.length > 1) {
      rawValue = parts[0] + '.' + parts.slice(1).join('').slice(0, 3 * (parts.length - 1));
    }
    setDisplayValue(rawValue);
  };

  const handleBlur = () => {
    if (displayValue === '') return;
    const value = parseInt(displayValue.replace(/\./g, '')) || 0;
    setDisplayValue(formatNumber(value));
  };

  // Handle place bid with custom modal
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

    if (currentBidValue < minBid) {
      showToast(`Số tiền phải >= ${formatPrice(minBid)}!`, 'error');
      return;
    }

    if (!isBiddingOngoing) {
      showToast('Phiên đấu giá chưa bắt đầu hoặc đã kết thúc.', 'error');
      return;
    }

    setPendingBid(currentBidValue);
    setShowConfirmModal(true);
  };

  const handleConfirmBid = async () => {
    try {
      const fullUrl = `${API_URL}bids`;
      const response = await axios.post(fullUrl, {
        session_id: id,
        amount: pendingBid,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = response.data;
      if (result.status) {
        showToast('Đặt giá thành công!', 'success');
        setDisplayValue('');
        fetchBids();
      } else {
        showToast(result.message || 'Lỗi đặt giá', 'error');
      }
    } catch (err) {
   
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
  const n = calculateN();
  const countdown = getCountdownParts();
  const highestBid = bids.length > 0 ? Math.max(...bids.map(b => parseFloat(b.amount))) : currentPrice;
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
                  <div>Số tiền đấu giá (tối thiểu: {formatPrice(minBid)})</div>
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
                  <div style={{ fontSize: '12px', color: '#2772BA' }}>
                    Số tiền đấu giá = Giá hiện tại ({formatNumber(currentPrice)} VNĐ) + {n} x Bước giá ({formatNumber(bidStep)} VNĐ)
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