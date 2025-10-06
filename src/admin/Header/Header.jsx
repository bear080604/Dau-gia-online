// Sidebar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Giữ nguyên từ trước
import styles from './Header.module.css'; // Assuming CSS module file

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('settings'); // Default active is settings
  const navigate = useNavigate(); // Giữ nguyên

  // Helper function để thêm prefix "/admin" nếu href không phải '#'
  const addAdminPrefix = (href) => {
    if (href === '#') return href;
    return `/admin${href.startsWith('/') ? href : `/${href}`}`;
  };

  const sidebarItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'Trang chủ', href: addAdminPrefix('/dashboard') },
    { id: 'assets', icon: 'fas fa-box-open', label: 'Tài sản đấu giá', href: addAdminPrefix('/auction-asset') },
    { id: 'auctions', icon: 'fas fa-clock', label: 'Phiên đấu giá', href: addAdminPrefix('/auction-session') },
    { id: 'contracts', icon: 'fas fa-file-contract', label: 'Hợp đồng', href: addAdminPrefix('/contract') },
    { id: 'reports', icon: 'fas fa-chart-bar', label: 'Báo cáo', href: addAdminPrefix('/report') },
    { id: 'users', icon: 'fas fa-users', label: 'Quản lý người dùng', href: addAdminPrefix('/users') },
    { id: 'bids', icon: 'fas fa-file-alt', label: 'Hồ sơ đấu giá', href: addAdminPrefix('/profile') },
    { id: 'notifications', icon: 'fas fa-bell', label: 'Thông báo', href: addAdminPrefix('/notification') },
    { id: 'payments', icon: 'fas fa-money-bill-wave', label: 'Thanh toán', href: addAdminPrefix('/payment') },
    { id: 'econtracts', icon: 'fas fa-file-signature', label: 'Hợp đồng điện tử', href: addAdminPrefix('/econtract') },
    { id: 'settings', icon: 'fas fa-cog', label: 'Cài đặt', href: addAdminPrefix('/settings'), active: true },
    { id: 'support', icon: 'fas fa-headset', label: 'Hỗ trợ', href: '#' }, // Giữ nguyên
    { id: 'security', icon: 'fas fa-shield-alt', label: 'Bảo mật', href: '#' }, // Giữ nguyên
    { id: 'logs', icon: 'fas fa-history', label: 'Lịch sử log', href: addAdminPrefix('/history') },
  ];

  const sections = [
    {
      title: 'Bảng điều khiển',
      items: sidebarItems.slice(0, 5),
    },
    {
      title: 'Công cụ',
      items: sidebarItems.slice(5, 10),
    },
    {
      title: 'Hệ thống',
      items: sidebarItems.slice(10),
    },
  ];

  const handleItemClick = (id, href) => {
    setActiveItem(id);
    if (href !== '#') {
      navigate(href); // Sử dụng href đã có prefix
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>
          <i className="fas fa-gavel"></i>
          <span>DauGia Online</span>
        </h2>
      </div>
      {sections.map((section, index) => (
        <div key={index} className={styles.sidebarSection}>
          <h3>{section.title}</h3>
          {section.items.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`${styles.sidebarItem} ${activeItem === item.id ? styles.active : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleItemClick(item.id, item.href);
              }}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;