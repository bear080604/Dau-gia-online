import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../UserContext';
import axios from 'axios';
import styles from './Header.module.css';

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
  const searchRef = useRef(null);
  const navigate = useNavigate();

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
          setNotificationError(null);
        } else {
          setNotificationError('Invalid API response structure');
          setNotifications([]);
        }
      } catch (e) {
        setNotificationError(e.message || 'Không thể tải thông báo');
        setNotifications([]);
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

  // Search suggestions
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
          .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 5)
          .map((p) => ({
            id: p.sessions?.[0]?.id || p.product_id || Math.random(),
            name: p.name,
            href: `/auction-session/${p.sessions?.[0]?.id || ''}`,
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

  // Handle latest unpaid contract
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
    if (!latestUnpaidContract) {
      setCountdown('Không có hợp đồng');
      return;
    }
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
        await logout();
        localStorage.removeItem('token');
        alert('Đăng xuất thành công');
        navigate('/login');
      } else {
        throw new Error(result.message || 'Đăng xuất thất bại');
      }
    } catch (err) {
      alert('Lỗi đăng xuất: ' + (err.message || err));
    }
  };

  // Mobile search toggles & outside click
  const toggleMobileSearch = () => {
    setIsMobileSearchActive(!isMobileSearchActive);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleClickOutsideSearch = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setIsMobileSearchActive(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutsideSearch);
    return () => document.removeEventListener('click', handleClickOutsideSearch);
  }, []);

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

  const toggleNotification = (e) => {
    e.stopPropagation();
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotification = (e) => {
    if (
      e.target.closest(`.${styles.notifi}`) ||
      e.target.closest(`.${styles.userIconContainer}`) ||
      e.target.closest(`.${styles.authLinks}`)
    ) {
      return;
    }
    if (isNotificationOpen && !e.target.closest(`.${styles.notificationPopup}`)) {
      setIsNotificationOpen(false);
      setShowAllNotifications(false);
    }
  };

  useEffect(() => {
    if (isNotificationOpen) {
      document.addEventListener('click', closeNotification);
      return () => document.removeEventListener('click', closeNotification);
    }
  }, [isNotificationOpen]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/'}notifications/${id}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to mark notification as read');
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/'}notifications/user/${user?.user_id}/read-all`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin === 1) return '1 phút trước';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) return '1 giờ trước';
    return `${diffHours} giờ trước`;
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

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
    <div style={{ position: 'relative' }}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.hotline}>
          <i aria-hidden="true" className="fa fa-phone"></i>
          HOTLINE: (028) 39406853 - (028) 62561989
        </div>
        <div className={styles.authLinks}>
          {user ? (
            <>
              <span>Xin chào, {user.full_name}</span>
              <div className={styles.userIconContainer}>
                <Link to="/profile" aria-label="Go to profile">
                  <i className={`fa fa-user ${styles.userIcon}`} aria-hidden="true"></i>
                </Link>
                {user.role === 'admin' && (
                  <div className={styles.adminDropdown}>
                    <Link to="/admin" aria-label="Go to admin panel">
                      Admin
                    </Link>
                  </div>
                )}
              </div>
              <div className={styles.notifi} onClick={toggleNotification}>
                <i className="fa fa-bell" aria-hidden="true"></i>
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className={styles.unreadCount}>{notifications.filter((n) => !n.isRead).length}</span>
                )}
              </div>
              <a href="#" onClick={handleLogout}>
                Đăng Xuất <i className="fa fa-sign-out" aria-hidden="true"></i>
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

      {/* Notification Popup */}
      {isNotificationOpen && (
        <div className={styles.notificationPopup} role="dialog" aria-label="Thông báo">
          <div className={styles.notificationContent}>
            <span
              className={styles.notificationClose}
              onClick={(e) => {
                e.stopPropagation();
                setIsNotificationOpen(false);
              }}
              role="button"
              tabIndex={0}
              aria-label="Đóng thông báo"
            >
              &times;
            </span>
            <h3>Thông Báo</h3>
            {notificationError ? (
              <p className={styles.error}>{notificationError}</p>
            ) : notifications.length > 0 ? (
              <ul>
                {notifications.slice(0, 5).map((notif) => (
                  <li
                    key={notif.id}
                    className={notif.isRead ? styles.read : styles.unread}
                    onClick={() => markAsRead(notif.id)}
                    role="button"
                    tabIndex={0}
                  >
                    {notif.isRead && <span className={styles.readIcon}>✔</span>}
                    {notif.text}
                    <span className={styles.timeAgo}>({getTimeAgo(notif.timestamp)})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Không có thông báo nào</p>
            )}
          </div>
        </div>
      )}

      {/* Header Main */}
      <header className={styles.headerMain}>
        <div className={styles.logo}>
          <div className={styles.logoImg}>
            <a href="/">
              <img  src="\assets\img\logo.jpg" alt="Logo" />
            </a>
          </div>
        </div>

        {/* Desktop Search */}
        <div className={styles.searchContainer} ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
            <input
              name="q"
              placeholder="Nhập tên tài sản cần tìm ..."
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              autoComplete="off"
            />
            <button type="submit">
              <i aria-hidden="true" className="fa fa-search"></i>
            </button>
          </form>
          {suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((s) => (
                <li key={s.id} className={styles.suggestionItem}>
                  <Link to={s.href} onClick={() => setSearchQuery('')}>
                    <div className={styles.suggestionContent}>
                      <img src={s.image} alt={s.name} className={styles.suggestionImage} />
                      <div className={styles.suggestionDetails}>
                        <span className={styles.suggestionName}>{s.name}</span>
                        <span className={styles.suggestionPrice}>
                          Giá: {s.price.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mobile Search */}
        <div className={styles.mobileSearchContainer}>
          <button className={styles.mobileSearchToggle} onClick={toggleMobileSearch}>
            <i aria-hidden="true" className="fa fa-search"></i>
          </button>
          <div className={`${styles.mobileSearchBox} ${isMobileSearchActive ? styles.active : ''}`}>
            <form onSubmit={handleSearchSubmit}>
              <input
                placeholder="Nhập tên tài sản..."
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                autoComplete="off"
              />
              <button type="submit">
                <i aria-hidden="true" className="fa fa-search"></i>
              </button>
            </form>
            {suggestions.length > 0 && (
              <ul className={styles.suggestions}>
                {suggestions.map((s) => (
                  <li key={s.id} className={styles.suggestionItem}>
                    <Link to={s.href} onClick={() => setSearchQuery('')}>
                      <div className={styles.suggestionContent}>
                        <img src={s.image} alt={s.name} className={styles.suggestionImage} />
                        <div className={styles.suggestionDetails}>
                          <span className={styles.suggestionName}>{s.name}</span>
                          <span className={styles.suggestionPrice}>
                            Giá: {s.price.toLocaleString('vi-VN')} VNĐ
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          {user && latestUnpaidContract && (
            <Link to="/contract" style={{ textDecoration: 'none' }}>
              <div aria-live="polite" className={styles.headContractBox} role="status">
                <div aria-hidden="true" className={styles.headIcon}>
                  HD
                </div>
                <div className={styles.headContent}>
                  <div className={styles.headTitle}>Hợp đồng: {latestUnpaidContract.session.item.name}</div>
                  <div className={styles.headDueTime}>Còn lại: {countdown}</div>
                </div>
              </div>
            </Link>
          )}
          <div className={styles.datetime}>{currentTime}</div>
        </div>
      </header>

      {/* Nav Bar */}
      <nav className={styles.navBar}>
        <ul className={styles.navMenu}>
          {navItems.map((item, idx) => (
            <li key={idx} className={item.isCategory ? styles.categories : ''}>
              <Link to={item.href}>
                <i aria-hidden="true" className={`fa ${item.icon}`}></i>
                <span>{item.text}</span>
              </Link>
              {item.isCategory && item.subItems && (
                <ul className={styles.categoryHidden}>
                  {item.subItems.map((sub, sIdx) => (
                    <li key={sIdx}>
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
