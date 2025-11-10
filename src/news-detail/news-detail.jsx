import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './newsDetail.module.css';
import Loading from '../components/Loading';

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}news/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Không tìm thấy tin tức');
        }
        return response.json();
      })
      .then((data) => {
        // Xử lý nội dung có thể chứa nhiều đoạn
        const processedContent = data.content
          ? data.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          : 'Không có nội dung';

        // ✅ Xử lý ảnh an toàn
        let imageUrl = '';
        if (data.thumbnail) {
          if (data.thumbnail.startsWith('http')) {
            imageUrl = data.thumbnail; // backend trả URL đầy đủ
          } else {
            imageUrl = `${process.env.REACT_APP_BASE_URL}/storage/news/${data.thumbnail.replace(
              'storage/news/',
              ''
            )}`;
          }
        } else {
          imageUrl = '';
        }

        setNews({
          id: data.id,
          title: data.title,
          category: data.category?.name || 'Không có danh mục',
          date: new Date(data.created_at).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          author: data.author || 'Không xác định',
          content: processedContent,
          imageUrl: imageUrl,
        });

        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {  
    return <Loading message="Đang tải tin tức..." />;
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
      />

      <div className={styles.content}>{news.content}</div>
    </div>
  );
};

export default NewsDetail;
