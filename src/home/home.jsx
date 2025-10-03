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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log("API URL:", apiUrl);
    
    if (!apiUrl) {
      console.error("REACT_APP_API_URL không được định nghĩa!");
      setLoading(false);
      return;
    }

    const fullUrl = `${apiUrl}auction-sessions`;
    console.log("Full URL:", fullUrl);

    axios.get(fullUrl)
      .then((res) => {
        console.log("Full response:", res.data);
        const sessions = res.data.sessions || [];
        console.log("Sessions:", sessions);

        // Map và filter như trên
        const auctionItemsMapped = sessions
          .filter(s => s.item && s.status !== "KetThuc")
          .map(s => ({
            id: s.item.item_id,
            name: s.item.name,
            starting_price: s.item.starting_price,
            image_url: s.item.image_url,
            sessions: [s],  // Để khớp render code
          }));

        console.log("Mapped auctionItems:", auctionItemsMapped);
        setAuctionItems(auctionItemsMapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi API đầy đủ:", err.response?.data || err.message || err.code);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="home-container">Đang tải dữ liệu...</div>;

  return (
    <div className="home-container">
      <main style={{ padding: "20px 8%" }}>
        <div className='section-title'>
          <p>DANH SÁCH TÀI SẢN ĐẤU GIÁ NỔI BẬT/MỚI NHẤT</p>
        </div>

        {auctionItems.length > 0 ? (
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
        ) : (
          <p>Không có sản phẩm đấu giá nào hiện tại.</p>
        )}
      </main>
    </div>
  );
};

export default Home;