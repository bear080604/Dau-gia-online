import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './news.module.css';

const News = () => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [newsData, setNewsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 6;

  // Fetch categories và news
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch categories
        const catRes = await fetch('http://127.0.0.1:8000/api/news-categories');
        const catData = await catRes.json();
        const categoryNames = catData.map((cat) => cat.name);
        setCategories(['Tất cả', ...categoryNames]); // ✅ Thêm "Tất cả"
        setActiveCategory('Tất cả');

        // Fetch news
        const newsRes = await fetch('http://127.0.0.1:8000/api/news');
        const allNews = await newsRes.json();
        const news = allNews.filter(item => item.is_published === 1);

        // Map dữ liệu tin tức
        const formattedNews = news.map((item) => ({
          id: item.id,
          category: item.category.name,
          title: item.title,
          date: new Date(item.created_at).toLocaleDateString('vi-VN'),
          summary:
            item.content.substring(0, 100) +
            (item.content.length > 100 ? '...' : ''),
          link: `/news/${item.id}`,
          imageUrl: item.thumbnail
            ? item.thumbnail.startsWith('http')
              ? item.thumbnail
              : `http://127.0.0.1:8000/storage/news/${item.thumbnail.replace(
                  'storage/news/',
                  ''
                )}`
            : 'https://via.placeholder.com/300x200?text=Image+Not+Found',
        }));

        setNewsData(formattedNews);
      } catch (error) {
        console.error('Lỗi fetch dữ liệu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lọc tin theo danh mục
  const filteredNews =
    activeCategory === 'Tất cả'
      ? newsData
      : newsData.filter((item) => item.category === activeCategory);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  // Menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Tin tức - Thông báo</h1>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className={styles.layout}>
          {/* SIDEBAR (Danh mục) */}
          <div className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Danh mục tin</h2>
            <ul className={styles.categoryList}>
              {categories.map((category, index) => (
                <React.Fragment key={index}>
                  <li
                    className={`${styles.categoryItem} ${
                      activeCategory === category ? styles.active : ''
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </li>
                  {index < categories.length - 1 && (
                    <hr className={styles.categoryDivider} />
                  )}
                </React.Fragment>
              ))}
            </ul>
          </div>

          {/* MENU MOBILE */}
          <div className={styles.mobileCategory}>
            <button
              className={styles.mobileCategoryToggle}
              onClick={toggleMobileMenu}
            >
              {activeCategory || 'Chọn danh mục'}{' '}
              <i className="fa fa-chevron-down"></i>
            </button>
            {isMobileMenuOpen && (
              <ul className={styles.mobileCategoryList}>
                {categories.map((category, index) => (
                  <React.Fragment key={index}>
                    <li
                      className={`${styles.mobileCategoryItem} ${
                        activeCategory === category ? styles.active : ''
                      }`}
                      onClick={() => {
                        handleCategoryChange(category);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {category}
                    </li>
                    {index < categories.length - 1 && (
                      <hr className={styles.categoryDivider} />
                    )}
                  </React.Fragment>
                ))}
              </ul>
            )}
          </div>

          {/* DANH SÁCH TIN */}
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
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/300x200?text=Image+Not+Found';
                      }}
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

            {/* PHÂN TRANG */}
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
                    className={`${styles.pageBtn} ${
                      currentPage === index + 1 ? styles.active : ''
                    }`}
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
      )}
    </div>
  );
};

export default News;
