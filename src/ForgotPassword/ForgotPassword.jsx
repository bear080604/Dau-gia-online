import React, { useState } from "react";
import styles from "./forgot.module.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },    
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Vui lòng kiểm tra email để xác nhận yêu cầu đổi mật khẩu.");
      } else {
        setIsError(true);
        setMessage(data.message || "Email không hợp lệ hoặc không tồn tại.");
      }
    } catch (error) {
      setIsError(true);
      setMessage("Không thể kết nối đến server!");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <label>Email của bạn</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          required
        />
        <button type="submit">Gửi yêu cầu</button>
      </form>

      {message && (
        <p className={isError ? styles.error : styles.success}>{message}</p>
      )}
    </div>
  );
}

export default ForgotPassword;
