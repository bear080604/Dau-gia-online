import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ chỉ import 1 lần
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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notificationError, setNotificationError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
    const [open, setOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

   const togglePopup = (e) => {
    e.stopPropagation(); // tránh đóng liền sau khi mở
    setOpen((prev) => !prev);
  };
  // Fetch danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}categories`
        );
        if (!response.ok) throw new Error('Failed to fetch categories');
        const result = await response.json();
        if (result.status && result.data) {
          const mappedCategories = result.data.map((category) => ({
            icon: getIconForCategory(category.name),
            text: category.name,
            href: `/category/${category.category_id}`,
          }));
          setCategories(mappedCategories);
        } else throw new Error('Invalid API response');
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const getIconForCategory = (categoryName) => {
    switch (categoryName) {
      case 'Bất động sản':
        return 'fa-home';
      case 'Xe cộ':
        return 'fa-car';
      case 'Đồ cổ':
        return 'fa-gem';
      case 'Thiết bị điện tử':
        return 'fa-laptop';
      case 'Người yêu':
        return 'fa-heart';
      default:
        return 'fa-folder';
    }
  };

  // Fetch thông báo
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.user_id) return setNotifications([]);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}notifications/${user.user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        if (data.status && data.notifications) {
          setNotifications(
            data.notifications.map((n) => ({
              id: n.notification_id,
              text: n.message,
              isRead: n.is_read,
              timestamp: new Date(n.created_at),
            }))
          );
        }
      } catch (e) {
        setNotificationError(e.message);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch contracts
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}contracts`
        );
        if (!res.ok) throw new Error('Failed to fetch contract data');
        const data = await res.json();
        setContractData(data);
      } catch {
        setContractData({ status: false, contracts: [] });
      }
    };
    fetchContracts();
  }, []);

  // Search gợi ý
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) return setSuggestions([]);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}products`,
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
            image: p.image || '/assets/img/default-product.jpg',
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

  // Clock
  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleString('vi-VN'));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  // Xử lý hợp đồng chưa thanh toán
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

  // Countdown
  useEffect(() => {
    if (!latestUnpaidContract)
      return setCountdown('Không có hợp đồng');
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

  // Logout
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}logout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await res.json();
      if (res.ok && result.status) {
        logout();
        localStorage.removeItem('token');
        alert('Đăng xuất thành công');
        navigate('/login');
      } else throw new Error(result.message);
    } catch (err) {
      alert('Lỗi đăng xuất: ' + err.message);
    }
  };

  // Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/auction-session?q=${encodeURIComponent(searchQuery)}`);
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
    { icon: 'fa-book', text: 'HƯỚNG DẪN SỬ DỤNG', href: '#' },
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
            <div>
              <div onClick={togglePopup} style={{ cursor: "pointer" }}>
                <i className="fa-solid fa-bell fa-lg"></i>
              </div>

              <NotificationBell open={open} onClose={() => setOpen(false)} />
            </div>
                

              <span>Xin chào, {user.full_name}</span>
              <div className={styles.userIconContainer}>
                <Link to="/profile">
                  <i className={`fa fa-user ${styles.userIcon}`} />
                </Link>
              </div>
              <a href="#" onClick={handleLogout}>
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

      {/* ==== NAV BAR ==== */}
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
    </div>
  );
};

export default Header;
