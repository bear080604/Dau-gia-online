import React, { useState } from "react";
import axios from "axios";
import "./register.module.css"; // Import file CSS

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
    <div className="register-container">
      <h2 className="register-title">Đăng ký tài khoản</h2>
      {successMsg && <p className="success-msg">{successMsg}</p>}

      <form onSubmit={handleSubmit} className="register-form" encType="multipart/form-data">
        <div className="form-group">
          <label>Họ tên</label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} />
          {errors.full_name && <p className="error-msg">{errors.full_name[0]}</p>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
          {errors.email && <p className="error-msg">{errors.email[0]}</p>}
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Mật khẩu</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
          {errors.password && <p className="error-msg">{errors.password[0]}</p>}
        </div>

        <div className="form-group">
          <label>Nhập lại mật khẩu</label>
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Ngân hàng</label>
          <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Số tài khoản</label>
          <input type="text" name="bank_account" value={formData.bank_account} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>CCCD mặt trước</label>
          <input type="file" onChange={(e) => setIdCardFront(e.target.files[0])} />
        </div>

        <div className="form-group">
          <label>CCCD mặt sau</label>
          <input type="file" onChange={(e) => setIdCardBack(e.target.files[0])} />
        </div>

        <button type="submit" className="btn-submit">Đăng ký</button>
      </form>
    </div>
  );
}

export default Register;
