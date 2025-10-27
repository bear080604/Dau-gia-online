import React, { useState, useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [activePeriod, setActivePeriod] = useState('week');
  const [sessions, setSessions] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [bids, setBids] = useState([]); // State cho dữ liệu bids từ API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Static labels (giữ nguyên)
  const staticLabels = {
    week: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
    month: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
    quarter: ["Tháng 1", "Tháng 2", "Tháng 3"]
  };

  // Fetch data from all APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionsRes, contractsRes, usersRes, productsRes, bidsRes] = await Promise.all([
          fetch('http://localhost:8000/api/auction-sessions'),
          fetch('http://localhost:8000/api/contracts'),
          fetch('http://localhost:8000/api/showuser'),
          fetch('http://localhost:8000/api/products'),
          fetch('http://localhost:8000/api/showbids')
        ]);

        if (!sessionsRes.ok) throw new Error(`Sessions API error: ${sessionsRes.status}`);
        if (!contractsRes.ok) throw new Error(`Contracts API error: ${contractsRes.status}`);
        if (!usersRes.ok) throw new Error(`Users API error: ${usersRes.status}`);
        if (!productsRes.ok) throw new Error(`Products API error: ${productsRes.status}`);
        if (!bidsRes.ok) throw new Error(`Bids API error: ${bidsRes.status}`);

        const sessionsData = await sessionsRes.json();
        const contractsData = await contractsRes.json();
        const usersData = await usersRes.json();
        const productsData = await productsRes.json();
        const bidsData = await bidsRes.json();

        if (sessionsData.status) setSessions(sessionsData.sessions || []);
        if (contractsData.status) setContracts(contractsData.contracts || []);
        if (usersData.status) setUsers(usersData.users || []);
        setProducts(productsData.data || []);
        if (bidsData.status) setBids(bidsData.bids || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate dynamic chart data based on bids and period
  const dynamicChartData = useMemo(() => {
    const now = new Date('2025-10-27T00:00:00'); // Current date: Oct 27, 2025
    const values = new Array(staticLabels[activePeriod].length).fill(0);

    bids.forEach(bid => {
      const bidDate = new Date(bid.bid_time);
      bidDate.setHours(0, 0, 0, 0); // Normalize to day

      let index = -1;
      if (activePeriod === 'week') {
        // Calculate day of week for current week (Mon=0, Sun=6)
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of week (Monday)
        const daysFromWeekStart = (bidDate - currentWeekStart) / (1000 * 60 * 60 * 24);
        if (daysFromWeekStart >= 0 && daysFromWeekStart < 7) {
          index = Math.floor(daysFromWeekStart);
        }
      } else if (activePeriod === 'month') {
        // Simple: group by week of month
        const weekNum = Math.floor((bidDate.getDate() - 1) / 7);
        index = Math.min(weekNum, 3); // Cap at 4 weeks
      } else if (activePeriod === 'quarter') {
        // Group by month in quarter (Oct-Dec for Q4 2025)
        const month = bidDate.getMonth(); // 0=Jan, 9=Oct
        if (month === 9) index = 0; // Oct = Tháng 10 (but labels are Jan-Mar, adjust if needed)
        else if (month === 10) index = 1; // Nov
        else if (month === 11) index = 2; // Dec
      }

      if (index >= 0) {
        values[index]++;
      }
    });

    // Fallback to some default if no data
    return { labels: staticLabels[activePeriod], values: values.length > 0 ? values : [0, 10, 20, 30] }; // Example fallback
  }, [bids, activePeriod]);

  // Status mapping for sessions
  const getStatusBadge = (status, bidEnd) => {
    const now = new Date('2025-10-27T00:00:00');
    const endDate = new Date(bidEnd);
    if (endDate < now) return { text: 'Kết thúc', class: styles.statusActive };
    if (status === 'Mo') return { text: 'Đang diễn ra', class: styles.statusActive };
    return { text: 'Chờ duyệt', class: styles.statusInactive };
  };

  // Contract status mapping
  const getContractStatus = (status) => {
    switch (status) {
      case 'ChoThanhToan': return 'Chờ thanh toán';
      case 'DaThanhToan': return 'Đã thanh toán';
      default: return status;
    }
  };

  // Format VND
  const formatVND = (price) => {
    if (!price) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseFloat(price)).replace('₫', 'đ');
  };

  // Relative time
  const getRelativeTime = (createdAt) => {
    const now = new Date('2025-10-27T00:00:00');
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return `${diffWeeks} tuần trước`;
  };

  // Metrics calculations
  const todaySessionsCount = sessions.filter(session => {
    const now = new Date('2025-10-27T00:00:00');
    const start = new Date(session.bid_start);
    const end = new Date(session.bid_end);
    return start <= now && end >= now;
  }).length;

  const todayContractsCount = contracts.filter(contract => {
    const signedDate = new Date(contract.signed_date);
    const today = new Date('2025-10-27T00:00:00');
    const tomorrow = new Date('2025-10-28T00:00:00');
    return signedDate >= today && signedDate < tomorrow;
  }).length;

  const completedContracts = contracts.filter(c => c.status !== 'ChoThanhToan').length;
  const paymentCompletionRate = contracts.length > 0 ? Math.round((completedContracts / contracts.length) * 100) : 0;

  const todayNewUsers = users.filter(user => {
    const createdDate = new Date(user.created_at);
    const today = new Date('2025-10-27T00:00:00');
    const tomorrow = new Date('2025-10-28T00:00:00');
    return createdDate >= today && createdDate < tomorrow;
  }).length;

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const data = dynamicChartData; // Use dynamic data

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.labels,
          datasets: [
            {
              label: "Lượt bid",
              data: data.values,
              backgroundColor: "rgba(79, 70, 229, 0.7)",
              borderColor: "#4f46e5",
              borderWidth: 2,
              yAxisID: 'y',
              order: 2
            },
            {
              label: "Xu hướng",
              data: data.values, // Same data for trend line
              type: "line",
              borderColor: "#f43f5e",
              backgroundColor: "rgba(244, 63, 94, 0.1)",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "white",
              pointBorderColor: "#f43f5e",
              pointBorderWidth: 2,
              yAxisID: 'y',
              order: 1
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                  family: "Inter",
                  weight: "500",
                },
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
              backgroundColor: "rgba(31, 42, 68, 0.9)",
              titleFont: {
                size: 14,
                weight: "600",
              },
              bodyFont: {
                size: 12,
              },
              padding: 12,
              cornerRadius: 6,
              boxPadding: 6,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(229, 231, 235, 0.5)",
                borderDash: [3, 3],
              },
              ticks: {
                font: {
                  size: 12,
                },
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 12,
                },
              },
            },
          },
          elements: {
            point: {
              radius: 4,
              hoverRadius: 8,
              hoverBorderWidth: 3,
            },
            bar: {
              borderRadius: 4,
              borderSkipped: false,
            }
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [activePeriod, dynamicChartData]); // Depend on dynamicChartData

  const handlePeriodChange = (period) => {
    setActivePeriod(period);
  };

  if (loading) return <div className={styles.mainContent}><p>Đang tải dữ liệu...</p></div>;
  if (error) return <div className={styles.mainContent}><p>Lỗi: {error}</p></div>;

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.dashboardTitle}>Tổng quan hệ thống đấu giá</h1>
          <p className={styles.dashboardSubtitle}>
            Theo dõi và phân tích hiệu suất đấu giá trực tuyến
          </p>
        </div>
        <div className={styles.userProfile}>
          <div className={styles.notificationBell}>
            <i className="fas fa-bell"></i>
          </div>
          <div className={styles.profileAvatar}>QT</div>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            <span>Phiên đấu giá hôm nay</span>
            <i className="fas fa-gavel"></i>
          </div>
          <div className={styles.metricValue}>{todaySessionsCount}</div>
          <div className={`${styles.metricChange} ${styles.metricChangeUp}`}>
            <i className="fas fa-arrow-up"></i>
            <span>+15% so với hôm qua</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            <span>Hợp đồng ký kết</span>
            <i className="fas fa-file-contract"></i>
          </div>
          <div className={styles.metricValue}>{todayContractsCount || contracts.length}</div>
          <div className={`${styles.metricChange} ${styles.metricChangeDown}`}>
            <i className="fas fa-arrow-down"></i>
            <span>-3% so với hôm qua</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            <span>Người dùng mới</span>
            <i className="fas fa-user-plus"></i>
          </div>
          <div className={styles.metricValue}>{todayNewUsers}</div>
          <div className={`${styles.metricChange} ${styles.metricChangeUp}`}>
            <i className="fas fa-arrow-up"></i>
            <span>+30% so với hôm qua</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            <span>Thanh toán hoàn tất</span>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className={styles.metricValue}>{paymentCompletionRate}%</div>
          <div className={`${styles.metricChange} ${styles.metricChangeUp}`}>
            <i className="fas fa-arrow-up"></i>
            <span>+5% so với hôm qua</span>
          </div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Lượt đấu giá tuần này</h3>
            <div className={styles.chartPeriod}>
              <button
                className={`${styles.chartPeriodBtn} ${activePeriod === 'week' ? styles.chartPeriodBtnActive : ''}`}
                onClick={() => handlePeriodChange('week')}
              >
                7 ngày
              </button>
              <button
                className={`${styles.chartPeriodBtn} ${activePeriod === 'month' ? styles.chartPeriodBtnActive : ''}`}
                onClick={() => handlePeriodChange('month')}
              >
                30 ngày
              </button>
              <button
                className={`${styles.chartPeriodBtn} ${activePeriod === 'quarter' ? styles.chartPeriodBtnActive : ''}`}
                onClick={() => handlePeriodChange('quarter')}
              >
                90 ngày
              </button>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </div>

      <div className={styles.dataSection}>
        <div className={styles.dataCard}>
          <div className={styles.dataHeader}>
            <h3 className={styles.dataTitle}>Phiên đấu giá gần đây</h3>
            <span className={styles.dataAction}>Xem tất cả</span>
          </div>

          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Mã phiên</th>
                <th>Tài sản</th>
                <th>Giá cuối</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const linkedContract = contracts.find(c => c.session_id === session.session_id);
                const statusInfo = getStatusBadge(session.status, session.bid_end);
                const finalPrice = linkedContract ? linkedContract.final_price : session.highest_bid;
                return (
                  <tr key={session.session_id}>
                    <td>#PG-{session.session_id}</td>
                    <td>{session.item?.name || 'N/A'}</td>
                    <td>{formatVND(finalPrice)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusInfo.class}`}>
                        {statusInfo.text}
                        {linkedContract && (
                          <>
                            <br />
                            <small>{getContractStatus(linkedContract.status)}</small>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan="4">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.dataCard}>
          <div className={styles.dataHeader}>
            <h3 className={styles.dataTitle}>Tài sản chờ duyệt</h3>
            <span className={styles.dataAction}>Xem tất cả</span>
          </div>

          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Mã TS</th>
                <th>Tên tài sản</th>
                <th>Chủ sở hữu</th>
                <th>Giá khởi điểm</th>
                <th>Thời gian gửi</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>#TS-{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.owner?.name || 'N/A'}</td>
                  <td>{formatVND(product.starting_price)}</td>
                  <td>{getRelativeTime(product.created_at)}</td>
                  <td>
                    <button className={`${styles.btn} ${styles.btnPrimary}`}>Xem chi tiết</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.additionalSection}>
        <div className={styles.additionalCard}>
          <div className={styles.additionalHeader}>
            <h4 className={styles.additionalTitle}>Tỷ lệ hoàn thành hợp đồng</h4>
            <span className={styles.dataAction}>Chi tiết</span>
          </div>
          <div className={styles.metricValue}>{paymentCompletionRate}%</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${paymentCompletionRate}%` }}></div>
          </div>
        </div>

        <div className={styles.additionalCard}>
          <div className={styles.additionalHeader}>
            <h4 className={styles.additionalTitle}>Số lượng danh mục tài sản</h4>
            <span className={styles.dataAction}>Quản lý</span>
          </div>
          <div className={styles.metricValue}>{products.length}</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${Math.min((products.length / 20) * 100, 100)}%`, backgroundColor: '#f59e0b' }}></div>
          </div>
        </div>

        <div className={styles.additionalCard}>
          <div className={styles.additionalHeader}>
            <h4 className={styles.additionalTitle}>Log kiểm toán hôm nay</h4>
            <span className={styles.dataAction}>Xem log</span>
          </div>
          <div className={styles.metricValue}>47</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '60%', backgroundColor: '#f43f5e' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;