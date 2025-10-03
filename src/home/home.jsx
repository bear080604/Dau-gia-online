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
  const [auctionItems, setAuctionItems] = useState([]);
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}auction-sessions`)
      .then((res) => {
      const products = res.data.data || [];

        // Lọc sản phẩm có sessions và sessions.length > 0
        const productsWithSessions = products.filter(
          (p) => Array.isArray(p.sessions) && p.sessions.length > 0
        );

        setAuctionItems(productsWithSessions);
      })
      .catch((err) => {
        console.error("Lỗi API:", err);
      });
  }, []);

  return (
    <div className="home-container">
      <main style={{ padding: "20px 8%" }}>
        <div className='section-title'>
          <p>DANH SÁCH TÀI SẢN ĐẤU GIÁ NỔI BẬT/MỚI NHẤT</p>
        </div>

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
          {auctionItems.map((item) => (
            <SwiperSlide key={item.id}>
              <div className='list-auction'>
                <div className='auction-item'>
                  {/* Nếu có ảnh thật từ API thì thay link này */}
                  <img
                    className='auction-image'
                    src={item.image_url ? item.image_url : "/assets/img/xe.png"}
                    alt={item.name}
                  />
                  <div className='auction-details'>
                    <h3 className='auction-name'>{item.name}</h3>
                    <p className='auction-method'>
                      {item.sessions?.[0]?.status === "DangDienRa"
                        ? "Đang diễn ra"
                        : "Chưa bắt đầu"}
                    </p>
                    <p className='auction-price'>
                      Giá khởi điểm: {Number(item.starting_price).toLocaleString()} VNĐ
                    </p>
                  </div>
                  <div className='action'>
                      <Link to={`/detail/${item.id}`} style={{ textDecoration: 'none' }}>
                        <button className='bid-button'>
                          <i className="fa fa-gavel" aria-hidden="true"></i> Đấu giá
                        </button>
                      </Link>
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
