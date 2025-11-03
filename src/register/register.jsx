import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./register.module.css";

function Register() {
  const [accountType, setAccountType] = useState("user");
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    password_confirmation: "",
    bank_name: "",
    bank_account: "",
    bank_branch: "",
    identity_number: "",
    identity_issue_date: "",
    identity_issued_by: "",
    position: accountType === "business" ? "" : undefined,
    organization_name: accountType === "business" ? "" : undefined,
    tax_code: accountType === "business" ? "" : undefined,
    business_license_issue_date: accountType === "business" ? "" : undefined,
    business_license_issued_by: accountType === "business" ? "" : undefined,
    online_contact_method: accountType === "auction" ? "" : undefined,
    certificate_number: accountType === "auction" ? "" : undefined,
    certificate_issue_date: accountType === "auction" ? "" : undefined,
    certificate_issued_by: accountType === "auction" ? "" : undefined,
  });

  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [businessLicense, setBusinessLicense] = useState(accountType === "business" ? null : undefined);
  const [auctioneerCardFront, setAuctioneerCardFront] = useState(accountType === "auction" ? null : undefined);
  const [auctioneerCardBack, setAuctioneerCardBack] = useState(accountType === "auction" ? null : undefined);
  const [errors, setErrors] = useState({});
  const [clientErrors, setClientErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [searchBank, setSearchBank] = useState("");
  const dropdownRef = useRef(null);
const [openGenderDropdown, setOpenGenderDropdown] = useState(false);
useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest(`.${styles.customSelectWrapper}`)) {
      setOpenGenderDropdown(false);
    }
  };
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

  useEffect(() => {
    axios
      .get("https://api.vietqr.io/v2/banks")
      .then((res) => {
        if (res.data.code === "00" && res.data.data) {
          setBanks(res.data.data);
        } else {
          console.warn("API ngân hàng trả về dữ liệu không hợp lệ:", res.data);
        }
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách ngân hàng:", err);
      })
      .finally(() => setBanksLoading(false));
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsBankDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchBank.toLowerCase()) ||
    bank.shortName.toLowerCase().includes(searchBank.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setClientErrors({
      ...clientErrors,
      [name]: "",
    });
    setErrors({});
  };

  const handleBankSelect = (bank) => {
    setFormData({
      ...formData,
      bank_name: bank.name,
    });
    setSearchBank("");
    setIsBankDropdownOpen(false);
    setClientErrors({
      ...clientErrors,
      bank_name: "",
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    const validExtensions = ['pdf', 'doc', 'docx'];

    if (!formData.full_name.trim()) {
      newErrors.full_name = accountType === "user" 
        ? "Vui lòng nhập họ và tên." 
        : accountType === "auction" 
        ? "Vui lòng nhập họ và tên người đấu giá."
        : "Vui lòng nhập họ và tên người đại diện pháp luật.";
    }
    if (!formData.birth_date.trim()) newErrors.birth_date = "Vui lòng nhập ngày sinh.";
    if (!formData.gender.trim()) newErrors.gender = "Vui lòng chọn giới tính.";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ.";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại.";
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ.";
    if (!formData.password.trim()) newErrors.password = "Vui lòng nhập mật khẩu.";
    else if (formData.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    if (!formData.password_confirmation.trim()) newErrors.password_confirmation = "Vui lòng nhập lại mật khẩu.";
    else if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = "Mật khẩu nhập lại không khớp.";
    if (!formData.bank_name.trim()) newErrors.bank_name = "Vui lòng chọn ngân hàng.";
    if (!formData.bank_account.trim()) newErrors.bank_account = "Vui lòng nhập số tài khoản.";
    if (!formData.bank_branch.trim()) newErrors.bank_branch = "Vui lòng nhập chi nhánh ngân hàng.";
    if (!formData.identity_number.trim()) newErrors.identity_number = "Vui lòng nhập số căn cước.";
    if (!formData.identity_issue_date.trim()) newErrors.identity_issue_date = "Vui lòng nhập ngày cấp.";
    if (!formData.identity_issued_by.trim()) newErrors.identity_issued_by = "Vui lòng nhập nơi cấp.";
    if (!idCardFront) newErrors.id_card_front = "Vui lòng tải lên ảnh căn cước mặt trước.";
    if (!idCardBack) newErrors.id_card_back = "Vui lòng tải lên ảnh căn cước mặt sau.";

    if (accountType === "business") {
      if (!formData.position.trim()) newErrors.position = "Vui lòng nhập chức vụ.";
      if (!formData.organization_name.trim()) newErrors.organization_name = "Vui lòng nhập tên tổ chức.";
      if (!formData.tax_code.trim()) newErrors.tax_code = "Vui lòng nhập mã số thuế.";
      if (!formData.business_license_issue_date.trim()) newErrors.business_license_issue_date = "Vui lòng nhập ngày cấp giấy chứng nhận.";
      if (!formData.business_license_issued_by.trim()) newErrors.business_license_issued_by = "Vui lòng nhập nơi cấp giấy chứng nhận.";
      if (!businessLicense) newErrors.business_license = "Vui lòng tải lên giấy chứng nhận đăng ký kinh doanh.";
      else if (!validExtensions.includes(businessLicense.name.split('.').pop().toLowerCase())) {
        newErrors.business_license = "File giấy chứng nhận đăng ký kinh doanh phải là PDF hoặc Word (.pdf, .doc, .docx).";
      }
    }

    if (accountType === "auction") {
      if (!formData.online_contact_method.trim()) newErrors.online_contact_method = "Vui lòng nhập phương thức liên hệ trực tuyến.";
      if (!formData.certificate_number.trim()) newErrors.certificate_number = "Vui lòng nhập số chứng chỉ.";
      if (!formData.certificate_issue_date.trim()) newErrors.certificate_issue_date = "Vui lòng nhập ngày cấp chứng chỉ.";
      if (!formData.certificate_issued_by.trim()) newErrors.certificate_issued_by = "Vui lòng nhập nơi cấp chứng chỉ.";
      if (!auctioneerCardFront) newErrors.auctioneer_card_front = "Vui lòng tải lên ảnh thẻ đấu giá viên mặt trước.";
      if (!auctioneerCardBack) newErrors.auctioneer_card_back = "Vui lòng tải lên ảnh thẻ đấu giá viên mặt sau.";
    }

    setClientErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    for (let key in formData) {
      if (formData[key] !== undefined) data.append(key, formData[key]);
    }
    if (idCardFront) data.append("id_card_front", idCardFront);
    if (idCardBack) data.append("id_card_back", idCardBack);
    if (businessLicense && ['pdf', 'doc', 'docx'].includes(businessLicense.name.split('.').pop().toLowerCase())) {
      data.append("business_license", businessLicense);
    }
    if (auctioneerCardFront) data.append("auctioneer_card_front", auctioneerCardFront);
    if (auctioneerCardBack) data.append("auctioneer_card_back", auctioneerCardBack);
    data.append("account_type", accountType);

    console.log("Dữ liệu gửi đi:", Object.fromEntries(data));

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg(`Đăng ký thành công! Kiểm tra email để xác thực tài khoản. Chuyển trang đăng nhập sau ${countdown} giây...`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      console.log(res.data);
    } catch (err) {
      console.error("Lỗi API:", err.response ? err.response.data : err.message);
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
      
      <div className={styles.accountTypeButtons}>
        <button
          type="button"
          className={`${styles.accountTypeButton} ${accountType === "user" ? styles.active : ""}`}
          onClick={() => setAccountType("user")}
          disabled={isLoading}
        >
          Cá nhân
        </button>
        <button
          type="button"
          className={`${styles.accountTypeButton} ${accountType === "business" ? styles.active : ""}`}
          onClick={() => setAccountType("business")}
          disabled={isLoading}
        >
          Doanh nghiệp
        </button>
        <button
          type="button"
          className={`${styles.accountTypeButton} ${accountType === "auction" ? styles.active : ""}`}
          onClick={() => setAccountType("auction")}
          disabled={isLoading}
        >
          Đấu giá viên
        </button>
      </div>

      {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
      {errors.general && <p className={styles.errorMsg}>{errors.general}</p>}

      <form onSubmit={handleSubmit} className={styles.registerForm} encType="multipart/form-data">
        <div className={styles.formGroup}>
          <label>{accountType === "user" ? "Họ và tên" : accountType === "auction" ? "Họ và tên người đấu giá" : "Họ và tên người đại diện pháp luật"} <span className={styles.required}>*</span></label>
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
        {accountType === "business" && (
          <div className={styles.formGroup}>
            <label>Chức vụ <span className={styles.required}>*</span></label>
            <input
              type="text"
              name="position"
              value={formData.position || ""}
              onChange={handleChange}
              className={clientErrors.position || errors.position ? styles.inputError : ""}
              disabled={isLoading}
            />
            {(clientErrors.position || errors.position) && (
              <p className={styles.errorMsg}>{clientErrors.position || errors.position[0]}</p>
            )}
          </div>
        )}
        <div className={styles.formGroup}>
          <label>Ngày sinh <span className={styles.required}>*</span></label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            className={clientErrors.birth_date || errors.birth_date ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.birth_date || errors.birth_date) && (
            <p className={styles.errorMsg}>{clientErrors.birth_date || errors.birth_date[0]}</p>
          )}
        </div>
        {/* <div className={styles.formGroup}>
          <label>Giới tính <span className={styles.required}>*</span></label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={clientErrors.gender || errors.gender ? styles.inputError : ""}
            disabled={isLoading}
          >
            <option value="">Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
          {(clientErrors.gender || errors.gender) && (
            <p className={styles.errorMsg}>{clientErrors.gender || errors.gender[0]}</p>
          )}
        </div> */}


        <div className={styles.formGroup}>
  <label>
    Giới tính <span className={styles.required}>*</span>
  </label>

  <div className={styles.customSelectWrapper}>
    <div
      className={`${styles.customSelect} ${clientErrors.gender || errors.gender ? styles.inputError : ""}`}
      onClick={() => {
        if (!isLoading) setOpenGenderDropdown((prev) => !prev);
      }}
    >
      <span>
        {
          formData.gender === "male"
            ? "Nam"
            : formData.gender === "female"
            ? "Nữ"
            : formData.gender === "other"
            ? "Khác"
            : "Chọn giới tính"
        }
      </span>
      <span className={styles.arrow}>{openGenderDropdown ? "▲" : "▼"}</span>
    </div>

    {openGenderDropdown && !isLoading && (
      <ul className={styles.dropdownList}>
        {["male", "female", "other"].map((value) => (
          <li
            key={value}
            onClick={() => {
              handleChange({
                target: { name: "gender", value },
              });
              setOpenGenderDropdown(false);
            }}
            className={
              formData.gender === value ? styles.activeOption : ""
            }
          >
            {value === "male" ? "Nam" : value === "female" ? "Nữ" : "Khác"}
          </li>
        ))}
      </ul>
    )}
  </div>

  {(clientErrors.gender || errors.gender) && (
    <p className={styles.errorMsg}>
      {clientErrors.gender || errors.gender[0]}
    </p>
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
        {accountType === "auction" && (
          <div className={styles.formGroup}>
            <label>Phương thức liên hệ trực tuyến <span className={styles.required}>*</span></label>
            <input
              type="text"
              name="online_contact_method"
              value={formData.online_contact_method || ""}
              onChange={handleChange}
              className={clientErrors.online_contact_method || errors.online_contact_method ? styles.inputError : ""}
              disabled={isLoading}
            />
            {(clientErrors.online_contact_method || errors.online_contact_method) && (
              <p className={styles.errorMsg}>{clientErrors.online_contact_method || errors.online_contact_method[0]}</p>
            )}
          </div>
        )}
        <div className={styles.formGroup}>
          <label>Địa chỉ <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={clientErrors.address || errors.address ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.address || errors.address) && (
            <p className={styles.errorMsg}>{clientErrors.address || errors.address[0]}</p>
          )}
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
          <label>Ngân hàng <span className={styles.required}>*</span></label>
          <div className={styles.customDropdown} ref={dropdownRef}>
            <div
              className={`${styles.dropdownHeader} ${clientErrors.bank_name || errors.bank_name ? styles.inputError : ""} ${isLoading ? styles.disabled : ""}`}
              onClick={() => !isLoading && setIsBankDropdownOpen(!isBankDropdownOpen)}
            >
              <span className={formData.bank_name ? styles.selectedValue : styles.placeholder}>
                {formData.bank_name || "Chọn ngân hàng"}
              </span>
              <span className={styles.dropdownArrow}>
                {isBankDropdownOpen ? '▲' : '▼'}
              </span>
            </div>
            {isBankDropdownOpen && (
              <div className={styles.dropdownList}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm ngân hàng..."
                    value={searchBank}
                    onChange={(e) => setSearchBank(e.target.value)}
                    className={styles.searchInput}
                    autoFocus
                  />
                </div>
                <div className={styles.dropdownOptions}>
                  {banksLoading ? (
                    <div className={styles.loadingMessage}>Đang tải danh sách ngân hàng...</div>
                  ) : filteredBanks.length > 0 ? (
                    filteredBanks.map((bank) => (
                      <div
                        key={bank.id}
                        className={`${styles.dropdownOption} ${
                          formData.bank_name === bank.name ? styles.selected : ""
                        }`}
                        onClick={() => handleBankSelect(bank)}
                      >
                        <span className={styles.bankName}>{bank.name}</span>
                        <span className={styles.bankShortName}>({bank.shortName})</span>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noResults}>Không tìm thấy ngân hàng</div>
                  )}
                </div>
              </div>
            )}
          </div>
          {(clientErrors.bank_name || errors.bank_name) && (
            <p className={styles.errorMsg}>{clientErrors.bank_name || errors.bank_name[0]}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Số tài khoản <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="bank_account"
            value={formData.bank_account}
            onChange={handleChange}
            className={clientErrors.bank_account || errors.bank_account ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.bank_account || errors.bank_account) && (
            <p className={styles.errorMsg}>{clientErrors.bank_account || errors.bank_account[0]}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Chi nhánh <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="bank_branch"
            value={formData.bank_branch}
            onChange={handleChange}
            className={clientErrors.bank_branch || errors.bank_branch ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.bank_branch || errors.bank_branch) && (
            <p className={styles.errorMsg}>{clientErrors.bank_branch || errors.bank_branch[0]}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Số căn cước <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="identity_number"
            value={formData.identity_number}
            onChange={handleChange}
            className={clientErrors.identity_number || errors.identity_number ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.identity_number || errors.identity_number) && (
            <p className={styles.errorMsg}>{clientErrors.identity_number || errors.identity_number[0]}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Ngày cấp <span className={styles.required}>*</span></label>
          <input
            type="date"
            name="identity_issue_date"
            value={formData.identity_issue_date}
            onChange={handleChange}
            className={clientErrors.identity_issue_date || errors.identity_issue_date ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.identity_issue_date || errors.identity_issue_date) && (
            <p className={styles.errorMsg}>{clientErrors.identity_issue_date || errors.identity_issue_date[0]}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Nơi cấp <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="identity_issued_by"
            value={formData.identity_issued_by}
            onChange={handleChange}
            className={clientErrors.identity_issued_by || errors.identity_issued_by ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.identity_issued_by || errors.identity_issued_by) && (
            <p className={styles.errorMsg}>{clientErrors.identity_issued_by || errors.identity_issued_by[0]}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Ảnh căn cước mặt trước <span className={styles.required}>*</span></label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setIdCardFront(e.target.files[0]);
              setClientErrors({ ...clientErrors, id_card_front: "" });
              setErrors({ ...errors, id_card_front: null });
            }}
            className={clientErrors.id_card_front || errors.id_card_front ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.id_card_front || errors.id_card_front) && (
            <p className={styles.errorMsg}>{clientErrors.id_card_front || errors.id_card_front[0]}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Ảnh căn cước mặt sau <span className={styles.required}>*</span></label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setIdCardBack(e.target.files[0]);
              setClientErrors({ ...clientErrors, id_card_back: "" });
              setErrors({ ...errors, id_card_back: null });
            }}
            className={clientErrors.id_card_back || errors.id_card_back ? styles.inputError : ""}
            disabled={isLoading}
          />
          {(clientErrors.id_card_back || errors.id_card_back) && (
            <p className={styles.errorMsg}>{clientErrors.id_card_back || errors.id_card_back[0]}</p>
          )}
        </div>

        {accountType === "business" && (
          <>
            <div className={styles.formGroup}>
              <label>Tên tổ chức <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="organization_name"
                value={formData.organization_name || ""}
                onChange={handleChange}
                className={clientErrors.organization_name || errors.organization_name ? styles.inputError : ""}
                disabled={isLoading}
              />
              {(clientErrors.organization_name || errors.organization_name) && (
                <p className={styles.errorMsg}>{clientErrors.organization_name || errors.organization_name[0]}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Mã số thuế <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="tax_code"
                value={formData.tax_code || ""}
                onChange={handleChange}
                className={clientErrors.tax_code || errors.tax_code ? styles.inputError : ""}
                disabled={isLoading}
              />
              {(clientErrors.tax_code || errors.tax_code) && (
                <p className={styles.errorMsg}>{clientErrors.tax_code || errors.tax_code[0]}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Ngày cấp giấy chứng nhận <span className={styles.required}>*</span></label>
              <input
                type="date"
                name="business_license_issue_date"
                value={formData.business_license_issue_date || ""}
                onChange={handleChange}
                className={clientErrors.business_license_issue_date || errors.business_license_issue_date ? styles.inputError : ""}
                disabled={isLoading}
              />
              {(clientErrors.business_license_issue_date || errors.business_license_issue_date) && (
                <p className={styles.errorMsg}>{clientErrors.business_license_issue_date || errors.business_license_issue_date[0]}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Nơi cấp giấy chứng nhận <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="business_license_issued_by"
                value={formData.business_license_issued_by || ""}
                onChange={handleChange}
                className={clientErrors.business_license_issued_by || errors.business_license_issued_by ? styles.inputError : ""}
                disabled={isLoading}
              />
              {(clientErrors.business_license_issued_by || errors.business_license_issued_by) && (
                <p className={styles.errorMsg}>{clientErrors.business_license_issued_by || errors.business_license_issued_by[0]}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Giấy chứng nhận đăng ký kinh doanh <span className={styles.required}>*</span></label>
              <p className={styles.fileInstruction}>Chỉ chấp nhận file PDF hoặc Word (.pdf, .doc, .docx)</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const validExtensions = ['pdf', 'doc', 'docx'];
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    if (!validExtensions.includes(fileExtension)) {
                      setClientErrors({
                        ...clientErrors,
                        business_license: "Vui lòng tải lên file PDF hoặc Word (.pdf, .doc, .docx)."
                      });
                      setBusinessLicense(null);
                    } else {
                      setBusinessLicense(file);
                      setClientErrors({ ...clientErrors, business_license: "" });
                      setErrors({ ...errors, business_license: null });
                    }
                  }
                }}
                className={clientErrors.business_license || errors.business_license ? styles.inputError : ""}
                disabled={isLoading}
              />
              {(clientErrors.business_license || errors.business_license) && (
                <p className={styles.errorMsg}>{clientErrors.business_license || errors.business_license[0]}</p>
              )}
            </div>
          </>
        )}

        {accountType === "auction" && (
          <>
            <div className={styles.formGroup}>
              <label>Số chứng chỉ <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="certificate_number"
                value={formData.certificate_number || ""}
                onChange={handleChange}
                className={clientErrors.certificate_number || errors.certificate_number ? styles.inputError : ""}
                disabled={isLoading}
              />
              {(clientErrors.certificate_number || errors.certificate_number) && (
                <p className={styles.errorMsg}>{clientErrors.certificate_number || errors.certificate_number[0]}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Ngày cấp chứng chỉ <span className={styles.required}>*</span></label>
              <input
                type="date"
                name="certificate_issue_date"
                value={formData.certificate_issue_date || ""}
                onChange={handleChange}
                className={clientErrors.certificate_issue_date || errors.certificate_issue_date ? styles.inputError : ""}
                disabled={isLoading}
              />
              {(clientErrors.certificate_issue_date || errors.certificate_issue_date) && (
                <p className={styles.errorMsg}>{clientErrors.certificate_issue_date || errors.certificate_issue_date[0]}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Nơi cấp chứng chỉ <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="certificate_issued_by"
                value={formData.certificate_issued_by || ""}
                onChange={handleChange}
                className={clientErrors.certificate_issued_by || errors.certificate_issued_by ? styles.inputError : ""}
                disabled={isLoading}
              />
              {(clientErrors.certificate_issued_by || errors.certificate_issued_by) && (
                <p className={styles.errorMsg}>{clientErrors.certificate_issued_by || errors.certificate_issued_by[0]}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Ảnh thẻ đấu giá viên mặt trước <span className={styles.required}>*</span></label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setAuctioneerCardFront(e.target.files[0]);
                  setClientErrors({ ...clientErrors, auctioneer_card_front: "" });
                  setErrors({ ...errors, auctioneer_card_front: null });
                }}
                className={clientErrors.auctioneer_card_front || errors.auctioneer_card_front ? styles.inputError : ""}
                disabled={isLoading}
              />
              {(clientErrors.auctioneer_card_front || errors.auctioneer_card_front) && (
                <p className={styles.errorMsg}>{clientErrors.auctioneer_card_front || errors.auctioneer_card_front[0]}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Ảnh thẻ đấu giá viên mặt sau <span className={styles.required}>*</span></label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setAuctioneerCardBack(e.target.files[0]);
                  setClientErrors({ ...clientErrors, auctioneer_card_back: "" });
                  setErrors({ ...errors, auctioneer_card_back: null });
                }}
                className={clientErrors.auctioneer_card_back || errors.auctioneer_card_back ? styles.inputError : ""}
                disabled={isLoading}
              />
              {(clientErrors.auctioneer_card_back || errors.auctioneer_card_back) && (
                <p className={styles.errorMsg}>{clientErrors.auctioneer_card_back || errors.auctioneer_card_back[0]}</p>
              )}
            </div>
          </>
        )}

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