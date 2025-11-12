import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import axios from 'axios';
import styles from './header.module.css';
import NotificationBell from "./NotificationBell";

const Header = () => {
  const { user, logout } = useUser();
  const [currentTime, setCurrentTime] = useState('');
  const [countdown, setCountdown] = useState('23:59:59');
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);
  const [isMobileCategoryActive, setIsMobileCategoryActive] = useState(false);
  const [latestUnpaidContract, setLatestUnpaidContract] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false); // Popup thông báo
  const [unreadCount, setUnreadCount] = useState(0); // Số chưa đọc (nhận từ NotificationBell)
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // === TOGGLE NOTIFICATION POPUP ===
  const togglePopup = (e) => {
    e.stopPropagation();
    const isOpening = !open;
    setOpen(!open);
    if (isOpening) {
      setUnreadCount(0); // Reset badge khi mở popup
    }
  };

  // === CẬP NHẬT UNREAD COUNT TỪ NotificationBell ===
  const handleUnreadCountChange = (count) => {
    setUnreadCount(count);
  };

  const mountedRef = useRef(false);

useEffect(() => {
  // Nếu đã fetch, return ngay
  if (mountedRef.current) return;

  mountedRef.current = true; // Đánh dấu đã mount

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}categories`
      );
      if (!response.ok) throw new Error('Failed to fetch categories');
      const result = await response.json();
      if (result.status && result.data) {
        const mappedCategories = result.data.map((category) => ({

          text: category.name,
          href: `/auction-session?category=${category.category_id}`,
        }));
        setCategories(mappedCategories);
      }
    } catch (err) {
      console.error("Fetch categories error:", err);
      setCategories([]);
    }
  };

  fetchCategories();
}, []); // Dependency rỗng




const contractsMountedRef = useRef(false);

useEffect(() => {
  if (contractsMountedRef.current) return; // đã fetch trước đó, bỏ qua

  contractsMountedRef.current = true; // đánh dấu đã fetch

  const fetchContracts = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}contracts`
      );
      if (!res.ok) throw new Error('Failed to fetch contract data');
      const data = await res.json();
      setContractData(data);
    } catch (err) {
      console.error('Fetch contracts error:', err);
      setContractData({ status: false, contracts: [] });
    }
  };

  fetchContracts();
}, []); // Dependency rỗng

  // === SEARCH SUGGESTIONS ===
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) return setSuggestions([]);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}products`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const products = res.data.data || [];
        const filtered = products
          .filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 5)
          .map((p) => ({
            id: p.sessions?.[0]?.id,
            name: p.name,
            href: `/auction-session/${p.sessions?.[0]?.id}`,
            image: p.image || '',
            price: p.price || 0,
          }));
        setSuggestions(filtered);
      } catch {
        setSuggestions([]);
      }
    };
    const t = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // === CLOCK ===
  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleString('vi-VN'));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  // === HỢP ĐỒNG CHƯA THANH TOÁN ===
  useEffect(() => {
    if (!user || !contractData?.status) return;
    const userContracts = contractData.contracts
      .filter(
        (c) =>
          c.winner_id === user.user_id &&
          c.status === 'ChoThanhToan' &&
          new Date(c.signed_date).getTime() + 86400000 > Date.now()
      )
      .sort((a, b) => new Date(b.signed_date) - new Date(a.signed_date));
    setLatestUnpaidContract(userContracts[0] || null);
  }, [user, contractData]);

  // === COUNTDOWN ===
  useEffect(() => {
    if (!latestUnpaidContract) return setCountdown('Không có hợp đồng');
    const update = () => {
      const end = new Date(latestUnpaidContract.signed_date);
      end.setHours(end.getHours() + 24);
      const diff = end - new Date();
      if (diff <= 0) return setCountdown('Hết thời gian');
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [latestUnpaidContract]);

  // === LOGOUT ===
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${process.env.REACT_APP_API_URL}logout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      logout();
      localStorage.removeItem('token');
      navigate('/login');
      alert('Đăng xuất thành công');
    }
  };

  // === SEARCH SUBMIT ===
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/auction-session?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // === MOBILE SEARCH TOGGLE ===
  const toggleMobileSearch = () => {
    setIsMobileSearchActive(!isMobileSearchActive);
  };

  const handleClickOutsideSearch = (e) => {
    if (
      isMobileSearchActive &&
      !e.target.closest(`.${styles.mobileSearchBox}`) &&
      !e.target.closest(`.${styles.mobileSearchToggle}`)
    ) {
      setIsMobileSearchActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutsideSearch);
    return () => document.removeEventListener('click', handleClickOutsideSearch);
  }, [isMobileSearchActive]);

  // === MOBILE NAVIGATION ===
  const openMobileNav = () => {
    setIsMobileNavActive(true);
    setIsMobileSearchActive(false);
    document.body.style.overflow = 'hidden';
  };

  const closeMobileNav = () => {
    setIsMobileNavActive(false);
    setIsMobileCategoryActive(false);
    document.body.style.overflow = '';
  };

  const toggleMobileCategory = () => {
    setIsMobileCategoryActive(!isMobileCategoryActive);
  };

  const navItems = [
    { icon: 'fa-info-circle', text: 'GIỚI THIỆU', href: '/about' },
    {
      icon: 'fa-th-list',
      text: 'DANH MỤC TÀI SẢN',
      href: '#',
      isCategory: true,
      subItems: categories,
    },
    { icon: 'fa-gavel', text: 'ĐẤU GIÁ TRỰC TUYẾN', href: '/auction-session' },
    { icon: 'fa-newspaper', text: 'TIN TỨC - THÔNG BÁO', href: '/news' },
    { icon: 'fa-book', text: 'HƯỚNG DẪN SỬ DỤNG', href: '/guide' },
    { icon: 'fa-phone', text: 'LIÊN HỆ BÁN TÀI SẢN', href: '/contact' },
  ];

  return (
    <div>
      {/* ==== TOP BAR ==== */}
      <div className={styles.topBar}>
        <div className={styles.hotline}>
          <i className="fa fa-phone" /> HOTLINE: (028) 39406853 - (028) 62561989
        </div>
        <div className={styles.authLinks}>
          {user ? (
            <>
              {/* ICON CHUÔNG + BADGE */}
              <div style={{ position: "relative", display: "inline-block" }}>
                <div
                  onClick={togglePopup}
                  style={{
                    cursor: "pointer",
                    position: "relative",
                    padding: "8px",
                    borderRadius: "50%",
                    background: open ? "#f1f5f9" : "transparent",
                    transition: "0.2s",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fa-solid fa-bell fa-lg" style={{ color: "#475569" }}></i>

                  {/* BADGE SỐ CHƯA ĐỌC */}
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        background: "#ef4444",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: "600",
                        minWidth: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                        border: "2px solid white",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        animation: unreadCount > 0 ? "pulse 1.5s infinite" : "none",
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>

                {/* POPUP THÔNG BÁO */}
                <NotificationBell
                  open={open}
                  onClose={() => setOpen(false)}
                  onUnreadCountChange={handleUnreadCountChange} // Cập nhật badge từ NotificationBell
                />
              </div>

              <span className={styles.annn}>Xin chào, {user.full_name}</span>
              <div className={styles.userIconContainer}>
                <Link to="/profile">
                  <i className={`fa fa-user ${styles.userIcon}`} />
                </Link>
              </div>
              <a href="/login" onClick={handleLogout}>
                Đăng Xuất <i className="fa fa-sign-out" />
              </a>
            </>
          ) : (
            <>
              <Link to="/login">Đăng Nhập</Link>
              <span>|</span>
              <Link to="/register">Đăng Ký</Link>
            </>
          )}
        </div>
      </div>

      {/* ==== SEARCH ==== */}
      <header className={styles.headerMain}>
        <div className={styles.logo}>
          <Link to="/">
            <img className={styles.logoImg} src="/assets/img/logo.jpg" alt="Logo" />
          </Link>
        </div>

        <div className={styles.searchContainer} ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
            <input
              name="q"
              placeholder="Nhập tên tài sản cần tìm ..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            <button type="submit">
              <i className="fa fa-search" />
            </button>
          </form>
          {suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((s) => (
                <li key={s.id}>
                  <Link to={s.href}>
                    <img src={s.image} alt={s.name} />
                    <span>{s.name}</span>
                    <span>{s.price.toLocaleString('vi-VN')} VNĐ</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mobile Search */}
        <div className={styles.mobileSearchContainer}>
          <button className={styles.mobileSearchToggle} onClick={toggleMobileSearch}>
            <i className="fa fa-search" />
          </button>
          <form
            onSubmit={handleSearchSubmit}
            className={`${styles.mobileSearchBox} ${isMobileSearchActive ? styles.active : ''}`}
          >
            <input
              placeholder="Nhập tên tài sản..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <i className="fa fa-search" />
            </button>
          </form>
        </div>

        <div className={styles.headerRight}>
          {user && latestUnpaidContract && (
            <Link to="/contract" className={styles.headContractBox}>
              <div className={styles.headIcon}>HD</div>
              <div className={styles.headContent}>
                <div className={styles.headTitle}>
                  Hợp đồng: {latestUnpaidContract.session.item.name}
                </div>
                <div className={styles.headDueTime}>Còn lại: {countdown}</div>
              </div>
            </Link>
          )}
          <div className={styles.datetime}>{currentTime}</div>
        </div>
      </header>

      {/* ==== DESKTOP NAV BAR ==== */}
      <nav className={styles.navBar}>
        <ul className={styles.navMenu}>
          {navItems.map((item, i) => (
            <li key={i}>
              <Link to={item.href}>
                <i className={`fa ${item.icon}`} /> {item.text}
              </Link>
              {item.isCategory && item.subItems?.length > 0 && (
                <ul className={styles.categoryHidden}>
                  {item.subItems.map((sub, j) => (
                    <li key={j}>
                      <Link to={sub.href}>{sub.text}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* ==== MOBILE NAV TOGGLE ==== */}
      <button
        aria-label="Mở menu"
        className={`${styles.mobileNavToggle} ${isMobileNavActive ? styles.active : ''}`}
        onClick={openMobileNav}
      >
        <i className="fa fa-bars"></i>
      </button>

      {/* ==== MOBILE NAV OVERLAY ==== */}
      <div
        className={`${styles.mobileNavOverlay} ${isMobileNavActive ? styles.active : ''}`}
        onClick={closeMobileNav}
      ></div>

      {/* ==== MOBILE NAV SIDEBAR ==== */}
      <div
        className={`${styles.mobileNavSidebar} ${isMobileNavActive ? styles.active : ''}`}
      >
        <div className={styles.mobileNavHeader}>
          <h3>Menu Điều Hướng</h3>
          <button aria-label="Đóng menu" className={styles.mobileNavClose} onClick={closeMobileNav}>
            <i className="fa fa-times"></i>
          </button>
        </div>
        <ul className={styles.mobileNavMenu}>
          {navItems.map((item, index) => (
            <li key={index}>
              {item.isCategory ? (
                <>
                  <button
                    className={`${styles.mobileCategoryToggle} ${isMobileCategoryActive ? styles.active : ''}`}
                    onClick={toggleMobileCategory}
                  >
                    <div>
                      <i className={`fa ${item.icon}`} aria-hidden="true"></i>
                      {item.text}
                    </div>
                    <i className={`fa fa-chevron-down ${styles.arrow}`} aria-hidden="true"></i>
                  </button>
                  <ul
                    className={`${styles.mobileCategoryMenu} ${isMobileCategoryActive ? styles.active : ''}`}
                  >
                    {item.subItems.map((sub, subIndex) => (
                      <li key={subIndex}>
                        <Link to={sub.href} onClick={closeMobileNav}>
                          <i className={`fa ${sub.icon}`} aria-hidden="true"></i> {sub.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link to={item.href} onClick={closeMobileNav}>
                  <i className={`fa ${item.icon}`} aria-hidden="true"></i>
                  {item.text}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* === HIỆU ỨNG NHẤP NHÁY KHI CÓ TB MỚI === */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Header;