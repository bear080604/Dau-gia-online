import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./register.module.css";

function Register() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    password_confirmation: "",
    bank_name: "",
    bank_account: "",
  });

  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [errors, setErrors] = useState({});
  const [clientErrors, setClientErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setClientErrors({
      ...clientErrors,
      [name]: "", // Xóa lỗi client khi người dùng nhập
    });
    setErrors({}); // Xóa lỗi API khi người dùng nhập
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Vui lòng nhập họ và tên.";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ.";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại.";
    if (!formData.password.trim()) newErrors.password = "Vui lòng nhập mật khẩu.";
    else if (formData.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    if (!formData.password_confirmation.trim()) newErrors.password_confirmation = "Vui lòng nhập lại mật khẩu.";
    else if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = "Mật khẩu nhập lại không khớp.";

    setClientErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    let timer;
    if (successMsg && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    if (countdown === 0) {
      window.location.href = "/login";
    }
    return () => clearInterval(timer);
  }, [successMsg, countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    for (let key in formData) data.append(key, formData[key]);
    if (idCardFront) data.append("id_card_front", idCardFront);
    if (idCardBack) data.append("id_card_back", idCardBack);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg(`Đăng ký thành công! Kiểm tra email để xác thực tài khoản. Chuyển trang đăng nhập sau ${countdown} giây...`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      console.log(res.data);
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: "Lỗi kết nối API. Vui lòng thử lại sau." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.registerTitle}>Đăng ký tài khoản</h2>
      {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
      {errors.general && <p className={styles.errorMsg}>{errors.general}</p>}

      <form onSubmit={handleSubmit} className={styles.registerForm} encType="multipart/form-data">
        <div className={styles.formGroup}>
          <label>Họ tên <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className={clientErrors.full_name || errors.full_name ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.full_name || errors.full_name) && (
            <p className={styles.errorMsg}>{clientErrors.full_name || errors.full_name[0]}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Email <span className={styles.required}>*</span></label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={clientErrors.email || errors.email ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.email || errors.email) && (
            <p className={styles.errorMsg}>{clientErrors.email || errors.email[0]}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Số điện thoại <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={clientErrors.phone || errors.phone ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.phone || errors.phone) && (
            <p className={styles.errorMsg}>{clientErrors.phone || errors.phone[0]}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Địa chỉ</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={errors.address ? styles.inputError : ""}
            disabled={isLoading}
          />
          {errors.address && <p className={styles.errorMsg}>{errors.address[0]}</p>}
        </div>

        <div className={styles.formGroup}>
          <label>Mật khẩu <span className={styles.required}>*</span></label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={clientErrors.password || errors.password ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.password || errors.password) && (
            <p className={styles.errorMsg}>{clientErrors.password || errors.password[0]}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Nhập lại mật khẩu <span className={styles.required}>*</span></label>
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className={clientErrors.password_confirmation || errors.password_confirmation ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.password_confirmation || errors.password_confirmation) && (
            <p className={styles.errorMsg}>{clientErrors.password_confirmation || errors.password_confirmation[0]}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Ngân hàng</label>
          <input
            type="text"
            name="bank_name"
            value={formData.bank_name}
            onChange={handleChange}
            className={errors.bank_name ? styles.inputError : ""}
            disabled={isLoading}
          />
          {errors.bank_name && <p className={styles.errorMsg}>{errors.bank_name[0]}</p>}
        </div>

        <div className={styles.formGroup}>
          <label>Số tài khoản</label>
          <input
            type="text"
            name="bank_account"
            value={formData.bank_account}
            onChange={handleChange}
            className={errors.bank_account ? styles.inputError : ""}
            disabled={isLoading}
          />
          {errors.bank_account && <p className={styles.errorMsg}>{errors.bank_account[0]}</p>}
        </div>

        <div className={styles.formGroup}>
          <label>CCCD mặt trước</label>
          <input
            type="file"
            onChange={(e) => setIdCardFront(e.target.files[0])}
            className={errors.id_card_front ? styles.inputError : ""}
            disabled={isLoading}
          />
          {errors.id_card_front && <p className={styles.errorMsg}>{errors.id_card_front[0]}</p>}
        </div>

        <div className={styles.formGroup}>
          <label>CCCD mặt sau</label>
          <input
            type="file"
            onChange={(e) => setIdCardBack(e.target.files[0])}
            className={errors.id_card_back ? styles.inputError : ""}
            disabled={isLoading}
          />
          {errors.id_card_back && <p className={styles.errorMsg}>{errors.id_card_back[0]}</p>}
        </div>

        <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <span className={styles.spinner}></span> Đang đăng ký...
            </>
          ) : (
            "Đăng ký"
          )}
        </button>
      </form>
    </div>
  );
}

export default Register;