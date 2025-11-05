import React, { useState, useEffect } from 'react';
import styles from './History.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const logs = [
    {
      id: 1,
      user: 'Admin QT',
      table: 'Users',
      action: 'UPDATE',
      actionClass: 'statusUpdate',
      time: '2025-10-02 09:15',
      oldValue: '{"role": "User"}',
      newValue: '{"role": "Administrator"}',
    },
    {
      id: 2,
      user: 'Nguyễn Văn A',
      table: 'AuctionItems',
      action: 'INSERT',
      actionClass: 'statusInsert',
      time: '2025-10-02 10:20',
      oldValue: 'null',
      newValue: '{"name": "Bất động sản Q1", "starting_price": 2000000000}',
    },
    {
      id: 3,
      user: 'Trần Thị B',
      table: 'Bids',
      action: 'UPDATE',
      actionClass: 'statusUpdate',
      time: '2025-10-02 11:05',
      oldValue: '{"amount": 1500000}',
      newValue: '{"amount": 1600000}',
    },
    {
      id: 4,
      user: 'Lê Văn C',
      table: 'Contracts',
      action: 'DELETE',
      actionClass: 'statusDelete',
      time: '2025-10-02 12:30',
      oldValue: '{"status": "ChoThanhToan"}',
      newValue: 'null',
    },
    {
      id: 5,
      user: 'Phạm Thị D',
      table: 'Payments',
      action: 'INSERT',
      actionClass: 'statusInsert',
      time: '2025-10-02 13:45',
      oldValue: 'null',
      newValue: '{"method": "ChuyenKhoan", "amount": 2500000000}',
    },
    {
      id: 6,
      user: 'Hoàng Văn E',
      table: 'AuctionSessions',
      action: 'UPDATE',
      actionClass: 'statusUpdate',
      time: '2025-10-02 14:20',
      oldValue: '{"status": "Mo"}',
      newValue: '{"status": "DangDienRa"}',
    },
    {
      id: 7,
      user: 'Vũ Thị F',
      table: 'Notifications',
      action: 'INSERT',
      actionClass: 'statusInsert',
      time: '2025-10-02 15:10',
      oldValue: 'null',
      newValue: '{"message": "Bạn có bid mới", "status": "ChuaDoc"}',
    },
    {
      id: 8,
      user: 'Admin QT',
      table: 'UserVerifications',
      action: 'DELETE',
      actionClass: 'statusDelete',
      time: '2025-10-02 16:00',
      oldValue: '{"code": "123456", "expires_at": "2025-10-02 16:30"}',
      newValue: 'null',
    },
  ];

  const applyFilters = () => {
    return logs.filter(log => {
      const searchMatch =
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.oldValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.newValue.toLowerCase().includes(searchTerm.toLowerCase());

      const actionMatch = !actionFilter || log.action.toLowerCase() === actionFilter.toLowerCase();
      const tableMatch = !tableFilter || log.table.toLowerCase() === tableFilter.toLowerCase();

      return searchMatch && actionMatch && tableMatch;
    });
  };

  const filteredLogs = applyFilters();
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, actionFilter, tableFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleActionFilterChange = (e) => {
    setActionFilter(e.target.value);
  };

  const handleTableFilterChange = (e) => {
    setTableFilter(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);

    if (endPage - startPage + 1 < 3 && startPage > 1) {
      startPage = Math.max(1, endPage - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.paginationBtn} ${currentPage === i ? styles.paginationBtnActive : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  const handleViewDetails = (log) => {
    alert(`Chi tiết log:\n${log.oldValue} → ${log.newValue}\n(Demo)`);
  };

  const handleDeleteLog = (log) => {
    if (window.confirm('Xóa log này?')) {
      alert('Log đã được xóa (Demo)');
    }
  };

  const handleExportLogs = () => {
    alert('Log đã được xuất ra file CSV (Demo)');
  };

  const handleClearOldLogs = () => {
    if (window.confirm('Dọn dẹp tất cả log cũ hơn 30 ngày?')) {
      alert('Đã dọn dẹp 150 log cũ (Demo)');
    }
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm log theo user, bảng hoặc hành động..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
      </div>

      <h1 className={styles.pageTitle}>Lịch Sử Log Hệ Thống</h1>
      <p className={styles.pageSubtitle}>Theo dõi và quản lý các hoạt động kiểm toán trong hệ thống</p>

      <div className={styles.logSection}>
        <h3><i className="fas fa-chart-bar"></i> Tổng Quan Log</h3>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>247</div>
            <div className={styles.metricLabel}>Tổng log</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>45</div>
            <div className={styles.metricLabel}>Log hôm nay</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>120</div>
            <div className={styles.metricLabel}>UPDATE</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>89</div>
            <div className={styles.metricLabel}>INSERT</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>38</div>
            <div className={styles.metricLabel}>DELETE</div>
          </div>
        </div>
      </div>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select className={styles.filterSelect} value={actionFilter} onChange={handleActionFilterChange}>
            <option value="">Tất cả hành động</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
          <select className={styles.filterSelect} value={tableFilter} onChange={handleTableFilterChange}>
            <option value="">Tất cả bảng</option>
            <option value="Users">Users</option>
            <option value="AuctionItems">AuctionItems</option>
            <option value="Bids">Bids</option>
            <option value="Contracts">Contracts</option>
            <option value="Payments">Payments</option>
          </select>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleExportLogs}>
          <i className="fas fa-download"></i>
          Xuất log
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>ID Log</th>
            <th>Người dùng</th>
            <th>Bảng</th>
            <th>Hành động</th>
            <th>Thời gian</th>
            <th>Giá trị cũ</th>
            <th>Giá trị mới</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentLogs.map(log => (
            <tr key={log.id}>
              <td data-label="ID Log">{log.id}</td>
              <td data-label="Người dùng">{log.user}</td>
              <td data-label="Bảng">{log.table}</td>
              <td data-label="Hành động">
                <span className={`${styles.statusBadge} ${styles[log.actionClass]}`}>{log.action}</span>
              </td>
              <td data-label="Thời gian">{log.time}</td>
              <td data-label="Giá trị cũ">{log.oldValue}</td>
              <td data-label="Giá trị mới">{log.newValue}</td>
              <td data-label="Hành động">
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleViewDetails(log)}>Xem chi tiết</button>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteLog(log)}>Xóa log</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        {renderPagination()}
      </div>

      <div className={styles.logSection}>
        <h3><i className="fas fa-trash-alt"></i> Quản Lý Log Cũ</h3>
        <p className={styles.pageSubtitle}>Xóa log cũ hơn 30 ngày để tiết kiệm không gian lưu trữ.</p>
        <button className={`${styles.clearBtn}`} onClick={handleClearOldLogs}>
          <i className="fas fa-broom"></i>
          Dọn dẹp log cũ
        </button>
      </div>
    </div>
  );
}

export default History;
