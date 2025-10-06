import React, { useState } from 'react';
import styles from './register.module.css'; // Import CSS Modules
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({}); // State để lưu lỗi từng field
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user'  // Giữ default 'user' – giả sử đã OK từ lần test trước
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
    setErrors({}); // Clear previous errors
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu và nhập lại mật khẩu không khớp' });
      return;
    }

    // Chỉ gửi các trường backend yêu cầu: full_name, email, phone, password, role
    // Bao gồm password_confirmation cho validation
    const dataToSend = {
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      role: formData.role
    };

    // Debug: Log data gửi đi để kiểm tra
    console.log('Data gửi đến server:', dataToSend);

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
        console.log('Đăng ký thành công:', result);
        // Có thể thêm logic chuyển hướng hoặc hiển thị thông báo thành công
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Lỗi đăng ký chi tiết:', errorData);
        
        // Map server errors (snake_case) to client fields (camelCase)
        const fieldErrors = {};
        if (errorData.errors) {
          if (errorData.errors.full_name) fieldErrors.fullName = errorData.errors.full_name[0];
          if (errorData.errors.email) fieldErrors.email = errorData.errors.email[0];
          if (errorData.errors.phone) fieldErrors.phone = errorData.errors.phone[0];
          if (errorData.errors.password) fieldErrors.password = errorData.errors.password[0];
          if (errorData.errors.role) fieldErrors.role = errorData.errors.role[0];
          if (errorData.errors.password_confirmation) fieldErrors.confirmPassword = errorData.errors.password_confirmation[0];
        }
        setErrors(fieldErrors);
        
        // Fallback message nếu không có field cụ thể
        if (Object.keys(fieldErrors).length === 0) {
          setErrors({ general: errorData.message || 'Lỗi đăng ký không xác định' });
        }
      }
    } catch (err) {
      console.error('Lỗi API:', err);
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

          {/* Vai trò */}
          <div className={styles.field}>
            <label className={styles.label}>
              Vai trò <span className={styles.required}>*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.role ? styles.inputError : ''}`}
              required
            >
              <option value="user">Người dùng (User)</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="bidder">Người đấu giá (Bidder)</option>
              <option value="seller">Người bán (Seller)</option>
            </select>
            {errors.role && <span className={styles.fieldError}>{errors.role}</span>}
            <small className={styles.helpText}>
              Các giá trị phổ biến từ Laravel enum Role: user, admin, bidder, seller.
            </small>
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