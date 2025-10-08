import React, { useState, useEffect } from "react"; // Thêm useState, useEffect cho clock
import "./header.css";
import { useUser } from "../UserContext";

function Header() {
  const { user, logout } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString('vi-VN'));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('vi-VN'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="hotline">
          <i className="fa fa-phone" aria-hidden="true"></i> HOTLINE: (028) 39406853 - (028) 62561989
        </div>
        <div className="auth-links">
          {user ? (
            <>
              <span>Xin chào, {user.name || user.email}</span>
              <a href="#" onClick={handleLogout}>Đăng Xuất</a>
            </>
          ) : (
            <>
              <a href="/login">Đăng Nhập</a>
              <a href="#">|</a>
              <a href="/register">Đăng Ký</a>
            </>
          )}
        </div>
      </div>

      {/* Header Main */}
      <header className="header-main">
        <div className="logo">
          <div className="logo-img">
            <a href="/">
            <img src="/assets/img/logo.jpg" alt="Logo" />
            </a>
          </div>
        </div>

        <div className="search-container">
          <form action="" method="GET" className="search-box">
            <input type="text" name="q" placeholder="Nhập tên tài sản cần tìm ..." />
            <button type="submit">
              <i className="fa fa-search" aria-hidden="true"></i>
            </button>
          </form>
        </div>

        <div className="datetime">{currentTime}</div> {/* Render clock */}
      </header>

      {/* Navigation Bar */}
      <nav className="nav-bar">
        <ul className="nav-menu">
          <li>
            <a href="#">
              <i className="fa fa-info" aria-hidden="true"></i> GIỚI THIỆU
            </a>
          </li>
          <li className="categories">
            <a href="#">
              <i className="fa fa-bars" aria-hidden="true"></i> DANH MỤC TÀI SẢN
            </a>
            <ul className="category-hidden">
              <li>category1</li>
              <li>category2</li>
              <li>category3</li>
            </ul>
          </li>
          <li>
            <a href="/auction-session">
              <i className="fa fa-gavel" aria-hidden="true"></i> ĐẤU GIÁ TRỰC TUYẾN
            </a>
          </li>
          <li>
            <a href="#">
              <i className="fa fa-book" aria-hidden="true"></i> TIN TỨC - THÔNG BÁO
            </a>
          </li>
          <li>
            <a href="#">
              <i className="fa fa-book" aria-hidden="true"></i> HƯỚNG DẪN SỬ DỤNG
            </a>
          </li>
          <li>
            <a href="/contact">
              <i className="fa fa-phone" aria-hidden="true"></i> LIÊN HỆ BÁN TÀI SẢN
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Header;