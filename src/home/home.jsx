import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

const Home = () => {
  return (
    <div className="home-container">
      <main style={{ padding: "20px 8%" }}>
        <div className='section-title'>
            <p>DANH SÁCH TÀI SẢN ĐẤU GIÁ NỔI BẬT/MỚI NHẤT</p>
        </div>
        <div className='list-auction'>
            <div className='auction-item'>
                <img className='auction-image'
                 src='/assets/img/xe.png' alt='Auction Item' />
                <div className='auction-details'>
                    <h3 className='auction-name'>Tên tài sản</h3>
                    <p className='auction-method'>Đấu giá tự do</p>
                    <p className='auction-price'>Giá khởi điểm: 100,000 VNĐ</p>
                </div>
                <div className='action'>
                <button className='bid-button'
                    >
                        <i className="fa fa-gavel" aria-hidden="true"></i>Đấu giá</button>
            </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
