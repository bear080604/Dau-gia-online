import React, { useState, useEffect } from 'react';
import styles from './Settings.module.css';
import NotificationBell from "../NotificationBell";

const Settings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSections, setFilteredSections] = useState([]);
    const [open, setOpen] = useState(false);
  const togglePopup = (e) => {
    e.stopPropagation(); // tránh đóng liền sau khi mở
    setOpen((prev) => !prev);
  };
  const settingsSections = [
    {
      id: 'general',
      title: 'Cài đặt chung',
      icon: 'fas fa-cogs',
      items: [
        { label: 'Tên hệ thống', type: 'text', id: 'siteName', value: 'DauGia Online' },
        { label: 'Mô tả hệ thống', type: 'textarea', id: 'siteDescription', value: 'Hệ thống đấu giá trực tuyến uy tín và an toàn.' },
        { label: 'URL logo', type: 'url', id: 'siteLogo', value: 'https://example.com/logo.png' },
        { label: 'Tiền tệ mặc định', type: 'select', id: 'defaultCurrency', options: [
          { value: 'VND', label: 'VND (Việt Nam Đồng)' },
          { value: 'USD', label: 'USD (Đô la Mỹ)' }
        ], value: 'VND' }
      ]
    },
    {
      id: 'email',
      title: 'Cài đặt email',
      icon: 'fas fa-envelope',
      items: [
        { label: 'SMTP Host', type: 'text', id: 'smtpHost', value: 'smtp.gmail.com' },
        { label: 'SMTP Port', type: 'number', id: 'smtpPort', value: '587' },
        { label: 'Tài khoản email', type: 'email', id: 'smtpUser', value: 'noreply@daugiaonline.com' },
        { label: 'Mật khẩu email', type: 'password', id: 'smtpPass', placeholder: 'Nhập mật khẩu ứng dụng' },
        { label: 'Email gửi từ', type: 'email', id: 'emailFrom', value: 'noreply@daugiaonline.com' }
      ]
    },
    {
      id: 'security',
      title: 'Cài đặt bảo mật',
      icon: 'fas fa-shield-alt',
      items: [
        { label: 'Độ dài mật khẩu tối thiểu', type: 'number', id: 'minPasswordLength', value: '8', min: '6', max: '20' },
        { label: 'Thời gian hết hạn phiên (phút)', type: 'number', id: 'sessionTimeout', value: '30', min: '5', max: '120' },
        { label: 'Bật xác thực 2 yếu tố', type: 'select', id: 'enable2FA', options: [
          { value: 'true', label: 'Bật' },
          { value: 'false', label: 'Tắt' }
        ], value: 'true' },
        { label: 'Số lần đăng nhập sai tối đa', type: 'number', id: 'maxLoginAttempts', value: '5', min: '3', max: '10' }
      ]
    },
    {
      id: 'auction',
      title: 'Cài đặt đấu giá',
      icon: 'fas fa-cog',
      items: [
        { label: 'Bước nhảy giá tối thiểu (VND)', type: 'number', id: 'bidIncrement', value: '100000', step: '10000' },
        { label: 'Thời gian gia hạn bid (phút)', type: 'number', id: 'maxBidExtension', value: '5', min: '1', max: '30' },
        { label: 'Phần trăm đặt cọc (%)', type: 'number', id: 'depositPercentage', value: '10', min: '5', max: '50', step: '1' },
        { label: 'Hạn thanh toán (ngày)', type: 'number', id: 'paymentDeadline', value: '7', min: '1', max: '30' }
      ]
    }
  ];

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredSections(settingsSections);
    } else {
      const filtered = settingsSections.filter(section =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.items.some(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSections(filtered);
    }
  }, [searchTerm]);

  const handleSave = (sectionId) => {
    alert(`Cài đặt ${sectionId} đã được lưu thành công! (Demo)`);
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm cài đặt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.userProfile}>
            <div>
                        <div onClick={togglePopup} style={{ cursor: "pointer" }}>
                          <i className="fa-solid fa-bell fa-lg"></i>
                        </div>
          
                        <NotificationBell open={open} onClose={() => setOpen(false)} />
                      </div>
          <div className={styles.profileAvatar}>QT</div>
        </div>
      </div>

      <h1 className={styles.pageTitle}>Cài Đặt Hệ Thống</h1>
      <p className={styles.pageSubtitle}>Cấu hình và tùy chỉnh các thiết lập của hệ thống đấu giá</p>

      {filteredSections.map(section => (
        <div key={section.id} className={styles.settingsSection}>
          <h3>
            <i className={section.icon}></i>
            {section.title}
          </h3>
          <div className={styles.settingsGroup}>
            {section.items.map(item => (
              <div key={item.id} className={styles.settingItem}>
                <label htmlFor={item.id}>{item.label}</label>
                {item.type === 'select' ? (
                  <select id={item.id} defaultValue={item.value}>
                    {item.options.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : item.type === 'textarea' ? (
                  <textarea id={item.id} placeholder={item.placeholder} defaultValue={item.value}></textarea>
                ) : (
                  <input
                    type={item.type}
                    id={item.id}
                    placeholder={item.placeholder}
                    defaultValue={item.value}
                    min={item.min}
                    max={item.max}
                    step={item.step}
                  />
                )}
              </div>
            ))}
          </div>
          <button className={styles.saveBtn} onClick={() => handleSave(section.id)}>
            <i className="fas fa-save"></i>
            Lưu cài đặt {section.title.toLowerCase()}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Settings;
