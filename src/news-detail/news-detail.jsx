import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './newsDetail.module.css';

const NewsDetail = () => {
  const { id } = useParams(); // Lấy id từ URL
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch chi tiết tin tức từ API
    fetch(`http://127.0.0.1:8000/api/news/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Không tìm thấy tin tức');
        }
        return response.json();
      })
      .then((data) => {
        setNews({
          id: data.id,
          title: data.title,
          category: data.category.name,
          date: new Date(data.created_at).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          author: data.author || 'Không xác định',
          content: data.content,
          imageUrl: data.thumbnail
            ? `http://127.0.0.1:8000/storage/news/${data.thumbnail}`
            : 'https://via.placeholder.com/600x400?text=Image+Not+Found',
        });
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error) {
    return <div className={styles.error}>Lỗi: {error}</div>;
  }

  if (!news) {
    return <div className={styles.error}>Không tìm thấy tin tức</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{news.title}</h1>
      <div className={styles.meta}>
        <span className={styles.category}>{news.category}</span>
        <span className={styles.date}>Ngày đăng: {news.date}</span>
        <span className={styles.author}>Tác giả: {news.author}</span>
      </div>
      <img
        src={news.imageUrl}
        alt={news.title}
        className={styles.thumbnail}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
        }}
      />
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: news.content }}
      />
    </div>
  );
};

export default NewsDetail;