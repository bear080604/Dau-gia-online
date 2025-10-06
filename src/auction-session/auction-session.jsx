  import React, { useState, useEffect } from 'react';
  import styles from './auction-session.module.css';
  import '@fortawesome/fontawesome-free/css/all.min.css';

  function AuctionSession() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [auctionItems, setAuctionItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 6;

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
      fetchData();
    }, []);

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}auction-sessions`);
        const data = await response.json();
        if (data.status) {
          const mappedItems = data.sessions.map(session => ({
            id: session.session_id,
            title: session.item.name,
            price: parseFloat(session.item.starting_price).toLocaleString('vi-VN') + ' VNĐ',
            startTime: formatDate(session.start_time),
            endTime: formatDate(session.end_time),
            category: mapCategory(session.item.category_id),
            status: mapStatus(session.status),
            image: session.item.image_url
          }));
          setAuctionItems(mappedItems);
        }
      } catch (error) {
        console.error('Error fetching auction sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const mapCategory = (categoryId) => {
      const categoryMap = {
        1: 'property',
        2: 'vehicle',
        3: 'property',
        4: 'electronics',
        5: 'jewelry',
        6: 'art'
        // Thêm mapping cho các category_id khác nếu cần
      };
      return categoryMap[categoryId] || 'other';
    };

    const mapStatus = (status) => {
      switch (status) {
        case 'DangDienRa':
          return 'active';
        case 'KetThuc':
          return 'ended';
        case 'Mo':
        default:
          return 'active';
      }
    };

    const filterAndSortItems = () => {
      let filtered = auctionItems.filter(item => {
        // Filter by search term
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter by category
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

        // Filter by date range
        let matchesDate = true;
        if (fromDate || toDate) {
          const itemDateParts = item.startTime.split(' ')[0].split('/');
          const itemDate = new Date(itemDateParts[2], itemDateParts[1] - 1, itemDateParts[0]);

          if (fromDate) {
            const from = new Date(fromDate);
            matchesDate = matchesDate && itemDate >= from;
          }

          if (toDate) {
            const to = new Date(toDate);
            matchesDate = matchesDate && itemDate <= to;
          }
        }

        return matchesSearch && matchesCategory && matchesDate;
      });

      // Sort items
      if (sortBy === 'newest') {
        filtered.sort((a, b) => b.id - a.id);
      } else if (sortBy === 'oldest') {
        filtered.sort((a, b) => a.id - b.id);
      }

      return filtered;
    };

    const filteredItems = filterAndSortItems();
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, endIndex);

    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm, categoryFilter, fromDate, toDate, sortBy]);

    const handleSearch = () => {
      // Search is handled automatically through state changes
    };

    const handleSearchKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    };

    const handleSortChange = (sortType) => {
      setSortBy(sortType);
    };

    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

    const getCategoryName = (category) => {
      const categoryMap = {
        'vehicle': 'Xe cộ',
        'property': 'Bất động sản',
        'electronics': 'Điện tử',
        'jewelry': 'Trang sức',
        'art': 'Nghệ thuật',
        'other': 'Khác'
      };
      return categoryMap[category] || 'Khác';
    };

    const getStatusClass = (status) => {
      return status === 'active' ? styles.statusActive : styles.statusEnded;
    };

    const getStatusText = (status) => {
      return status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc';
    };

    const renderPagination = () => {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
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

      return (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Trước
          </button>
          {pages}
          <button
            className={styles.paginationBtn}
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Tiếp
          </button>
        </div>
      );
    };

    if (loading) {
      return (
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Đang tải dữ liệu...
          </div>
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          <h1 className={styles.pageTitle}>Tổng {auctionItems.length} Phiên đấu giá</h1>
          <section className={styles.searchSection}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
              <button onClick={handleSearch}>
                <i className="fa fa-search" aria-hidden="true"></i>
              </button>
            </div>

            <div className={styles.filterSection}>
              <div className={styles.filterGroup}>
                <label htmlFor="categorySelect">Danh mục tài sản:</label>
                <select
                  id="categorySelect"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="vehicle">Xe ô tô</option>
                  <option value="property">Bất động sản</option>
                  <option value="electronics">Điện tử</option>
                  <option value="jewelry">Trang sức</option>
                  <option value="art">Nghệ thuật</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Thời gian:</label>
                <div className={styles.dateFilter}>
                  <input
                    type="date"
                    className={styles.dateInput}
                    placeholder="Từ ngày"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className={styles.dateInput}
                    placeholder="Đến ngày"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>Sắp xếp:</label>
                <div className={styles.sortSection}>
                  <button
                    className={`${styles.sortBtn} ${sortBy === 'newest' ? styles.sortBtnActive : ''}`}
                    onClick={() => handleSortChange('newest')}
                  >
                    Mới nhất
                  </button>
                  <button
                    className={`${styles.sortBtn} ${sortBy === 'oldest' ? styles.sortBtnActive : ''}`}
                    onClick={() => handleSortChange('oldest')}
                  >
                    Cũ nhất
                  </button>
                  <button
                    className={`${styles.sortBtn} ${sortBy === 'all' ? styles.sortBtnActive : ''}`}
                    onClick={() => handleSortChange('all')}
                  >
                    Tất cả
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.resultsInfo}>
            <span>{filteredItems.length} kết quả phù hợp</span>
            <span>Trang {currentPage}/{totalPages}</span>
          </div>

          <div className={styles.auctionItems}>
            {currentItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                Không tìm thấy kết quả phù hợp
              </div>
            ) : (
              currentItems.map(item => (
                <div key={item.id} className={styles.auctionItem}>
                  <div className={styles.itemImage}>
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemTitle}>{item.title}</div>
                      <div className={styles.itemPrice}>{item.price}</div>
                    </div>
                    <div>
                      <div className={styles.itemTime}>Thời gian bắt đầu: {item.startTime}</div>
                      <div className={styles.itemTime}>Thời gian kết thúc: {item.endTime}</div>
                    </div>
                    <div className={styles.itemFooter}>
                      <span className={styles.itemCategory}>{getCategoryName(item.category)}</span>
                      <div className={`${styles.itemStatus} ${getStatusClass(item.status)}`}>
                        {getStatusText(item.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && renderPagination()}
        </div>
      </div>
    );
  }

  export default AuctionSession;