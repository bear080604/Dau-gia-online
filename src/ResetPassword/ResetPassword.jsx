import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './reset.module.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Kiểm tra token hợp lệ
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}verify-reset/${token}`);
        const data = await response.json();

        if (response.ok && data.status) {
          setValidToken(true);
        } else {
          setError(data.message || 'Liên kết không hợp lệ hoặc đã hết hạn.');
        }
      } catch (err) {
        setError('Lỗi khi kiểm tra token.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // ✅ Gửi mật khẩu mới
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          password_confirmation: confirm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Đổi mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Không thể đổi mật khẩu.');
      }
    } catch (err) {
      setError('Lỗi kết nối đến server.');
    }
  };

  if (loading) return <p className={styles.infoMessage}>Đang kiểm tra liên kết...</p>;

  if (!validToken)
    return <div className={styles.errorMessage}>{error || 'Token không hợp lệ!'}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>ĐẶT LẠI MẬT KHẨU</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>
              Mật khẩu mới <span className={styles.required}>*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Nhập lại mật khẩu <span className={styles.required}>*</span>
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={styles.input}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          {message && <div className={styles.successMessage}>{message}</div>}
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.submitContainer}>
            <button type="submit" className={styles.submitButton}>
              Xác nhận đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
