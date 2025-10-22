import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import styles from './auction-session.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function AuctionSession() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [auctionItems, setAuctionItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const itemsPerPage = 6;
  const socketRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Lấy từ khóa từ URL (?q=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('q') || '';
    setSearchTerm(keyword);
  }, [location.search]);

  const getAuctionStatus = (status) => {
    const statusMap = {
      Mo: 'Chưa bắt đầu',
      DangDienRa: 'Đang diễn ra',
      KetThuc: 'Kết thúc',
      Pause: 'Tạm dừng',
    };
    return statusMap[status] || 'Chưa cập nhật';
  };

  // Kết nối Socket.io
  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Kết nối Socket.io thành công');
      socket.emit('join.channel', 'auction-sessions');
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Socket disconnected');
    });

    // Realtime cập nhật
    socket.on('auction.session.updated', (updatedData) => {
      const updatedSession = updatedData.session || updatedData;
      setAuctionItems((prev) => {
        const index = prev.findIndex((s) => s.session_id === updatedSession.session_id);
        if (index !== -1) {
          const newItems = [...prev];
          newItems[index] = { ...newItems[index], ...updatedSession };
          return newItems;
        } else {
          return [updatedSession, ...prev];
        }
      });
    });

    socket.on('auction.session.created', (newData) => {
      const newSession = newData.session || newData;
      setAuctionItems((prev) => {
        if (prev.some((s) => s.session_id === newSession.session_id)) return prev;
        return [newSession, ...prev];
      });
    });

    socket.on('auction.session.deleted', (deletedData) => {
      const deletedSession = deletedData.session || deletedData;
      setAuctionItems((prev) => prev.filter((s) => s.session_id !== deletedSession.session_id));
    });

    socket.on('error', (err) => console.error('❌ Lỗi Socket.io:', err));

    return () => {
      socket.emit('leave.channel', 'auction-sessions');
      socket.disconnect();
    };
  }, []);

  // Fetch dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoryResponse = await axios.get(`${process.env.REACT_APP_API_URL}categories`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (categoryResponse.data.status && categoryResponse.data.data) {
          setCategories(categoryResponse.data.data);
        }

        const sessionsResponse = await axios.get(`${process.env.REACT_APP_API_URL}auction-sessions`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const sessionsData = sessionsResponse.data.sessions || sessionsResponse.data.data || [];
        setAuctionItems(Array.isArray(sessionsData) ? sessionsData : []);
        setError(null);
      } catch (err) {
        console.error('❌ Lỗi API:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lọc dữ liệu
  const filterAndSortItems = () => {
    let filtered = auctionItems.filter((session) => {
      const item = session.item;
      if (!item) return false;

      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category_id.toString() === categoryFilter;
      const registerStart = new Date(session.register_start);
      const registerEnd = new Date(session.register_end);
      const matchesDate =
        (!startDate || registerStart >= new Date(startDate)) &&
        (!endDate || registerEnd <= new Date(endDate));

      return matchesSearch && matchesCategory && matchesDate;
    });

    if (sortBy === 'newest') {
      filtered.sort((a, b) => b.session_id - a.session_id);
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.session_id - b.session_id);
    }

    return filtered;
  };

  const filteredItems = filterAndSortItems();
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleSortChange = (sortType) => setSortBy(sortType);
  const handlePageChange = (page) => setCurrentPage(page);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, sortBy, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/auction-session?q=${encodeURIComponent(searchTerm)}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Đang tải dữ liệu phiên đấu giá...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <section className={styles.searchSection}>
          <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
            <input
              type="text"
              placeholder="Tìm kiếm phiên đấu giá..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">
              <i className="fa fa-search" aria-hidden="true"></i>
            </button>
          </form>

          <div className={styles.filterSection}>
            <div className={styles.filterGroup}>
              <label htmlFor="categorySelect">Danh mục sản phẩm:</label>
              <select
                id="categorySelect"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label >Lọc theo thời gian đăng ký:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input className={styles.inputTime}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input className={styles.inputTime}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label>Sắp xếp:</label>
              <div className={styles.sortSection}>
                <button
                  className={`${styles.sortBtn} ${sortBy === 'newest' ? styles.sortBtnActive : ''}`}
                  onClick={() => handleSortChange('newest')}
                >
                  Mới nhất
                </button>
                <button
                  className={`${styles.sortBtn} ${sortBy === 'oldest' ? styles.sortBtnActive : ''}`}
                  onClick={() => handleSortChange('oldest')}
                >
                  Cũ nhất
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.resultsInfo}>
          <h1 className={styles.pageTitle}>
            Tổng {filteredItems.length} phiên đấu giá
          </h1>
        </div>

        <div className={styles.auctionItems}>
          {currentItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Không tìm thấy phiên đấu giá phù hợp
            </div>
          ) : (
            currentItems.map((session) => {
              const status = getAuctionStatus(session.status);
              return (
                <div key={session.session_id} className={styles.auctionItem}>
                  <div className={styles.itemImage}>
                    <img
                      src={session.item?.image_url ? `${process.env.REACT_APP_BASE_URL || 'http://localhost:8000'}${session.item.image_url}` : '/assets/img/xe.png'}
                      alt={session.item?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => (e.target.src = '/assets/img/xe.png')}
                    />
                  </div>
                  <a
                    href={`/auction-session/${session.session_id}`}
                    style={{ textDecoration: 'none', width: '100%' }}
                  >
                    <div className={styles.itemDetails}>
                      <div className={styles.itemHeader}>
                        <div className={styles.itemTitle}>
                          {session.item?.name || 'Chưa có tên'}
                        </div>
                        <div className={styles.itemPrice}>
                          {parseFloat(session.item?.starting_price || 0).toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                      <div className={styles.itemFooter}>
                        <div className={styles.Timeline}>
                          <b>Thời gian đăng ký:</b>{' '}
                          {formatDate(session.register_start)} - {formatDate(session.register_end)}
                        </div>
                        <div className={styles.Timeline}>
                          <b>Thời gian đấu giá:</b>{' '}
                          {formatDate(session.bid_start)} - {formatDate(session.bid_end)}
                        </div>
                        <div
                          style={{
                            color:
                              session.status === 'Mo'
                                ? '#16a34a'
                                : session.status === 'KetThuc'
                                ? '#d32f2f'
                                : session.status === 'Pause'
                                ? '#eab308'
                                : '#2772ba',
                          }}
                        >
                          <b>Trạng thái:</b> {status}
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`${currentPage === i + 1 ? styles.paginationBtnActive : ''}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Tiếp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuctionSession;
