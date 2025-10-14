import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './news.module.css';

const News = () => {
  const [activeCategory, setActiveCategory] = useState('Thông báo đấu giá');
  const [currentPage, setCurrentPage] = useState(1);
  const [newsData, setNewsData] = useState([]);
  const itemsPerPage = 6;

  // Dữ liệu giả định với thêm trường imageUrl
  const mockNewsData = [
    { id: 1, category: 'Thông báo đấu giá', title: 'Thông báo đấu giá căn hộ Quận 7', date: '2025-10-10', summary: 'Phiên đấu giá căn hộ cao cấp tại Quận 7 sẽ diễn ra vào 15/10/2025.', link: '/news/1', imageUrl: 'https://via.placeholder.com/300x200?text=Căn+hộ+Quận+7' },
    { id: 2, category: 'Thông báo đấu giá', title: 'Thông báo đấu giá xe ô tô BMW', date: '2025-10-09', summary: 'Phiên đấu giá xe BMW X5 sẽ được tổ chức trực tuyến.', link: '/news/2', imageUrl: 'https://via.placeholder.com/300x200?text=Xe+BMW+X5' },
    { id: 3, category: 'Kết quả đấu giá', title: 'Kết quả đấu giá đất nền Phú Mỹ', date: '2025-10-08', summary: 'Phiên đấu giá đất nền Phú Mỹ đã kết thúc với giá 5 tỷ.', link: '/news/3', imageUrl: 'https://via.placeholder.com/300x200?text=Đất+nền+Phú+Mỹ' },
    { id: 4, category: 'Kết quả đấu giá', title: 'Kết quả đấu giá tranh cổ', date: '2025-10-07', summary: 'Tranh cổ được bán với giá 200 triệu đồng.', link: '/news/4', imageUrl: 'https://via.placeholder.com/300x200?text=Tranh+cổ' },
    { id: 5, category: 'Tin tức sự kiện', title: 'Sự kiện ra mắt nền tảng đấu giá mới', date: '2025-10-06', summary: 'Nền tảng đấu giá trực tuyến mới sẽ ra mắt vào 20/10.', link: '/news/5', imageUrl: 'https://via.placeholder.com/300x200?text=Nền+tảng+đấu+giá' },
    { id: 6, category: 'Tin tức sự kiện', title: 'Hội thảo đấu giá bất động sản', date: '2025-10-05', summary: 'Hội thảo chia sẻ kinh nghiệm đấu giá bất động sản.', link: '/news/6', imageUrl: 'https://via.placeholder.com/300x200?text=Hội+thảo+BĐS' },
    { id: 7, category: 'Thông báo tuyển dụng', title: 'Tuyển dụng đấu giá viên', date: '2025-10-04', summary: 'Chúng tôi cần tuyển 5 đấu giá viên chuyên nghiệp.', link: '/news/7', imageUrl: 'https://via.placeholder.com/300x200?text=Đấu+giá+viên' },
    { id: 8, category: 'Thông báo tuyển dụng', title: 'Tuyển nhân viên hỗ trợ khách hàng', date: '2025-10-03', summary: 'Vị trí hỗ trợ khách hàng với mức lương hấp dẫn.', link: '/news/8', imageUrl: 'https://via.placeholder.com/300x200?text=Hỗ+trợ+khách+hàng' },
    { id: 9, category: 'Thông báo đấu giá', title: 'Thông báo đấu giá đất nền Quận 9', date: '2025-10-02', summary: 'Phiên đấu giá đất nền Quận 9 sẽ diễn ra vào 18/10.', link: '/news/9', imageUrl: 'https://via.placeholder.com/300x200?text=Đất+nền+Quận+9' },
    { id: 10, category: 'Kết quả đấu giá', title: 'Kết quả đấu giá xe máy Yamaha', date: '2025-10-01', summary: 'Xe máy Yamaha được bán với giá 50 triệu đồng.', link: '/news/10', imageUrl: 'https://via.placeholder.com/300x200?text=Xe+Yamaha' },
  ];

  useEffect(() => {
    setNewsData(mockNewsData); // Thay bằng fetch API nếu cần
  }, []);

  const filteredNews = newsData.filter(item => item.category === activeCategory);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);

  const categories = [
    'Thông báo đấu giá',
    'Kết quả đấu giá',
    'Tin tức sự kiện',
    'Thông báo tuyển dụng'
  ];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Tin tức - Thông báo</h1>
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Danh mục tin</h2>
          <ul className={styles.categoryList}>
            {categories.map((category, index) => (
              <React.Fragment key={index}>
                <li
                  className={`${styles.categoryItem} ${activeCategory === category ? styles.active : ''}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </li>
                {index < categories.length - 1 && <hr className={styles.categoryDivider} />}
              </React.Fragment>
            ))}
          </ul>
        </div>

        <div className={styles.mobileCategory}>
          <button className={styles.mobileCategoryToggle} onClick={toggleMobileMenu}>
            {activeCategory} <i className="fa fa-chevron-down"></i>
          </button>
          {isMobileMenuOpen && (
            <ul className={styles.mobileCategoryList}>
              {categories.map((category, index) => (
                <React.Fragment key={index}>
                  <li
                    className={`${styles.mobileCategoryItem} ${activeCategory === category ? styles.active : ''}`}
                    onClick={() => {
                      handleCategoryChange(category);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {category}
                  </li>
                  {index < categories.length - 1 && <hr className={styles.categoryDivider} />}
                </React.Fragment>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.newsList}>
          {currentNews.length === 0 ? (
            <p>Không có tin tức nào trong danh mục này.</p>
          ) : (
            <div className={styles.newsGrid}>
              {currentNews.map((news) => (
                <div key={news.id} className={styles.newsItem}>
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className={styles.newsImage}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found'; }}
                  />
                  <h3 className={styles.newsTitle}>{news.title}</h3>
                  <p className={styles.newsDate}>{news.date}</p>
                  <p className={styles.newsSummary}>{news.summary}</p>
                  <Link to={news.link} className={styles.readMoreBtn}>
                    Đọc thêm <i className="fa fa-arrow-right"></i>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={`${styles.pageBtn} ${currentPage === index + 1 ? styles.active : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;