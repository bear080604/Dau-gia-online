// Home.jsx
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
import echo from '../echo'; // cấu hình Pusher Cloud

const Home = () => {
  const [auctionItems, setAuctionItems] = useState([]);

  // Chuyển status backend sang hiển thị
  const getAuctionStatus = (session) => {
    if (!session || !session.status) return "Chưa bắt đầu";
    const statusMap = {
      Mo: "Chưa bắt đầu",
      DangDienRa: "Đang diễn ra",
      KetThuc: "Kết thúc"
    };
    return statusMap[session.status] || "Chưa bắt đầu";
  };

  useEffect(() => {
    const fetchProductsAndSetupEcho = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}products`);
        const products = res.data.data || [];
        setAuctionItems(products);

        // Setup Echo listener cho tất cả sessions
        products.forEach(item => {
          item.sessions.forEach(session => {
            const channelName = `auction-session.${session.id}`;
            echo.channel(channelName)
              .listen('.auction.session.updated', (e) => {
                console.log('♻️ Session updated:', e);
                setAuctionItems(prev =>
                  prev.map(prod => {
                    if (prod.id === e.session.item_id) {
                      const updatedSessions = prod.sessions.map(s =>
                        s.id === e.session.id ? { ...s, ...e.session } : { ...s }
                      );
                      return { ...prod, sessions: updatedSessions };
                    }
                    return { ...prod };
                  })
                );
              });
          });
        });

      } catch (err) {
        console.error("Lỗi API:", err);
      }
    };

    fetchProductsAndSetupEcho();
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
          loop={auctionItems.length > 1}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 5 },
          }}
        >
          {auctionItems.map(item => {
            const currentSession = item.sessions?.[0];
            const computedStatus = getAuctionStatus(currentSession);

            return (
              <SwiperSlide key={item.id}>
                <div className='list-auction'>
                  <div className='auction-item'>
                    <img
                      className='auction-image'
                      src={item.image_url || "/assets/img/xe.png"}
                      alt={item.name}
                    />
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
      </main>
    </div>
  );
};

export default Home;
