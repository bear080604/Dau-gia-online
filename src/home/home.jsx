import React, { useState, useEffect } from 'react';
import './home.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const Home = () => {
  const [auctionItems, setAuctionItems] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/products')
      .then(response => response.json())
      .then(data => setAuctionItems(data.data || []))
      .catch(error => console.error('Error fetching auction items:', error));
  }, []);

  return (
    <div className="home-container">
      <main style={{ padding: "20px 8%" }}>
        <div className='section-title'>
          <p>DANH SÁCH TÀI SẢN ĐẤU GIÁ NỔI BẬT/MỚI NHẤT</p>
        </div>

        <Swiper 
          modules={[Navigation, Pagination, Autoplay]} // Register modules
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
          {auctionItems.map((item, index) => (
            <SwiperSlide key={item.id || index}>
              <div className='list-auction'>
                <div className='auction-item'>
                  <img className='auction-image' src='/assets/img/xe.png' alt={item.name} />
                  <div className='auction-details'>
                    <h3 className='auction-name'>{item.name}</h3>
                    <p className='auction-method'>{item.sessions?.length > 0 ? item.sessions[0].method : 'Đấu giá tự do'}</p>
                    <p className='auction-price'>Giá khởi điểm: {parseFloat(item.starting_price).toLocaleString()} VNĐ</p>
                  </div>
                  <div className='action'>
                    <button className='bid-button'>
                      <i className="fa fa-gavel" aria-hidden="true"></i> Đấu giá
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </main>
    </div>
  );
};

export default Home;