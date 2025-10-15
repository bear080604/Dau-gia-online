import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './adminNews.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    content: '',
    author: '',
    is_published: 0,
    thumbnail: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch danh mục
        const categoriesResponse = await axios.get('http://127.0.0.1:8000/api/news-categories', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        } else {
          throw new Error('Invalid categories data format');
        }

        // Fetch tin tức
        const newsResponse = await axios.get('http://127.0.0.1:8000/api/news', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (newsResponse.data && Array.isArray(newsResponse.data)) {
          setNews(newsResponse.data);
        } else {
          throw new Error('Invalid news data format');
        }
        setLoading(false);
      } catch (err) {
        setError('Không thể tải dữ liệu');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tin tức này?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/news/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setNews(news.filter(item => item.id !== id));
        // Reset về trang 1 nếu trang hiện tại không còn item nào
        if (currentNews.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        setError('Xóa tin tức thất bại');
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('category_id', formData.category_id);
    data.append('content', formData.content);
    data.append('author', formData.author);
    data.append('is_published', formData.is_published);
    if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/news', data, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Tìm thông tin category từ categories để thêm vào dữ liệu mới
      const category = categories.find(cat => cat.id.toString() === formData.category_id);
      
      // Tạo đối tượng tin tức mới với đầy đủ thông tin
      const newNewsItem = {
        ...response.data.data,
        category: category || { id: formData.category_id, name: 'Unknown' }
      };
      
      setNews([newNewsItem, ...news]); // Thêm vào đầu mảng
      setShowAddModal(false);
      setFormData({ title: '', category_id: '', content: '', author: '', is_published: 0, thumbnail: null });
      setCurrentPage(1); // Reset về trang đầu tiên
    } catch (err) {
      setError('Thêm tin tức thất bại');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('_method', 'PUT');
    data.append('title', formData.title);
    data.append('category_id', formData.category_id);
    data.append('content', formData.content);
    data.append('author', formData.author);
    data.append('is_published', formData.is_published);
    if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/news/${selectedNews.id}`, data, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Tìm thông tin category từ categories để thêm vào dữ liệu cập nhật
      const category = categories.find(cat => cat.id.toString() === formData.category_id);
      
      const updatedNewsItem = {
        ...response.data.data,
        category: category || { id: formData.category_id, name: 'Unknown' }
      };

      setNews(news.map(item => item.id === selectedNews.id ? updatedNewsItem : item));
      setShowEditModal(false);
      setFormData({ title: '', category_id: '', content: '', author: '', is_published: 0, thumbnail: null });
      setSelectedNews(null);
    } catch (err) {
      setError('Cập nhật tin tức thất bại');
    }
  };

  const openEditModal = (item) => {
    setSelectedNews(item);
    setFormData({
      title: item.title,
      category_id: item.category?.id?.toString() || '',
      content: item.content,
      author: item.author || '',
      is_published: item.is_published,
      thumbnail: null,
    });
    setShowEditModal(true);
  };

  const openViewModal = (item) => {
    setSelectedNews(item);
    setShowViewModal(true);
  };

  const filteredNews = news.filter(item => {
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && item.is_published === 1) || 
      (statusFilter === 'unpublished' && item.is_published === 0);
    const matchesCategory = categoryFilter === 'all' || (item.category?.name === categoryFilter);
    return matchesStatus && matchesCategory;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Quản Lý Tin Tức</h1>
      <p className={styles.subtitle}>Quản lý và theo dõi các tin tức được đăng trên hệ thống</p>
      <div className={styles.headNews}>
        <div className={styles.filters}>
          <select 
            className={styles.filterSelect} 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="unpublished">Chưa xuất bản</option>
          </select>
          <select 
            className={styles.filterSelect} 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button
            className={styles.addButton}
            onClick={() => {
              setFormData({
                title: '',
                category_id: '',
                content: '',
                author: '',
                is_published: 0,
                thumbnail: null,
              });
              setShowAddModal(true);
            }}
          >
            + Thêm tin tức mới
          </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.loading}>Đang tải...</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã TS</th>
                <th>Tên Tin Tức</th>
                <th>Danh Mục</th>
                <th>Ngày Tạo</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {currentNews.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td className={styles.titleNews}>{item.title}</td>
                  <td>{item.category?.name || 'Không có danh mục'}</td>
                  <td>{new Date(item.created_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className={styles.status} 
                          style={{ backgroundColor: item.is_published ? '#4caf50' : '#ff9800' }}>
                      {item.is_published ? 'Đã xuất bản' : 'Chưa xuất bản'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.actionButton} 
                      onClick={() => openEditModal(item)}
                      style={{ backgroundColor: '#3192ecff' }}
                    >
                      <i className="fa fa-pencil" aria-hidden="true"></i>
                    </button>
                    <button 
                      className={styles.actionButton} 
                      onClick={() => handleDelete(item.id)}
                      style={{ backgroundColor: '#f44336' }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => openViewModal(item)}
                      style={{ backgroundColor: '#60d882ff' }}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.pagination}>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? styles.activePage : ''}
              >
                {i + 1}
              </button>
            ))}
            
          </div>
        </>
      )}

      {/* Modal Thêm mới */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Thêm Tin Tức Mới</h2>
            <form onSubmit={handleAdd}>
              <div className={styles.formGroup}>
                <label>Tiêu đề</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Danh mục</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Nội dung</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tác giả</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Trạng thái</label>
                <select
                  value={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: Number(e.target.value) })}
                  required
                >
                  <option value={0}>Chưa xuất bản</option>
                  <option value={1}>Đã xuất bản</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Ảnh thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files[0] })}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="submit">Lưu</button>
                <button type="button" onClick={() => setShowAddModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {showEditModal && selectedNews && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Sửa Tin Tức</h2>
            <form onSubmit={handleEdit}>
              <div className={styles.formGroup}>
                <label>Tiêu đề</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Danh mục</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Nội dung</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tác giả</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Trạng thái</label>
                <select
                  value={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: Number(e.target.value) })}
                  required
                >
                  <option value={0}>Chưa xuất bản</option>
                  <option value={1}>Đã xuất bản</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Ảnh thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files[0] })}
                />
                {selectedNews.thumbnail && (
                  <img src={selectedNews.thumbnail} alt="Current Thumbnail" style={{ maxWidth: '200px', marginTop: '10px' }} />
                )}
              </div>
              <div className={styles.modalActions}>
                <button type="submit">Lưu</button>
                <button type="button" onClick={() => setShowEditModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết */}
      {showViewModal && selectedNews && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Chi Tiết Tin Tức</h2>
            <div className={styles.viewGroup}>
              <label>Tiêu đề:</label>
              <p>{selectedNews.title}</p>
            </div>
            <div className={styles.viewGroup}>
              <label>Danh mục:</label>
              <p>{selectedNews.category?.name || 'Không có danh mục'}</p>
            </div>
            <div className={styles.viewGroup}>
              <label>Ngày tạo:</label>
              <p>{new Date(selectedNews.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className={styles.viewGroup}>
              <label>Tác giả:</label>
              <p>{selectedNews.author || 'Không có'}</p>
            </div>
            <div className={styles.viewGroup}>
              <label>Nội dung:</label>
              <p>{selectedNews.content}</p>
            </div>
            <div className={styles.viewGroup}>
              <label>Trạng thái:</label>
              <p style={{ color: selectedNews.is_published ? '#4caf50' : '#ff9800' }}>
                {selectedNews.is_published ? 'Đã xuất bản' : 'Chưa xuất bản'}
              </p>
            </div>
            <div className={styles.viewGroup}>
              <label>Ảnh thumbnail:</label>
              {selectedNews.thumbnail ? (
                <img src={selectedNews.thumbnail} alt="Thumbnail" style={{ maxWidth: '200px', marginTop: '10px' }} />
              ) : (
                <p>Không có ảnh</p>
              )}
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setShowViewModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;