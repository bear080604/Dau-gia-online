import React, { useEffect, useState } from 'react';
import './home.css';
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import axios from 'axios';

const Home = () => {
  const [latestAuctions, setLatestAuctions] = useState([]);
  const [allAuctions, setAllAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [error, setError] = useState(null);

  const getAuctionStatus = (session) => {
    if (!session || !session.bid_start || !session.bid_end) {
      return "Chưa bắt đầu";
    }

    const now = new Date();
    const bidStart = new Date(session.bid_start);
    const bidEnd = new Date(session.bid_end);

    if (now < bidStart) {
      return "Chưa bắt đầu";
    } else if (now >= bidStart && now <= bidEnd) {
      return "Đang diễn ra";
    } else {
      return "Kết thúc";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch danh mục
        const categoryResponse = await axios.get(`${process.env.REACT_APP_API_URL}categories`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (categoryResponse.data.status && categoryResponse.data.data) {
          setCategories(categoryResponse.data.data);
        } else {
          throw new Error('Invalid categories API response');
        }

        // Fetch sản phẩm
        const productResponse = await axios.get(`${process.env.REACT_APP_API_URL}products`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const products = productResponse.data.data || [];
        const productsWithSessions = products.filter(
          (p) => Array.isArray(p.sessions) && p.sessions.length > 0
        );

        // Phiên đấu giá mới nhất: Sắp xếp theo id giảm dần
        const latestSorted = [...productsWithSessions].sort((a, b) => b.id - a.id);
        setLatestAuctions(latestSorted);

        // Tất cả tài sản: Không sắp xếp
        setAllAuctions(productsWithSessions);

        setError(null);
      } catch (err) {
        console.error("Lỗi API:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const filterAndSortAuctions = () => {
    let filtered = allAuctions.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.starting_price - b.starting_price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.starting_price - a.starting_price);
    }

    return filtered;
  };

  const filteredAuctions = filterAndSortAuctions();

  return (
    <div className="home-container">
      <main style={{ padding: "20px 8%" }}>
        <div className='section-title'>
          <p>PHIÊN ĐẤU GIÁ MỚI NHẤT/NỔI BẬT</p>
        </div>
        {error && <p className="error-message">{error}</p>}
        {latestAuctions.length === 0 && !error && <p>Không có phiên đấu giá nào.</p>}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 7000 }}
          loop={true}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 5 },
          }}
        >
          {latestAuctions.map((item) => {
            const currentSession = item.sessions?.[0];
            const computedStatus = getAuctionStatus(currentSession);
            return (
              <SwiperSlide key={item.id}>
                <div className='list-auction'>
                  <div className='auction-item'>
                    <div className='item-img'>
                      <img
                          className='auction-image'
                          src={item.image_url ? `http://localhost:8000${item.image_url}` : "/assets/img/xe.png"}
                          alt={item.name}
                        />
                    </div>
                    <div className='auction-details'>
                      <h3 className='auction-name'>{item.name}</h3>
                      <p className='auction-method'>{computedStatus}</p>
                      <p className='auction-price'>
                        Giá khởi điểm: {Number(item.starting_price).toLocaleString()} VNĐ
                      </p>
                    </div>
                    <div className='action'>
                      <Link to={`/detail/${currentSession?.id}`} style={{ textDecoration: 'none' }}>
                        <button className='bid-button'>
                          <i className="fa fa-gavel" aria-hidden="true"></i> Đấu giá
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <section>
          <div className='section-title'>
            <p>DANH SÁCH TÀI SẢN ĐẤU GIÁ TRỰC TUYẾN</p>
          </div>
          <div className='head'>
            <div className='input-search'>
              <input
                className='input'
                type="text"
                placeholder='Tìm kiếm ...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className='select-cate'>
              <select
                name="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='method'>
              <select name="method">
                <option value="">Phương thức đấu giá</option>
                {/* Thêm phương thức động nếu cần */}
              </select>
            </div>
            <div className='sort'>
              <p>Sắp xếp: </p>
              <select
                className='select'
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
          {error && <p className="error-message">{error}</p>}
          {filteredAuctions.length === 0 && !error && <p>Không có tài sản nào.</p>}
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 7000 }}
            loop={true}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 5 },
            }}
          >
            {filteredAuctions.map((item) => {
              const currentSession = item.sessions?.[0];
              const computedStatus = getAuctionStatus(currentSession);
              return (
                <SwiperSlide key={item.id}>
                  <div className='list-auction'>
                    <div className='auction-item'>
                      <div className='item-img'>
                      <img
                        className='auction-image'
                        src={item.image_url ? item.image_url : "/assets/img/xe.png"}
                        alt={item.name}
                        onError={(e) => { e.target.src = "/assets/img/xe.png"; }}
                      />
                      </div>
                      <div className='auction-details'>
                        <h3 className='auction-name'>{item.name}</h3>
                        <p className='auction-method'>{computedStatus}</p>
                        <p className='auction-price'>
                          Giá khởi điểm: {Number(item.starting_price).toLocaleString()} VNĐ
                        </p>
                      </div>
                      <div className='action'>
                        <Link to={`/detail/${currentSession?.id}`} style={{ textDecoration: 'none' }}>
                          <button className='bid-button'>
                            <i className="fa fa-gavel" aria-hidden="true"></i> Đấu giá
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </section>
      </main>
    </div>
  );
};

export default Home;