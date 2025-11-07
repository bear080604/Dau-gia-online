import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import './home.css';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Loading from '../components/Loading';
import io from 'socket.io-client';
import { getCategories, getAuctionSessions, getNews, toggleSessionFavorite } from '../services';

// Cache for deduplicating image requests
const imageCache = new Map();

// Preload images function
const preloadImages = (urls) => {
  urls.forEach((url) => {
    if (url && !imageCache.has(url) && url.startsWith('http')) { // Skip rỗng/falsy
      const img = new Image();
      img.src = url;
      img.onerror = () => {
        imageCache.set(url, { src: '' });
      };
      imageCache.set(url, img);
    }
  });
};

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Component AuctionItem
const AuctionItem = React.memo(({ session, onToggleFavorite }) => {
  const [isFavorited, setIsFavorited] = useState(session.is_favorited || false);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('token');
  const isProcessingRef = useRef(false);

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
  const baseUrl = process.env.REACT_APP_BASE_URL; // Fallback
  const imageUrl = item?.image_url
    ? `${baseUrl}${item.image_url}`
    : '';

  // Đồng bộ state khi session.is_favorited thay đổi từ parent
  useEffect(() => {
    if (!isProcessingRef.current && session.is_favorited !== undefined) {
      setIsFavorited(session.is_favorited);
    }
  }, [session.is_favorited]);

  useEffect(() => {
    if (item?.image_url) {
      preloadImages([imageUrl]);
    }
  }, [imageUrl]);

  const handleToggleFavorite = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!token) {
        alert('Vui lòng đăng nhập để theo dõi phiên đấu giá!');
        return;
      }

      // Ngăn chặn multiple clicks
      if (isProcessingRef.current || isLoading) {
        return;
      }

      isProcessingRef.current = true;
      setIsLoading(true);

      // Optimistic update - cập nhật UI ngay lập tức
      const previousState = isFavorited;
      setIsFavorited(!previousState);

      try {
        const response = await toggleSessionFavorite(session.session_id);

        
        // ✅ ĐƠN GIẢN HÓA: Vì backend đã trả về is_favorited rõ ràng
        const finalFavoritedState = response.is_favorited ?? !previousState;
        
        
        // Cập nhật lại state từ server response
        setIsFavorited(finalFavoritedState);

        // Thông báo cho parent component
        if (onToggleFavorite) {
          onToggleFavorite(session.session_id, finalFavoritedState);
        }
      } catch (err) {
        // Rollback nếu có lỗi
        setIsFavorited(previousState);
        
        console.error('Lỗi toggle favorite:', err);
        if (err.response?.status === 401) {
          alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          alert(err.response?.data?.message || 'Không thể theo dõi. Vui lòng thử lại.');
        }
      } finally {
        setIsLoading(false);
        isProcessingRef.current = false;
      }
    },
    [token, session.session_id, onToggleFavorite, isFavorited, isLoading]
  );

  return (
    <div className="list-auction">
      <div className="auction-item">
        <div className="item-img">
          <img
            className="auction-image"
            src={imageCache.get(imageUrl)?.src || imageUrl}
            alt={item?.name || 'Sản phẩm'}
            loading="lazy"
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
          <p className="auction-price">
            Giá khởi điểm: {Number(item?.starting_price || 0).toLocaleString()} VNĐ
          </p>
        </div>
        <div className="action">
          {/* Nút Theo dõi */}
          <button
            className={`favorite-button ${isFavorited ? 'favorited' : ''} ${isLoading ? 'loading' : ''}`}
            onClick={handleToggleFavorite}
            disabled={isLoading}
            title={isFavorited ? 'Bỏ theo dõi' : 'Theo dõi phiên'}
          >
            {isLoading ? 
              'Đang xử lý...' : 
              isFavorited ? 
                'Bỏ theo dõi' : 
                'Theo dõi'
            }
          </button>
          {/* Nút Đấu giá */}
          <Link to={`/detail/${session.session_id}`} style={{ textDecoration: 'none' }}>
            <button className="bid-button">
              <i className="fa fa-gavel" aria-hidden="true"></i>
              Đấu giá
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
});

// Component chính
const Home = () => {
  const [sessions, setSessions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null); // Ref để lưu socket instance
  const initialDataFetchedRef = useRef(false);

  const debouncedSetSessions = useRef(debounce(setSessions, 100)).current;

  const handleToggleFavorite = useCallback((sessionId, isFavorited) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.session_id === sessionId ? { ...s, is_favorited: isFavorited } : s
      )
    );
  }, []);

  // Socket.io - CHỈ TẠO 1 LẦN, KHÔNG LẶP
  useEffect(() => {
    // Nếu đã tạo socket, return luôn
    if (socketRef.current) return;

    const socket = io(process.env.REACT_APP_SOCKET_URL, {
      transports: ['websocket'], // chỉ dùng websocket, không polling
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join.channel', 'auction-sessions');
    });

    socket.on('auction-sessions', (data) => {
      if (Array.isArray(data)) debouncedSetSessions(data);
    });

    socket.on('auction.session.updated', (updatedData) => {
      const updatedSession = updatedData.session || updatedData;
      debouncedSetSessions((prev) => {
        const index = prev.findIndex(s => s.session_id === updatedSession.session_id);
        if (index !== -1) {
          const newSessions = [...prev];
          newSessions[index] = { ...newSessions[index], ...updatedSession };
          return newSessions;
        }
        return [updatedSession, ...prev];
      });
    });

    socket.on('auction.session.created', (newData) => {
      const newSession = newData.session || newData;
      debouncedSetSessions((prev) => {
        if (prev.some(s => s.session_id === newSession.session_id)) return prev;
        return [newSession, ...prev];
      });
    });

    socket.on('auction.session.deleted', (deletedData) => {
      const deletedSession = deletedData.session || deletedData;
      debouncedSetSessions((prev) =>
        prev.filter(s => s.session_id !== deletedSession.session_id)
      );
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    // Cleanup khi component unmount
    return () => {
      socket.emit('leave.channel', 'auction-sessions');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [debouncedSetSessions]);

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    if (initialDataFetchedRef.current) return;
    initialDataFetchedRef.current = true;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const baseUrl = process.env.REACT_APP_API_URL; // Fallback

        // Tối ưu: Gọi song song các API
        const [categoriesResponse, sessionsResponse, newsResponse] = await Promise.all([
          getCategories(),
          getAuctionSessions(),
          getNews(),
        ]);

        // Xử lý categories
        const categoriesData = categoriesResponse.data || categoriesResponse || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        // Xử lý auction sessions
        const sessionsData = sessionsResponse.sessions || sessionsResponse.data || sessionsResponse || [];
        debouncedSetSessions(Array.isArray(sessionsData) ? sessionsData : []);

        // Xử lý news
        const newsData = newsResponse.data || newsResponse || [];
        const formattedNews = Array.isArray(newsData) ? newsData.map((item) => {
          const imageUrl =
            item.thumbnail && item.thumbnail.startsWith('/')
              ? `${baseUrl.replace('/api', '')}${item.thumbnail}` // Adjust base for images
              : item.thumbnail || '';
          return {
            id: item.id,
            category: item.category?.name || 'Khác',
            title: item.title,
            date: new Date(item.created_at).toLocaleDateString('vi-VN'),
            summary: item.content ? (item.content.substring(0, 100) + (item.content.length > 100 ? '...' : '')) : '',
            imageUrl,
          };
        }) : [];
        setNews(formattedNews);
        preloadImages(formattedNews.map((item) => item.imageUrl).filter(url => url)); // Skip rỗng

        setError(null);
      } catch (err) {
        console.error('❌ Lỗi API:', err);
        setError(`Lỗi khi tải dữ liệu: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [debouncedSetSessions]);

  // Lọc và sắp xếp sessions (với ưu tiên Mo và DangDienRa lên đầu)
  const filteredSessions = useMemo(() => {
    // Lọc theo search + category
    let filtered = sessions.filter((session) => {
      const item = session.item;
      if (!item) return false;
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category_id === Number(categoryFilter); // Convert to number
      return matchesSearch && matchesCategory;
    });

    // Ưu tiên các trạng thái Mo và DangDienRa lên đầu
    filtered.sort((a, b) => {
      const priorityStatus = ['Mo', 'DangDienRa'];
      const aPriority = priorityStatus.includes(a.status) ? 0 : 1;
      const bPriority = priorityStatus.includes(b.status) ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;

      // Nếu cùng nhóm, sắp xếp theo giá (tùy chọn)
      if (sortBy === 'price-asc') return Number(a.item?.starting_price || 0) - Number(b.item?.starting_price || 0);
      if (sortBy === 'price-desc') return Number(b.item?.starting_price || 0) - Number(a.item?.starting_price || 0);
      return 0;
    });

    return filtered;
  }, [sessions, searchTerm, categoryFilter, sortBy]);

  const latestSessions = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => b.session_id - a.session_id).slice(0, 10);
    const baseUrl = process.env.REACT_APP_BASE_URL; // Fallback
    preloadImages(
      sorted
        .filter((s) => s.item?.image_url)
        .map((s) => `${baseUrl}${s.item.image_url}`)
        .filter(url => url) // Skip rỗng
    );
    return sorted;
  }, [sessions]);

  return (
    <div className="home-container">
      <main style={{ padding: '20px 8%' }}>
        {/* === 1. PHIÊN MỚI NHẤT === */}
        <div className="section-title">
          <p>PHIÊN ĐẤU GIÁ MỚI NHẤT</p>
          <Link className="xem-them" to="/auction-session" style={{ textDecoration: 'none', color: '', fontSize: '16px' }}>
           Xem tất cả
          </Link>
        </div>
        
         {loading && <Loading message="Đang tải dữ liệu..." />}
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
            1024: { slidesPerView: 3 },
            1200: { slidesPerView: 5 },
          }}
          key={latestSessions.map((s) => s.session_id).join('-')}
        >
          {latestSessions.map((session) => (
            <SwiperSlide key={session.session_id}>
              <AuctionItem session={session} onToggleFavorite={handleToggleFavorite} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Nút Xem thêm */}
     


        {/* === 2. DANH SÁCH TÀI SẢN === */}
        <section>
          <div className="section-title">
            <p>DANH SÁCH TÀI SẢN ĐẤU GIÁ TRỰC TUYẾN</p>
            <Link className="xem-them" to="/auction-session" style={{ textDecoration: 'none', color: '', fontSize: '16px' }}>
           Xem tất cả
          </Link>
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
              <div 
                className="custom-select" 
                onClick={() => setOpenDropdown(!openDropdown)} // toggle mở/đóng menu
              >
                <div className="selected">
                  {
                    categories.find(c => Number(categoryFilter) === c.category_id)?.name || "Tất cả danh mục" // Convert to number
                  }
                </div>

                {openDropdown && (
                  <ul className="options">
                    <li 
                      onClick={() => {
                        setCategoryFilter("all");
                        setOpenDropdown(false);
                      }}
                      className={categoryFilter === "all" ? "active" : ""} // 'all' giữ string
                    >
                      Tất cả danh mục
                    </li>

                    {categories.map((category) => (
                      <li
                        key={category.category_id}
                        onClick={() => {
                          setCategoryFilter(category.category_id); // Set as number
                          setOpenDropdown(false);
                        }}
                        className={Number(categoryFilter) === category.category_id ? "active" : ""} // Convert to number
                      >
                        {category.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="sort">
              <p>Sắp xếp: </p>
              <select className="select" name="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
          </div>
           {loading && <Loading message="Đang tải dữ liệu..." />}
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
              1024: { slidesPerView: 3 },
              1200: { slidesPerView: 5 },
            }}
            key={filteredSessions.map((s) => s.session_id).join('-')}
          >
            {filteredSessions.slice(0, 10).map((session) => (
              <SwiperSlide key={session.session_id}>
                <AuctionItem session={session} onToggleFavorite={handleToggleFavorite} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* === 3. TIN TỨC VÀ THÔNG BÁO === */}
        <section>
          <div className="section-title">
            <p>TIN TỨC VÀ THÔNG BÁO</p>
            <Link className="xem-them" to="/news" style={{ textDecoration: 'none'}}>
           Xem tất cả
          </Link>
          </div>
           {loading && <Loading message="Đang tải dữ liệu..." />}
          {error && <p className="error-message">{error}</p>}
          {!loading && news.length === 0 && !error && <p>Không có tin tức nào.</p>}

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            navigation
            // pagination={{ clickable: false }}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1200: { slidesPerView: 3 },
            }}
          >
            {news.slice(0, 8).map((newsItem) => (
              <SwiperSlide key={newsItem.id}>
                <div className="news-item">
                  <img
                    className="news-image"
                    src={imageCache.get(newsItem.imageUrl)?.src || newsItem.imageUrl}
                    alt={newsItem.title}
                    loading="lazy"
                  />
                  <div className="news-details">
                    <h3 className="news-title">
                      {newsItem.title}
                    </h3>
                    <p className="news-date">{newsItem.date}</p>
                    <p className="news-summary">
                      {newsItem.summary}
                    </p>
                  </div>
                  <div className="action">
                    <Link to={`/news/${newsItem.id}`} style={{ textDecoration: 'none' }}>
                      <button className="read-more-button">
                        <i className="fa fa-arrow-right" aria-hidden="true"></i>
                        Đọc thêm
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