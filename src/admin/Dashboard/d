import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [activePeriod, setActivePeriod] = useState('week');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const chartData = {
    week: {
      labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
      values: [120, 150, 140, 180, 160, 200, 156]
    },
    month: {
      labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
      values: [650, 720, 680, 750]
    },
    quarter: {
      labels: ["Tháng 1", "Tháng 2", "Tháng 3"],
      values: [2800, 3200, 3100]
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const data = chartData[activePeriod];

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
              data: data.values,
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
  }, [activePeriod]);

  const handlePeriodChange = (period) => {
    setActivePeriod(period);
  };

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
          <div className={styles.metricValue}>12</div>
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
          <div className={styles.metricValue}>8</div>
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
          <div className={styles.metricValue}>25</div>
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
          <div className={styles.metricValue}>95%</div>
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
              <tr>
                <td>#PG-2456</td>
                <td>Bất động sản quận 1</td>
                <td>2.750.000.000đ</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                    Kết thúc
                  </span>
                </td>
              </tr>
              <tr>
                <td>#PG-2455</td>
                <td>Xe hơi Mercedes</td>
                <td>1.350.000.000đ</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                    Đang diễn ra
                  </span>
                </td>
              </tr>
              <tr>
                <td>#PG-2454</td>
                <td>Đồng hồ Rolex</td>
                <td>180.000.000đ</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.statusInactive}`}>
                    Chờ duyệt
                  </span>
                </td>
              </tr>
              <tr>
                <td>#PG-2453</td>
                <td>Tranh nghệ thuật</td>
                <td>500.000.000đ</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                    Đã ký hợp đồng
                  </span>
                </td>
              </tr>
              <tr>
                <td>#PG-2452</td>
                <td>Máy ảnh Canon</td>
                <td>50.000.000đ</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.statusWarning}`}>
                    Tạm dừng
                  </span>
                </td>
              </tr>
              <tr>
                <td>#PG-2451</td>
                <td>Điện thoại iPhone</td>
                <td>30.000.000đ</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                    Kết thúc
                  </span>
                </td>
              </tr>
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
              <tr>
                <td>#TS-001</td>
                <td>Bất động sản quận 2</td>
                <td>Nguyễn Văn A</td>
                <td>1.500.000.000đ</td>
                <td>2 giờ trước</td>
                <td>
                  <button className={`${styles.btn} ${styles.btnPrimary}`}>Xem chi tiết</button>
                </td>
              </tr>
              <tr>
                <td>#TS-002</td>
                <td>Xe máy Honda</td>
                <td>Trần Thị B</td>
                <td>50.000.000đ</td>
                <td>5 giờ trước</td>
                <td>
                  <button className={`${styles.btn} ${styles.btnPrimary}`}>Xem chi tiết</button>
                </td>
              </tr>
              <tr>
                <td>#TS-003</td>
                <td>Tranh vẽ nghệ thuật</td>
                <td>Lê Văn C</td>
                <td>200.000.000đ</td>
                <td>1 ngày trước</td>
                <td>
                  <button className={`${styles.btn} ${styles.btnPrimary}`}>Xem chi tiết</button>
                </td>
              </tr>
              <tr>
                <td>#TS-004</td>
                <td>Đồng hồ cổ</td>
                <td>Phạm Thị D</td>
                <td>80.000.000đ</td>
                <td>3 ngày trước</td>
                <td>
                  <button className={`${styles.btn} ${styles.btnPrimary}`}>Xem chi tiết</button>
                </td>
              </tr>
              <tr>
                <td>#TS-005</td>
                <td>Máy tính laptop</td>
                <td>Hoàng Văn E</td>
                <td>25.000.000đ</td>
                <td>4 ngày trước</td>
                <td>
                  <button className={`${styles.btn} ${styles.btnPrimary}`}>Xem chi tiết</button>
                </td>
              </tr>
              <tr>
                <td>#TS-006</td>
                <td>Đất nền ngoại ô</td>
                <td>Vũ Thị F</td>
                <td>800.000.000đ</td>
                <td>1 tuần trước</td>
                <td>
                  <button className={`${styles.btn} ${styles.btnPrimary}`}>Xem chi tiết</button>
                </td>
              </tr>
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
          <div className={styles.metricValue}>92%</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '92%' }}></div>
          </div>
        </div>

        <div className={styles.additionalCard}>
          <div className={styles.additionalHeader}>
            <h4 className={styles.additionalTitle}>Số lượng danh mục tài sản</h4>
            <span className={styles.dataAction}>Quản lý</span>
          </div>
          <div className={styles.metricValue}>15</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '75%', backgroundColor: '#f59e0b' }}></div>
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
