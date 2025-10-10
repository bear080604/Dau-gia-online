import React, { useState } from "react";
import axios from "axios";
import styles from "./register.module.css"; // ✅ import CSS module

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
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");

    const data = new FormData();
    for (let key in formData) data.append(key, formData[key]);
    if (idCardFront) data.append("id_card_front", idCardFront);
    if (idCardBack) data.append("id_card_back", idCardBack);

    try {
      const res = await axios.post("http://localhost:8000/api/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("Đăng ký thành công!");
      console.log(res.data);
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert("Lỗi kết nối API");
      }
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.registerTitle}>Đăng ký tài khoản</h2>
      {successMsg && <p className={styles.successMsg}>{successMsg}</p>}

      <form onSubmit={handleSubmit} className={styles.registerForm} encType="multipart/form-data">
        <div className={styles.formGroup}>
          <label>Họ tên</label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} />
          {errors.full_name && <p className={styles.errorMsg}>{errors.full_name[0]}</p>}
        </div>

        <div className={styles.formGroup}>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
          {errors.email && <p className={styles.errorMsg}>{errors.email[0]}</p>}
        </div>

        <div className={styles.formGroup}>
          <label>Số điện thoại</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Địa chỉ</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Mật khẩu</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
          {errors.password && <p className={styles.errorMsg}>{errors.password[0]}</p>}
        </div>

        <div className={styles.formGroup}>
          <label>Nhập lại mật khẩu</label>
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Ngân hàng</label>
          <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Số tài khoản</label>
          <input type="text" name="bank_account" value={formData.bank_account} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>CCCD mặt trước</label>
          <input type="file" onChange={(e) => setIdCardFront(e.target.files[0])} />
        </div>

        <div className={styles.formGroup}>
          <label>CCCD mặt sau</label>
          <input type="file" onChange={(e) => setIdCardBack(e.target.files[0])} />
        </div>

        <button type="submit" className={styles.btnSubmit}>Đăng ký</button>
      </form>
    </div>
  );
}

export default Register;
