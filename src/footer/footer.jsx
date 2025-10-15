import React, { useState, useEffect } from 'react';
import styles from './footer.module.css';

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}categories`);
      const result = await response.json();
      
      if (result.status) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Left Section - Contact Form */}
        <div className={styles.leftSection}>
          <h2 className={styles.title}>ĐĂNG KÝ TƯ VẤN</h2>
          
          <form className={styles.form}>
            <div className={styles.row}>
              <input 
                type="text" 
                placeholder="Họ và tên" 
                className={styles.input}
              />
              <input 
                type="tel" 
                placeholder="Số điện thoại" 
                className={`${styles.input} ${styles.phoneInput}`}
              />
            </div>
            
            <div className={styles.row}>
              <input 
                type="text" 
                placeholder="Địa chỉ" 
                className={styles.input}
              />
              <input 
                type="email" 
                placeholder="Email" 
                className={styles.input}
              />
            </div>
            
            <textarea 
              placeholder="Nội dung ..." 
              className={styles.textarea}
              rows="4"
            />
            
            <button type="submit" className={styles.submitBtn}>
              GỬI NGAY
              <i className="fas fa-arrow-right"></i>
            </button>
          </form>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span>Đang trực tuyến : 250</span>
              <span>Thống kê tháng : 5338</span>
            </div>
            <div className={styles.stat}>
              <span>Thống kê tuần : 316</span>
              <span>Thống kê năm : 65260</span>
            </div>
          </div>
          
          <p className={styles.copyright}>
            Copyright by Khải Bảo. All Rights Reserved.
          </p>
        </div>

        {/* Right Section - Company Info */}
        <div className={styles.rightSection}>
          {/* Company Header */}
          <div className={styles.companyHeader}>
            
            <div className={styles.companyInfo}>
              <h3>CÔNG TY ĐẤU GIÁ HỢP DANH KHẢI BẢO</h3>
              <p>
                <strong>Trụ sở chính:</strong> Phòng 2.05 Lầu 2, Số 6 Lương Định Của, phường Bình Trưng, TP.HCM
              </p>
              <p>
                <strong>Hotline:</strong> 0862 707176 – 0862 707178
              </p>
              <p>
                <strong>Email:</strong> info@daugiakhaibao.vn
              </p>
            </div>
          </div>

          {/* Services Grid */}
          <div className={styles.servicesGrid}>
            {/* Policies Column */}
            <div className={styles.serviceColumn}>
              <h4>CHÍNH SÁCH & ĐIỀU KHOẢN</h4>
              <ul>
                <li>Chính sách hợp tác</li>
                <li>Quá trình giải quyết khiếu nại</li>
                <li>Điều khoản và chính sách chung</li>
                <li>Chính sách bảo vệ thông tin người dùng</li>
                <li>Hướng dẫn đăng ký tài khoản đấu giá</li>
              </ul>
            
            </div>

            {/* Services Column - Dynamic Categories */}
            <div className={styles.serviceColumn}>
              <h4>DỊCH VỤ ĐẤU GIÁ TÀI SẢN</h4>
              {loading ? (
                <div className={styles.loadingCategories}>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Đang tải...</span>
                </div>
              ) : (
                <ul>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <li key={category.category_id}>
                        {category.name}
                      </li>
                    ))
                  ) : (
                    <li>Đang cập nhật...</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className={styles.socialSection}>
            <span>Kết nối với chúng tôi</span>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>
                <i className="fas fa-envelope"></i>
              </a>
              <a href="#" className={styles.socialLink}>
                <i className="fas fa-phone"></i>
              </a>
              <a href="#" className={styles.socialLink}>
                <i className="fab fa-facebook-messenger"></i>
              </a>
              <a href="#" className={styles.socialLink}>
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;