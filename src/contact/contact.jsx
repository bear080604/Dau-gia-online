import React, { useState } from 'react';
import styles from './contact.module.css';

function Contact() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState({
    assetName: '',
    assetCategory: '',
    startingPrice: ''
  });

  const categories = [
    { value: '', label: '-- Chọn danh mục --' },
    { value: 'vehicle', label: 'Xe ô tô' },
    { value: 'property', label: 'Bất động sản' },
    { value: 'electronics', label: 'Điện tử' },
    { value: 'jewelry', label: 'Trang sức' },
    { value: 'art', label: 'Nghệ thuật' }
  ];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.filter(file => !selectedImages.some(img => img.name === file.name && img.size === file.size));
    setSelectedImages(prev => [...prev, ...newFiles]);
  };

  const removeImage = (fileToRemove) => {
    setSelectedImages(prev => prev.filter(file => !(file.name === fileToRemove.name && file.size === fileToRemove.size)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { assetName, assetCategory, startingPrice } = formData;
    if (!assetName || !assetCategory || !startingPrice) {
      alert('Vui lòng điền đầy đủ thông tin tài sản');
      return;
    }
    alert(`Thông tin tài sản đã được gửi thành công!\n\nTên tài sản: ${assetName}\nDanh mục: ${assetCategory}\nGiá khởi điểm: ${parseInt(startingPrice).toLocaleString('vi-VN')} VNĐ\nSố hình ảnh: ${selectedImages.length}`);
    setFormData({ assetName: '', assetCategory: '', startingPrice: '' });
    setSelectedImages([]);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>LIÊN HỆ BÁN TÀI SẢN</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Thông tin cá nhân</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Tên đầy đủ</div>
              <div className={styles.infoValue} id="fullName">Nguyễn văn sợ khanh</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Điện thoại</div>
              <div className={styles.infoValue} id="phoneNumber">0867662266</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Email</div>
              <div className={styles.infoValue} id="email">manh@gmail.com</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Nơi công tác</div>
              <div className={styles.infoValue} id="workplace">evisu</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Số tài khoản</div>
              <div className={styles.infoValue} id="accountNumber">123123123</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Chủ tài khoản</div>
              <div className={styles.infoValue} id="accountHolder">Dinh lam truong</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Ngân hàng</div>
              <div className={styles.infoValue} id="bankName">mamabank</div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Thông tin tài sản</h2>
          <form id="assetForm" onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="assetName">Tên tài sản</label>
              <input
                type="text"
                className={styles.formControl}
                id="assetName"
                placeholder="Nhập tên tài sản"
                value={formData.assetName}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="assetCategory">Danh mục</label>
              <select
                className={styles.formControl}
                id="assetCategory"
                value={formData.assetCategory}
                onChange={handleInputChange}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="startingPrice">Giá khởi điểm (VNĐ)</label>
              <input
                type="number"
                className={styles.formControl}
                id="startingPrice"
                placeholder="Nhập giá khởi điểm"
                value={formData.startingPrice}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Hình ảnh tài sản</label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="assetImages"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
                <label className={styles.fileUploadLabel} htmlFor="assetImages">
                  <span>Chọn hình ảnh tài sản</span>
                </label>
              </div>

              <div className={styles.imagePreviewContainer} id="imagePreviewContainer">
                {selectedImages.map((file, index) => (
                  <div key={index} className={styles.imagePreviewItem}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className={styles.imagePreview}
                    />
                    <button
                      type="button"
                      className={styles.removeImageBtn}
                      onClick={() => removeImage(file)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className={styles.btnSubmit}>Gửi thông tin</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
