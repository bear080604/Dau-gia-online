import React from "react";
import "./header.css";

function Header() {
  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="hotline">
          <i className="fa fa-phone" aria-hidden="true"></i> HOTLINE: (028) 39406853 - (028) 62561989
        </div>
        <div className="auth-links">
          <a href="#">Đăng Nhập</a>
          <a href="#">|</a>
          <a href="#">Đăng Ký</a>
        </div>
      </div>

      {/* Header Main */}
      <header className="header-main">
        <div className="logo">
          <div className="logo-img">
            <img src="/assets/img/logo.jpg" alt="Logo" />
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

        <div className="datetime">{/* Có thể dùng useEffect để render ngày giờ */}</div>
      </header>

      {/* Navigation Bar */}
      <nav className="nav-bar">
        <ul className="nav-menu">
          <li>
            <a href="#">
              <i className="fa fa-info" aria-hidden="true"></i> GIỚI THIỆU
            </a>
          </li>
          <li>
            <a href="#">
              <i className="fa fa-bars" aria-hidden="true"></i> DANH MỤC TÀI SẢN
            </a>
          </li>
          <li>
            <a href="#">
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
            <a href="#">
              <i className="fa fa-phone" aria-hidden="true"></i> LIÊN HỆ BÁN TÀI SẢN
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Header;
