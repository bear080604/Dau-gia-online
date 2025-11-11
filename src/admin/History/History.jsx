import React, { useState, useEffect } from 'react';
import styles from './History.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getLogs, deleteLog, exportLogs, clearOldLogs } from '../../services/logService';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalLogs, setTotalLogs] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    insert: 0,
    update: 0,
    delete: 0,
  });

  const itemsPerPage = 5;

  const detectActionFromDescription = (desc = '') => {
    const d = desc.toLowerCase();
    if (d.includes('tạo') || d.includes('create') || d.includes('tao')) return 'INSERT';
    if (d.includes('cập nhật') || d.includes('cap nhat') || d.includes('update')) return 'UPDATE';
    if (d.includes('xóa') || d.includes('xoa') || d.includes('delete')) return 'DELETE';
    if (d.includes('đăng nhập') || d.includes('dang nhap') || d.includes('login')) return 'LOGIN';
    return 'OTHER';
  };

  const actionClassFor = (actionTypeOrLabel) => {
    const a = (actionTypeOrLabel || '').toString().toLowerCase();
    if (a.includes('insert')) return 'actionInsert';
    if (a.includes('update')) return 'actionUpdate';
    if (a.includes('delete')) return 'actionDelete';
    if (a.includes('system')) return 'actionSystem';
    return 'actionOther';
  };

  const stringifyValue = (val) => {
    if (val === null || val === undefined) return 'Không có';
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : String(parsed);
      } catch {
        return val;
      }
    }
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  };

  const mapApiItem = (item) => {
    const actionLabel = item.action_type ? (item.action_type === 'system' ? 'Hệ thống' : item.action_type) : detectActionFromDescription(item.description);
    const simpleAction = detectActionFromDescription(item.description);
    return {
      id: item.id,
      user: item.user_name || item.user?.name || item.user_id || `#${item.user_id}`,
      table: item.table_name ?? item.table ?? '',
      actionType: item.action_type ?? simpleAction,
      action: actionLabel === 'Hệ thống' ? 'Hệ thống' : simpleAction,
      actionClass: actionClassFor(item.action_type ?? simpleAction),
      time: item.created_at ?? item.time ?? new Date().toISOString(),
      oldValue: stringifyValue(item.old_value),
      newValue: stringifyValue(item.new_value),
      description: item.description ?? '',
    };
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        q: searchTerm || undefined,
        action: actionFilter || undefined,
        table: tableFilter || undefined,
      };

      const res = await getLogs(params);
      // res expected normalized: { data: [...], meta: { total }, stats: {...} }
      const items = Array.isArray(res) ? res : (res.data ?? []);
      const total = res.meta?.total ?? (Array.isArray(items) ? items.length : 0);
      const s = res.stats ?? {};

      const mapped = (items || []).map(mapApiItem);
      setLogs(mapped);
      setTotalLogs(total);
      setStats({
        total: s.total ?? total,
        today: s.today ?? 0,
        insert: s.insert ?? 0,
        update: s.update ?? 0,
        delete: s.delete ?? 0,
      });
    } catch (err) {
      console.error('fetchLogs error', err);
      setError('Không thể tải dữ liệu log');
      toast.error('Lỗi tải log từ server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, actionFilter, tableFilter]);

  const handleDeleteLog = async (id) => {
    if (!window.confirm('Xóa log này?')) return;
    try {
      await deleteLog(id);
      toast.success('Xóa log thành công');
      fetchLogs();
    } catch (err) {
      console.error('deleteLog error', err);
      toast.error('Xóa thất bại');
    }
  };

  const handleExportLogs = async () => {
    try {
      const blob = await exportLogs({ search: searchTerm, action: actionFilter, table: tableFilter });
      const filename = `logs_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;
      saveAs(blob, filename);
      toast.success('Xuất file thành công!');
    } catch (err) {
      console.error('exportLogs error', err);
      toast.error('Xuất file thất bại');
    }
  };

  const handleClearOldLogs = async () => {
    if (!window.confirm('Dọn dẹp tất cả log cũ hơn 30 ngày?')) return;
    try {
      const result = await clearOldLogs();
      toast.success(`Đã xóa ${result.deleted ?? 0} log cũ`);
      fetchLogs();
    } catch (err) {
      console.error('clearOldLogs error', err);
      toast.error('Dọn dẹp thất bại');
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalLogs / itemsPerPage));

  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, startPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.paginationBtn} ${currentPage === i ? styles.paginationBtnActive : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const handleViewDetails = (log) => {
    const oldVal = log.oldValue || 'Không có';
    const newVal = log.newValue || 'Không có';
    const timeStr = log.time ? format(parseISO(log.time), 'PPPp', { locale: vi }) : 'Không rõ';
    alert(
      `Chi tiết log ID: ${log.id}\n\n` +
      `Người dùng: ${log.user}\n` +
      `Bảng: ${log.table || 'Không rõ'}\n` +
      `Hành động: ${log.action}\n` +
      `Thời gian: ${timeStr}\n\n` +
      `Mô tả:\n${log.description}\n\n` +
      `Giá trị cũ:\n${oldVal}\n\n` +
      `Giá trị mới:\n${newVal}`
    );
  };

  if (error) return <div className={styles.error}>Lỗi: {error}</div>;

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm log..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <h1 className={styles.pageTitle}>Lịch Sử Log Hệ Thống</h1>
      <p className={styles.pageSubtitle}>Theo dõi và quản lý các hoạt động kiểm toán trong hệ thống</p>

      <div className={styles.logSection}>
        <h3>Tổng Quan Log</h3>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{stats.total}</div>
            <div className={styles.metricLabel}>Tổng log</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{stats.today}</div>
            <div className={styles.metricLabel}>Log hôm nay</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{stats.update}</div>
            <div className={styles.metricLabel}>UPDATE</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{stats.insert}</div>
            <div className={styles.metricLabel}>INSERT</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{stats.delete}</div>
            <div className={styles.metricLabel}>DELETE</div>
          </div>
        </div>
      </div>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}>
            <option value="">Tất cả hành động</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
          <select value={tableFilter} onChange={(e) => { setTableFilter(e.target.value); setCurrentPage(1); }}>
            <option value="">Tất cả bảng</option>
            <option value="Users">Users</option>
            <option value="AuctionItems">AuctionItems</option>
            <option value="Bids">Bids</option>
            <option value="Contracts">Contracts</option>
            <option value="Payments">Payments</option>
          </select>
        </div>
        <div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleExportLogs}>Xuất log</button>
          <button className={`${styles.btn} ${styles.btn}`} style={{ marginLeft: 8 }} onClick={fetchLogs}>Làm mới</button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải log...</div>
      ) : logs.length === 0 ? (
        <div className={styles.empty}>Không có log nào</div>
      ) : (
        <>
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
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.user}</td>
                  <td>{log.table}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[log.actionClass] || ''}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.time ? format(parseISO(log.time), 'dd/MM/yyyy HH:mm', { locale: vi }) : '-'}</td>
                  <td className={styles.jsonCell}><pre>{log.oldValue}</pre></td>
                  <td className={styles.jsonCell}><pre>{log.newValue}</pre></td>
                  <td>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleViewDetails(log)}>Xem</button>
                    <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteLog(log.id)} style={{ marginLeft: 8 }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.pagination}>
            {renderPagination()}
          </div>
        </>
      )}

      <div className={styles.logSection} style={{ marginTop: 20 }}>
        <h3>Quản Lý Log Cũ</h3>
        <p className={styles.pageSubtitle}>Xóa log cũ hơn 30 ngày để tiết kiệm không gian lưu trữ.</p>
        <button className={styles.clearBtn} onClick={handleClearOldLogs}>
          Dọn dẹp log cũ
        </button>
      </div>
    </div>
  );
}

export default History;