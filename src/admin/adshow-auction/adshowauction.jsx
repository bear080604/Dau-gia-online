import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './adshowauction.css';
import { useParams } from 'react-router-dom';
// Tách Countdown thành component riêng
const CountdownDisplay = React.memo(({ 
  timer, 
  label, 
  hours, 
  minutes, 
  seconds 
}) => (
  <div className="adviewdg-lot-numbers">
    <div className="adviewdg-countdown-label">{label}</div>
    <div className="adviewdg-lot-number">{hours}</div>
    <div className="adviewdg-lot-number">{minutes}</div>
    <div className="adviewdg-lot-number">{seconds}</div>
  </div>
));

// Tách Control Section thành component riêng
const ControlSection = React.memo(({
  paused,
  statusText,
  timer,
  logMessages,
  onPause,
  onResume,
  countdownData
}) => (
  <div className="adviewdg-control-section">
    <h3>Điều khiển Phiên</h3>
    <div className="adviewdg-status">
      Trạng thái: <span id="adviewdg-statusTxt">{statusText}</span>
    </div>
    <div className="adviewdg-timer" id="adviewdg-timerTxt">{timer}</div>
    <button 
      id="adviewdg-pauseBtn" 
      className="adviewdg-button adviewdg-pause-btn"
      onClick={onPause}
      disabled={countdownData.status === 'ended' || paused}
    >
      ⏸ Dừng
    </button>
    <button 
      id="adviewdg-resumeBtn" 
      className="adviewdg-button adviewdg-resume-btn" 
      onClick={onResume}
      disabled={!paused}
    >
      ▶ Tiếp tục
    </button>
    <div className="adviewdg-log" id="adviewdg-log">
      {logMessages.map((msg, index) => (
        <div key={index}>{msg}</div>
      ))}
    </div>
  </div>
));

const AdShowAuction = () => {
    // Constants
    const API_URL = 'http://localhost:8000/api/';
  const { id } = useParams(); // Lấy id từ URL
  
    // State management
    const [token] = useState(localStorage.getItem('token'));
    const [auctionItem, setAuctionItem] = useState(null);
    const [paused, setPaused] = useState(false);
    const [pausedTime, setPausedTime] = useState(null);
    const [bidders, setBidders] = useState([]);
    const [bids, setBids] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentPrice, setCurrentPrice] = useState(0);
    
    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalReason, setModalReason] = useState('');
    const [modalOnConfirm, setModalOnConfirm] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    
    // Log state
    const [logMessages, setLogMessages] = useState([]);
    
    // Refs
    const timeIntervalRef = useRef(null);
    const pollIntervalRef = useRef(null);
    const isPollingPausedRef = useRef(false);

    // Utility functions
    const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    const formatPrice = (priceStr) => {
        if (!priceStr) return 'N/A';
        const num = parseFloat(priceStr);
        return num.toLocaleString('vi-VN') + ' VNĐ';
    };
    
    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        return new Date(dateTimeStr).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    };

    // Log helper
    const log = useCallback((message) => {
        const time = new Date().toLocaleTimeString();
        setLogMessages(prev => {
            const newMessages = [...prev, `[${time}] ${message}`];
            return newMessages.slice(-20);
        });
    }, []);

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.category_id === categoryId);
        return category ? category.name : 'N/A';
    };

    // API functions
    const fetchWithAuth = useCallback(async (url, options = {}) => {
        try {
            const headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
            const response = await fetch(`${API_URL}${url}`, { ...options, headers });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }, [token]);

    const fetchAuctionItem = useCallback(async () => {
        try {
            const data = await fetchWithAuth(`auction-sessions/${id}`);
            return data.session;
        } catch (err) {
            console.error('Fetch auction item error:', err);
            throw err;
        }
    }, [fetchWithAuth]);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await fetchWithAuth('categories');
            return data.status && data.data ? data.data : [];
        } catch (err) {
            console.error('Fetch categories error:', err);
            return [];
        }
    }, [fetchWithAuth]);

    const fetchBidders = useCallback(async () => {
        try {
            const data = await fetchWithAuth(`auction-profiles?session_id=${id}`);
            return (data.profiles || []).filter(p => 
                (p.status === 'DaDuyet' || p.status === 'pending') && p.session_id === parseInt(id)
            );
        } catch (err) {
            console.error('Fetch bidders error:', err);
            return [];
        }
    }, [fetchWithAuth]);

    const fetchBids = useCallback(async () => {
        try {
            const data = await fetchWithAuth(`bids/${id}`);
            return data.bids || [];
        } catch (err) {
            console.error('Fetch bids error:', err);
            return [];
        }
    }, [fetchWithAuth]);

    // Polling với clear interval khi pause
    const pollAuctionData = useCallback(async () => {
        if (isPollingPausedRef.current) return;
        
        try {
            const [sessionData, bidsData, biddersData] = await Promise.all([
                fetchAuctionItem(),
                fetchBids(),
                fetchBidders()
            ]);

            // Batch updates
            if (sessionData) {
                setAuctionItem(prev => {
                    if (prev?.paused !== sessionData.paused) {
                        setPaused(sessionData.paused ?? false);
                        setPausedTime(sessionData.paused ? new Date() : null);
                    }
                    return sessionData;
                });
            }

            setBids(bidsData);
            setBidders(biddersData);

        } catch (err) {
            console.error('Poll error:', err);
        }
    }, [fetchAuctionItem, fetchBids, fetchBidders]);

    // Tách currentPrice calculation thành useEffect riêng
    useEffect(() => {
        if (bids.length > 0 && auctionItem) {
            const maxAmount = Math.max(...bids.map(b => parseFloat(b.amount)));
            const startingPrice = parseFloat(auctionItem?.item?.starting_price) || 0;
            const newPrice = Math.max(maxAmount, startingPrice);
            
            setCurrentPrice(prev => prev !== newPrice ? newPrice : prev);
        } else if (auctionItem?.item?.starting_price) {
            const startingPrice = parseFloat(auctionItem.item.starting_price);
            setCurrentPrice(prev => prev !== startingPrice ? startingPrice : prev);
        }
    }, [bids, auctionItem]);

    // Countdown logic
    const countdownData = useMemo(() => {
        if (!auctionItem) {
            return {
                countdownLabel: 'Thời gian không xác định',
                status: 'invalid',
                displaySeconds: 0
            };
        }

        const now = paused ? pausedTime : currentTime;
        const bidStart = auctionItem.bid_start ? new Date(auctionItem.bid_start) : null;
        const bidEnd = auctionItem.bid_end ? new Date(auctionItem.bid_end) : null;
        
        const isBiddingOngoing = bidStart && bidEnd && now >= bidStart && now <= bidEnd;
        const isAuctionEnded = bidEnd && now > bidEnd;
        const isAuctionNotStarted = bidStart && now < bidStart;

        let status = 'invalid';
        let countdownLabel = 'Thời gian không xác định';

        if (isAuctionEnded) {
            countdownLabel = 'Phiên đấu giá đã kết thúc';
            status = 'ended';
        } else if (isAuctionNotStarted) {
            countdownLabel = 'Thời gian còn lại để bắt đầu:';
            status = 'not_started';
        } else if (isBiddingOngoing) {
            countdownLabel = 'Thời gian đấu giá còn:';
            status = 'ongoing';
        }

        let diff;
        if (status === 'not_started') {
            diff = bidStart - now;
        } else if (status === 'ongoing') {
            diff = bidEnd - now;
        } else {
            diff = 0;
        }

        return {
            countdownLabel,
            status,
            displaySeconds: Math.max(0, diff / 1000)
        };
    }, [auctionItem, paused, pausedTime, currentTime]);

    const countdownValues = useMemo(() => {
        const displaySeconds = countdownData.displaySeconds;
        const hours = Math.floor(displaySeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((displaySeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = Math.floor(displaySeconds % 60).toString().padStart(2, '0');
        const timer = `${minutes}:${seconds}`;
        
        return { hours, minutes, seconds, timer };
    }, [countdownData.displaySeconds]);

    const statusText = useMemo(() => {
        if (paused) return "⏸ Đang tạm dừng";
        if (countdownData.status === 'ended') return "⏹ Đã kết thúc";
        if (countdownData.status === 'ongoing') return "🟢 Đang diễn ra";
        return "invalid";
    }, [paused, countdownData.status]);

    // Control functions - OPTIMIZED VERSION
    const handlePause = useCallback(async () => {
        if (!token) {
            alert("Vui lòng đăng nhập lại để có token hợp lệ!");
            return;
        }

        // 1. Clear polling ngay lập tức
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }

        // 2. Update UI ngay lập tức
        setPaused(true);
        setPausedTime(new Date());
        log(`⏸ Đang tạm dừng phiên...`);

        // 3. Tạm dừng polling flag
        isPollingPausedRef.current = true;

        try {
            const res = await fetch(`${API_URL}auction-sessions/${id}/pause`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ reason: 'Dừng tạm thời' })
            });
            
            if (!res.ok) {
                throw new Error('Lỗi pause API');
            }
            
            log(`✅ Đã tạm dừng phiên đấu giá`);
        } catch (err) {
            console.error(err);
            // Rollback chỉ khi cần thiết
            setPaused(false);
            setPausedTime(null);
            log(`❌ Lỗi pause: ${err.message}`);
            
            // Khởi động lại polling nếu lỗi
            if (!pollIntervalRef.current) {
                pollIntervalRef.current = setInterval(pollAuctionData, 5000);
                isPollingPausedRef.current = false;
            }
        }
    }, [token, log, pollAuctionData]);

    const handleResume = useCallback(async () => {
        if (!token) {
            alert("Vui lòng đăng nhập lại để có token hợp lệ!");
            return;
        }

        // 1. Update UI ngay lập tức
        setPaused(false);
        setPausedTime(null);
        log(`▶ Đang tiếp tục phiên...`);

        // 2. Vẫn giữ polling paused trong lúc fetch
        isPollingPausedRef.current = true;

        try {
            const res = await fetch(`${API_URL}auction-sessions/${id}/resume`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ reason: 'Tiếp tục phiên' })
            });
            
            const data = await res.json();
            if (res.ok) {
                log(`✅ Đã tiếp tục phiên đấu giá`);
            } else {
                throw new Error(data.message || 'Lỗi tiếp tục phiên');
            }
        } catch (err) {
            console.error(err);
            // Rollback
            setPaused(true);
            setPausedTime(new Date());
            log(`❌ Lỗi resume: ${err.message}`);
        } finally {
            // Khởi động lại polling sau 2 giây
            setTimeout(() => {
                isPollingPausedRef.current = false;
                if (!pollIntervalRef.current) {
                    pollIntervalRef.current = setInterval(pollAuctionData, 5000);
                }
            }, 2000);
        }
    }, [token, log, pollAuctionData]);

    const handleKick = useCallback((userId, userName) => {
        if (!userId || userId === 'unknown') {
            alert("Không thể kích vì UserID không hợp lệ.");
            return;
        }

        setModalTitle('Kích người tham gia');
        setModalMessage(`Bạn có chắc chắn muốn kích ${userName} (ID: ${userId})?`);
        setModalReason('');
        setModalOnConfirm(() => async (reason) => {
            setModalLoading(true);
            
            try {
                const res = await fetch(`${API_URL}auction-sessions/${id}/kick/${userId}`, {
                    method: "POST",
                    headers: { 
                        "Authorization": `Bearer ${token}`, 
                        "Content-Type": "application/json" 
                    },
                    body: JSON.stringify({ reason })
                });
                
                if (res.ok) {
                    log(`✅ Đã kích user ID ${userId}. Lý do: ${reason}`);
                    const updatedBidders = await fetchBidders();
                    setBidders(updatedBidders);
                } else {
                    const text = await res.text();
                    let data = {};
                    try { data = JSON.parse(text); } catch {}
                    throw new Error(data.message || text);
                }
            } catch (err) {
                log(`❌ Lỗi kick: ${err.message}`);
            } finally {
                setModalLoading(false);
            }
        });
        setModalVisible(true);
    }, [token, fetchBidders, log]);

    const handleModalConfirm = useCallback(async () => {
        if (!modalReason.trim()) {
            alert('Vui lòng nhập lý do');
            return;
        }
        
        setModalVisible(false);
        
        try {
            await modalOnConfirm(modalReason);
        } catch (err) {
            log(`❌ Lỗi: ${err.message}`);
        }
    }, [modalReason, modalOnConfirm, log]);

    const handleModalCancel = useCallback(() => {
        setModalVisible(false);
        setModalLoading(false);
    }, []);

    // Optimized table components với virtualized data
    const BidsTable = useMemo(() => React.memo(({ bids, currentPrice }) => {
        const displayedBids = bids.slice(-50);
        const highestBid = displayedBids.length > 0 ? 
            Math.max(...displayedBids.map(b => parseFloat(b.amount))) : currentPrice;
        
        if (displayedBids.length === 0) {
            return (
                <tr>
                    <td colSpan="4">Chưa có lượt đặt giá</td>
                </tr>
            );
        }

        return displayedBids.map((bid, index) => (
            <tr key={bid.bid_id || index} className={parseFloat(bid.amount) === highestBid ? 'adviewdg-current-winner' : ''}>
                <td className="adviewdg-td">{index + 1}</td>
                <td className="adviewdg-td">{bid.user?.full_name || 'N/A'}</td>
                <td className="adviewdg-td">{formatPrice(bid.amount)}</td>
                <td className="adviewdg-td">{formatDateTime(bid.bid_time)}</td>
            </tr>
        ));
    }), []);

    const BiddersTable = useMemo(() => React.memo(({ bidders, onKick }) => {
        const displayedBidders = bidders.slice(0, 50);
        
        if (displayedBidders.length === 0) {
            return (
                <tr>
                    <td colSpan="4">Chưa có người đăng ký</td>
                </tr>
            );
        }

        return displayedBidders.map((bidder, index) => {
            const userId = bidder.user?.user_id || bidder.id || 'unknown';
            const userName = bidder.user?.full_name || bidder.full_name || 'N/A';
            
            return (
                <tr key={userId}>
                    <td className="adviewdg-td">{index + 1}</td>
                    <td className="adviewdg-td">{userName}</td>
                    <td className="adviewdg-td">{formatPrice(bidder.deposit_amount)}</td>
                    <td className="adviewdg-td">
                        <button 
                            className="adviewdg-button adviewdg-kick-btn adviewdg-bidder-kick" 
                            onClick={() => onKick(userId, userName)}
                        >
                            🚫 Kích
                        </button>
                    </td>
                </tr>
            );
        });
    }), []);

    // Initial load effect
    useEffect(() => {
        const initializeData = async () => {
            if (!id || !token) {
                log('Vui lòng đăng nhập để xem thông tin đấu giá');
                return;
            }

            setLoading(true);
            try {
                const [session, categoriesData, bidsData, biddersData] = await Promise.all([
                    fetchAuctionItem(),
                    fetchCategories(),
                    fetchBids(),
                    fetchBidders()
                ]);

                setAuctionItem(session);
                setCategories(categoriesData);
                setBids(bidsData);
                setBidders(biddersData);

                if (session) {
                    setPaused(session.paused ?? false);
                    setPausedTime(session.paused ? new Date() : null);
                }

            } catch (err) {
                setError(err.message);
                log(`Lỗi khởi tạo: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        initializeData();

        // Start intervals
        timeIntervalRef.current = setInterval(() => {
            if (!paused) {
                setCurrentTime(new Date());
            }
        }, 1000);

        pollIntervalRef.current = setInterval(pollAuctionData, 5000);

        // Cleanup
        return () => {
            if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [token, paused, pollAuctionData, log, fetchAuctionItem, fetchCategories, fetchBids, fetchBidders]);

    if (loading) {
        return <div className="adviewdg-body">Đang tải...</div>;
    }

    if (error) {
        return <div className="adviewdg-body">Lỗi: {error}</div>;
    }

    return (
        <div className="adviewdg-body">
            <div id="adviewdg-container" className="adviewdg-container">
                <div className="adviewdg-header" id="adviewdg-header">
                    Phiên đấu giá {auctionItem?.item?.name || 'Loading...'} (ID: {id})
                </div>
                
                <div 
                    className={`adviewdg-pausedNotice ${paused && countdownData.status !== 'ended' ? '' : 'adviewdg-pausedNotice-hidden'}`}
                    id="adviewdg-pausedNotice"
                >
                    ⏸ Phiên đấu giá đang tạm dừng — Vui lòng chờ đấu giá viên tiếp tục!
                </div>
                
                <CountdownDisplay 
                    timer={countdownValues.timer}
                    label={countdownData.countdownLabel}
                    hours={countdownValues.hours}
                    minutes={countdownValues.minutes}
                    seconds={countdownValues.seconds}
                />

                <div className="adviewdg-content">
                    <div className="adviewdg-left-section">
                        <div className="adviewdg-section-title">THÔNG TIN SẢN PHẨM</div>
                        <div className="adviewdg-info-row">
                            <div className="adviewdg-info-label">Tên sản phẩm:</div>
                            <div className="adviewdg-info-value" id="adviewdg-productName">
                                {auctionItem?.item?.name || 'N/A'}
                            </div>
                        </div>
                        <div className="adviewdg-info-row">
                            <div className="adviewdg-info-label">Tên loại tài sản:</div>
                            <div className="adviewdg-info-value" id="adviewdg-categoryName">
                                {getCategoryName(auctionItem?.item?.category_id)}
                            </div>
                        </div>
                        <div className="adviewdg-info-row">
                            <div className="adviewdg-info-label">Người có tài sản:</div>
                            <div className="adviewdg-info-value" id="adviewdg-ownerName">
                                {auctionItem?.item?.owner?.full_name || 'N/A'}
                            </div>
                        </div>
                        <div className="adviewdg-info-row">
                            <div className="adviewdg-info-label">Nơi có tài sản:</div>
                            <div className="adviewdg-info-value">Kho hàng thu mua đồi Gò Dưa phường Tân Quy Q7</div>
                        </div>
                        <div className="adviewdg-info-row">
                            <div className="adviewdg-info-label">Thời gian xem tài sản:</div>
                            <div className="adviewdg-info-value">Giờ hành chính các ngày từ 24/12 đến 28/12/2021</div>
                        </div>
                        <div className="adviewdg-info-row">
                            <div className="adviewdg-info-label">Tổ chức đấu giá:</div>
                            <div className="adviewdg-info-value" id="adviewdg-auctionOrg">
                                {auctionItem?.auction_org?.full_name || 'N/A'}
                            </div>
                        </div>
                        <div className="adviewdg-info-row">
                            <div className="adviewdg-info-label">Phương thức đấu giá:</div>
                            <div className="adviewdg-info-value" id="adviewdg-auctionMethod">
                                {auctionItem?.method || 'Trực tiếp'}
                            </div>
                        </div>
                        <div className="adviewdg-info-row">
                            <div className="adviewdg-info-label">Thời gian mở đăng ký:</div>
                            <div className="adviewdg-info-value" id="adviewdg-registerStart">
                                {formatDateTime(auctionItem?.register_start)}
                            </div>
                        </div>
                        <div className="adviewdg-info-row">
                            <div className="adviewdg-info-label">Thời gian kết thúc đăng ký:</div>
                            <div className="adviewdg-info-value" id="adviewdg-registerEnd">
                                {formatDateTime(auctionItem?.register_end)}
                            </div>
                        </div>
                        <div className="adviewdg-info-row">
                            <div className="adviewdg-info-label">Thời gian bắt đầu trả giá:</div>
                            <div className="adviewdg-info-value" id="adviewdg-bidStart">
                                {formatDateTime(auctionItem?.bid_start)}
                            </div>
                        </div>
                        <div className="adviewdg-info-row">
                            <div className="adviewdg-info-label">Giá khởi điểm:</div>
                            <div className="adviewdg-info-value" id="adviewdg-startingPrice">
                                {formatPrice(auctionItem?.item?.starting_price)}
                            </div>
                        </div>
                        <div className="adviewdg-info-row">
                            <div className="adviewdg-info-label">Giá hiện tại:</div>
                            <div className="adviewdg-info-value" id="adviewdg-currentPrice">
                                {formatPrice(currentPrice)}
                            </div>
                        </div>
                    </div>

                    <div className="adviewdg-right-section">
                        <div className="adviewdg-participants-section">
                            <div className="adviewdg-section-title">THÀNH PHẦN THAM DỰ</div>
                            <div className="adviewdg-info-row">
                                <div className="adviewdg-info-label">Thư ký phiên đấu giá:</div>
                                <div className="adviewdg-info-value">Nguyễn Văn A</div>
                            </div>
                            <div className="adviewdg-info-row">
                                <div className="adviewdg-info-label">Đại diện bên có tài sản:</div>
                                <div className="adviewdg-info-value">Nguyễn Văn B</div>
                            </div>
                            <div className="adviewdg-info-row">
                                <div className="adviewdg-info-label">Đấu giá viên:</div>
                                <div className="adviewdg-info-value">Nguyễn Văn D</div>
                            </div>
                            <div className="adviewdg-info-row">
                                <div className="adviewdg-info-label">Đại diện người tham gia đấu giá:</div>
                                <div className="adviewdg-info-value">Nguyễn Văn E</div>
                            </div>
                        </div>

                        <ControlSection
                            paused={paused}
                            statusText={statusText}
                            timer={countdownValues.timer}
                            logMessages={logMessages}
                            onPause={handlePause}
                            onResume={handleResume}
                            countdownData={countdownData}
                        />
                    </div>
                </div>

                <div className="adviewdg-table-wrapper">
                    <div className="adviewdg-table-title">DANH SÁCH LƯỢT ĐẶT GIÁ</div>
                    <table id="adviewdg-bidsTable" className="adviewdg-table">
                        <thead>
                            <tr>
                                <th className="adviewdg-th">STT</th>
                                <th className="adviewdg-th">Người đặt giá</th>
                                <th className="adviewdg-th">Số tiền</th>
                                <th className="adviewdg-th">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="adviewdg-tbody">
                            <BidsTable bids={bids} currentPrice={currentPrice} />
                        </tbody>
                    </table>
                </div>
                
                <div className="adviewdg-table-wrapper">
                    <div className="adviewdg-table-title">DANH SÁCH NGƯỜI ĐĂNG KÝ ĐẤU GIÁ</div>
                    <table id="adviewdg-biddersTable" className="adviewdg-table">
                        <thead>
                            <tr>
                                <th className="adviewdg-th">STT</th>
                                <th className="adviewdg-th">Họ và Tên</th>
                                <th className="adviewdg-th">Tiền đặt trước</th>
                                <th className="adviewdg-th">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="adviewdg-tbody">
                            <BiddersTable bidders={bidders} onKick={handleKick} />
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <div 
                id="adviewdg-actionModal" 
                className={`adviewdg-modal ${modalVisible ? 'adviewdg-modal-show' : ''}`}
            >
                <div className="adviewdg-modal-content">
                    <h3 id="adviewdg-modalTitle">{modalTitle}</h3>
                    <p id="adviewdg-modalMessage">{modalMessage}</p>
                    <textarea 
                        id="adviewdg-modalReason" 
                        className="adviewdg-input" 
                        placeholder="Nhập lý do..."
                        value={modalReason}
                        onChange={(e) => setModalReason(e.target.value)}
                        disabled={modalLoading}
                    />
                    <div>
                        <button 
                            id="adviewdg-modalCancel" 
                            className="adviewdg-button"
                            onClick={handleModalCancel}
                            disabled={modalLoading}
                        >
                            Hủy
                        </button>
                        <button 
                            id="adviewdg-modalConfirm" 
                            className="adviewdg-button"
                            onClick={handleModalConfirm}
                            disabled={modalLoading}
                        >
                            {modalLoading ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdShowAuction;