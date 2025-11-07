import React, { useState, useEffect,useRef  } from 'react';
import { Link } from 'react-router-dom';
import styles from './footer.module.css';

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoriesFetchedRef = useRef(false);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
     if (categoriesFetchedRef.current) return; // nếu đã fetch thì return
    categoriesFetchedRef.current = true; // 
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
            <button type="submit" className={styles.submitBtn}>
              Liên hệ
            
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
                        <Link to={`/auction-session?category=${category.category_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {category.name}
                        </Link>
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