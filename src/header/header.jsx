import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../UserContext';
import axios from 'axios';
import styles from './header.module.css';

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
  const [searchQuery, setSearchQuery] = useState(''); // State cho từ khóa tìm kiếm
  const [suggestions, setSuggestions] = useState([]); // State cho danh sách đề xuất
  const searchRef = useRef(null); // Ref để xử lý click bên ngoài

  // Fetch danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}categories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const result = await response.json();
        if (result.status && result.data) {
          const mappedCategories = result.data.map(category => ({
            icon: getIconForCategory(category.name),
            text: category.name,
            href: `/category/${category.category_id}`,
          }));
          setCategories(mappedCategories);
        } else {
          throw new Error('Invalid API response');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Hàm ánh xạ tên danh mục với icon
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

  // Fetch thông báo từ API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !user.user_id) {
        setNotifications([]);
        setNotificationError(null);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setNotifications([]);
          setNotificationError(null);
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}notifications/${user.user_id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.status && result.notifications) {
          setNotifications(
            result.notifications.map(notif => ({
              id: notif.notification_id,
              text: notif.message,
              isRead: notif.is_read,
              timestamp: new Date(notif.created_at),
            }))
          );
          setNotificationError(null);
        } else {
          throw new Error('Invalid API response structure');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setNotificationError(`Không thể tải thông báo: ${error.message}`);
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
        const apiUrl = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}contracts`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch contract data');
        }
        const data = await response.json();
        setContractData(data);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setContractData({ status: false, contracts: [] });
      }
    };

    fetchContracts();
  }, []);

  // Fetch sản phẩm cho tìm kiếm có đề xuất
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}products`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const products = response.data.data || [];
        const productsWithSessions = products.filter(
          (p) => Array.isArray(p.sessions) && p.sessions.length > 0
        );
        // Lọc sản phẩm dựa trên từ khóa tìm kiếm
        const filteredSuggestions = productsWithSessions
          .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(p => ({
            id: p.sessions[0]?.id,
            name: p.name,
            href: `/auction-session/${p.sessions[0]?.id}`,

          }))
          .slice(0, 5); // Giới hạn 5 đề xuất
        setSuggestions(filteredSuggestions);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300); // Debounce để tránh gọi API quá nhanh
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Update clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('vi-VN'));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // User authentication and contract filtering
  useEffect(() => {
    if (user && contractData && contractData.status && contractData.contracts.length > 0) {
      const userContracts = contractData.contracts
        .filter(
          (contract) =>
            contract.winner_id === user.user_id &&
            contract.status === 'ChoThanhToan' &&
            new Date(contract.signed_date).getTime() + 24 * 60 * 60 * 1000 >= new Date().getTime()
        )
        .sort((a, b) => new Date(b.signed_date) - new Date(a.signed_date));

      setLatestUnpaidContract(userContracts[0] || null);
    }
  }, [user, contractData]);

  // Countdown timer for the latest unpaid contract
  useEffect(() => {
    if (!latestUnpaidContract) {
      setCountdown('Không có hợp đồng');
      return;
    }

    const getTargetDate = (signedDate) => {
      const signed = new Date(signedDate);
      signed.setHours(signed.getHours() + 24);
      return signed;
    };

    const formatCountdown = (ms) => {
      if (ms <= 0) return 'Hết thời gian';
      const totalSec = Math.floor(ms / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const updateCountdown = () => {
      const target = getTargetDate(latestUnpaidContract.signed_date);
      const now = new Date();
      const diff = target - now;
      setCountdown(formatCountdown(diff));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [latestUnpaidContract]);

  // User logout using API
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log('LocalStorage keys:', Object.keys(localStorage));
      console.log('Token retrieved:', token);
      if (!token) {
        throw new Error('Không tìm thấy token đăng nhập trong localStorage');
      }
      const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
      console.log('API URL:', `${apiUrl}logout`);
      const response = await fetch(`${apiUrl}logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const text = await response.text();
        console.log('Response text:', text);
        throw new Error(`Yêu cầu thất bại với mã trạng thái ${response.status}`);
      }

      const result = await response.json();
      console.log('Response JSON:', result);
      if (response.ok && result.status) {
        await logout();
        localStorage.removeItem('token');
        alert('Đăng xuất thành công');
        window.location.href = '/login';
      } else {
        throw new Error(result.message || 'Đăng xuất thất bại');
      }
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
      alert('Lỗi đăng xuất: ' + err.message);
    }
  };

  // Mobile search handlers
  const toggleMobileSearch = () => {
    setIsMobileSearchActive(!isMobileSearchActive);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleClickOutsideSearch = (e) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(e.target) &&
      !e.target.closest(`.${styles.mobileSearchToggle}`)
    ) {
      setIsMobileSearchActive(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutsideSearch);
    return () => document.removeEventListener('click', handleClickOutsideSearch);
  }, []);

  // Mobile navigation handlers
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
    }
  };

  useEffect(() => {
    if (isNotificationOpen) {
      document.addEventListener('click', closeNotification);
      return () => document.removeEventListener('click', closeNotification);
    }
  }, [isNotificationOpen]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}notifications/${id}/mark-read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`);
      }
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Calculate time ago
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

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`; // Chuyển hướng đến trang tìm kiếm
    }
  };

  // Navigation menu items
  const navItems = [
    { icon: 'fa-info-circle', text: 'GIỚI THIỆU', href: '/about' },
    {
      icon: 'fa-th-list',
      text: 'DANH MỤC TÀI SẢN',
      href: '#',
      isCategory: true,
      subItems: categories,
    },
    { icon: 'fa-gavel', text: 'ĐẤU GIÁ TRỰC TUYẾN', href: 'auction-session' },
    { icon: 'fa-newspaper', text: 'TIN TỨC - THÔNG BÁO', href: 'news' },
    { icon: 'fa-book', text: 'HƯỚNG DẪN SỬ DỤNG', href: '#' },
    { icon: 'fa-phone', text: 'LIÊN HỆ BÁN TÀI SẢN', href: 'contact' },
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
              {/* Notification Bell */}
              <div className={styles.notifi} onClick={toggleNotification}>
                <i className="fa fa-bell" aria-hidden="true"></i>
                {notifications.filter(notif => !notif.isRead).length > 0 && (
                  <span className={styles.unreadCount}>
                    {notifications.filter(notif => !notif.isRead).length}
                  </span>
                )}
              </div>
              <a href="#" onClick={handleLogout}>
                Đăng Xuất <i className="fa fa-sign-out" aria-hidden="true"></i>
              </a>
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
              <img src="\assets\img\logo.jpg" alt="Logo" />
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
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <Link to={suggestion.href} onClick={() => setSearchQuery('')}>
                    {suggestion.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mobile Search */}
        <div className={styles.mobileSearchContainer} ref={searchRef}>
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
                {suggestions.map((suggestion) => (
                  <li key={suggestion.id}>
                    <Link to={suggestion.href} onClick={() => setSearchQuery('')}>
                      {suggestion.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          {user && latestUnpaidContract && (
            <Link to={`/contract`} style={{ textDecoration: 'none' }}>
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

      {/* Desktop Navigation Bar */}
      <nav className={styles.navBar}>
        <ul className={styles.navMenu}>
          {navItems.map((item, index) => (
            <li key={index} className={item.isCategory ? styles.categories : ''}>
              <a href={item.href}>
                <i aria-hidden="true" className={`fa ${item.icon}`}></i>
                <span>{item.text}</span>
              </a>
              {item.isCategory && item.subItems && (
                <ul className={styles.categoryHidden}>
                  {item.subItems.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <a href={subItem.href}>{subItem.text}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Navigation Toggle Button */}
      <button
        aria-label="Mở menu"
        className={`${styles.mobileNavToggle} ${isMobileNavActive ? styles.active : ''}`}
        onClick={openMobileNav}
      >
        <i className="fa fa-bars"></i>
      </button>

      {/* Mobile Navigation Overlay */}
      <div
        className={`${styles.mobileNavOverlay} ${isMobileNavActive ? styles.active : ''}`}
        onClick={closeMobileNav}
      ></div>

      {/* Mobile Navigation Sidebar */}
      <div
        className={`${styles.mobileNavSidebar} ${isMobileNavActive ? styles.active : ''}`}
      >
        <div className={styles.mobileNavHeader}>
          <h3>Menu Điều Hướng</h3>
          <button aria-label="Đóng menu" className={styles.mobileNavClose} onClick={closeMobileNav}>
            <i className="fa fa-times" />
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
                      <i aria-hidden="true" className={`fa ${item.icon}`}></i>
                      {item.text}
                    </div>
                    <i aria-hidden="true" className={`fa fa-chevron-down ${styles.arrow}`}></i>
                  </button>
                  <ul
                    className={`${styles.mobileCategoryMenu} ${isMobileCategoryActive ? styles.active : ''}`}
                  >
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <a href={subItem.href}>
                          <i className={`fa ${subItem.icon}`}></i> {subItem.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <a href={item.href} onClick={closeMobileNav}>
                  <i aria-hidden="true" className={`fa ${item.icon}`}></i>
                  {item.text}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Header;