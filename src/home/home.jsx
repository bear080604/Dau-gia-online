import React, { useEffect, useState, useMemo, useRef } from 'react';
import './home.css';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import axios from 'axios';
import io from 'socket.io-client';

// Component AuctionItem - CHỈ DÙNG STATUS TỪ SOCKET
const AuctionItem = React.memo(({ session }) => {
  // Lấy status từ session (realtime từ socket)
  const getAuctionStatus = (status) => {
    const statusMap = {
      DangDienRa: 'Đang diễn ra',
      KetThuc: 'Kết thúc',
      Pause: 'Tạm dừng',
      Mo: 'Chưa bắt đầu',
    };
    return statusMap[status] || 'Chưa cập nhật';
  };

  const displayStatus = getAuctionStatus(session.status);
  const item = session.item;

  return (
    <div className="list-auction">
      <div className="auction-item">
        <div className="item-img">
          <img
            className="auction-image"
            src={item?.image_url ? `http://localhost:8000${item.image_url}` : '/assets/img/xe.png'}
            alt={item?.name || 'Sản phẩm'}
            loading="lazy"
            onError={(e) => (e.target.src = '/assets/img/xe.png')}
          />
        </div>
        <div className="auction-details">
          <h3 className="auction-name">{item?.name || 'Chưa có tên'}</h3>
          <p
            className="auction-method"
            style={{
              color:
                session.status === 'Mo'
                  ? '#16a34a'
                  : session.status === 'KetThuc'
                  ? '#dc2626'
                  : session.status === 'Pause'
                  ? '#eab308'
                  : '#6b7280',
              fontWeight: 'bold',
            }}
          >
            {displayStatus}
          </p>
          <p className="auction-price" style={{  minHeight: '45px' }}>
            Giá khởi điểm: {Number(item?.starting_price || 0).toLocaleString()} VNĐ
          </p>
          {session.highest_bid && (
            <p className="auction-current-price" style={{ color: '#16a34a', fontWeight: 'bold', minHeight: '52px' }}>
              Giá cao nhất: {Number(session.highest_bid).toLocaleString()} VNĐ
            </p>
          )}
          {!session.highest_bid && (
            <p className="auction-current-price" style={{  minHeight: '52px' }}>
             
            </p>
          )}
        </div>
        <div className="action">
          <Link to={`/detail/${session.session_id}`} style={{ textDecoration: 'none' }}>
            <button className="bid-button">
              <i className="fa fa-gavel" aria-hidden="true"></i> Đấu giá
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
});

// Component chính
const Home = () => {
  const [sessions, setSessions] = useState([]); // Lưu trực tiếp sessions
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const initialDataFetchedRef = useRef(false);

  // Kết nối Socket.io
  useEffect(() => {
    const socket = io('http://localhost:6001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Kết nối Socket.io thành công');
      socket.emit('join.channel', 'auction-sessions');
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Socket disconnected');
    });

    // Nhận dữ liệu phiên đấu giá ban đầu (nếu server emit)
    socket.on('auction-sessions', (data) => {
      console.log('📩 Nhận dữ liệu phiên đấu giá từ socket:', data);
      if (Array.isArray(data)) {
        setSessions(data);
      }
    });

    // REALTIME: Cập nhật phiên đấu giá
    socket.on('auction.session.updated', (updatedData) => {
      console.log('🔄 Cập nhật phiên đấu giá realtime:', updatedData);

      // Xử lý dữ liệu: lấy session từ updatedData.session hoặc dùng trực tiếp
      const updatedSession = updatedData.session || updatedData;

      setSessions((prev) => {
        const index = prev.findIndex((s) => s.session_id === updatedSession.session_id);
        if (index !== -1) {
          const newSessions = [...prev];
          newSessions[index] = { ...newSessions[index], ...updatedSession }; // Gộp dữ liệu để giữ item
          console.log(`✨ Status updated: Session ${updatedSession.session_id} -> ${updatedSession.status}`);
          return newSessions;
        } else {
          console.log(`⚠️ Session ${updatedSession.session_id} không tồn tại, thêm mới`);
          return [updatedSession, ...prev]; // Thêm session mới nếu không tìm thấy
        }
      });
    });

    // REALTIME: Phiên đấu giá mới
    socket.on('auction.session.created', (newData) => {
      console.log('✨ Phiên đấu giá mới:', newData);

      const newSession = newData.session || newData;

      setSessions((prev) => {
        if (prev.some((s) => s.session_id === newSession.session_id)) {
          console.log(`⚠️ Phiên ${newSession.session_id} đã tồn tại, bỏ qua`);
          return prev;
        }
        console.log(`✅ Thêm phiên mới ${newSession.session_id}`);
        return [newSession, ...prev];
      });
    });

    // REALTIME: Xóa phiên đấu giá
    socket.on('auction.session.deleted', (deletedData) => {
      console.log('🗑️ Phiên đấu giá bị xóa:', deletedData);

      const deletedSession = deletedData.session || deletedData;
      setSessions((prev) => prev.filter((s) => s.session_id !== deletedSession.session_id));
    });

    socket.on('error', (err) => {
      console.error('❌ Lỗi Socket.io:', err);
    });

    return () => {
      socket.emit('leave.channel', 'auction-sessions');
      socket.disconnect();
    };
  }, []);

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    if (initialDataFetchedRef.current) return;
    initialDataFetchedRef.current = true;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoryResponse = await axios.get(`${process.env.REACT_APP_API_URL}categories`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setCategories(categoryResponse.data.status && categoryResponse.data.data ? categoryResponse.data.data : []);

        // Fetch auction sessions
        const sessionsResponse = await axios.get(`${process.env.REACT_APP_API_URL}auction-sessions`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const sessionsData = sessionsResponse.data.sessions || sessionsResponse.data.data || sessionsResponse.data || [];
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);

        // Fetch news
        const newsResponse = await fetch('http://127.0.0.1:8000/api/news');
        if (!newsResponse.ok) throw new Error('Lỗi khi lấy tin tức');
        const newsData = await newsResponse.json();
        const formattedNews = newsData.map((item) => ({
          id: item.id,
          category: item.category?.name || 'Khác',
          title: item.title,
          date: new Date(item.created_at).toLocaleDateString('vi-VN'),
          summary: item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''),
          imageUrl: item.thumbnail
            ? `${item.thumbnail}`
            : '/assets/img/placeholder.png',
        }));
        setNews(formattedNews);

        setError(null);
      } catch (err) {
        console.error('❌ Lỗi API:', err);
        setError('Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };


    fetchInitialData();
  }, []);

  // Lọc và sắp xếp sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter((session) => {
      const item = session.item;
      if (!item) return false;

      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category_id === parseInt(categoryFilter);
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'price-asc') {
      return [...filtered].sort((a, b) => Number(a.item?.starting_price || 0) - Number(b.item?.starting_price || 0));
    } else if (sortBy === 'price-desc') {
      return [...filtered].sort((a, b) => Number(b.item?.starting_price || 0) - Number(a.item?.starting_price || 0));
    }
    return filtered;
  }, [sessions, searchTerm, categoryFilter, sortBy]);

  // Lấy 10 phiên mới nhất
  const latestSessions = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => b.session_id - a.session_id).slice(0, 10);
    return sorted;
  }, [sessions]);

  return (
    <div className="home-container">
      <main style={{ padding: '20px 8%' }}>
        <div className="section-title">
          <p>PHIÊN ĐẤU GIÁ MỚI NHẤT/NỔI BẬT</p>
        </div>

        {loading && <p>Đang tải dữ liệu...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && latestSessions.length === 0 && !error && <p>Không có phiên đấu giá nào.</p>}
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 5 },
          }}
          key={latestSessions.map((s) => s.session_id).join('-')} // Ép Swiper re-render
        >
          {latestSessions.map((session) => (
            <SwiperSlide key={session.session_id}>
              <AuctionItem session={session} />
            </SwiperSlide>
          ))}
        </Swiper>

        <section>
          <div className="section-title">
            <p>DANH SÁCH TÀI SẢN ĐẤU GIÁ TRỰC TUYẾN</p>
          </div>
          <div className="head">
            <div className="input-search">
              <input
                className="input"
                type="text"
                placeholder="Tìm kiếm ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="select-cate">
              <select
                name="category"
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
            <div className="method">
              <select name="method">
                <option value="">Phương thức đấu giá</option>
                <option value="Đấu giá tự do">Đấu giá tự do</option>
              </select>
            </div>
            <div className="sort">
              <p>Sắp xếp: </p>
              <select
                className="select"
                name="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
          </div>

          {loading && <p>Đang tải dữ liệu...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && filteredSessions.length === 0 && !error && <p>Không có tài sản nào.</p>}
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 5 },
            }}
            key={filteredSessions.map((s) => s.session_id).join('-')} // Ép Swiper re-render
          >
            {filteredSessions.slice(0, 10).map((session) => (
              <SwiperSlide key={session.session_id}>
                <AuctionItem session={session} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        <section>
          <div className="section-title">
            <p>TIN TỨC VÀ THÔNG BÁO</p>
          </div>

          {loading && <p>Đang tải dữ liệu...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && news.length === 0 && !error && <p>Không có tin tức nào.</p>}
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
          >
            {news.slice(0, 8).map((newsItem) => (
              <SwiperSlide key={newsItem.id}>
                <div className="news-item">
                  <img
                    className="news-image"
                    src={newsItem.imageUrl}
                    alt={newsItem.title}

                    loading="lazy"
                    onError={(e) => (e.target.src = '/assets/img/placeholder.png')}
                  />
                  <div className="news-details">
                    <h3 className="news-title" style={{ minHeight: '56px'}}>{newsItem.title}</h3>
                    <p className="news-date">{newsItem.date}</p>
                    <p className="news-summary" style={{ minHeight: '72px'}}>{newsItem.summary}</p>
                  </div>
                  <div className="action">
                    <Link to={`/news/${newsItem.id}`} style={{ textDecoration: 'none' }}>
                      <button className="read-more-button">
                        <i className="fa fa-arrow-right" aria-hidden="true"></i> Đọc thêm
                      </button>
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      </main>
    </div>
  );
};

export default Home;