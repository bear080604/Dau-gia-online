import React, { useState } from 'react';
import styles from './login.module.css'; // Import CSS Modules
import { Eye, EyeOff } from 'lucide-react';
import { useUser } from '../UserContext';

function LoginForm() {
  const { login } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    setRememberMe(e.target.checked);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        rememberMe: rememberMe ? true : false
      }),
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Đăng nhập thành công:', result);
      if (result && result.user) {
        const token = result.token || null;
        login(result.user, token);
        window.location.href = result.user.role === 'Administrator' ? '/admin' : '/';
      }
    } else {
      const error = await response.json();
      console.error('Lỗi đăng nhập:', error.message);
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
