import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  getRoles,
  listUsers,
  registerUser,
  updateUserAdmin,
  deleteUser as deleteUserService,
  approveUser as approveUserService,
  rejectUser as rejectUserService,
  lockUser as lockUserService,
  unlockUser as unlockUserService,
  exportUsersExcel as exportUsersExcelService,
  exportUserPDF as exportUserPDFService,
  exportUserExcel as exportUserExcelService,
} from '../../services/userService';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './Users.module.css';
import Loading from '../../components/Loading';

const API_URL = `${process.env.REACT_APP_BASE_URL}`;

function Users() {
  // === STATE CƠ BẢN ===
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);

  // === LOẠI TÀI KHOẢN ===
  const [accountType, setAccountType] = useState('personal');

  // === FORM STATE ===
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: '',
    address: '',
    password: '',
    password_confirmation: '',
    bank_name: '',
    bank_account: '',
    bank_branch: '',
    identity_number: '',
    identity_issue_date: '',
    identity_issued_by: '',
    role_id: '',
    // Business
    position: '',
    organization_name: '',
    tax_code: '',
    business_license_issue_date: '',
    business_license_issued_by: '',
    // Auction
    online_contact_method: '',
    certificate_number: '',
    certificate_issue_date: '',
    certificate_issued_by: '',
  });

  // === FILE STATE ===
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [businessLicense, setBusinessLicense] = useState(null);
  const [auctioneerCardFront, setAuctioneerCardFront] = useState(null);
  const [auctioneerCardBack, setAuctioneerCardBack] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({
    id_card_front: null,
    id_card_back: null,
    business_license: null,
    auctioneer_card_front: null,
    auctioneer_card_back: null,
  });
  const [imageErrors, setImageErrors] = useState({
    id_card_front: false,
    id_card_back: false,
    business_license: false,
    auctioneer_card_front: false,
    auctioneer_card_back: false,
  });

  // === DATA & LOADING ===
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  // === FORM UX ===
  const [clientErrors, setClientErrors] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(10);

  // === DROPDOWN NGÂN HÀNG ===
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [searchBank, setSearchBank] = useState("");
  const dropdownRef = useRef(null);

  // === GENDER DROPDOWN ===
  const [openGenderDropdown, setOpenGenderDropdown] = useState(false);
  const genderDropdownRef = useRef(null);

  const itemsPerPage = 5;
  const token = localStorage.getItem('token');

  const roleToAccountTypeMap = {
    1: 'personal',
    5: 'auction', 
    9: 'business',
  };

  // === UTILS ===
  const formatDate = (isoDate) => {
    if (!isoDate || isoDate === 'Chưa cập nhật') return 'Chưa cập nhật';
    const date = new Date(isoDate);
    return isNaN(date) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN');
  };

  const formatDateForInput = (dateString) => {
    if (!dateString || dateString === 'Chưa cập nhật') return '';
    try {
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      const date = new Date(dateString);
      return !isNaN(date) ? date.toISOString().split('T')[0] : '';
    } catch {
      return '';
    }
  };

  const createPreviewUrl = (file) => file ? URL.createObjectURL(file) : null;

  const handleFileChange = (file, setFile, previewKey) => {
    setFile(file);
    setPreviewUrls(prev => ({ ...prev, [previewKey]: createPreviewUrl(file) }));
    setClientErrors(prev => ({ ...prev, [previewKey]: '' }));
    setImageErrors(prev => ({ ...prev, [previewKey]: false }));
  };

  // === FETCH DATA ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rolesRes, usersRes] = await Promise.all([getRoles(), listUsers()]);
        
        const rolesData = rolesRes?.roles || rolesRes?.data?.roles || [];
        setRoles(Array.isArray(rolesData) ? rolesData : []);

        const usersData = usersRes?.users || usersRes?.data?.users || [];
        const mappedUsers = Array.isArray(usersData)
          ? usersData.map(user => {
              const id_card_front_url = user.id_card_front ? `${API_URL}/storage/${user.id_card_front}` : '';
              const id_card_back_url = user.id_card_back ? `${API_URL}/storage/${user.id_card_back}` : '';
              const business_license_url = user.business_license ? `${API_URL}/storage/${user.business_license}` : undefined;
              const auctioneer_card_front_url = user.auctioneer_card_front ? `${API_URL}/storage/${user.auctioneer_card_front}` : undefined;
              const auctioneer_card_back_url = user.auctioneer_card_back ? `${API_URL}/storage/${user.auctioneer_card_back}` : undefined;

              return {
                id: user.user_id,
                name: user.full_name || 'Chưa cập nhật',
                email: user.email || 'Chưa cập nhật',
                phone: user.phone || 'Chưa cập nhật',
                role_id: user.role_id || null,
                role_name: user.role?.name || 'Chưa có vai trò',
                email_verify: user.email_verified_at ? 'Đã xác minh' : 'Chưa xác minh',
                admin_verify: user.admin_verify_status === 'approved'
                  ? 'Đã xét duyệt'
                  : user.admin_verify_status === 'rejected'
                  ? 'Bị từ chối'
                  : 'Chờ xét duyệt',
                createdDate: formatDate(user.created_at),
                deletedAt: user.deleted_at || null,
                accountType: user.account_type || roleToAccountTypeMap[user.role_id] || 'personal',
                full_name: user.full_name || 'Chưa cập nhật',
                birth_date: formatDate(user.birth_date),
                gender: user.gender || 'Chưa cập nhật',
                address: user.address || 'Chưa cập nhật',
                bank_name: user.bank_name || 'Chưa cập nhật',
                bank_account: user.bank_account || 'Chưa cập nhật',
                bank_branch: user.bank_branch || 'Chưa cập nhật',
                identity_number: user.identity_number || 'Chưa cập nhật',
                identity_issue_date: formatDate(user.identity_issue_date),
                identity_issued_by: user.identity_issued_by || 'Chưa cập nhật',
                position: user.position || undefined,
                organization_name: user.organization_name || undefined,
                tax_code: user.tax_code || undefined,
                business_license_issue_date: formatDate(user.business_license_issue_date),
                business_license_issued_by: user.business_license_issued_by || undefined,
                online_contact_method: user.online_contact_method || undefined,
                certificate_number: user.certificate_number || undefined,
                certificate_issue_date: formatDate(user.certificate_issue_date),
                certificate_issued_by: user.certificate_issued_by || undefined,
                id_card_front_url,
                id_card_back_url,
                business_license_url,
                auctioneer_card_front_url,
                auctioneer_card_back_url,
                is_locked: user.is_locked,
                locked_at: user.locked_at,
              };
            })
          : [];

        setUsers(mappedUsers);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể lấy dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // === FETCH BANKS ===
  useEffect(() => {
    fetch("https://api.vietqr.io/v2/banks")
      .then(res => res.json())
      .then(data => data.code === "00" && data.data && setBanks(data.data))
      .catch(console.error)
      .finally(() => setBanksLoading(false));
  }, []);

  // === COUNTDOWN ===
  useEffect(() => {
    if (successMsg && countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    if (countdown === 0) {
      window.location.reload();
    }
  }, [successMsg, countdown]);

  // === CLEANUP URLS ===
  useEffect(() => {
    return () => Object.values(previewUrls).forEach(url => url && URL.revokeObjectURL(url));
  }, [previewUrls]);

  // === OUTSIDE CLICK ===
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsBankDropdownOpen(false);
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(e.target)) setOpenGenderDropdown(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchBank.toLowerCase()) ||
    bank.shortName.toLowerCase().includes(searchBank.toLowerCase())
  );

  // === FILTER & PAGINATION ===
  const applyFilters = () => {
    const validUsers = Array.isArray(users) ? users : [];
    return validUsers.filter(user => {
      const searchMatch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = !roleFilter || user.role_id === parseInt(roleFilter);
      return searchMatch && roleMatch;
    });
  };

  const filteredUsers = applyFilters();
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  // === PAGINATION RENDER ===
  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);
    if (endPage - startPage + 1 < 3 && startPage > 1) {
      startPage = Math.max(1, endPage - 2);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.paginationBtn} ${currentPage === i ? styles.paginationBtnActive : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // === MODAL OPEN/CLOSE ===
  const openUserModal = (mode, user = null) => {
    setModalMode(mode);
    setFormError(null);
    setClientErrors({});
    setErrors({});
    setSuccessMsg("");
    setCountdown(10);
    setIsLoading(false);
    setSearchBank("");
    setIsBankDropdownOpen(false);
    setOpenGenderDropdown(false);

    setIdCardFront(null); setIdCardBack(null); setBusinessLicense(null); 
    setAuctioneerCardFront(null); setAuctioneerCardBack(null);
    setPreviewUrls({
      id_card_front: null,
      id_card_back: null,
      business_license: null,
      auctioneer_card_front: null,
      auctioneer_card_back: null,
    });
    setImageErrors({
      id_card_front: false,
      id_card_back: false,
      business_license: false,
      auctioneer_card_front: false,
      auctioneer_card_back: false,
    });

    if (user) {
      const type = user.accountType || 'personal';
      setAccountType(type);
      setUserForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        birth_date: user.birth_date && user.birth_date !== 'Chưa cập nhật' ? formatDateForInput(user.birth_date) : '',
        gender: user.gender || '',
        address: user.address || '',
        password: '',
        password_confirmation: '',
        bank_name: user.bank_name || '',
        bank_account: user.bank_account || '',
        bank_branch: user.bank_branch || '',
        identity_number: user.identity_number || '',
        identity_issue_date: user.identity_issue_date && user.identity_issue_date !== 'Chưa cập nhật' ? formatDateForInput(user.identity_issue_date) : '',
        identity_issued_by: user.identity_issued_by || '',
        role_id: user.role_id || '',
        position: type === 'business' ? (user.position || '') : '',
        organization_name: type === 'business' ? (user.organization_name || '') : '',
        tax_code: type === 'business' ? (user.tax_code || '') : '',
        business_license_issue_date: type === 'business' && user.business_license_issue_date && user.business_license_issue_date !== 'Chưa cập nhật' ? formatDateForInput(user.business_license_issue_date) : '',
        business_license_issued_by: type === 'business' ? (user.business_license_issued_by || '') : '',
        online_contact_method: type === 'auction' ? (user.online_contact_method || '') : '',
        certificate_number: type === 'auction' ? (user.certificate_number || '') : '',
        certificate_issue_date: type === 'auction' && user.certificate_issue_date && user.certificate_issue_date !== 'Chưa cập nhật' ? formatDateForInput(user.certificate_issue_date) : '',
        certificate_issued_by: type === 'auction' ? (user.certificate_issued_by || '') : '',
      });
      setSelectedUser(user);
    } else {
      setAccountType('personal');
      const defaultRoleId = roles.length > 0 ? roles[0].role_id : '';
      setUserForm({
        full_name: '', email: '', phone: '', birth_date: '', gender: '', address: '',
        password: '', password_confirmation: '',
        bank_name: '', bank_account: '', bank_branch: '',
        identity_number: '', identity_issue_date: '', identity_issued_by: '',
        role_id: defaultRoleId,
        position: '', organization_name: '', tax_code: '', business_license_issue_date: '', business_license_issued_by: '',
        online_contact_method: '', certificate_number: '', certificate_issue_date: '', certificate_issued_by: '',
      });
    }
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setFormError(null);
    setClientErrors({});
    Object.values(previewUrls).forEach(url => url && URL.revokeObjectURL(url));
    setPreviewUrls({
      id_card_front: null,
      id_card_back: null,
      business_license: null,
      auctioneer_card_front: null,
      auctioneer_card_back: null,
    });
    setImageErrors({
      id_card_front: false,
      id_card_back: false,
      business_license: false,
      auctioneer_card_front: false,
      auctioneer_card_back: false,
    });
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setImageErrors({
      id_card_front: false,
      id_card_back: false,
      business_license: false,
      auctioneer_card_front: false,
      auctioneer_card_back: false,
    });
  };

  // === HANDLE CHANGE ===
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
    setClientErrors(prev => ({ ...prev, [name]: '' }));
    setErrors({});
  };

  const handleBankSelect = (bank) => {
    setUserForm(prev => ({ ...prev, bank_name: bank.name }));
    setSearchBank("");
    setIsBankDropdownOpen(false);
    setClientErrors(prev => ({ ...prev, bank_name: "" }));
  };

  const handleGenderSelect = (value) => {
    setUserForm(prev => ({ ...prev, gender: value }));
    setOpenGenderDropdown(false);
    setClientErrors(prev => ({ ...prev, gender: "" }));
  };

  // === VALIDATE ===
  const validateForm = () => {
    const newErrors = {};
    const isAdd = modalMode === 'add';

    if (!userForm.full_name?.trim()) newErrors.full_name = "Vui lòng nhập họ và tên.";
    if (!userForm.email?.trim()) newErrors.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(userForm.email)) newErrors.email = "Email không hợp lệ.";
    if (isAdd && !userForm.phone?.trim()) newErrors.phone = "Vui lòng nhập số điện thoại.";
    if (isAdd && !userForm.birth_date?.trim()) newErrors.birth_date = "Vui lòng nhập ngày sinh.";
    if (!userForm.gender?.trim()) newErrors.gender = "Vui lòng chọn giới tính.";
    if (isAdd && !userForm.address?.trim()) newErrors.address = "Vui lòng nhập địa chỉ.";
    if (isAdd && !userForm.password?.trim()) newErrors.password = "Vui lòng nhập mật khẩu.";
    else if (isAdd && userForm.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    if (isAdd && !userForm.password_confirmation?.trim()) newErrors.password_confirmation = "Vui lòng nhập lại mật khẩu.";
    else if (isAdd && userForm.password !== userForm.password_confirmation) newErrors.password_confirmation = "Mật khẩu nhập lại không khớp.";
    if (isAdd && !userForm.bank_name?.trim()) newErrors.bank_name = "Vui lòng chọn ngân hàng.";
    if (isAdd && !userForm.bank_account?.trim()) newErrors.bank_account = "Vui lòng nhập số tài khoản.";
    if (isAdd && !userForm.bank_branch?.trim()) newErrors.bank_branch = "Vui lòng nhập chi nhánh.";
    if (!userForm.identity_number?.trim()) newErrors.identity_number = "Vui lòng nhập số căn cước.";
    if (!userForm.identity_issue_date?.trim()) newErrors.identity_issue_date = "Vui lòng nhập ngày cấp.";
    if (!userForm.identity_issued_by?.trim()) newErrors.identity_issued_by = "Vui lòng nhập nơi cấp.";

    if ((isAdd || !selectedUser?.id_card_front_url) && !idCardFront) newErrors.id_card_front = "Vui lòng tải lên ảnh căn cước mặt trước.";
    if ((isAdd || !selectedUser?.id_card_back_url) && !idCardBack) newErrors.id_card_back = "Vui lòng tải lên ảnh căn cước mặt sau.";

    if (accountType === 'business') {
      if (isAdd && !userForm.position?.trim()) newErrors.position = "Vui lòng nhập chức vụ.";
      if (isAdd && !userForm.organization_name?.trim()) newErrors.organization_name = "Vui lòng nhập tên tổ chức.";
      if (isAdd && !userForm.tax_code?.trim()) newErrors.tax_code = "Vui lòng nhập mã số thuế.";
      if (isAdd && !userForm.business_license_issue_date?.trim()) newErrors.business_license_issue_date = "Vui lòng nhập ngày cấp.";
      if (isAdd && !userForm.business_license_issued_by?.trim()) newErrors.business_license_issued_by = "Vui lòng nhập nơi cấp.";
    }
    if ((isAdd || !selectedUser?.business_license_url) && accountType === 'business' && !businessLicense) {
      newErrors.business_license = "Vui lòng tải lên giấy chứng nhận.";
    }

    if (accountType === 'auction') {
      if (isAdd && !userForm.online_contact_method?.trim()) newErrors.online_contact_method = "Vui lòng nhập phương thức liên hệ.";
      if (isAdd && !userForm.certificate_number?.trim()) newErrors.certificate_number = "Vui lòng nhập số chứng chỉ.";
      if (isAdd && !userForm.certificate_issue_date?.trim()) newErrors.certificate_issue_date = "Vui lòng nhập ngày cấp.";
      if (isAdd && !userForm.certificate_issued_by?.trim()) newErrors.certificate_issued_by = "Vui lòng nhập nơi cấp.";
    }
    if ((isAdd || !selectedUser?.auctioneer_card_front_url) && accountType === 'auction' && !auctioneerCardFront) newErrors.auctioneer_card_front = "Vui lòng tải lên ảnh mặt trước.";
    if ((isAdd || !selectedUser?.auctioneer_card_back_url) && accountType === 'auction' && !auctioneerCardBack) newErrors.auctioneer_card_back = "Vui lòng tải lên ảnh mặt sau.";

    setClientErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === SAVE USER ===
  const handleSaveUser = async () => {
    setErrors({});
    setFormError(null);
    setSuccessMsg("");
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    const fields = ['full_name', 'email', 'phone', 'birth_date', 'gender', 'address', 'bank_name', 'bank_account', 'bank_branch', 'identity_number', 'identity_issue_date', 'identity_issued_by'];
    fields.forEach(f => userForm[f] && data.append(f, userForm[f]));
    
    if (idCardFront) data.append('id_card_front', idCardFront);
    if (idCardBack) data.append('id_card_back', idCardBack);
    data.append('account_type', accountType);

    if (accountType === 'business') {
      ['position', 'organization_name', 'tax_code', 'business_license_issue_date', 'business_license_issued_by'].forEach(f => userForm[f] && data.append(f, userForm[f]));
      if (businessLicense) data.append('business_license', businessLicense);
    }
    if (accountType === 'auction') {
      ['online_contact_method', 'certificate_number', 'certificate_issue_date', 'certificate_issued_by'].forEach(f => userForm[f] && data.append(f, userForm[f]));
      if (auctioneerCardFront) data.append('auctioneer_card_front', auctioneerCardFront);
      if (auctioneerCardBack) data.append('auctioneer_card_back', auctioneerCardBack);
    }

    if (modalMode === 'add') {
      data.append('password', userForm.password);
      data.append('password_confirmation', userForm.password_confirmation);
      data.append('role_id', userForm.role_id);
    } else {
      data.append('_method', 'PUT');
      data.append('role_id', userForm.role_id);
    }

    try {
      const response = modalMode === 'add' 
        ? await registerUser(data)
        : await updateUserAdmin(selectedUser.id, data);

      if (response.data?.status) {
        setSuccessMsg(`Thành công! Tải lại trang sau ${countdown} giây...`);
        
        // Refresh user list without reloading page
        const usersResponse = await listUsers();
        const usersData = usersResponse?.users || usersResponse?.data?.users || [];
        const mappedUsers = Array.isArray(usersData)
          ? usersData.map(user => ({
              id: user.user_id,
              name: user.full_name || 'Chưa cập nhật',
              email: user.email || 'Chưa cập nhật',
              phone: user.phone || 'Chưa cập nhật',
              role_id: user.role_id || null,
              role_name: user.role?.name || 'Chưa có vai trò',
              email_verify: user.email_verified_at ? 'Đã xác minh' : 'Chưa xác minh',
              admin_verify: user.admin_verify_status === 'approved'
                ? 'Đã xét duyệt'
                : user.admin_verify_status === 'rejected'
                ? 'Bị từ chối'
                : 'Chờ xét duyệt',
              createdDate: formatDate(user.created_at),
              accountType: user.account_type || roleToAccountTypeMap[user.role_id] || 'personal',
              full_name: user.full_name || 'Chưa cập nhật',
              birth_date: formatDate(user.birth_date),
              gender: user.gender || 'Chưa cập nhật',
              address: user.address || 'Chưa cập nhật',
              bank_name: user.bank_name || 'Chưa cập nhật',
              bank_account: user.bank_account || 'Chưa cập nhật',
              bank_branch: user.bank_branch || 'Chưa cập nhật',
              identity_number: user.identity_number || 'Chưa cập nhật',
              identity_issue_date: formatDate(user.identity_issue_date),
              identity_issued_by: user.identity_issued_by || 'Chưa cập nhật',
              position: user.position || undefined,
              organization_name: user.organization_name || undefined,
              tax_code: user.tax_code || undefined,
              business_license_issue_date: formatDate(user.business_license_issue_date),
              business_license_issued_by: user.business_license_issued_by || undefined,
              online_contact_method: user.online_contact_method || undefined,
              certificate_number: user.certificate_number || undefined,
              certificate_issue_date: formatDate(user.certificate_issue_date),
              certificate_issued_by: user.certificate_issued_by || undefined,
              id_card_front_url: user.id_card_front ? `${API_URL}/storage/${user.id_card_front}` : '',
              id_card_back_url: user.id_card_back ? `${API_URL}/storage/${user.id_card_back}` : '',
              business_license_url: user.business_license ? `${API_URL}/storage/${user.business_license}` : undefined,
              auctioneer_card_front_url: user.auctioneer_card_front ? `${API_URL}/storage/${user.auctioneer_card_front}` : undefined,
              auctioneer_card_back_url: user.auctioneer_card_back ? `${API_URL}/storage/${user.auctioneer_card_back}` : undefined,
              is_locked: user.is_locked,
            }))
          : [];

        setUsers(mappedUsers);
        
        // Close modal after successful save
        setTimeout(() => {
          closeUserModal();
        }, 2000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi lưu người dùng');
      setErrors(err.response?.data?.errors || {});
    } finally {
      setIsLoading(false);
    }
  };

  // === USER ACTIONS ===
  const handleDeleteUser = async (user) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        const response = await deleteUserService(user.id);
        if (response.data?.status) {
          setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
        }
      } catch (err) {
        setFormError(err.response?.data?.message || 'Lỗi khi xóa người dùng');
      }
    }
  };

  const handleApproveUser = async (user) => {
    try {
      const response = await approveUserService(user.id);
      if (response.data?.status) {
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.id === user.id
              ? { ...u, admin_verify: 'Đã xét duyệt', admin_verify_status: 'approved' }
              : u
          )
        );
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi duyệt người dùng');
    }
  };

  const handleRejectUser = async (user) => {
    try {
      const response = await rejectUserService(user.id);
      if (response.data?.status) {
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.id === user.id
              ? { ...u, admin_verify: 'Bị từ chối', admin_verify_status: 'rejected' }
              : u
          )
        );
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi từ chối người dùng');
    }
  };

  const handleLockUser = async (user) => {
    if (window.confirm(`Bạn có chắc muốn khóa tài khoản ${user.name}?`)) {
      try {
        const response = await lockUserService(user.id);
        if (response.data?.status) {
          setUsers(prevUsers =>
            prevUsers.map(u =>
              u.id === user.id
                ? { ...u, is_locked: 1 }
                : u
            )
          );
        }
      } catch (err) {
        setFormError(err.response?.data?.message || 'Lỗi khi khóa tài khoản');
      }
    }
  };

  const handleUnlockUser = async (user) => {
    if (window.confirm(`Bạn có chắc muốn mở khóa tài khoản ${user.name}?`)) {
      try {
        const response = await unlockUserService(user.id);
        if (response.data?.status) {
          setUsers(prevUsers =>
            prevUsers.map(u =>
              u.id === user.id
                ? { ...u, is_locked: null }
                : u
            )
          );
        }
      } catch (err) {
        setFormError(err.response?.data?.message || 'Lỗi khi mở khóa tài khoản');
      }
    }
  };

  const handleExportAllUsersExcel = async () => {
    try {
      const blob = await exportUsersExcelService();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi xuất file Excel');
    }
  };

  const handleExportUserPDF = async (userId) => {
    try {
      const blob = await exportUserPDFService(userId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_${userId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi xuất file PDF');
    }
  };

  const handleExportUserExcel = async (userId) => {
    try {
      const blob = await exportUserExcelService(userId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_${userId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi xuất file Excel');
    }
  };

  // === RENDER IMAGE ===
  const renderImage = (url, type, errorKey) => {
    if (!url || imageErrors[errorKey]) {
      return (
        <div className={styles.placeholder}>
          <p>Chưa cập nhật hoặc không thể tải ảnh</p>
        </div>
      );
    }
    return (
      <img
        src={url}
        alt={type}
        className={styles.fixedImage}
        onError={() => setImageErrors(prev => ({ ...prev, [errorKey]: true }))}
      />
    );
  };

  // === RENDER ===
  if (loading) return <div className={styles.mainContent}><Loading message="Đang tải dữ liệu..." /></div>;
  if (error) return <div className={`${styles.mainContent} text-red-600`}>Lỗi: {error}</div>;

  return (
    <div className={styles.mainContent}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <h1 className={styles.pageTitle}>Quản Lý Người Dùng</h1>
      <p className={styles.pageSubtitle}>Quản lý tài khoản và quyền hạn người dùng hệ thống</p>

      {/* ACTIONS BAR */}
      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            {roles.map(role => (
              <option key={role.role_id} value={role.role_id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.actionButtons}>
          <button
            className={`${styles.addBtn} ${styles.exportBtn}`}
            onClick={handleExportAllUsersExcel}
            aria-label="Xuất Excel tất cả người dùng"
          >
            <i className="fas fa-file-excel"></i>
            Xuất Excel tất cả người dùng
          </button>
          <button
            className={styles.addBtn}
            onClick={() => openUserModal('add')}
            aria-label="Thêm người dùng mới"
          >
            <i className="fas fa-plus"></i>
            Thêm người dùng mới
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className={styles.dataTable}>
        <table className="w-full" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className={styles.dataTableCell}>ID</th>
              <th className={styles.dataTableCell}>Họ và tên</th>
              <th className={styles.dataTableCell}>Email</th>
              <th className={styles.dataTableCell}>Số điện thoại</th>
              <th className={styles.dataTableCell}>Vai trò</th>
              <th className={styles.dataTableCell}>Xác minh email</th>
              <th className={styles.dataTableCell}>Xét duyệt</th>
              <th className={styles.dataTableCell}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id} className={styles.dataTableCell}>
                <td className={styles.dataTableCell} data-label="ID">{user.id}</td>
                <td className={styles.dataTableCell} data-label="Họ và tên">{user.name}</td>
                <td className={styles.dataTableCell} data-label="Email">{user.email}</td>
                <td className={styles.dataTableCell} data-label="Số điện thoại">{user.phone}</td>
                <td className={styles.dataTableCell} data-label="Vai trò">
                  <span className={`${styles.statusBadge} ${styles.roleUser}`}>
                    {user.role_name}
                  </span>
                </td>
                <td className={styles.dataTableCell} data-label="Xác minh email">{user.email_verify}</td>
                <td className={styles.dataTableCell} data-label="Xét duyệt">{user.admin_verify}</td>
                <td className={styles.dataTableCell} data-label="Thao tác">
                  <div className="flex gap-2">
                    {user.admin_verify === 'Chờ xét duyệt' ? (
                      <>
                        <button
                          className={`${styles.btnSuccess} bg-green-600 hover:bg-green-700`}
                          onClick={() => handleApproveUser(user)}
                          aria-label="Duyệt người dùng"
                        > 
                          <i className="fa fa-check"></i>
                        </button>
                        <button
                          className={`${styles.btnDanger} bg-red-600 hover:bg-red-700`}
                          onClick={() => handleRejectUser(user)}
                          aria-label="Từ chối người dùng"
                        >
                          <i className="fa fa-times"></i>
                        </button>
                        <button
                          className={styles.btnSuccess}
                          onClick={() => openViewModal(user)}
                          aria-label="Xem chi tiết người dùng"
                        >
                          <i className="fa fa-eye"></i>
                        </button>
                        <button
                          className={styles.btnSuccess}
                          onClick={() => handleExportUserPDF(user.id)}
                          aria-label="Xuất PDF người dùng"
                        >
                          <i className="fa fa-file-pdf"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={styles.btnPrimary}
                          onClick={() => openUserModal('edit', user)}
                          aria-label="Chỉnh sửa người dùng"
                        >
                          <i className="fa fa-pencil"></i>
                        </button>
                        
                        {user.is_locked ? (
                          <button
                            className={styles.btnSuccess}
                            onClick={() => handleUnlockUser(user)}
                            aria-label="Mở khóa tài khoản"
                          >
                            <i className="fa fa-unlock"></i>
                          </button>
                        ) : (
                          <button
                            className={styles.btnWarning}
                            onClick={() => handleLockUser(user)}
                            aria-label="Khóa tài khoản"
                          >
                            <i className="fa fa-lock"></i>
                          </button>
                        )}
                        
                        <button
                          className={styles.btnSuccess}
                          onClick={() => openViewModal(user)}
                          aria-label="Xem chi tiết người dùng"
                        >
                          <i className="fa fa-eye"></i>
                        </button>
                        <button
                          className={styles.btnSuccess}
                          onClick={() => handleExportUserPDF(user.id)}
                          aria-label="Xuất PDF người dùng"
                        >
                          <i className="fa fa-file-pdf"></i>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className={styles.pagination}>{renderPagination()}</div>

      {/* MODAL THÊM/CHỈNH SỬA NGƯỜI DÙNG */}
      {showUserModal && (
        <div className={styles.modalOverlay} onClick={closeUserModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h2>
              <button className={styles.modalClose} onClick={closeUserModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className={styles.errorMsg}>{formError}</div>}
              {successMsg && <div className={styles.successMsg}>{successMsg}</div>}

              {/* CHỈ HIỂN THỊ CHỌN LOẠI TÀI KHOẢN KHI THÊM MỚI */}
              {modalMode === 'add' && (
                <div className={styles.accountTypeSelector}>
                  <label className={styles.sectionLabel}>Loại tài khoản:</label>
                  <div className={styles.typeButtons}>
                    {['personal', 'business', 'auction'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAccountType(type)}
                        className={`${styles.typeButton} ${accountType === type ? styles.typeButtonActive : ''}`}
                      >
                        {type === 'personal' ? 'Cá nhân' : type === 'business' ? 'Doanh nghiệp' : 'Đấu giá viên'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }} className={styles.modalForm}>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Họ và tên <span className={styles.required}>*</span></label>
                    <input 
                      type="text" 
                      name="full_name" 
                      value={userForm.full_name} 
                      onChange={handleFormChange}
                      className={`${styles.formInput} ${(clientErrors.full_name || errors.full_name) ? styles.inputError : ''}`} 
                      disabled={isLoading} 
                    />
                    {(clientErrors.full_name || errors.full_name) && <p className={styles.errorText}>{clientErrors.full_name || errors.full_name[0]}</p>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email <span className={styles.required}>*</span></label>
                    <input 
                      type="email" 
                      name="email" 
                      value={userForm.email} 
                      onChange={handleFormChange}
                      className={`${styles.formInput} ${(clientErrors.email || errors.email) ? styles.inputError : ''}`} 
                      disabled={isLoading} 
                    />
                    {(clientErrors.email || errors.email) && <p className={styles.errorText}>{clientErrors.email || errors.email[0]}</p>}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số điện thoại {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={userForm.phone} 
                      onChange={handleFormChange}
                      className={`${styles.formInput} ${(clientErrors.phone || errors.phone) ? styles.inputError : ''}`} 
                      disabled={isLoading} 
                    />
                    {(clientErrors.phone || errors.phone) && <p className={styles.errorText}>{clientErrors.phone || errors.phone[0]}</p>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ngày sinh {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                    <input 
                      type="date" 
                      name="birth_date" 
                      value={userForm.birth_date} 
                      onChange={handleFormChange}
                      className={`${styles.formInput} ${(clientErrors.birth_date || errors.birth_date) ? styles.inputError : ''}`} 
                      disabled={isLoading} 
                    />
                    {(clientErrors.birth_date || errors.birth_date) && <p className={styles.errorText}>{clientErrors.birth_date || errors.birth_date[0]}</p>}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Giới tính <span className={styles.required}>*</span></label>
                    <div className={styles.customDropdown} ref={genderDropdownRef}>
                      <div 
                        className={`${styles.dropdownHeader} ${(clientErrors.gender || errors.gender) ? styles.inputError : ''}`}
                        onClick={() => !isLoading && setOpenGenderDropdown(prev => !prev)}
                      >
                        <span className={userForm.gender ? styles.selectedValue : styles.placeholder}>
                          {userForm.gender === 'male' ? 'Nam' : userForm.gender === 'female' ? 'Nữ' : userForm.gender === 'other' ? 'Khác' : 'Chọn giới tính'}
                        </span>
                        <span className={styles.dropdownArrow}>{openGenderDropdown ? '▲' : '▼'}</span>
                      </div>
                      {openGenderDropdown && (
                        <div className={styles.dropdownList}>
                          {['male', 'female', 'other'].map(g => (
                            <div key={g} className={styles.dropdownOption} onClick={() => handleGenderSelect(g)}>
                              {g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {(clientErrors.gender || errors.gender) && <p className={styles.errorText}>{clientErrors.gender || errors.gender[0]}</p>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Vai trò <span className={styles.required}>*</span></label>
                    <select
                      name="role_id"
                      value={userForm.role_id}
                      onChange={handleFormChange}
                      className={`${styles.formInput} ${(clientErrors.role_id || errors.role_id) ? styles.inputError : ''}`}
                      disabled={isLoading}
                    >
                      <option value="">-- Chọn vai trò --</option>
                      {roles.map(role => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    {(clientErrors.role_id || errors.role_id) && <p className={styles.errorText}>{clientErrors.role_id || errors.role_id[0]}</p>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Địa chỉ {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={userForm.address} 
                    onChange={handleFormChange}
                    className={`${styles.formInput} ${(clientErrors.address || errors.address) ? styles.inputError : ''}`} 
                    disabled={isLoading} 
                  />
                  {(clientErrors.address || errors.address) && <p className={styles.errorText}>{clientErrors.address || errors.address[0]}</p>}
                </div>

                {modalMode === 'add' && (
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Mật khẩu <span className={styles.required}>*</span></label>
                      <input 
                        type="password" 
                        name="password" 
                        value={userForm.password} 
                        onChange={handleFormChange}
                        className={`${styles.formInput} ${(clientErrors.password || errors.password) ? styles.inputError : ''}`} 
                        disabled={isLoading} 
                      />
                      {(clientErrors.password || errors.password) && <p className={styles.errorText}>{clientErrors.password || errors.password[0]}</p>}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Xác nhận mật khẩu <span className={styles.required}>*</span></label>
                      <input 
                        type="password" 
                        name="password_confirmation" 
                        value={userForm.password_confirmation} 
                        onChange={handleFormChange}
                        className={`${styles.formInput} ${(clientErrors.password_confirmation || errors.password_confirmation) ? styles.inputError : ''}`} 
                        disabled={isLoading} 
                      />
                      {(clientErrors.password_confirmation || errors.password_confirmation) && <p className={styles.errorText}>{clientErrors.password_confirmation || errors.password_confirmation[0]}</p>}
                    </div>
                  </div>
                )}

                {/* NGÂN HÀNG */}
                <div className={styles.sectionDivider}>
                  <h3 className={styles.sectionTitle}>Thông tin ngân hàng</h3>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ngân hàng {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                  <div className={styles.customDropdown} ref={dropdownRef}>
                    <div 
                      className={`${styles.dropdownHeader} ${(clientErrors.bank_name || errors.bank_name) ? styles.inputError : ''}`}
                      onClick={() => !isLoading && setIsBankDropdownOpen(prev => !prev)}
                    >
                      <span className={userForm.bank_name ? styles.selectedValue : styles.placeholder}>
                        {userForm.bank_name || "Chọn ngân hàng"}
                      </span>
                      <span className={styles.dropdownArrow}>{isBankDropdownOpen ? '▲' : '▼'}</span>
                    </div>
                    {isBankDropdownOpen && (
                      <div className={styles.dropdownList}>
                        <input 
                          type="text" 
                          placeholder="Tìm kiếm..." 
                          value={searchBank} 
                          onChange={e => setSearchBank(e.target.value)} 
                          className={styles.searchInput} 
                          autoFocus 
                        />
                        <div className={styles.dropdownOptions}>
                          {banksLoading ? (
                            <div className={styles.loadingText}>Đang tải...</div>
                          ) : (
                            filteredBanks.map(bank => (
                              <div key={bank.id} className={styles.dropdownOption} onClick={() => handleBankSelect(bank)}>
                                {bank.name} ({bank.shortName})
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {(clientErrors.bank_name || errors.bank_name) && <p className={styles.errorText}>{clientErrors.bank_name || errors.bank_name[0]}</p>}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số tài khoản {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                    <input 
                      type="text" 
                      name="bank_account" 
                      value={userForm.bank_account} 
                      onChange={handleFormChange}
                      className={`${styles.formInput} ${(clientErrors.bank_account || errors.bank_account) ? styles.inputError : ''}`} 
                      disabled={isLoading} 
                    />
                    {(clientErrors.bank_account || errors.bank_account) && <p className={styles.errorText}>{clientErrors.bank_account || errors.bank_account[0]}</p>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Chi nhánh {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                    <input 
                      type="text" 
                      name="bank_branch" 
                      value={userForm.bank_branch} 
                      onChange={handleFormChange}
                      className={`${styles.formInput} ${(clientErrors.bank_branch || errors.bank_branch) ? styles.inputError : ''}`} 
                      disabled={isLoading} 
                    />
                    {(clientErrors.bank_branch || errors.bank_branch) && <p className={styles.errorText}>{clientErrors.bank_branch || errors.bank_branch[0]}</p>}
                  </div>
                </div>

                {/* CĂN CƯỚC */}
                <div className={styles.sectionDivider}>
                  <h3 className={styles.sectionTitle}>Thông tin căn cước</h3>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số CMND/CCCD <span className={styles.required}>*</span></label>
                    <input 
                      type="text" 
                      name="identity_number" 
                      value={userForm.identity_number} 
                      onChange={handleFormChange}
                      className={`${styles.formInput} ${(clientErrors.identity_number || errors.identity_number) ? styles.inputError : ''}`} 
                      disabled={isLoading} 
                    />
                    {(clientErrors.identity_number || errors.identity_number) && <p className={styles.errorText}>{clientErrors.identity_number || errors.identity_number[0]}</p>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ngày cấp <span className={styles.required}>*</span></label>
                    <input 
                      type="date" 
                      name="identity_issue_date" 
                      value={userForm.identity_issue_date} 
                      onChange={handleFormChange}
                      className={`${styles.formInput} ${(clientErrors.identity_issue_date || errors.identity_issue_date) ? styles.inputError : ''}`} 
                      disabled={isLoading} 
                    />
                    {(clientErrors.identity_issue_date || errors.identity_issue_date) && <p className={styles.errorText}>{clientErrors.identity_issue_date || errors.identity_issue_date[0]}</p>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nơi cấp <span className={styles.required}>*</span></label>
                  <input 
                    type="text" 
                    name="identity_issued_by" 
                    value={userForm.identity_issued_by} 
                    onChange={handleFormChange}
                    className={`${styles.formInput} ${(clientErrors.identity_issued_by || errors.identity_issued_by) ? styles.inputError : ''}`} 
                    disabled={isLoading} 
                  />
                  {(clientErrors.identity_issued_by || errors.identity_issued_by) && <p className={styles.errorText}>{clientErrors.identity_issued_by || errors.identity_issued_by[0]}</p>}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ảnh mặt trước {(modalMode === 'add' || !selectedUser?.id_card_front_url) && <span className={styles.required}>*</span>}</label>
                    {modalMode === 'edit' && selectedUser?.id_card_front_url && (
                      <div className={styles.imagePreview}>
                        <p className={styles.previewLabel}>Ảnh hiện tại:</p>
                        {renderImage(selectedUser.id_card_front_url, 'ID Card Front', 'id_card_front')}
                      </div>
                    )}
                    {previewUrls.id_card_front && (
                      <div className={styles.imagePreview}>
                        <p className={styles.previewLabel}>Xem trước ảnh mới:</p>
                        <img src={previewUrls.id_card_front} alt="Preview" className={styles.previewImage} />
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleFileChange(e.target.files[0], setIdCardFront, 'id_card_front')} 
                      className={styles.fileInput}
                      disabled={isLoading} 
                    />
                    {(clientErrors.id_card_front || errors.id_card_front) && <p className={styles.errorText}>{clientErrors.id_card_front || errors.id_card_front[0]}</p>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ảnh mặt sau {(modalMode === 'add' || !selectedUser?.id_card_back_url) && <span className={styles.required}>*</span>}</label>
                    {modalMode === 'edit' && selectedUser?.id_card_back_url && (
                      <div className={styles.imagePreview}>
                        <p className={styles.previewLabel}>Ảnh hiện tại:</p>
                        {renderImage(selectedUser.id_card_back_url, 'ID Card Back', 'id_card_back')}
                      </div>
                    )}
                    {previewUrls.id_card_back && (
                      <div className={styles.imagePreview}>
                        <p className={styles.previewLabel}>Xem trước ảnh mới:</p>
                        <img src={previewUrls.id_card_back} alt="Preview" className={styles.previewImage} />
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleFileChange(e.target.files[0], setIdCardBack, 'id_card_back')} 
                      className={styles.fileInput}
                      disabled={isLoading} 
                    />
                    {(clientErrors.id_card_back || errors.id_card_back) && <p className={styles.errorText}>{clientErrors.id_card_back || errors.id_card_back[0]}</p>}
                  </div>
                </div>

                {/* DOANH NGHIỆP */}
                {accountType === 'business' && (
                  <>
                    <div className={styles.sectionDivider}>
                      <h3 className={styles.sectionTitle}>Thông tin doanh nghiệp</h3>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Chức vụ {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                        <input 
                          type="text" 
                          name="position" 
                          value={userForm.position} 
                          onChange={handleFormChange}
                          className={`${styles.formInput} ${(clientErrors.position || errors.position) ? styles.inputError : ''}`} 
                          disabled={isLoading} 
                        />
                        {(clientErrors.position || errors.position) && <p className={styles.errorText}>{clientErrors.position || errors.position[0]}</p>}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Tên tổ chức {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                        <input 
                          type="text" 
                          name="organization_name" 
                          value={userForm.organization_name} 
                          onChange={handleFormChange}
                          className={`${styles.formInput} ${(clientErrors.organization_name || errors.organization_name) ? styles.inputError : ''}`} 
                          disabled={isLoading} 
                        />
                        {(clientErrors.organization_name || errors.organization_name) && <p className={styles.errorText}>{clientErrors.organization_name || errors.organization_name[0]}</p>}
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Mã số thuế {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                        <input 
                          type="text" 
                          name="tax_code" 
                          value={userForm.tax_code} 
                          onChange={handleFormChange}
                          className={`${styles.formInput} ${(clientErrors.tax_code || errors.tax_code) ? styles.inputError : ''}`} 
                          disabled={isLoading} 
                        />
                        {(clientErrors.tax_code || errors.tax_code) && <p className={styles.errorText}>{clientErrors.tax_code || errors.tax_code[0]}</p>}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Ngày cấp giấy phép {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                        <input 
                          type="date" 
                          name="business_license_issue_date" 
                          value={userForm.business_license_issue_date} 
                          onChange={handleFormChange}
                          className={`${styles.formInput} ${(clientErrors.business_license_issue_date || errors.business_license_issue_date) ? styles.inputError : ''}`} 
                          disabled={isLoading} 
                        />
                        {(clientErrors.business_license_issue_date || errors.business_license_issue_date) && <p className={styles.errorText}>{clientErrors.business_license_issue_date || errors.business_license_issue_date[0]}</p>}
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Nơi cấp {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                      <input 
                        type="text" 
                        name="business_license_issued_by" 
                        value={userForm.business_license_issued_by} 
                        onChange={handleFormChange}
                        className={`${styles.formInput} ${(clientErrors.business_license_issued_by || errors.business_license_issued_by) ? styles.inputError : ''}`} 
                        disabled={isLoading} 
                      />
                      {(clientErrors.business_license_issued_by || errors.business_license_issued_by) && <p className={styles.errorText}>{clientErrors.business_license_issued_by || errors.business_license_issued_by[0]}</p>}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Giấy chứng nhận {(modalMode === 'add' || !selectedUser?.business_license_url) && <span className={styles.required}>*</span>}</label>
                      {modalMode === 'edit' && selectedUser?.business_license_url && (
                        <div className={styles.filePreview}>
                          <p className={styles.previewLabel}>File hiện tại:</p>
                          {imageErrors.business_license ? (
                            <p className={styles.errorText}>Không thể tải file giấy chứng nhận</p>
                          ) : (
                            <a href={selectedUser.business_license_url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>Xem file</a>
                          )}
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx" 
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file && !['pdf', 'doc', 'docx'].includes(file.name.split('.').pop().toLowerCase())) {
                            setClientErrors(prev => ({ ...prev, business_license: 'Chỉ chấp nhận PDF, DOC, DOCX' }));
                          } else {
                            handleFileChange(file, setBusinessLicense, 'business_license');
                          }
                        }} 
                        className={styles.fileInput}
                        disabled={isLoading} 
                      />
                      {(clientErrors.business_license || errors.business_license) && <p className={styles.errorText}>{clientErrors.business_license || errors.business_license[0]}</p>}
                    </div>
                  </>
                )}

                {/* ĐẤU GIÁ VIÊN */}
                {accountType === 'auction' && (
                  <>
                    <div className={styles.sectionDivider}>
                      <h3 className={styles.sectionTitle}>Thông tin đấu giá viên</h3>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Phương thức liên hệ {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                      <input 
                        type="text" 
                        name="online_contact_method" 
                        value={userForm.online_contact_method} 
                        onChange={handleFormChange}
                        className={`${styles.formInput} ${(clientErrors.online_contact_method || errors.online_contact_method) ? styles.inputError : ''}`} 
                        disabled={isLoading} 
                      />
                      {(clientErrors.online_contact_method || errors.online_contact_method) && <p className={styles.errorText}>{clientErrors.online_contact_method || errors.online_contact_method[0]}</p>}
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Số chứng chỉ {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                        <input 
                          type="text" 
                          name="certificate_number" 
                          value={userForm.certificate_number} 
                          onChange={handleFormChange}
                          className={`${styles.formInput} ${(clientErrors.certificate_number || errors.certificate_number) ? styles.inputError : ''}`} 
                          disabled={isLoading} 
                        />
                        {(clientErrors.certificate_number || errors.certificate_number) && <p className={styles.errorText}>{clientErrors.certificate_number || errors.certificate_number[0]}</p>}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Ngày cấp chứng chỉ {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                        <input 
                          type="date" 
                          name="certificate_issue_date" 
                          value={userForm.certificate_issue_date} 
                          onChange={handleFormChange}
                          className={`${styles.formInput} ${(clientErrors.certificate_issue_date || errors.certificate_issue_date) ? styles.inputError : ''}`} 
                          disabled={isLoading} 
                        />
                        {(clientErrors.certificate_issue_date || errors.certificate_issue_date) && <p className={styles.errorText}>{clientErrors.certificate_issue_date || errors.certificate_issue_date[0]}</p>}
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Nơi cấp {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                      <input 
                        type="text" 
                        name="certificate_issued_by" 
                        value={userForm.certificate_issued_by} 
                        onChange={handleFormChange}
                        className={`${styles.formInput} ${(clientErrors.certificate_issued_by || errors.certificate_issued_by) ? styles.inputError : ''}`} 
                        disabled={isLoading} 
                      />
                      {(clientErrors.certificate_issued_by || errors.certificate_issued_by) && <p className={styles.errorText}>{clientErrors.certificate_issued_by || errors.certificate_issued_by[0]}</p>}
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Ảnh thẻ mặt trước {(modalMode === 'add' || !selectedUser?.auctioneer_card_front_url) && <span className={styles.required}>*</span>}</label>
                        {modalMode === 'edit' && selectedUser?.auctioneer_card_front_url && (
                          <div className={styles.imagePreview}>
                            <p className={styles.previewLabel}>Ảnh hiện tại:</p>
                            {renderImage(selectedUser.auctioneer_card_front_url, 'Auctioneer Card Front', 'auctioneer_card_front')}
                          </div>
                        )}
                        {previewUrls.auctioneer_card_front && (
                          <div className={styles.imagePreview}>
                            <p className={styles.previewLabel}>Xem trước ảnh mới:</p>
                            <img src={previewUrls.auctioneer_card_front} alt="Preview" className={styles.previewImage} />
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => handleFileChange(e.target.files[0], setAuctioneerCardFront, 'auctioneer_card_front')} 
                          className={styles.fileInput}
                          disabled={isLoading} 
                        />
                        {(clientErrors.auctioneer_card_front || errors.auctioneer_card_front) && <p className={styles.errorText}>{clientErrors.auctioneer_card_front || errors.auctioneer_card_front[0]}</p>}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Ảnh thẻ mặt sau {(modalMode === 'add' || !selectedUser?.auctioneer_card_back_url) && <span className={styles.required}>*</span>}</label>
                        {modalMode === 'edit' && selectedUser?.auctioneer_card_back_url && (
                          <div className={styles.imagePreview}>
                            <p className={styles.previewLabel}>Ảnh hiện tại:</p>
                            {renderImage(selectedUser.auctioneer_card_back_url, 'Auctioneer Card Back', 'auctioneer_card_back')}
                          </div>
                        )}
                        {previewUrls.auctioneer_card_back && (
                          <div className={styles.imagePreview}>
                            <p className={styles.previewLabel}>Xem trước ảnh mới:</p>
                            <img src={previewUrls.auctioneer_card_back} alt="Preview" className={styles.previewImage} />
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => handleFileChange(e.target.files[0], setAuctioneerCardBack, 'auctioneer_card_back')} 
                          className={styles.fileInput}
                          disabled={isLoading} 
                        />
                        {(clientErrors.auctioneer_card_back || errors.auctioneer_card_back) && <p className={styles.errorText}>{clientErrors.auctioneer_card_back || errors.auctioneer_card_back[0]}</p>}
                      </div>
                    </div>
                  </>
                )}

                <div className={styles.modalFooter}>
                  <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : 'Lưu'}
                  </button>
                  <button type="button" className={styles.btnSecondary} onClick={closeUserModal} disabled={isLoading}>
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT */}
      {showViewModal && selectedUser && (
        <div className={styles.modalOverlay} onClick={closeViewModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Người Dùng</h2>
              <button className={styles.modalClose} onClick={closeViewModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>Thông tin cơ bản</h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>ID:</span>
                    <span className={styles.detailValue}>{selectedUser.id}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Họ và tên:</span>
                    <span className={styles.detailValue}>{selectedUser.name}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{selectedUser.email}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Số điện thoại:</span>
                    <span className={styles.detailValue}>{selectedUser.phone}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Vai trò:</span>
                    <span className={styles.detailValue}>{selectedUser.role_name}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Loại tài khoản:</span>
                    <span className={styles.detailValue}>
                      {selectedUser.accountType === 'personal' ? 'Cá nhân' : 
                       selectedUser.accountType === 'business' ? 'Doanh nghiệp' : 'Đấu giá viên'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Ngày sinh:</span>
                    <span className={styles.detailValue}>{selectedUser.birth_date}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Giới tính:</span>
                    <span className={styles.detailValue}>
                      {selectedUser.gender === 'male' ? 'Nam' : 
                       selectedUser.gender === 'female' ? 'Nữ' : 
                       selectedUser.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Địa chỉ:</span>
                    <span className={styles.detailValue}>{selectedUser.address}</span>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>Thông tin ngân hàng</h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Tên ngân hàng:</span>
                    <span className={styles.detailValue}>{selectedUser.bank_name}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Số tài khoản:</span>
                    <span className={styles.detailValue}>{selectedUser.bank_account}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Chi nhánh:</span>
                    <span className={styles.detailValue}>{selectedUser.bank_branch}</span>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>Thông tin căn cước</h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Số CMND/CCCD:</span>
                    <span className={styles.detailValue}>{selectedUser.identity_number}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Ngày cấp:</span>
                    <span className={styles.detailValue}>{selectedUser.identity_issue_date}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Nơi cấp:</span>
                    <span className={styles.detailValue}>{selectedUser.identity_issued_by}</span>
                  </div>
                  
                  {/* Ảnh CCCD */}
                  <div className={styles.imageSection}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Ảnh mặt trước:</span>
                      <div className={styles.imageContainer}>
                        {renderImage(selectedUser.id_card_front_url, 'ID Card Front', 'id_card_front')}
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Ảnh mặt sau:</span>
                      <div className={styles.imageContainer}>
                        {renderImage(selectedUser.id_card_back_url, 'ID Card Back', 'id_card_back')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin doanh nghiệp */}
                {selectedUser.accountType === 'business' && (
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailSectionTitle}>Thông tin doanh nghiệp</h3>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Chức vụ:</span>
                      <span className={styles.detailValue}>{selectedUser.position || 'Chưa cập nhật'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Tên tổ chức:</span>
                      <span className={styles.detailValue}>{selectedUser.organization_name || 'Chưa cập nhật'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Mã số thuế:</span>
                      <span className={styles.detailValue}>{selectedUser.tax_code || 'Chưa cập nhật'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Ngày cấp giấy phép:</span>
                      <span className={styles.detailValue}>{selectedUser.business_license_issue_date}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Nơi cấp giấy phép:</span>
                      <span className={styles.detailValue}>{selectedUser.business_license_issued_by || 'Chưa cập nhật'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Giấy chứng nhận:</span>
                      <div className={styles.imageContainer}>
                        {selectedUser.business_license_url ? (
                          <a href={selectedUser.business_license_url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                            Xem file
                          </a>
                        ) : (
                          <span className={styles.detailValue}>Chưa cập nhật</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Thông tin đấu giá viên */}
                {selectedUser.accountType === 'auction' && (
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailSectionTitle}>Thông tin đấu giá viên</h3>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Phương thức liên hệ:</span>
                      <span className={styles.detailValue}>{selectedUser.online_contact_method || 'Chưa cập nhật'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Số chứng chỉ:</span>
                      <span className={styles.detailValue}>{selectedUser.certificate_number || 'Chưa cập nhật'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Ngày cấp chứng chỉ:</span>
                      <span className={styles.detailValue}>{selectedUser.certificate_issue_date}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Nơi cấp chứng chỉ:</span>
                      <span className={styles.detailValue}>{selectedUser.certificate_issued_by || 'Chưa cập nhật'}</span>
                    </div>
                    
                    {/* Ảnh thẻ đấu giá viên */}
                    <div className={styles.imageSection}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Ảnh thẻ mặt trước:</span>
                        <div className={styles.imageContainer}>
                          {renderImage(selectedUser.auctioneer_card_front_url, 'Auctioneer Card Front', 'auctioneer_card_front')}
                        </div>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Ảnh thẻ mặt sau:</span>
                        <div className={styles.imageContainer}>
                          {renderImage(selectedUser.auctioneer_card_back_url, 'Auctioneer Card Back', 'auctioneer_card_back')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>Thông tin hệ thống</h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Ngày tạo:</span>
                    <span className={styles.detailValue}>{selectedUser.createdDate}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Trạng thái duyệt:</span>
                    <span className={styles.detailValue}>{selectedUser.admin_verify}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Xác minh email:</span>
                    <span className={styles.detailValue}>{selectedUser.email_verify}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Trạng thái tài khoản:</span>
                    <span className={`${styles.detailValue} ${selectedUser.is_locked ? styles.locked : styles.active}`}>
                      {selectedUser.is_locked ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={closeViewModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;