import React from 'react';
import './home.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const auctionItems = [1, 2, 3, 4, 5 ,6]; // Temporary data

const Home = () => {
  return (
    <div className="home-container">
      <main style={{ padding: "20px 8%" }}>
        <div className='section-title'>
          <p>DANH SÁCH TÀI SẢN ĐẤU GIÁ NỔI BẬT/MỚI NHẤT</p>
        </div>

        <Swiper 
          modules={[Navigation, Pagination, Autoplay]} // Register modules
          spaceBetween={20}
        //   slidesPerView={5}
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
            <SwiperSlide key={index}>
                <div className='list-auction'>
              <div className='auction-item'>
                <img className='auction-image' src='/assets/img/xe.png' alt='Auction Item' />
                <div className='auction-details'>
                  <h3 className='auction-name'>Tên tài sản</h3>
                  <p className='auction-method'>Đấu giá tự do</p>
                  <p className='auction-price'>Giá khởi điểm: 100,000 VNĐ</p>
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