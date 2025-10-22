import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../UserContext';
import styles from './Header.module.css';

const Sidebar = () => {
  const { user } = useUser();
  const [activeItem, setActiveItem] = useState('settings');
  const [allowedItems, setAllowedItems] = useState([]);
  const navigate = useNavigate();

  // Lấy REACT_APP_API_URL từ biến môi trường
  const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/';

  const addAdminPrefix = (href) => {
    if (href === '#') return href;
    return `/admin${href.startsWith('/') ? href : `/${href}`}`;
  };

  const getSidebarItems = () => {
    return [
      { id: 'dashboard', icon: 'fas fa-home', label: 'Trang chủ', href: addAdminPrefix('/dashboard') },
      { id: 'assets', icon: 'fas fa-box-open', label: 'Tài sản đấu giá', href: addAdminPrefix('/auction-asset') },
      { id: 'assets-categories', icon: 'fas fa-box-open', label: 'Danh mục tài sản', href: addAdminPrefix('/assets-categories') },
      { id: 'auctions', icon: 'fas fa-clock', label: 'Phiên đấu giá', href: addAdminPrefix('/auction-session') },
      { id: 'contracts', icon: 'fas fa-file-contract', label: 'Hợp đồng', href: addAdminPrefix('/contract') },
      { id: 'register-auction', icon: 'fa fa-ticket', label: 'Đăng ký đấu giá', href: addAdminPrefix('/register-auction') },
      { id: 'news', icon: 'fas fa-file-contract', label: 'Tin tức', href: addAdminPrefix('/news') },
      { id: 'news-categories', icon: 'fas fa-file-contract', label: 'Danh mục tin tức', href: addAdminPrefix('/news-categories') },
      { id: 'reports', icon: 'fas fa-chart-bar', label: 'Báo cáo', href: addAdminPrefix('/report') },
      { id: 'users', icon: 'fas fa-users', label: 'Quản lý người dùng', href: addAdminPrefix('/users') },
      { id: 'bids', icon: 'fas fa-file-alt', label: 'Hồ sơ đấu giá', href: addAdminPrefix('/profile') },
      { id: 'notifications', icon: 'fas fa-bell', label: 'Thông báo', href: addAdminPrefix('/notification') },
      { id: 'payments', icon: 'fas fa-money-bill-wave', label: 'Thanh toán', href: addAdminPrefix('/payment') },
      { id: 'econtracts', icon: 'fas fa-file-signature', label: 'Hợp đồng điện tử', href: addAdminPrefix('/econtract') },
      { id: 'roles', icon: 'fas fa-user-tag', label: 'Vai trò', href: addAdminPrefix('/roles') },
      { id: 'permissions', icon: 'fas fa-key', label: 'Quyền hạn', href: addAdminPrefix('/permissions') },
      { id: 'settings', icon: 'fas fa-cog', label: 'Cài đặt', href: addAdminPrefix('/settings') },
      { id: 'support', icon: 'fas fa-headset', label: 'Hỗ trợ', href: '#' },
      { id: 'security', icon: 'fas fa-shield-alt', label: 'Bảo mật', href: '#' },
      { id: 'logs', icon: 'fas fa-history', label: 'Lịch sử log', href: addAdminPrefix('/history') },
    ];
  };

  // Ánh xạ quyền hạn với các trang
  const permissionsMapping = {
    2: ['/contract'],
    3: ['/report'],
    22: ['/auction-asset'], // manage_products (cần thêm trang nếu có)
    23: ['/assets-categories'],
    24: ['/auction-asset'],   
    25: ['/news'],
    26: ['/news-categories'],
    27: ['/profile'],
    28: ['/profile'],
    29: ['/payment'],
    30: ['/payment'],
    31: ['/auction-session'],
    32: ['/register-auction'],
    33: ['/payment'],
    34: ['/payment'],
    35: ['/report'],
    36: ['/notification'],
    37: ['/econtract'],
    38: ['/roles', '/permissions'],
    42: ['/dashboard'], // manage_dashboard
    43: ['/users'],     // manage_users (giả sử thêm)
    44: ['/settings'],  // manage_settings
    45: ['/history'],   // view_history
    46: ['/asset-categories']
  };

  // Lấy danh sách trang được phép từ API
  useEffect(() => {
    const fetchPermissions = async () => {
      if (user?.role_id) {
        console.log('Checking permissions for role_id:', user.role_id);
        try {
          const response = await fetch(`${API_URL}roles/${user.role_id}/permissions`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Raw API response:', data);
          if (data && Array.isArray(data.permissions)) {
            const permissionIds = data.permissions.map(permission => permission.permission_id);
            console.log('Extracted permission IDs:', permissionIds);
            const allowedPaths = permissionIds.flatMap((id) => permissionsMapping[id] || []);
            console.log('Allowed paths mapped:', allowedPaths);
            const allItems = getSidebarItems();
            const filteredItems = allItems.filter((item) =>
              allowedPaths.includes(item.href.replace('/admin', '')) || item.href === '#'
            );
            setAllowedItems(filteredItems);
            console.log('Filtered sidebar items:', filteredItems);
          } else {
            console.log('No permissions array found in response:', data);
          }
        } catch (error) {
          console.error('Error fetching permissions:', error);
        }
      } else {
        console.log('No role_id found for user:', user);
      }
    };

    fetchPermissions();
  }, [user?.role_id, API_URL]);

  const sections = [
    { title: 'Bảng điều khiển', items: allowedItems.slice(0, 5) },
    { title: 'Công cụ', items: allowedItems.slice(5, 10) },
    { title: 'Hệ thống', items: allowedItems.slice(10) },
  ];

  const handleItemClick = (id, href) => {
    setActiveItem(id);
    if (href !== '#') {
      navigate(href);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <img className={styles.logoImg} src="\assets\img\logo.jpg" alt="Logo" />
        </div>
      </div>

      {sections.map((section, index) => (
        section.items.length > 0 && (
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
        )
      ))}
    </div>
  );
};

export default Sidebar;
