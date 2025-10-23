import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminAssetCategories.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const AdminAssetCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/categories', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.status && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        throw new Error('Invalid categories data format');
      }
      setLoading(false);
    } catch (err) {
      setError('Không thể tải danh sách danh mục: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleDelete = async (category_id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await axios.delete(`http://localhost:8000/api/categories/${category_id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setCategories(categories.filter(item => item.category_id !== category_id));
        if (currentCategories.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        setError('Xóa danh mục thất bại: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/categories', formData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.status) {
        setCategories([response.data.data, ...categories]);
        setShowAddModal(false);
        setFormData({ name: '', description: '' });
        setCurrentPage(1);
      } else {
        throw new Error(response.data.message || 'Thêm danh mục thất bại');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || err.message;
      setError('Thêm danh mục thất bại: ' + errorMessage);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:8000/api/categories/${selectedCategory.category_id}`, formData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status) {
        setCategories(categories.map(item => 
          item.category_id === selectedCategory.category_id ? response.data.data : item
        ));
        setShowEditModal(false);
        setFormData({ name: '', description: '' });
        setSelectedCategory(null);
      } else {
        throw new Error(response.data.message || 'Cập nhật danh mục thất bại');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || err.message;
      setError('Cập nhật danh mục thất bại: ' + errorMessage);
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setShowEditModal(true);
  };

  const openViewModal = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  return (
    <div className={styles.container}>
      <div className={styles.headNews}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Quản Lý Danh Mục Tài Sản</h1>
          <p className={styles.subtitle}>Quản lý và theo dõi các danh mục tài sản trên hệ thống</p>
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={styles.addButton}
          onClick={() => {
            setFormData({ name: '', description: '' });
            setShowAddModal(true);
          }}
        >
          <i className="fas fa-plus"></i>
          Thêm danh mục mới
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      
      {loading ? (
        <p className={styles.loading}>Đang tải...</p>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã DM</th>
                  <th>Tên Danh Mục</th>
                  <th>Mô Tả</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map(category => (
                  <tr key={category.category_id}>
                    <td>{category.category_id}</td>
                    <td>{category.name}</td>
                    <td>{category.description || 'Không có mô tả'}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button 
                          className={styles.actionButton} 
                          onClick={() => openEditModal(category)}
                          style={{ backgroundColor: 'rgb(69, 15, 247)' }}
                          title="Sửa"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button 
                          className={styles.actionButton} 
                          onClick={() => handleDelete(category.category_id)}
                          style={{ backgroundColor: '#f44336' }}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                        <button 
                          className={styles.actionButton}
                          onClick={() => openViewModal(category)}
                          style={{ backgroundColor: '#60d882' }}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? styles.activePage : ''}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        </>
      )}

      {/* Modal Thêm mới */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Thêm Danh Mục Mới</h2>
            <form onSubmit={handleAdd}>
              <div className={styles.formGroup}>
                <label>Tên danh mục *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nhập tên danh mục"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả danh mục"
                  rows="3"
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
      {showEditModal && selectedCategory && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Sửa Danh Mục</h2>
            <form onSubmit={handleEdit}>
              <div className={styles.formGroup}>
                <label>Tên danh mục *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="submit">Cập nhật</button>
                <button type="button" onClick={() => setShowEditModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết */}
      {showViewModal && selectedCategory && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Chi Tiết Danh Mục</h2>
            <div className={styles.viewGroup}>
              <label>Mã danh mục:</label>
              <p>{selectedCategory.category_id}</p>
            </div>
            <div className={styles.viewGroup}>
              <label>Tên danh mục:</label>
              <p>{selectedCategory.name}</p>
            </div>
            <div className={styles.viewGroup}>
              <label>Mô tả:</label>
              <p>{selectedCategory.description || 'Không có mô tả'}</p>
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

export default AdminAssetCategories;