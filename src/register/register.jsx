import React, { useState } from 'react';
import styles from './register.module.css'; // Import CSS Modules
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterForm() {
  const [activeTab, setActiveTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    birthDate: '',
    gender: 'Nam',
    idNumber: '',
    issueDate: '',
    issuePlace: '',
    idFrontImage: null,
    idBackImage: null,
    familyBook: null,
    accountNumber: '',
    accountHolder: '',
    bankName: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}register`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Đăng ký thành công:', result);
        // Có thể thêm logic chuyển hướng hoặc hiển thị thông báo thành công
      } else {
        console.error('Lỗi đăng ký:', response.statusText);
      }
    } catch (err) {
      console.error('Lỗi API:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            ĐĂNG KÝ TÀI KHOẢN ĐẤU GIÁ TRỰC TUYẾN
          </h1>
          <div className={styles.divider}>
            <div className={styles.line}></div>
            <div className={styles.symbol}>❈</div>
            <div className={styles.line}></div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`${styles.tabButton} ${activeTab === 'personal' ? styles.active : ''}`}
          >
            Tài khoản cá nhân
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('organization')}
            className={`${styles.tabButton} ${activeTab === 'organization' ? styles.active : ''}`}
          >
            Tài khoản tổ chức
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <p className={styles.introText}>Vui lòng cung cấp chính xác các thông tin dưới đây:</p>

          {/* Họ và tên */}
          <div className={styles.field}>
            <label className={styles.label}>
              Họ và tên người có tài sản bán <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Tên đăng nhập */}
          <div className={styles.field}>
            <label className={styles.label}>
              Tên đăng nhập <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Thư điện tử */}
          <div className={styles.field}>
            <label className={styles.label}>
              Thư điện tử <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Mật khẩu */}
          <div className={styles.field}>
            <label className={styles.label}>
              Mật khẩu <span className={styles.required}>*</span>
            </label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Địa chỉ thường trú */}
          <div className={styles.field}>
            <label className={styles.label}>
              Địa chỉ thường trú <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Số điện thoại */}
          <div className={styles.field}>
            <label className={styles.label}>
              Số Điện thoại <span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>


          {/* Ngày sinh và Giới tính */}
          <div className={styles.gridFields}>
             {activeTab === 'personal' && (
            <div className={styles.field}>
              <label className={styles.label}>
                Ngày sinh <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
              
            </div>
                  )}
            {activeTab === 'personal' && (
              <div className={styles.field}>
                <label className={styles.label}>
                  Giới tính <span className={styles.required}>*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            )}
          </div>

          {/* Số CMND/CCCD */}
          <div className={styles.field}>
            <label className={styles.label}>
              Số CMND/CCCD <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Ngày cấp */}
          <div className={styles.field}>
            <label className={styles.label}>
              Ngày cấp <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Nơi cấp */}
          <div className={styles.field}>
            <label className={styles.label}>
              Nơi cấp <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="issuePlace"
              value={formData.issuePlace}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Ảnh mặt trước CMND/CCCD */}
          <div className={styles.field}>
            <label className={styles.label}>
              Ảnh mặt trước CMND/CCCD <span className={styles.required}>*</span>
            </label>
            <div className={styles.fileUpload}>
              <input
                type="file"
                name="idFrontImage"
                onChange={handleFileChange}
                className={styles.fileInput}
                id="idFrontImage"
                required
              />
              <label htmlFor="idFrontImage" className={styles.fileButton}>
                Chọn tập
              </label>
              <span className={styles.fileText}>
                {formData.idFrontImage ? formData.idFrontImage.name : 'Không có tệp nào được chọn'}
              </span>
            </div>
          </div>

          {/* Ảnh mặt sau CMND/CCCD */}
          <div className={styles.field}>
            <label className={styles.label}>
              Ảnh mặt sau CMND/CCCD <span className={styles.required}>*</span>
            </label>
            <div className={styles.fileUpload}>
              <input
                type="file"
                name="idBackImage"
                onChange={handleFileChange}
                className={styles.fileInput}
                id="idBackImage"
                required
              />
              <label htmlFor="idBackImage" className={styles.fileButton}>
                Chọn tập
              </label>
              <span className={styles.fileText}>
                {formData.idBackImage ? formData.idBackImage.name : 'Không có tệp nào được chọn'}
              </span>
            </div>
          </div>

          {/* Hộ sơ đính kèm */}
          <div className={styles.field}>
            <label className={styles.label}>Hộ sơ đính kèm</label>
            <div className={styles.fileUpload}>
              <input
                type="file"
                name="familyBook"
                onChange={handleFileChange}
                className={styles.fileInput}
                id="familyBook"
              />
              <label htmlFor="familyBook" className={styles.fileButton}>
                Chọn tập
              </label>
              <span className={styles.fileText}>
                {formData.familyBook ? formData.familyBook.name : 'Không có tệp nào được chọn'}
              </span>
            </div>
          </div>

          {/* Số tài khoản nhận lại tiền đặt trước */}
          <div className={styles.field}>
            <label className={styles.label}>
              Số tài khoản nhận lại tiền đặt trước <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Chủ tài khoản */}
          <div className={styles.field}>
            <label className={styles.label}>
              Chủ tài khoản <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="accountHolder"
              value={formData.accountHolder}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Tên ngân hàng */}
          <div className={styles.field}>
            <label className={styles.label}>
              Tên ngân hàng <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Submit Button */}
          <div className={styles.submitContainer}>
            <button type="submit" className={styles.submitButton}>
              Đăng ký
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}