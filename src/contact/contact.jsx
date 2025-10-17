// Contact.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './contact.module.css';

const API_URL = 'http://127.0.0.1:8000/api/auction-items';
const AUTO_DISMISS_MS = 5000;

const Contact = () => {
  // Form states
  const [formData, setFormData] = useState({
    category_id: '',
    owner_id: '',
    owner_name: '',
    name: '',
    description: '',
    starting_price: '',
    status: 'ChoDuyet',
    image: null
  });
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [checkAuthMsg, setCheckAuthMsg] = useState('Đang kiểm tra xác thực...');
  const [toasts, setToasts] = useState([]);

  const fileInputRef = useRef(null);

  // Auth check on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      setGlobalError('Bạn cần đăng nhập để tạo sản phẩm. Vui lòng quay lại trang đăng nhập.');
      setCheckAuthMsg('');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user && user.user_id) {
        setFormData(prev => ({
          ...prev,
          owner_id: user.user_id,
          owner_name: user.full_name || user.email || 'Người dùng'
        }));
       
      } else {
        setGlobalError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      }
    } catch (err) {
    
      setGlobalError('Lỗi dữ liệu người dùng. Vui lòng đăng nhập lại.');
    }

    setCheckAuthMsg('');
  }, []);

  // Description count handler
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescriptionCount(value.length);
    setFormData(prev => ({ ...prev, description: value }));
  };

  // Image preview and file handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, image: file }));
    } else {
      setImagePreview(null);
      setFormData(prev => ({ ...prev, image: null }));
    }
  };

  // Generic input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Clear errors
  const clearErrors = () => {
    setErrors({});
    setGlobalError('');
  };

  // Field error setter
  const setFieldError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  // Validate form
  const validateForm = () => {
    clearErrors();
    let isValid = true;

    const { category_id, owner_id, name, description, starting_price, status } = formData;

    if (!category_id || parseInt(category_id) < 1) {
      setFieldError('category_id', 'ID danh mục phải > 0');
      isValid = false;
    }

    if (!owner_id || parseInt(owner_id) < 1) {
      setFieldError('owner_id', 'ID chủ sở hữu phải > 0');
      isValid = false;
    }

    if (!name.trim() || name.length > 255) {
      setFieldError('name', 'Tên bắt buộc, max 255 ký tự');
      isValid = false;
    }

    if (description.length > 1000) {
      setFieldError('description', 'Mô tả max 1000 ký tự');
      isValid = false;
    }

    const price = parseFloat(starting_price);
    if (!starting_price || price < 1) {
      setFieldError('starting_price', 'Giá >= 1 VND');
      isValid = false;
    }

    const validStatuses = ['ChoDuyet', 'ChoDauGia', 'DangDauGia', 'DaBan', 'Huy'];
    if (!validStatuses.includes(status)) {
      setFieldError('status', 'Trạng thái không hợp lệ');
      isValid = false;
    }

    return isValid;
  };

  // Show server errors
  const showServerErrors = (serverErrors) => {
    clearErrors();
    let hasFieldErrors = false;
    Object.keys(serverErrors).forEach(field => {
      if (serverErrors[field]) {
        const msg = Array.isArray(serverErrors[field]) ? serverErrors[field][0] : serverErrors[field];
        setFieldError(field, msg);
        hasFieldErrors = true;
      }
    });
    if (!hasFieldErrors) {
      setGlobalError('Lỗi validation từ server: ' + JSON.stringify(serverErrors));
    }
  };

  // Toast functions
  const escapeHtml = (str) => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const showToast = ({ title = '', message = '' }) => {
    const id = Date.now();
    const newToast = { id, title, message, timer: setTimeout(() => dismissToast(id), AUTO_DISMISS_MS) };
    setToasts(prev => [...prev, newToast]);

    // Progress bar simulation via timeout
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, progress: 0 } : t));
    }, 0);
  };

  const dismissToast = (id) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast && toast.timer) clearTimeout(toast.timer);
      return prev.filter(t => t.id !== id);
    });
  };

  const handleCloseToast = (id) => {
    dismissToast(id);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem('token');
    const submitData = new FormData();
    submitData.append('category_id', formData.category_id);
    submitData.append('owner_id', formData.owner_id);
    submitData.append('name', formData.name.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('starting_price', formData.starting_price);
    submitData.append('status', formData.status);
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    setLoading(true);
    clearErrors();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();
    

      if (response.ok) {
        showToast({ title: 'Thành công!', message: 'Tạo thành công! ID: ' + (data.item?.item_id || 'N/A') });
        // Reset form
        setFormData({
          category_id: '',
          owner_id: '',
          owner_name: '',
          name: '',
          description: '',
          starting_price: '',
          status: 'ChoDuyet',
          image: null
        });
        setDescriptionCount(0);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else if (response.status === 422 && data.errors) {
        showServerErrors(data.errors);
      } else {
        throw new Error(data.message || 'Lỗi tạo sản phẩm');
      }
    } catch (error) {
    
      setGlobalError(error.message || 'Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Render toast
  const renderToasts = () => (
    <div className={styles.toastContainer}>
      {toasts.map(toast => (
        <div key={toast.id} className={`${styles.toast} ${styles.show}`}>
          <div className={styles.toastBody}>
            <div className={styles.toastTitle}>{escapeHtml(toast.title)}</div>
            <div className={styles.toastMsg}>{escapeHtml(toast.message)}</div>
            <div className={styles.progress}>
              <i style={{ width: toast.progress === 0 ? '0%' : '100%' }}></i>
            </div>
          </div>
          <button className={styles.toastClose} onClick={() => handleCloseToast(toast.id)}>✕</button>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>GỬI YÊU CẦU ĐẤU GIÁ TÀI SẢN</h1>
      </header>

      <div className={styles.content}>
        {checkAuthMsg && <div className={styles.checkAuth}>{checkAuthMsg}</div>}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Thông tin sản phẩm</h2>
          <form onSubmit={handleSubmit} className={styles.assetForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="category_id">Danh mục (ID)</label>
              <select
                className={`${styles.formControl} ${errors.category_id ? styles.error : ''}`}
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Danh mục --</option>
                <option value="1">Bất động sản - Nhà đất, căn hộ, đất nền</option>
                <option value="2">Xe cộ - Ô tô, xe máy, xe tải</option>
                <option value="3">Đồ cổ - Tranh, tượng, đồ sưu tầm</option>
                <option value="4">Thiết bị điện tử - Điện thoại, laptop, tivi</option>
              </select>
              {errors.category_id && <div className={styles.validationError}>{errors.category_id}</div>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="owner_name">Chủ sở hữu</label>
              <input
                type="text"
                className={`${styles.formControl} ${styles.readonly}`}
                id="owner_name"
                value={formData.owner_name}
                readOnly
                required
              />
              <input type="hidden" name="owner_id" value={formData.owner_id} />
              {errors.owner_id && <div className={styles.validationError}>{errors.owner_id}</div>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="name">Tên sản phẩm</label>
              <input
                type="text"
                className={`${styles.formControl} ${errors.name ? styles.error : ''}`}
                id="name"
                name="name"
                placeholder="Nhập tên sản phẩm (tối đa 255 ký tự)"
                maxLength="255"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              {errors.name && <div className={styles.validationError}>{errors.name}</div>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="description">Mô tả</label>
              <textarea
                className={`${styles.formControl} ${errors.description ? styles.error : ''}`}
                id="description"
                name="description"
                placeholder="Nhập mô tả chi tiết sản phẩm (tối đa 1000 ký tự)"
                maxLength="1000"
                value={formData.description}
                onChange={handleDescriptionChange}
              ></textarea>
              <div className={styles.charCount}>{descriptionCount}/1000</div>
              {errors.description && <div className={styles.validationError}>{errors.description}</div>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="starting_price">Giá khởi điểm (VND)</label>
              <input
                type="number"
                className={`${styles.formControl} ${errors.starting_price ? styles.error : ''}`}
                id="starting_price"
                name="starting_price"
                placeholder="Nhập giá khởi điểm (tối thiểu 1 VND)"
                step="0.01"
                min="1"
                value={formData.starting_price}
                onChange={handleInputChange}
                required
              />
              {errors.starting_price && <div className={styles.validationError}>{errors.starting_price}</div>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Hình ảnh sản phẩm</label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  className={styles.formControl}
                  id="image_url"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label htmlFor="image_url" className={styles.fileUploadLabel}>Chọn file hình ảnh (tùy chọn)</label>
              </div>
              {imagePreview && (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                </div>
              )}
              {errors.image_url && <div className={styles.validationError}>{errors.image_url}</div>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="status">Trạng thái</label>
              <select
                className={`${styles.formControl} ${styles.disabled} ${errors.status ? styles.error : ''}`}
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled
                required
              >
                <option value="ChoDuyet">Chờ duyệt (mặc định)</option>
              </select>
              {errors.status && <div className={styles.validationError}>{errors.status}</div>}
            </div>

            <button type="submit" className={`${styles.btnSubmit} ${loading ? styles.disabled : ''}`} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Gửi yêu cầu'}
            </button>
          </form>
          {loading && <div className={styles.loading}><i className="fas fa-spinner fa-spin"></i> Đang gửi yêu cầu...</div>}
          {globalError && (
            <div className={styles.error}>
              {globalError}
            </div>
          )}
          <div className={styles.redirectLink}>
            <a href="detail.html" style={{ display: 'none' }}>Quay về trang chi tiết</a>
          </div>
        </div>
      </div>

      {renderToasts()}
    </div>
  );
};

export default Contact;