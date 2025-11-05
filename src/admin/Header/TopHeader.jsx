import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../UserContext';
import NotificationBell from '../NotificationBell';
import styles from './TopHeader.module.css';

const TopHeader = () => {
  const { user, logout } = useUser();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const toggleNotification = (e) => {
    e.stopPropagation();
    setNotificationOpen((prev) => !prev);
    setUserMenuOpen(false);
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setUserMenuOpen((prev) => !prev);
    setNotificationOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoToClient = () => {
    navigate('/');
    setUserMenuOpen(false);
  };

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Lấy initials cho avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'AD';
  };

  return (
    <div className={styles.topHeader}>
      <div className={styles.headerContent}>
        <div className={styles.leftSection}>
          <h1 className={styles.title}>Admin Panel</h1>
        </div>

        <div className={styles.centerSection}>
          {/* Search Bar */}
          <div className={styles.searchBar}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.rightSection}>
          {/* Notification Bell */}
          <div className={styles.notificationWrapper}>
            <button
              className={styles.iconButton}
              onClick={toggleNotification}
              title="Thông báo"
            >
              <i className="fa-solid fa-bell"></i>
            </button>
            <NotificationBell
              open={notificationOpen}
              onClose={() => setNotificationOpen(false)}
            />
          </div>

          {/* User Menu */}
          <div className={styles.userMenuWrapper} ref={userMenuRef}>
            <button
              className={styles.userButton}
              onClick={toggleUserMenu}
            >
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
              <i className={`fa-solid fa-chevron-down ${styles.dropdownIcon} ${userMenuOpen ? styles.rotated : ''}`}></i>
            </button>

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
    </div>
  );
};

export default TopHeader;
