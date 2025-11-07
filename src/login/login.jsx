import React, { useState, useEffect } from 'react';
import styles from './login.module.css';
import { Eye, EyeOff } from 'lucide-react';
import { useUser } from '../UserContext';
import { useLocation } from 'react-router-dom';
import { login as loginService } from '../services/authService';

function LoginForm() {
  const { login } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const location = useLocation();

  // Đọc message từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msg = params.get('message');
    if (msg) {
      const decoded = decodeURIComponent(msg);
      if (decoded.toLowerCase().includes('thành công')) {
        setSuccessMessage(decoded);
      } else {
        setErrorMessage(decoded);
      }
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleCheckboxChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.email.trim()) {
      setErrorMessage('Vui lòng nhập email.');
      return;
    }
    if (!formData.password.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    try {
      // Gọi service → trả về { user, token }
      const { user, token } = await loginService({
        email: formData.email,
        password: formData.password,
        rememberMe
      });

      // Kiểm tra dữ liệu hợp lệ
      if (!user) {
        setErrorMessage('Đăng nhập thất bại: Không nhận được thông tin người dùng.');
        return;
      }

      // Lưu token nếu có
      if (token) {
        if (rememberMe) {
          localStorage.setItem('authToken', token);
        } else {
          sessionStorage.setItem('authToken', token);
        }
      }

      // Cập nhật context
      login(user, token);

      // Chuyển hướng theo role
      const redirectTo = user.role_id === 2 ? '/admin' : '/';
      window.location.href = redirectTo;

    } catch (err) {
      // err có thể là Error hoặc AxiosError
      const msg = err.response?.data?.message || err.message || 'Email hoặc mật khẩu không đúng';
      setErrorMessage(msg);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>ĐĂNG NHẬP</h1>
          <div className={styles.divider}>
            <div className={styles.line}></div>
            <div className={styles.symbol}>❈</div>
            <div className={styles.line}></div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className={styles.errorMessage}>
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>
              Email <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Nhập email của bạn"
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
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className={styles.eyeButton}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className={styles.options}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleCheckboxChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Nhớ mật khẩu</span>
            </label>
            <a href="/forgot-password" className={styles.forgotLink}>
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit */}
          <div className={styles.submitContainer}>
            <button type="submit" className={styles.submitButton}>
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;