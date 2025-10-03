// Sidebar.jsx
import React, { useState } from 'react';
import styles from './Header.module.css'; // Assuming CSS module file

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('settings'); // Default active is settings

  const sidebarItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'Trang chủ', href: 'dashboard.html' },
    { id: 'assets', icon: 'fas fa-box-open', label: 'Tài sản đấu giá', href: '#' },
    { id: 'auctions', icon: 'fas fa-clock', label: 'Phiên đấu giá', href: '#' },
    { id: 'contracts', icon: 'fas fa-file-contract', label: 'Hợp đồng', href: '#' },
    { id: 'reports', icon: 'fas fa-chart-bar', label: 'Báo cáo', href: '#' },
    { id: 'users', icon: 'fas fa-users', label: 'Quản lý người dùng', href: '#' },
    { id: 'bids', icon: 'fas fa-file-alt', label: 'Hồ sơ đấu giá', href: '#' },
    { id: 'notifications', icon: 'fas fa-bell', label: 'Thông báo', href: '#' },
    { id: 'payments', icon: 'fas fa-money-bill-wave', label: 'Thanh toán', href: '#' },
    { id: 'econtracts', icon: 'fas fa-file-signature', label: 'Hợp đồng điện tử', href: '#' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Cài đặt', href: '#', active: true },
    { id: 'support', icon: 'fas fa-headset', label: 'Hỗ trợ', href: '#' },
    { id: 'security', icon: 'fas fa-shield-alt', label: 'Bảo mật', href: '#' },
    { id: 'logs', icon: 'fas fa-history', label: 'Lịch sử log', href: '#' },
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

  const handleItemClick = (id) => {
    setActiveItem(id);
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
                handleItemClick(item.id);
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