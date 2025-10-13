import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../UserContext';
import styles from './header.module.css'; // Import CSS module

const Header = () => {
  const { user, logout } = useUser();
  const [currentTime, setCurrentTime] = useState('');
  const [countdown, setCountdown] = useState('23:59:59');
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);
  const [isMobileCategoryActive, setIsMobileCategoryActive] = useState(false);
  const [latestUnpaidContract, setLatestUnpaidContract] = useState(null);
  const [contractData, setContractData] = useState(null);

  // Logo base64
  

  // Fetch contract data from API
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}contracts`;
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
      signed.setHours(signed.getHours() + 24); // 24-hour payment window
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
      await logout();
      alert('Đăng xuất thành công');
      window.location.href = '/login';
    } catch (err) {
      alert('Lỗi đăng xuất: ' + err.message);
    }
  };

  // Mobile search handlers
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

  // Navigation menu items
  const navItems = [
    { icon: 'fa-info-circle', text: 'GIỚI THIỆU', href: '#' },
    {
      icon: 'fa-th-list',
      text: 'DANH MỤC TÀI SẢN',
      href: '#',
      isCategory: true,
      subItems: [
        { icon: 'fa-home', text: 'Bất động sản', href: '#' },
        { icon: 'fa-car', text: 'Xe cộ', href: '#' },
        { icon: 'fa-gem', text: 'Đồ cổ & Quý hiếm', href: '#' },
        { icon: 'fa-laptop', text: 'Thiết bị công nghệ', href: '#' },
      ],
    },
    { icon: 'fa-gavel', text: 'ĐẤU GIÁ TRỰC TUYẾN', href: 'auction-session' },
    { icon: 'fa-newspaper', text: 'TIN TỨC - THÔNG BÁO', href: '#' },
    { icon: 'fa-book', text: 'HƯỚNG DẪN SỬ DỤNG', href: '#' },
    { icon: 'fa-phone', text: 'LIÊN HỆ BÁN TÀI SẢN', href: 'contact' },
  ];

  return (
    <>
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
        <div className={styles.searchContainer}>
          <form action="#" className={styles.searchBox} method="GET">
            <input name="q" placeholder="Nhập tên tài sản cần tìm ..." type="text" />
            <button type="submit">
              <i aria-hidden="true" className="fa fa-search"></i>
            </button>
          </form>
        </div>

        {/* Mobile Search */}
        <div className={styles.mobileSearchContainer}>
          <button className={styles.mobileSearchToggle} onClick={toggleMobileSearch}>
            <i aria-hidden="true" className="fa fa-search"></i>
          </button>
          <div className={`${styles.mobileSearchBox} ${isMobileSearchActive ? styles.active : ''}`}>
            <input placeholder="Nhập tên tài sản..." type="text" />
            <button type="submit">
              <i aria-hidden="true" className="fa fa-search"></i>
            </button>
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
    </>
  );
};

export default Header;