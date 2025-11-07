import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../UserContext';
import NotificationBell from '../NotificationBell';
import styles from './TopHeader.module.css';

const TopHeader = () => {
  const { user, logout } = useUser();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // Số thông báo chưa đọc
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // === TOGGLE NOTIFICATION POPUP ===
  const toggleNotification = (e) => {
    e.stopPropagation();
    const isOpening = !notificationOpen;
    setNotificationOpen(isOpening);
    setUserMenuOpen(false);

    // Reset badge khi mở popup (tùy chọn)
    if (isOpening) {
      // setUnreadCount(0); // Bỏ comment nếu muốn reset badge khi mở
    }
  };

  // === TOGGLE USER MENU ===
  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setUserMenuOpen((prev) => !prev);
    setNotificationOpen(false);
  };

  // === NHẬN CẬP NHẬT SỐ CHƯA ĐỌC TỪ NotificationBell ===
  const handleUnreadCountChange = (count) => {
    setUnreadCount(count);
  };

  // === ĐÓNG KHI CLICK NGOÀI ===
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // === LOGOUT ===
  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    navigate('/login');
  };

  // === VỀ TRANG NGƯỜI DÙNG ===
  const handleGoToClient = () => {
    navigate('/');
    setUserMenuOpen(false);
  };

  // === LẤY CHỮ CÁI ĐẦU ===
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'AD';
  };

  return (
    <div className={styles.topHeader}>
      <div className={styles.headerContent}>
        {/* LEFT: TITLE */}
        <div className={styles.leftSection}>
          <h1 className={styles.title}>Admin Panel</h1>
        </div>

        {/* CENTER: SEARCH */}
        {/* <div className={styles.centerSection}>
          <div className={styles.searchBar}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className={styles.searchInput}
            />
          </div>
        </div> */}

        {/* RIGHT: NOTIFICATION + USER MENU */}
        <div className={styles.rightSection}>
          {/* NOTIFICATION BELL */}
          <div className={styles.notificationWrapper} ref={notificationRef}>
            <button
              className={styles.iconButton}
              onClick={toggleNotification}
              title="Thông báo"
            >
              <i className="fa-solid fa-bell"></i>

              {/* BADGE SỐ CHƯA ĐỌC */}
              {unreadCount > 0 && (
                <span
                  className={styles.notificationBadge}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* POPUP THÔNG BÁO */}
            <NotificationBell
              open={notificationOpen}
              onClose={() => setNotificationOpen(false)}
              onUnreadCountChange={handleUnreadCountChange}
            />
          </div>

          {/* USER MENU */}
          <div className={styles.userMenuWrapper} ref={userMenuRef}>
            <button className={styles.userButton} onClick={toggleUserMenu}>
              <div className={styles.userAvatar}>
                {getUserInitials()}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {user?.name || 'Admin User'}
                </span>
                <span className={styles.userRole}>
                  {user?.role_name || 'Administrator'}
                </span>
              </div>
              <i
                className={`fa-solid fa-chevron-down ${styles.dropdownIcon} ${
                  userMenuOpen ? styles.rotated : ''
                }`}
              ></i>
            </button>

            {/* DROPDOWN MENU */}
            {userMenuOpen && (
              <div className={styles.userDropdown}>
                <div className={styles.dropdownItem} onClick={handleGoToClient}>
                  <i className="fa-solid fa-user"></i>
                  <span>Trang người dùng</span>
                </div>
                <div className={styles.dropdownDivider}></div>
                <div className={styles.dropdownItem} onClick={handleLogout}>
                  <i className="fa-solid fa-sign-out-alt"></i>
                  <span>Đăng xuất</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HIỆU ỨNG NHẤP NHÁY BADGE */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default TopHeader;