import React, { useState, useEffect } from 'react';
import styles from './Report.module.css';
import NotificationBell from "../NotificationBell";

const Report = () => {
  const [activeItem, setActiveItem] = useState('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
      const [open, setOpen] = useState(false);
    const togglePopup = (e) => {
      e.stopPropagation(); // tránh đóng liền sau khi mở
      setOpen((prev) => !prev);
    };
  const [reports, setReports] = useState([
    {
      id: '#BC-001',
      type: 'Tổng quan',
      creator: 'Admin QT (ID: 1)',
      createdDate: '2025-10-01 10:00',
      summary: 'Tổng hợp doanh thu tháng 9: 5.5 tỷ VND, 7 phiên thành công.',
      creatorId: '1',
      fullContent: 'Báo cáo tổng quan chi tiết: Doanh thu từ 7 hợp đồng thành công, phân tích theo danh mục...'
    },
    {
      id: '#BC-002',
      type: 'Chi tiết',
      creator: 'Manager A (ID: 8)',
      createdDate: '2025-10-01 14:00',
      summary: 'Chi tiết lượt bid phiên PH-001: 15 bid, giá cao nhất 2.7 tỷ.',
      creatorId: '8',
      fullContent: 'Báo cáo chi tiết lượt bid: Liệt kê từng bid, người tham gia, thời gian...'
    },
    {
      id: '#BC-003',
      type: 'KPI',
      creator: 'Admin QT (ID: 1)',
      createdDate: '2025-09-30 16:00',
      summary: 'KPI tháng 9: Tỷ lệ thành công 85%, doanh thu vượt 120% mục tiêu.',
      creatorId: '1',
      fullContent: 'Báo cáo KPI: Các chỉ số chính, biểu đồ so sánh, khuyến nghị cải thiện...'
    },
    {
      id: '#BC-004',
      type: 'Tổng quan',
      creator: 'Manager B (ID: 9)',
      createdDate: '2025-10-02 09:00',
      summary: 'Tổng quan tài sản: 5 bất động sản, 2 ô tô đang chờ đấu giá.',
      creatorId: '9',
      fullContent: 'Báo cáo tổng quan tài sản: Phân loại theo danh mục, giá trị ước tính...'
    },
    {
      id: '#BC-005',
      type: 'Chi tiết',
      creator: 'Admin QT (ID: 1)',
      createdDate: '2025-10-02 12:00',
      summary: 'Chi tiết hợp đồng HD-001: Thanh toán hoàn tất, chuyển giao tài sản.',
      creatorId: '1',
      fullContent: 'Báo cáo chi tiết hợp đồng: Các điều khoản, lịch sử thay đổi...'
    },
    {
      id: '#BC-006',
      type: 'KPI',
      creator: 'Manager A (ID: 8)',
      createdDate: '2025-09-29 15:00',
      summary: 'KPI người dùng: 150 user hoạt động, 20% tăng trưởng.',
      creatorId: '8',
      fullContent: 'Báo cáo KPI người dùng: Phân tích theo role, hoạt động hàng ngày...'
    },
    {
      id: '#BC-007',
      type: 'Tổng quan',
      creator: 'Admin QT (ID: 1)',
      createdDate: '2025-09-28 11:00',
      summary: 'Tổng quan hệ thống: 50 thông báo, 10 log lỗi cần kiểm tra.',
      creatorId: '1',
      fullContent: 'Báo cáo tổng quan hệ thống: Tình trạng server, số lượng truy cập...'
    }
  ]);

  const itemsPerPage = 5;

  const handleItemClick = (id) => {
    setActiveItem(id);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.creator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || report.type.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesCreator = !creatorFilter || report.creator.toLowerCase().includes(creatorFilter.toLowerCase());
    return matchesSearch && matchesType && matchesCreator;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setShowAddModal(true);
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleDelete = (report) => {
    if (window.confirm('Bạn có chắc muốn xóa báo cáo này?')) {
      setReports(reports.filter(r => r.id !== report.id));
    }
  };

  const handleDownload = (report) => {
    alert(`Tải báo cáo demo: ${report.id}.pdf`);
  };

  const handleSaveReport = () => {
    alert('Chức năng lưu chỉ là demo, không lưu thực tế.');
    setShowAddModal(false);
    setSelectedReport(null);
  };

  const getStatusClass = (type) => {
    switch (type) {
      case 'Tổng quan': return styles.tongquan;
      case 'Chi tiết': return styles.chitiet;
      case 'KPI': return styles.kpi;
      default: return '';
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.searchBar}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm báo cáo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        
        </div>

        <h1 className={styles.pageTitle}>Quản Lý Báo Cáo</h1>
        <p className={styles.pageSubtitle}>Quản lý và theo dõi các báo cáo thống kê hệ thống</p>

        <div className={styles.actionsBar}>
          <div className={styles.filters}>
            <select
              className={styles.filterSelect}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tất cả loại báo cáo</option>
              <option value="TongQuan">Tổng quan</option>
              <option value="ChiTiet">Chi tiết</option>
              <option value="KPI">KPI</option>
            </select>
            <select
              className={styles.filterSelect}
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
            >
              <option value="">Tất cả người tạo</option>
              <option value="1">Admin QT (ID: 1)</option>
              <option value="8">Manager A (ID: 8)</option>
              <option value="9">Manager B (ID: 9)</option>
            </select>
          </div>
          <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus"></i>
            Tạo báo cáo mới
          </button>
        </div>

        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Mã BC</th>
              <th>Loại báo cáo</th>
              <th>Người tạo</th>
              <th>Ngày tạo</th>
              <th>Tóm tắt nội dung</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentReports.map((report) => (
              <tr key={report.id}>
                <td data-label="Mã BC">{report.id}</td>
                <td data-label="Loại báo cáo">
                  <span className={`${styles.statusBadge} ${getStatusClass(report.type)}`}>
                    {report.type}
                  </span>
                </td>
                <td data-label="Người tạo">{report.creator}</td>
                <td data-label="Ngày tạo">{report.createdDate}</td>
                <td data-label="Tóm tắt nội dung">{report.summary}</td>
                <td data-label="Hành động">
                  <button
                    className={`${styles.btn} ${styles.primary}`}
                    title="Chỉnh sửa báo cáo"
                    onClick={() => handleEdit(report)}
                  >
                    <i className="fa fa-pencil" aria-hidden="true"></i>
                  </button>
                  <button
                    className={`${styles.btn} ${styles.success}`}
                    title="Tải báo cáo"
                    onClick={() => handleDownload(report)}
                  >
                    <i className="fa fa-download" aria-hidden="true"></i>
                  </button>
                  <button
                    className={`${styles.btn} ${styles.danger}`}
                    title="Xóa báo cáo"
                    onClick={() => handleDelete(report)}
                  >
                    <i className="fa fa-trash" aria-hidden="true"></i>
                  </button>
                  <button
                    className={`${styles.btn} ${styles.success}`}
                    title="Xem chi tiết báo cáo"
                    onClick={() => handleView(report)}
                  >
                    <i className="fa fa-eye" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.paginationBtn} ${currentPage === page ? styles.active : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      {/* Modal Thêm/Chỉnh sửa báo cáo */}
      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {selectedReport ? 'Chỉnh sửa báo cáo' : 'Tạo báo cáo mới'}
              </h2>
              <span className={styles.modalClose} onClick={() => setShowAddModal(false)}>×</span>
            </div>
            <div className={styles.modalBody}>
              <div>
                <label htmlFor="reportType">Loại báo cáo</label>
                <select id="reportType" defaultValue={selectedReport?.type || 'TongQuan'}>
                  <option value="TongQuan">Tổng quan</option>
                  <option value="ChiTiet">Chi tiết</option>
                  <option value="KPI">KPI</option>
                </select>
              </div>
              <div>
                <label htmlFor="reportCreator">Người tạo (ID User)</label>
                <input
                  type="number"
                  id="reportCreator"
                  placeholder="Nhập ID người tạo"
                  defaultValue={selectedReport?.creatorId || '1'}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="reportContent">Nội dung báo cáo</label>
                <textarea
                  id="reportContent"
                  placeholder="Nhập nội dung chi tiết báo cáo"
                  defaultValue={selectedReport?.fullContent || ''}
                ></textarea>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.primary}`} onClick={handleSaveReport}>
                Lưu
              </button>
              <button className={`${styles.btn} ${styles.secondary}`} onClick={() => setShowAddModal(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem chi tiết báo cáo */}
      {showViewModal && selectedReport && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Báo Cáo</h2>
              <span className={styles.modalClose} onClick={() => setShowViewModal(false)}>×</span>
            </div>
            <div className={styles.modalBody}>
              <p><strong>Mã báo cáo:</strong> {selectedReport.id}</p>
              <p><strong>Loại báo cáo:</strong> {selectedReport.type}</p>
              <p><strong>Người tạo:</strong> {selectedReport.creator}</p>
              <p><strong>Ngày tạo:</strong> {selectedReport.createdDate}</p>
              <p><strong>Nội dung:</strong> {selectedReport.fullContent}</p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.success}`}
                onClick={() => handleDownload(selectedReport)}
              >
                Tải báo cáo
              </button>
              <button className={`${styles.btn} ${styles.secondary}`} onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
