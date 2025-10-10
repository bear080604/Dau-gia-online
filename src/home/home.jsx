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

  const getAuctionStatus = (session) => {
    if (!session || !session.bid_start || !session.bid_end) {
      return "Chưa bắt đầu";
    }

    // Sử dụng thời gian thực tế
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
    const fetchData = () => {
      axios.get(`${process.env.REACT_APP_API_URL}products`)
        .then((res) => {
          const products = res.data.data || [];

          // Lọc sản phẩm có sessions
          const productsWithSessions = products.filter(
            (p) => Array.isArray(p.sessions) && p.sessions.length > 0
          );

          setAuctionItems(productsWithSessions);
        })
        .catch((err) => {
          console.error("Lỗi API:", err);
        });
    };

    fetchData(); // gọi lần đầu khi mount

    const interval = setInterval(fetchData, 3000); // gọi lại mỗi 3 giây

    return () => clearInterval(interval); // cleanup khi component unmount
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
          {auctionItems.map((item) => {
            const currentSession = item.sessions?.[0];
            const computedStatus = getAuctionStatus(currentSession);
            return (
              <SwiperSlide key={item.id}>
                <div className='list-auction'>
                  <div className='auction-item'>
                    <img
                      className='auction-image'
                      src={item.image_url ? item.image_url : "/assets/img/xe.png"}
                      alt={item.name}
                    />
                    <div className='auction-details'>
                      <h3 className='auction-name'>{item.name}</h3>
                      <p className='auction-method'>
                        {computedStatus}
                      </p>
                      <p className='auction-price'>
                        Giá khởi điểm: {Number(item.starting_price).toLocaleString()} VNĐ
                      </p>
                    </div>
                    <div className='action'>
                      <Link to={`/detail/${currentSession.id}`} style={{ textDecoration: 'none' }}>
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
            <input className='input' type="text" name="" id="" placeholder='Tìm kiếm ...' />
            </div>
            <div className='select-cate'>
              <select name="" id="">
                <option value="">Tất cả</option>
              </select>
            </div>
            <div className='method'>
              <select name="" id="">
                <option value="">Tất cả</option>
              </select>
            </div>
            <div className='sort'>
              <p>Sắp xếp: </p>
              <select name="" id="">
                <option value="">Tat ca</option>
              </select>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;