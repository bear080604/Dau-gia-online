import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './home.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const Home = () => {
  const [auctionItems, setAuctionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctionSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://127.0.0.1:8000/api/auction-sessions');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch auction sessions`);
        }

        const responseData = await response.json();
        const { sessions } = responseData; // Adjusted to match the actual response structure: { status: true, sessions: [...] }
        setAuctionItems(sessions || []);
      } catch (err) {
        console.error('Error fetching auction items:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionSessions();
  }, []);

  if (loading) {
    return (
      <div className="home-container">
        <main style={{ padding: "20px 8%" }}>
          <div className='section-title'>
            <p>DANH SÁCH TÀI SẢN ĐẤU GIÁ NỔI BẬT/MỚI NHẤT</p>
          </div>
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading auction items...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <main style={{ padding: "20px 8%" }}>
          <div className='section-title'>
            <p>DANH SÁCH TÀI SÁCH ĐẤU GIÁ NỔI BẬT/MỚI NHẤT</p>
          </div>
          <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-container">
      <main style={{ padding: "20px 8%" }}>
        <div className='section-title'>
          <p>DANH SÁCH TÀI SẢN ĐẤU GIÁ NỔI BẬT/MỚI NHẤT</p>
        </div>

        {auctionItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>No auction items available</div>
        ) : (
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
            {auctionItems
              .filter(session => session.item && session.item.status === 'ChoDauGia') // Optional: Filter to only show items ready for auction
              .map((session, index) => (
              <SwiperSlide key={session.session_id || index}>
                <div className='list-auction'>
                  <div className='auction-item'>
                    <img 
                      className='auction-image' 
                      src={session.item.image_url || '/assets/img/xe.png'} 
                      alt={session.item.name} 
                    />
                    <div className='auction-details'>
                      <h3 className='auction-name'>{session.item.name}</h3>
                      <p className='auction-method'>
                        {session.method || 'Đấu giá tự do'}
                      </p>
                      <p className='auction-price'>
                        Giá khởi điểm: {parseFloat(session.item.starting_price || 0).toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                    <div className='action'>
                      <Link to={`/auction-items/${session.item.item_id}`} className='bid-button'>
                        <i className="fa fa-gavel" aria-hidden="true"></i> Đấu giá
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </main>
    </div>
  );
};

export default Home;