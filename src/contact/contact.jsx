import React, { useState, useEffect, useRef } from 'react';
import styles from './contact.module.css';

const API_URL = 'http://127.0.0.1:8000/api/auction-items';
const USER_API_URL = 'http://127.0.0.1:8000/api/showuser';
const CATEGORIES_API_URL = 'http://127.0.0.1:8000/api/categories';
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
    auction_org_id: '',
    image: null,
    extra_images: [],
    url_file: null
  });
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [extraImagePreviews, setExtraImagePreviews] = useState([]);
  const [fileNamePreview, setFileNamePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [checkAuthMsg, setCheckAuthMsg] = useState('Đang kiểm tra xác thực...');
  const [toasts, setToasts] = useState([]);
  const [auctionOrgs, setAuctionOrgs] = useState([]);
  const [categories, setCategories] = useState([]);

  const fileInputRef = useRef(null);
  const extraImagesRef = useRef(null);
  const urlFileRef = useRef(null);

  // Fetch auction organizations and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
        }

        // Fetch auction organizations
        const orgResponse = await fetch(USER_API_URL, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const orgData = await orgResponse.json();
        console.log('Dữ liệu API tổ chức đấu giá:', orgData); // Debug dữ liệu API
        if (orgData.status && Array.isArray(orgData.users)) {
          const orgs = orgData.users
            .filter(user => user.role_id === 8) // Sửa từ role sang role_id
            .map(user => ({
              user_id: user.user_id,
              full_name: user.full_name,
              email: user.email
            }));
          console.log('Danh sách tổ chức đấu giá:', orgs); // Debug danh sách tổ chức
          setAuctionOrgs(orgs);
          if (orgs.length === 0) {
            setGlobalError('Không tìm thấy tổ chức đấu giá nào hợp lệ.');
          }
        } else {
          setGlobalError('Dữ liệu tổ chức đấu giá không đúng định dạng.');
        }

        // Fetch categories
        const catResponse = await fetch(CATEGORIES_API_URL, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const catData = await catResponse.json();
        console.log('Dữ liệu API danh mục:', catData); // Debug dữ liệu danh mục
        if (catData.status && Array.isArray(catData.data)) {
          setCategories(catData.data);
        } else {
          setGlobalError('Dữ liệu danh mục không đúng định dạng.');
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        setGlobalError('Lỗi khi tải dữ liệu: ' + error.message);
      }
    };

    fetchData();
  }, []);

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

  // Extra images handler
  const handleExtraImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, extra_images: files }));

    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previews.push(ev.target.result);
        if (previews.length === files.length) {
          setExtraImagePreviews([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
    if (files.length === 0) setExtraImagePreviews([]);
  };

  // URL file handler
  const handleUrlFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileNamePreview(file.name);
      setFormData(prev => ({ ...prev, url_file: file }));
    } else {
      setFileNamePreview('');
      setFormData(prev => ({ ...prev, url_file: null }));
    }
  };

  // Generic input change with price formatting
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'starting_price') {
      const cleanValue = value.replace(/\./g, '');
      const formattedValue = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

    const { category_id, owner_id, name, description, starting_price, auction_org_id } = formData;

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

    const price = parseFloat(starting_price.replace(/\./g, ''));
    if (!starting_price || price < 1) {
      setFieldError('starting_price', 'Giá >= 1 VND');
      isValid = false;
    }

    if (!auction_org_id || !auctionOrgs.some(org => org.user_id === parseInt(auction_org_id))) {
      setFieldError('auction_org_id', 'ID tổ chức đấu giá không hợp lệ');
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
    submitData.append('auction_org_id', formData.auction_org_id);
    submitData.append('name', formData.name.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('starting_price', formData.starting_price.replace(/\./g, ''));
    if (formData.image) {
      submitData.append('image', formData.image);
    }
    formData.extra_images.forEach((file, index) => {
      submitData.append('extra_images[]', file);
    });
    if (formData.url_file) {
      submitData.append('url_file', formData.url_file);
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
        setFormData({
          category_id: '',
          owner_id: '',
          owner_name: '',
          name: '',
          description: '',
          starting_price: '',
          auction_org_id: '',
          image: null,
          extra_images: [],
          url_file: null
        });
        setDescriptionCount(0);
        setImagePreview(null);
        setExtraImagePreviews([]);
        setFileNamePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (extraImagesRef.current) extraImagesRef.current.value = '';
        if (urlFileRef.current) urlFileRef.current.value = '';
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
              <label className={styles.formLabel} htmlFor="category_id">Danh mục</label>
              <select
                className={`${styles.formControl} ${errors.category_id ? styles.error : ''}`}
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name} - {cat.description}
                  </option>
                ))}
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
                type="text"
                className={`${styles.formControl} ${errors.starting_price ? styles.error : ''}`}
                id="starting_price"
                name="starting_price"
                placeholder="Nhập giá khởi điểm (ví dụ: 100.000.000)"
                value={formData.starting_price}
                onChange={handleInputChange}
                required
              />
              {errors.starting_price && <div className={styles.validationError}>{errors.starting_price}</div>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="auction_org_id">Tổ chức đấu giá</label>
              <select
                className={`${styles.formControl} ${errors.auction_org_id ? styles.error : ''}`}
                id="auction_org_id"
                name="auction_org_id"
                value={formData.auction_org_id}
                onChange={handleInputChange}
                required
                disabled={auctionOrgs.length === 0} // Vô hiệu hóa nếu không có tổ chức
              >
                <option value="">-- Chọn tổ chức đấu giá --</option>
                {auctionOrgs.length > 0 ? (
                  auctionOrgs.map(org => (
                    <option key={org.user_id} value={org.user_id}>
                      {org.full_name} ({org.email})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Không có tổ chức đấu giá hợp lệ</option>
                )}
              </select>
              {errors.auction_org_id && <div className={styles.validationError}>{errors.auction_org_id}</div>}
              {auctionOrgs.length === 0 && (
                <div className={styles.validationError}>
                  Không có tổ chức đấu giá nào hợp lệ. Vui lòng liên hệ quản trị viên.
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ảnh chính</label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  className={styles.formControl}
                  id="image_url"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label htmlFor="image_url" className={styles.fileUploadLabel}>Chọn file ảnh chính (tùy chọn)</label>
              </div>
              {imagePreview && (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                </div>
              )}
              {errors.image_url && <div className={styles.validationError}>{errors.image_url}</div>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Hình ảnh bổ sung</label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  className={styles.formControl}
                  id="extra_images"
                  ref={extraImagesRef}
                  accept="image/*"
                  multiple
                  onChange={handleExtraImagesChange}
                />
                <label htmlFor="extra_images" className={styles.fileUploadLabel}>Chọn nhiều file ảnh bổ sung (tùy chọn)</label>
              </div>
              {extraImagePreviews.length > 0 && (
                <div className={styles.imagePreview}>
                  {extraImagePreviews.map((preview, index) => (
                    <img key={index} src={preview} alt={`Extra Preview ${index}`} className={styles.previewImg} />
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tệp đính kèm</label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  className={styles.formControl}
                  id="url_file"
                  ref={urlFileRef}
                  accept=".pdf,.doc,.docx"
                  onChange={handleUrlFileChange}
                />
                <label htmlFor="url_file" className={styles.fileUploadLabel}>Chọn tệp (PDF, DOC, DOCX) (tùy chọn)</label>
              </div>
              {fileNamePreview && (
                <div className={styles.fileNamePreview}>
                  Tệp đã chọn: {fileNamePreview}
                </div>
              )}
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