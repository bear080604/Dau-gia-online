import React, { useState, useEffect } from 'react';
import styles from './AdminNewsCategories.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Loading from '../../components/Loading';
import { 
  getNewsCategories, 
  createNewsCategory,
  updateNewsCategory, 
  deleteNewsCategory 
} from '../../services/newCategoriesService';
import { toast } from 'react-toastify';

const AdminNewsCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({ name: '' });

  // === FETCH DATA ===
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNewsCategories();
      const categoriesList = Array.isArray(data) ? data : (data.data || data.categories || []);
      setCategories(categoriesList);
    } catch (err) {
      console.error('fetchCategories error:', err);
      setError('Không thể tải danh mục tin tức');
      toast.error('Lỗi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  // === HANDLERS ===
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Vui lòng nhập tên danh mục');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createNewsCategory({ name: formData.name });
      const newCategory = response.data || response;
      
      setCategories([newCategory, ...categories]);
      setShowAddModal(false);
      setFormData({ name: '' });
      setCurrentPage(1);
      toast.success('Thêm danh mục thành công!');
    } catch (err) {
      console.error('Add error:', err);
      toast.error(err.response?.data?.message || 'Thêm danh mục thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Vui lòng nhập tên danh mục');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await updateNewsCategory(selectedCategory.id, { name: formData.name });
      const updated = response.data || response;
      
      setCategories(categories.map(item => 
        item.id === selectedCategory.id ? updated : item
      ));
      setShowEditModal(false);
      setFormData({ name: '' });
      setSelectedCategory(null);
      toast.success('Cập nhật danh mục thành công!');
    } catch (err) {
      console.error('Edit error:', err);
      toast.error(err.response?.data?.message || 'Cập nhật danh mục thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      setIsSubmitting(true);
      await deleteNewsCategory(id);
      
      setCategories(categories.filter(item => item.id !== id));
      if (currentCategories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      toast.success('Xóa danh mục thành công!');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Xóa danh mục thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name });
    setShowEditModal(true);
  };

  const openViewModal = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  // === PAGINATION ===
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  return (
    <div className={styles.container}>
      <div className={styles.headNews}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Quản Lý Danh Mục Tin Tức</h1>
          <p className={styles.subtitle}>Quản lý và theo dõi các danh mục tin tức trên hệ thống</p>
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={styles.addButton}
          onClick={() => {
            setFormData({ name: '' });
            setShowAddModal(true);
          }}
          disabled={isSubmitting}
        >
          <i className="fas fa-plus"></i>
          Thêm danh mục mới
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <button onClick={fetchCategories} className={styles.retryBtn}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <Loading message="Đang tải danh mục tin tức..." />
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã DM</th>
                  <th>Tên Danh Mục</th>
                  <th>Ngày Tạo</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      <i className="fas fa-inbox"></i> Không có danh mục nào
                    </td>
                  </tr>
                ) : (
                  currentCategories.map(category => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td>{category.name}</td>
                      <td>{new Date(category.created_at).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.actionButton} 
                            onClick={() => openEditModal(category)}
                            style={{ backgroundColor: '#4f46e5' }}
                            title="Sửa"
                            disabled={isSubmitting}
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button 
                            className={styles.actionButton} 
                            onClick={() => handleDelete(category.id)}
                            style={{ backgroundColor: '#f44336' }}
                            title="Xóa"
                            disabled={isSubmitting}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
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
          )}
        </>
      )}

      {/* Modal Thêm mới */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Thêm Danh Mục Mới</h2>
            <form onSubmit={handleAdd}>
              <div className={styles.formGroup}>
                <label>Tên danh mục *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                  placeholder="Nhập tên danh mục"
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {showEditModal && selectedCategory && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Sửa Danh Mục</h2>
            <form onSubmit={handleEdit}>
              <div className={styles.formGroup}>
                <label>Tên danh mục *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết */}
      {showViewModal && selectedCategory && (
        <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Chi Tiết Danh Mục</h2>
            <div className={styles.viewGroup}>
              <label>Mã danh mục:</label>
              <p>{selectedCategory.id}</p>
            </div>
            <div className={styles.viewGroup}>
              <label>Tên danh mục:</label>
              <p>{selectedCategory.name}</p>
            </div>
            <div className={styles.viewGroup}>
              <label>Ngày tạo:</label>
              <p>{new Date(selectedCategory.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className={styles.viewGroup}>
              <label>Ngày cập nhật:</label>
              <p>
                {selectedCategory.updated_at
                  ? new Date(selectedCategory.updated_at).toLocaleDateString('vi-VN')
                  : 'Chưa cập nhật'}
              </p>
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewsCategories;