import React, { useState } from 'react';
import styles from './login.module.css';
import { Eye, EyeOff } from 'lucide-react';
import { useUser } from '../UserContext';
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrorMessage(''); // Xóa lỗi khi người dùng nhập
  };

  const handleCheckboxChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setErrorMessage('Vui lòng nhập email.');
      return;
    }
    if (!formData.password.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    try {
      const result = await loginService({
        email: formData.email,
        password: formData.password,
        rememberMe: rememberMe ? true : false
      });

      if (result && result.user) {
        const token = result.token || null;
        if (token) {
          localStorage.setItem('authToken', token);
        }
        login(result.user, token);
        // Giả sử role_id 2 là Admin, 3 là NhanVien (dựa trên bảng role bạn cung cấp)
        window.location.href = result.user.role_id === 2 ? '/admin' : '/';
      } else {
        setErrorMessage('Đăng nhập thất bại: Dữ liệu người dùng không hợp lệ.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            ĐĂNG NHẬP
          </h1>
          <div className={styles.divider}>
            <div className={styles.line}></div>
            <div className={styles.symbol}>❈</div>
            <div className={styles.line}></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email */}
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
              placeholder="Thư điện tử"
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
                placeholder="Mật khẩu"
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
          {/* Error Message */}
          {errorMessage && (
            <div className={styles.errorMessage}>
              {errorMessage}
            </div>
          )}

          {/* Remember me and Forgot password */}
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
            <a href="#" className={styles.forgotLink}>Quên mật khẩu?</a>
          </div>

          {/* Submit Button */}
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