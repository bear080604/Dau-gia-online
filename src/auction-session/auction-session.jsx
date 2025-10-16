import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './auction-session.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function AuctionSession() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [auctionItems, setAuctionItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const itemsPerPage = 6;

  const getAuctionStatus = (session) => {
    if (!session || !session.bid_start || !session.bid_end) {
      return "Chưa bắt đầu";
    }

    const now = new Date();
    const bidStart = new Date(session.bid_start);
    const bidEnd = new Date(session.bid_end);


    if (now < bidStart) {
      return "Chưa bắt đầu";
    } else if (now >= bidStart && now <= bidEnd) {
      return "Đang diễn ra";
    } else {
      return "Kết thúc";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch danh mục
        const categoryResponse = await axios.get(`${process.env.REACT_APP_API_URL}categories`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (categoryResponse.data.status && categoryResponse.data.data) {
          setCategories(categoryResponse.data.data);
        } else {
          throw new Error('Invalid categories API response');
        }

        // Fetch sản phẩm
        const productResponse = await axios.get(`${process.env.REACT_APP_API_URL}products`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const products = productResponse.data.data || [];
        const productsWithSessions = products.filter(
          (p) => Array.isArray(p.sessions) && p.sessions.length > 0
        );
        setAuctionItems(productsWithSessions);

        setError(null);
      } catch (err) {
       
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterAndSortItems = () => {
    let filtered = auctionItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      const session = item.sessions[0];
      const registerStart = new Date(session?.register_start);
      const registerEnd = new Date(session?.register_end);

      const matchesDate =
        (!startDate || registerStart >= new Date(startDate)) &&
        (!endDate || registerEnd <= new Date(endDate));

      return matchesSearch && matchesCategory && matchesDate;
    });

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
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleSortChange = (sortType) => setSortBy(sortType);
  const handlePageChange = (page) => setCurrentPage(page);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, sortBy, startDate, endDate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Đang tải dữ liệu sản phẩm...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <section className={styles.searchSection}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button>
              <i className="fa fa-search" aria-hidden="true"></i>
            </button>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterGroup}>
              <label htmlFor="categorySelect">Danh mục sản phẩm:</label>
              <select
                id="categorySelect"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Lọc theo thời gian đăng ký:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.border = '1px solid #2772ba')}
                  onBlur={(e) => (e.target.style.border = '1px solid #ccc')}
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.border = '1px solid #2772ba')}
                  onBlur={(e) => (e.target.style.border = '1px solid #ccc')}
                />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label>Sắp xếp:</label>
              <div className={styles.sortSection}>
                <button
                  className={`${styles.sortBtn} ${
                    sortBy === 'newest' ? styles.sortBtnActive : ''
                  }`}
                  onClick={() => handleSortChange('newest')}
                >
                  Mới nhất
                </button>
                <button
                  className={`${styles.sortBtn} ${
                    sortBy === 'oldest' ? styles.sortBtnActive : ''
                  }`}
                  onClick={() => handleSortChange('oldest')}
                >
                  Cũ nhất
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.resultsInfo}>
          <span>
            <h1 className={styles.pageTitle}>
              Tổng {filteredItems.length} phiên đấu giá
            </h1>
          </span>
        </div>

        <div className={styles.auctionItems}>
          {currentItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Không tìm thấy kết quả phù hợp
            </div>
          ) : (
            currentItems.map((item) => {
              const session = item.sessions[0];
              const status = getAuctionStatus(session);
              return (
                <div key={item.id} className={styles.auctionItem}>
                  <div className={styles.itemImage}>
                    <img
                      src={item.image_url || '/assets/img/xe.png'}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <a
                    href={`/auction-session/${session?.id}`}
                    style={{ textDecoration: 'none', width: '100%' }}
                  >
                    <div className={styles.itemDetails}>
                      <div className={styles.itemHeader}>
                        <div className={styles.itemTitle}>{item.name}</div>
                        <div className={styles.itemPrice}>
                          {parseFloat(item.starting_price).toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                      <div className={styles.itemFooter} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '13px', color: '#555' }}>
                          <b>Thời gian đăng ký:</b>{' '}
                          {formatDate(session?.register_start)} {' - '}
                          {formatDate(session?.register_end)}
                        </div>
                        <br />
                        <div style={{ fontSize: '13px', color: '#555' }}>
                          <b>Thời gian đấu giá:</b>{' '}
                          {formatDate(session?.bid_start)} - {formatDate(session?.bid_end)}
                        </div>
                        <br />
                        <div style={{ fontSize: '13px', color: '#2772ba' }}>
                          <b>Trạng thái:</b> {status}
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationBtn}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`${styles.paginationBtn} ${
                  currentPage === i + 1 ? styles.paginationBtnActive : ''
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className={styles.paginationBtn}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Tiếp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuctionSession;