import React, { useState, useEffect, useRef } from 'react';
import styles from './contact.module.css';

const API_URL = 'http://127.0.0.1:8000/api/auction-items';
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
    auction_org_id: '1', // Giá trị mặc định là ID của Công Ty Đấu Giá Hợp Danh Khải Bảo
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
  const [categories, setCategories] = useState([]);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState(false);
  // Thêm state mới để theo dõi form hợp lệ
  const [isFormValid, setIsFormValid] = useState(false);
  const fileInputRef = useRef(null);
  const extraImagesRef = useRef(null);
  const urlFileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.customSelectWrapper}`)) {
        setOpenCategoryDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch categories - updated with debug logs and fallback
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
        }

        const catResponse = await fetch(CATEGORIES_API_URL, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const catData = await catResponse.json();
        
        // DEBUG: Log để kiểm tra
        console.log("Kết quả API categories:", catData);
        
        if (catData.status && Array.isArray(catData.data)) {
          setCategories(catData.data);
          console.log("Đã set categories:", catData.data); // DEBUG
        } else {
          // Fallback nếu cấu trúc khác (e.g., data.categories hoặc trực tiếp data)
          const categoriesList = catData.data || catData.categories || catData || [];
          setCategories(Array.isArray(categoriesList) ? categoriesList : []);
          console.log("Fallback categories:", categoriesList); // DEBUG
          if (!Array.isArray(categoriesList)) {
            setGlobalError('Dữ liệu danh mục không đúng định dạng. Kiểm tra console.');
          }
        }
      } catch (error) {
        console.error('Lỗi fetch categories:', error); // DEBUG
        setGlobalError('Lỗi khi tải danh mục: ' + error.message);
        setCategories([]); // Fallback rỗng
      }
    };

    fetchCategories();
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

  // 🆕 useEffect tự động kiểm tra form validity - Updated với check đủ 3 file bắt buộc
  useEffect(() => {
    const { category_id, owner_id, name, description, starting_price, image, extra_images, url_file } = formData;
    const price = parseFloat(String(starting_price || '').replace(/\./g, ''));

    const isValid =
      String(category_id || '').trim() !== '' &&
      String(owner_id || '').trim() !== '' &&
      String(name || '').trim() !== '' &&
      String(description || '').trim() !== '' &&
      String(starting_price || '').trim() !== '' &&
      !isNaN(price) &&
      price > 0 &&
      image &&                                  // Bắt buộc có ảnh chính
      Array.isArray(extra_images) && extra_images.length > 0 &&  // Có ít nhất 1 ảnh bổ sung
      url_file;                                // Có file đính kèm

    setIsFormValid(isValid);
  }, [formData]);

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
      const cleanValue = value.replace(/[^\d]/g, ''); // 🆕 Clean chỉ giữ số để tránh ký tự lạ
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

  // 🆕 Validate form - Updated với check đủ 3 file bắt buộc
  const validateForm = () => {
    const newErrors = {};
    const { category_id, owner_id, name, description, starting_price, auction_org_id, image, extra_images, url_file } = formData;

    // Kiểm tra danh mục
    if (!category_id || String(category_id).trim() === '') {
      newErrors.category_id = 'Vui lòng chọn danh mục.';
    }

    // Kiểm tra chủ sở hữu
    if (!owner_id || String(owner_id).trim() === '') {
      newErrors.owner_id = 'Không tìm thấy chủ sở hữu. Vui lòng đăng nhập lại.';
    }

    // Kiểm tra tên sản phẩm
    if (!name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc.';
    } else if (name.trim().length > 255) {
      newErrors.name = 'Tên sản phẩm không được vượt quá 255 ký tự.';
    }

    // Kiểm tra mô tả
    if (!description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc.';
    } else if (description.length > 1000) {
      newErrors.description = 'Mô tả không được vượt quá 1000 ký tự.';
    }

    // Kiểm tra giá
    const price = parseFloat(starting_price.replace(/\./g, ''));
    if (!starting_price.trim()) {
      newErrors.starting_price = 'Giá khởi điểm là bắt buộc.';
    } else if (isNaN(price) || price < 1) {
      newErrors.starting_price = 'Giá khởi điểm phải là số hợp lệ và lớn hơn 0.';
    }

    // Kiểm tra tổ chức đấu giá
    if (!auction_org_id || Number(auction_org_id) !== 1) {
      newErrors.auction_org_id = 'Tổ chức đấu giá không hợp lệ.';
    }

    // 🆕 Yêu cầu phải chọn đủ cả 3 loại file
    if (!image) {
      newErrors.image = 'Vui lòng chọn ảnh chính.';
    }
    if (!extra_images || extra_images.length === 0) {
      newErrors.extra_images = 'Vui lòng chọn ít nhất một ảnh bổ sung.';
    }
    if (!url_file) {
      newErrors.url_file = 'Vui lòng chọn tệp đính kèm (PDF, DOC hoặc DOCX).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  // Submit handler - Updated with stricter validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    const isValid = validateForm();
    if (!isValid) {
      showToast({ title: 'Cảnh báo', message: 'Vui lòng nhập đầy đủ và hợp lệ tất cả các trường bắt buộc.' });
      return;
    }

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
        // Reset form nhưng giữ owner info
        const resetData = {
          category_id: '',
          name: '',
          description: '',
          starting_price: '',
          image: null,
          extra_images: [],
          url_file: null
        };
        setFormData(prev => ({ ...prev, ...resetData }));
        setDescriptionCount(0);
        setImagePreview(null);
        setExtraImagePreviews([]);
        setFileNamePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (extraImagesRef.current) extraImagesRef.current.value = '';
        if (urlFileRef.current) urlFileRef.current.value = '';
        // Giữ owner từ localStorage nếu cần submit tiếp
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

            {/* Updated dropdown with safe checks and fallback */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="category_id">Danh mục</label>

              <div className={styles.customSelectWrapper}>
                <div
                  className={`${styles.customSelect} ${errors.category_id ? styles.error : ''}`}
                  onClick={() => setOpenCategoryDropdown(prev => !prev)}
                >
                  <span>
                    {formData.category_id
                      ? (() => {
                          const cat = categories.find(c => String(c.category_id) === String(formData.category_id));
                          return cat ? `${cat.name} - ${cat.description}` : '-- Chọn danh mục --';
                        })()
                      : '-- Chọn danh mục --'}
                  </span>
                  <span className={styles.arrow}>{openCategoryDropdown ? '▲' : '▼'}</span>
                </div>

                {openCategoryDropdown && (
                  <ul className={styles.dropdownList}>
                    {/* Fallback nếu chưa load */}
                    {!Array.isArray(categories) || categories.length === 0 ? (
                      <li className={styles.loadingOption}>Đang tải danh mục... (Kiểm tra console)</li>
                    ) : (
                      <>
                        <li
                          key="none"
                          onClick={() => {
                            handleInputChange({ target: { name: 'category_id', value: '' } });
                            setOpenCategoryDropdown(false);
                          }}
                          className={!formData.category_id ? styles.activeOption : ''}
                        >
                          -- Chọn danh mục --
                        </li>

                        {categories.map((cat) => (
                          <li
                            key={cat.category_id}
                            onClick={() => {
                              handleInputChange({ target: { name: 'category_id', value: String(cat.category_id) } });
                              setOpenCategoryDropdown(false);
                            }}
                            className={String(formData.category_id) === String(cat.category_id) ? styles.activeOption : ''}
                          >
                            <strong>{cat.name}</strong>
                            <br />
                            <small>{cat.description}</small>
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                )}
              </div>

              {errors.category_id && (
                <div className={styles.validationError}>{errors.category_id}</div>
              )}
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
                required
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

            {/* CỐ ĐỊNH TỔ CHỨC ĐẤU GIÁ */}
            <div className={styles.formGroup} style={{display: 'none'}}  >
              <label className={styles.formLabel} htmlFor="auction_org_id">Tổ chức đấu giá</label>
              <select
                className={`${styles.formControl} ${errors.auction_org_id ? styles.error : ''}`}
                id="auction_org_id"
                name="auction_org_id"
                value={formData.auction_org_id}
                onChange={handleInputChange}
                required
              >
                <option value="1">Công Ty Đấu Giá Hợp Danh Khải Bảo</option>
              </select>
              {errors.auction_org_id && <div className={styles.validationError}>{errors.auction_org_id}</div>}
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
                <label htmlFor="image_url" className={styles.fileUploadLabel}>Chọn file ảnh chính (bắt buộc)</label>
              </div>
              {imagePreview && (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                </div>
              )}
              {/* 🆕 Hiển thị lỗi cho ảnh chính */}
              {errors.image && <div className={styles.validationError}>{errors.image}</div>}
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
                <label htmlFor="extra_images" className={styles.fileUploadLabel}>Chọn ít nhất một file ảnh bổ sung (bắt buộc)</label>
              </div>
              {extraImagePreviews.length > 0 && (
                <div className={styles.imagePreview}>
                  {extraImagePreviews.map((preview, index) => (
                    <img key={index} src={preview} alt={`Extra Preview ${index}`} className={styles.previewImg} />
                  ))}
                </div>
              )}
              {/* 🆕 Hiển thị lỗi cho extra_images */}
              {errors.extra_images && <div className={styles.validationError}>{errors.extra_images}</div>}
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
                <label htmlFor="url_file" className={styles.fileUploadLabel}>Chọn tệp (PDF, DOC, DOCX) (bắt buộc)</label>
              </div>
              {fileNamePreview && (
                <div className={styles.fileNamePreview}>
                  Tệp đã chọn: {fileNamePreview}
                </div>
              )}
              {/* 🆕 Hiển thị lỗi cho url_file */}
              {errors.url_file && <div className={styles.validationError}>{errors.url_file}</div>}
            </div>

            {/* 🆕 BỎ: Hiển thị lỗi upload chung (không cần nữa) */}

            {/* Sửa nút submit: disable nếu !isFormValid hoặc loading */}
            <button 
              type="submit" 
              className={`${styles.btnSubmit} ${(!isFormValid || loading) ? styles.disabled : ''}`} 
              disabled={!isFormValid || loading}
            >
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