import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import styles from './register.module.css'; // Import CSS Modules
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({}); // State để lưu lỗi từng field
  const [successMessage, setSuccessMessage] = useState(''); // State để lưu thông báo thành công
  const navigate = useNavigate(); // Khởi tạo useNavigate

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'User' // Mặc định 'User' (chữ hoa, như code gốc)
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error cho field này khi user nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu và nhập lại mật khẩu không khớp' });
      return;
    }

    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrors({ phone: 'Số điện thoại phải bắt đầu bằng 0 và có 10 số.' });
      return;
    }

    const dataToSend = {
      full_name: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      role: formData.role // Gửi 'User' như code gốc
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'User'
        });
        // Chuyển hướng sau 2 giây
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const fieldErrors = {};
        if (errorData.errors) {
          if (errorData.errors.full_name) fieldErrors.fullName = errorData.errors.full_name[0];
          if (errorData.errors.email) fieldErrors.email = errorData.errors.email[0];
          if (errorData.errors.phone) fieldErrors.phone = errorData.errors.phone[0];
          if (errorData.errors.password) fieldErrors.password = errorData.errors.password[0];
          if (errorData.errors.password_confirmation) fieldErrors.confirmPassword = errorData.errors.password_confirmation[0];
          if (errorData.errors.role) fieldErrors.role = errorData.errors.role[0];
        }
        setErrors(fieldErrors);

        if (Object.keys(fieldErrors).length === 0) {
          setErrors({ general: errorData.message || 'Lỗi đăng ký không xác định' });
        }
      }
    } catch (err) {
      setErrors({ general: 'Lỗi kết nối. Vui lòng thử lại.' });
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

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <p className={styles.introText}>Vui lòng cung cấp chính xác các thông tin dưới đây:</p>

          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className={styles.errorMessage}>
              {errors.general}
            </div>
          )}

          {/* Họ và tên */}
          <div className={styles.field}>
            <label className={styles.label}>
              Họ và tên <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
              required
            />
            {errors.fullName && <span className={styles.fieldError}>{errors.fullName}</span>}
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
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              required
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          {/* Số điện thoại */}
          <div className={styles.field}>
            <label className={styles.label}>
              Số điện thoại <span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
              required
            />
            {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
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
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
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
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          {/* Nhập lại mật khẩu */}
          <div className={styles.field}>
            <label className={styles.label}>
              Nhập lại mật khẩu <span className={styles.required}>*</span>
            </label>
            <div className={styles.passwordContainer}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.eyeButton}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
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
