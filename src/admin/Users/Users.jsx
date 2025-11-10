import React, { useState, useEffect } from 'react';
 
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
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
      const [open, setOpen] = useState(false);
    const togglePopup = (e) => { 
      e.stopPropagation(); // tránh đóng liền sau khi mở
      setOpen((prev) => !prev);
    };
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: '',
    accountType: 'user',
    full_name: '',
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
    position: undefined,
    organization_name: undefined,
    tax_code: undefined,
    business_license_issue_date: undefined,
    business_license_issued_by: undefined,
    online_contact_method: undefined,
    certificate_number: undefined,
    certificate_issue_date: undefined,
    certificate_issued_by: undefined,
  });
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
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [clientErrors, setClientErrors] = useState({});

  const itemsPerPage = 5;
  const token = localStorage.getItem('token');

  const roleToAccountTypeMap = {
    1: 'user',
    5: 'auction',
    9: 'business',
  };

  const formatDate = (isoDate) => {
    if (!isoDate || isoDate === 'Chưa cập nhật') return 'Chưa cập nhật';
    const date = new Date(isoDate);
    return isNaN(date) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN');
  };

  const formatDateForInput = (dateString) => {
    if (!dateString || dateString === 'Chưa cập nhật') return '';
    
    try {
      // Thử parse theo định dạng Việt Nam (dd/mm/yyyy)
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2];
          return `${year}-${month}-${day}`;
        }
      }
      
      // Thử parse theo ISO string
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return '';
    } catch (err) {
      console.error('Error formatting date:', err);
      return '';
    }
  };

  const createPreviewUrl = (file) => {
    if (!file) return null;
    return URL.createObjectURL(file);
  };

  const checkImageExists = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleFileChange = (file, setFile, previewKey) => {
    setFile(file);
    setPreviewUrls(prev => ({
      ...prev,
      [previewKey]: file ? createPreviewUrl(file) : null,
    }));
    setClientErrors(prev => ({ ...prev, [previewKey]: '' }));
    setImageErrors(prev => ({ ...prev, [previewKey]: false }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rolesResponse, usersResponse] = await Promise.all([
          getRoles(),
          listUsers(),
        ]);

        const rolesData = rolesResponse?.roles || rolesResponse?.data?.roles || [];
        setRoles(Array.isArray(rolesData) ? rolesData : []);

        const usersData = usersResponse?.users || usersResponse?.data?.users || [];
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
                admin_verify:
                  user.admin_verify_status === 'approved'
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

        // Bỏ pre-check HEAD cho ảnh để tránh 403 hàng loạt và tăng tốc load.
        setUsers(mappedUsers);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể lấy dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

  const openUserModal = (mode, user = null) => {
    setModalMode(mode);
    setFormError(null);
    setClientErrors({});
    setIdCardFront(null);
    setIdCardBack(null);
    setBusinessLicense(null);
    setAuctioneerCardFront(null);
    setAuctioneerCardBack(null);
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
      // Xác định loại tài khoản
      const accountType = user.accountType || roleToAccountTypeMap[user.role_id] || 'personal';


      setUserForm({
        // === CƠ BẢN ===
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role_id: user.role_id || '',
        accountType: accountType,
        full_name: user.full_name || '',

        // === NGÀY THÁNG: SỬ DỤNG ĐÚNG HÀM formatDateForInput ===
        birth_date: user.birth_date && user.birth_date !== 'Chưa cập nhật' 
          ? formatDateForInput(user.birth_date) 
          : '',
        identity_issue_date: user.identity_issue_date && user.identity_issue_date !== 'Chưa cập nhật'
          ? formatDateForInput(user.identity_issue_date)
          : '',

        // === CÁC TRƯỜNG KHÁC ===
        gender: user.gender || '',
        address: user.address || '',
        password: '',
        password_confirmation: '',
        bank_name: user.bank_name || '',
        bank_account: user.bank_account || '',
        bank_branch: user.bank_branch || '',
        identity_number: user.identity_number || '',
        identity_issued_by: user.identity_issued_by || '',

        // === BUSINESS ===
        position: accountType === 'business' ? (user.position || '') : undefined,
        organization_name: accountType === 'business' ? (user.organization_name || '') : undefined,
        tax_code: accountType === 'business' ? (user.tax_code || '') : undefined,
        business_license_issue_date: accountType === 'business' && user.business_license_issue_date && user.business_license_issue_date !== 'Chưa cập nhật'
          ? formatDateForInput(user.business_license_issue_date)
          : '',
        business_license_issued_by: accountType === 'business' ? (user.business_license_issued_by || '') : undefined,

        // === AUCTION ===
        online_contact_method: accountType === 'auction' ? (user.online_contact_method || '') : undefined,
        certificate_number: accountType === 'auction' ? (user.certificate_number || '') : undefined,
        certificate_issue_date: accountType === 'auction' && user.certificate_issue_date && user.certificate_issue_date !== 'Chưa cập nhật'
          ? formatDateForInput(user.certificate_issue_date)
          : '',
        certificate_issued_by: accountType === 'auction' ? (user.certificate_issued_by || '') : undefined,
      });

      setSelectedUser(user);
    } else {
      // === THÊM MỚI (ADD) ===
      const defaultRoleId = roles.length > 0 ? roles[0].role_id : '';
      const defaultAccountType = roleToAccountTypeMap[defaultRoleId] || 'personal';

      setUserForm({
        name: '',
        email: '',
        phone: '',
        role_id: defaultRoleId,
        accountType: defaultAccountType,
        full_name: '',
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
        // Business
        position: defaultAccountType === 'business' ? '' : undefined,
        organization_name: defaultAccountType === 'business' ? '' : undefined,
        tax_code: defaultAccountType === 'business' ? '' : undefined,
        business_license_issue_date: defaultAccountType === 'business' ? '' : undefined,
        business_license_issued_by: defaultAccountType === 'business' ? '' : undefined,
        // Auction
        online_contact_method: defaultAccountType === 'auction' ? '' : undefined,
        certificate_number: defaultAccountType === 'auction' ? '' : undefined,
        certificate_issue_date: defaultAccountType === 'auction' ? '' : undefined,
        certificate_issued_by: defaultAccountType === 'auction' ? '' : undefined,
      });
    }

    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setFormError(null);
    setClientErrors({});
    Object.values(previewUrls).forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => {
      const updatedForm = { ...prev, [name]: value };

      if (name === 'role_id') {
        const newAccountType = roleToAccountTypeMap[value] || 'personal';
        updatedForm.accountType = newAccountType;

        if (newAccountType !== 'business') {
          updatedForm.position = undefined;
          updatedForm.organization_name = undefined;
          updatedForm.tax_code = undefined;
          updatedForm.business_license_issue_date = undefined;
          updatedForm.business_license_issued_by = undefined;
          setBusinessLicense(null);
          setPreviewUrls(prev => ({ ...prev, business_license: null }));
        } else {
          updatedForm.position = updatedForm.position || (selectedUser?.position || '');
          updatedForm.organization_name = updatedForm.organization_name || (selectedUser?.organization_name || '');
          updatedForm.tax_code = updatedForm.tax_code || (selectedUser?.tax_code || '');
          updatedForm.business_license_issue_date = updatedForm.business_license_issue_date || (selectedUser?.business_license_issue_date ? formatDateForInput(selectedUser.business_license_issue_date) : '');
          updatedForm.business_license_issued_by = updatedForm.business_license_issued_by || (selectedUser?.business_license_issued_by || '');
        }
        if (newAccountType !== 'auction') {
          updatedForm.online_contact_method = undefined;
          updatedForm.certificate_number = undefined;
          updatedForm.certificate_issue_date = undefined;
          updatedForm.certificate_issued_by = undefined;
          setAuctioneerCardFront(null);
          setAuctioneerCardBack(null);
          setPreviewUrls(prev => ({
            ...prev,
            auctioneer_card_front: null,
            auctioneer_card_back: null,
          }));
        } else {
          updatedForm.online_contact_method = updatedForm.online_contact_method || (selectedUser?.online_contact_method || '');
          updatedForm.certificate_number = updatedForm.certificate_number || (selectedUser?.certificate_number || '');
          updatedForm.certificate_issue_date = updatedForm.certificate_issue_date || (selectedUser?.certificate_issue_date ? formatDateForInput(selectedUser.certificate_issue_date) : '');
          updatedForm.certificate_issued_by = updatedForm.certificate_issued_by || (selectedUser?.certificate_issued_by || '');
        }
      }
      return updatedForm;
    });
    setClientErrors({ ...clientErrors, [name]: '' });
  };

  const validateForm = () => {
  const newErrors = {};
  const isAdd = modalMode === 'add';

  // === CÁC TRƯỜNG BẮT BUỘC CHUNG ===
  if (!userForm.full_name?.trim()) newErrors.full_name = 'Vui lòng nhập họ và tên.';
  if (!userForm.email?.trim()) newErrors.email = 'Vui lòng nhập email.';
  else if (!/\S+@\S+\.\S+/.test(userForm.email)) newErrors.email = 'Email không hợp lệ.';
  if (!userForm.identity_number?.trim()) newErrors.identity_number = 'Vui lòng nhập số CMND/CCCD.';
  if (!userForm.identity_issue_date?.trim()) newErrors.identity_issue_date = 'Vui lòng nhập ngày cấp CMND/CCCD.';
  if (!userForm.identity_issued_by?.trim()) newErrors.identity_issued_by = 'Vui lòng nhập nơi cấp CMND/CCCD.';

  // === CHỈ BẮT BUỘC KHI ADD ===
  if (isAdd) {
    if (!userForm.birth_date?.trim()) newErrors.birth_date = 'Vui lòng nhập ngày sinh.';
    if (!userForm.phone?.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại.';
    if (!userForm.address?.trim()) newErrors.address = 'Vui lòng nhập địa chỉ.';
    if (!userForm.bank_name?.trim()) newErrors.bank_name = 'Vui lòng nhập tên ngân hàng.';
    if (!userForm.bank_account?.trim()) newErrors.bank_account = 'Vui lòng nhập số tài khoản.';
    if (!userForm.bank_branch?.trim()) newErrors.bank_branch = 'Vui lòng nhập chi nhánh ngân hàng.';
  }

  // === MẬT KHẨU CHỈ KHI ADD ===
  if (isAdd) {
    if (!userForm.password?.trim()) newErrors.password = 'Vui lòng nhập mật khẩu.';
    else if (userForm.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (!userForm.password_confirmation?.trim()) newErrors.password_confirmation = 'Vui lòng nhập lại mật khẩu.';
    else if (userForm.password !== userForm.password_confirmation) newErrors.password_confirmation = 'Mật khẩu nhập lại không khớp.';
  }

  // === ẢNH CHỈ KHI ADD HOẶC CHƯA CÓ TRONG selectedUser ===
  if (isAdd || !selectedUser?.id_card_front_url) {
    if (!idCardFront) newErrors.id_card_front = 'Vui lòng tải lên ảnh căn cước mặt trước.';
  }
  if (isAdd || !selectedUser?.id_card_back_url) {
    if (!idCardBack) newErrors.id_card_back = 'Vui lòng tải lên ảnh căn cước mặt sau.';
  }

  // === BUSINESS ===
  if (userForm.accountType === 'business') {
    if (isAdd) {
      if (!userForm.position?.trim()) newErrors.position = 'Vui lòng nhập chức vụ.';
      if (!userForm.organization_name?.trim()) newErrors.organization_name = 'Vui lòng nhập tên tổ chức.';
      if (!userForm.tax_code?.trim()) newErrors.tax_code = 'Vui lòng nhập mã số thuế.';
      if (!userForm.business_license_issue_date?.trim()) newErrors.business_license_issue_date = 'Vui lòng nhập ngày cấp giấy chứng nhận.';
      if (!userForm.business_license_issued_by?.trim()) newErrors.business_license_issued_by = 'Vui lòng nhập nơi cấp giấy chứng nhận.';
    }

    if (isAdd || !selectedUser?.business_license_url) {
      if (!businessLicense) newErrors.business_license = 'Vui lòng tải lên giấy chứng nhận đăng ký kinh doanh.';
      else if (!['pdf', 'doc', 'docx'].includes(businessLicense.name.split('.').pop().toLowerCase())) {
        newErrors.business_license = 'File phải là PDF hoặc Word (.pdf, .doc, .docx).';
      }
    }
  }

  // === AUCTION ===
  if (userForm.accountType === 'auction') {
    if (isAdd) {
      if (!userForm.online_contact_method?.trim()) newErrors.online_contact_method = 'Vui lòng nhập phương thức liên hệ.';
      if (!userForm.certificate_number?.trim()) newErrors.certificate_number = 'Vui lòng nhập số chứng chỉ.';
      if (!userForm.certificate_issue_date?.trim()) newErrors.certificate_issue_date = 'Vui lòng nhập ngày cấp chứng chỉ.';
      if (!userForm.certificate_issued_by?.trim()) newErrors.certificate_issued_by = 'Vui lòng nhập nơi cấp chứng chỉ.';
    }

    if (isAdd || !selectedUser?.auctioneer_card_front_url) {
      if (!auctioneerCardFront) newErrors.auctioneer_card_front = 'Vui lòng tải lên ảnh thẻ mặt trước.';
    }
    if (isAdd || !selectedUser?.auctioneer_card_back_url) {
      if (!auctioneerCardBack) newErrors.auctioneer_card_back = 'Vui lòng tải lên ảnh thẻ mặt sau.';
    }
  }

  setClientErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSaveUser = async () => {
  try {
    setFormError(null);
    if (!validateForm()) return;

    const data = new FormData();
    
    // Thêm các trường cơ bản - chỉ gửi nếu có giá trị
    const baseFields = [
      'full_name', 'email', 'phone', 'birth_date', 'gender', 'address',
      'bank_name', 'bank_account', 'bank_branch',
      'identity_number', 'identity_issue_date', 'identity_issued_by'
    ];

    baseFields.forEach(field => {
      if (userForm[field] !== undefined && userForm[field] !== '' && userForm[field] !== null) {
        data.append(field, userForm[field]);
      }
    });

    // Thêm files nếu có
    if (idCardFront) data.append('id_card_front', idCardFront);
    if (idCardBack) data.append('id_card_back', idCardBack);
    
    // Thêm trường account_type
    data.append('account_type', userForm.accountType);

    if (userForm.accountType === 'business') {
      const businessFields = [
        'position', 'organization_name', 'tax_code',
        'business_license_issue_date', 'business_license_issued_by'
      ];
      
      businessFields.forEach(field => {
        if (userForm[field] !== undefined && userForm[field] !== '' && userForm[field] !== null) {
          data.append(field, userForm[field]);
        }
      });

      if (businessLicense) {
        data.append('business_license', businessLicense);
      }
    }

    if (userForm.accountType === 'auction') {
      const auctionFields = [
        'online_contact_method', 'certificate_number',
        'certificate_issue_date', 'certificate_issued_by'
      ];
      
      auctionFields.forEach(field => {
        if (userForm[field] !== undefined && userForm[field] !== '' && userForm[field] !== null) {
          data.append(field, userForm[field]);
        }
      });

      if (auctioneerCardFront) data.append('auctioneer_card_front', auctioneerCardFront);
      if (auctioneerCardBack) data.append('auctioneer_card_back', auctioneerCardBack);
    }

    if (modalMode === 'edit') {
      data.append('_method', 'PUT');
      // Thêm role_id nếu có thay đổi
      if (userForm.role_id) {
        data.append('role_id', userForm.role_id);
      }
    } else {
      // Thêm password cho trường hợp tạo mới
      data.append('password', userForm.password);
      data.append('password_confirmation', userForm.password_confirmation);
    }

    const response = modalMode === 'add'
      ? await registerUser(data)
      : await updateUserAdmin(selectedUser.id, data);

    // Xử lý response thành công - CẬP NHẬT ĐẦY ĐỦ DỮ LIỆU
    if (modalMode === 'add') {
      // Thêm mới: fetch lại toàn bộ dữ liệu để có đầy đủ thông tin
      const usersResponse = await listUsers();
      
      const mappedUsers = Array.isArray(usersResponse.data.users)
        ? usersResponse.data.users.map(user => ({
            id: user.user_id,
            name: user.full_name || 'Chưa cập nhật',
            email: user.email || 'Chưa cập nhật',
            phone: user.phone || 'Chưa cập nhật',
            role_id: user.role_id || null,
            role_name: user.role?.name || 'Chưa có vai trò',
            email_verify: user.email_verified_at ? 'Đã xác minh' : 'Chưa xác minh',
            admin_verify:
              user.admin_verify_status === 'approved'
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
            id_card_front_url: user.id_card_front ? `${API_URL}storage/${user.id_card_front}` : '',
            id_card_back_url: user.id_card_back ? `${API_URL}storage/${user.id_card_back}` : '',
            business_license_url: user.business_license ? `${API_URL}storage/${user.business_license}` : undefined,
            auctioneer_card_front_url: user.auctioneer_card_front ? `${API_URL}storage/${user.auctioneer_card_front}` : undefined,
            auctioneer_card_back_url: user.auctioneer_card_back ? `${API_URL}storage/${user.auctioneer_card_back}` : undefined,
          }))
        : [];

      setUsers(mappedUsers);
    } else {
      // Chỉnh sửa: cập nhật user cụ thể với dữ liệu đầy đủ
      const updatedUser = {
        id: selectedUser.id,
        name: userForm.full_name,
        email: userForm.email,
        phone: userForm.phone,
        role_id: userForm.role_id || selectedUser.role_id,
        role_name: roles.find(r => r.role_id === parseInt(userForm.role_id))?.name || selectedUser.role_name,
        email_verify: selectedUser.email_verify,
        admin_verify: selectedUser.admin_verify,
        admin_verify_status: selectedUser.admin_verify_status,
        createdDate: selectedUser.createdDate,
        deletedAt: selectedUser.deletedAt,
        accountType: userForm.accountType,
        full_name: userForm.full_name,
        birth_date: userForm.birth_date ? formatDate(userForm.birth_date) : selectedUser.birth_date,
        gender: userForm.gender,
        address: userForm.address,
        bank_name: userForm.bank_name,
        bank_account: userForm.bank_account,
        bank_branch: userForm.bank_branch,
        identity_number: userForm.identity_number,
        identity_issue_date: userForm.identity_issue_date ? formatDate(userForm.identity_issue_date) : selectedUser.identity_issue_date,
        identity_issued_by: userForm.identity_issued_by,
        position: userForm.position,
        organization_name: userForm.organization_name,
        tax_code: userForm.tax_code,
        business_license_issue_date: userForm.business_license_issue_date ? formatDate(userForm.business_license_issue_date) : selectedUser.business_license_issue_date,
        business_license_issued_by: userForm.business_license_issued_by,
        online_contact_method: userForm.online_contact_method,
        certificate_number: userForm.certificate_number,
        certificate_issue_date: userForm.certificate_issue_date ? formatDate(userForm.certificate_issue_date) : selectedUser.certificate_issue_date,
        certificate_issued_by: userForm.certificate_issued_by,
        id_card_front_url: idCardFront ? previewUrls.id_card_front : selectedUser.id_card_front_url,
        id_card_back_url: idCardBack ? previewUrls.id_card_back : selectedUser.id_card_back_url,
        business_license_url: businessLicense ? previewUrls.business_license : selectedUser.business_license_url,
        auctioneer_card_front_url: auctioneerCardFront ? previewUrls.auctioneer_card_front : selectedUser.auctioneer_card_front_url,
        auctioneer_card_back_url: auctioneerCardBack ? previewUrls.auctioneer_card_back : selectedUser.auctioneer_card_back_url,
      };

      setUsers(prevUsers => prevUsers.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      ));
    }

    closeUserModal();
  } catch (err) {
    console.error('Save user error:', err);
    setFormError(
      err.response?.data?.errors
        ? Object.values(err.response?.data?.errors).flat().join(', ')
        : err.response?.data?.message || 'Lỗi khi lưu người dùng'
    );
  }
};

  const handleDeleteUser = async (user) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
      const response = await deleteUserService(user.id);
        if (!response.data?.status) {
          throw new Error(response.data?.message || 'Lỗi khi xóa người dùng');
        }
        setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
      } catch (err) {
        setFormError(err.response?.data?.message || 'Lỗi khi xóa người dùng');
      }
    }
  };

  const handleApproveUser = async (user) => {
    try {
      const response = await approveUserService(user.id);
      if (!response.data.status) {
        throw new Error(response.data.message || 'Lỗi khi duyệt người dùng');
      }
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id
            ? { ...u, admin_verify: 'Đã xét duyệt', admin_verify_status: 'approved' }
            : u
        )
      );
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi duyệt người dùng');
    }
  };

  const handleRejectUser = async (user) => {
    try {
      const response = await rejectUserService(user.id);
      if (!response.data.status) {
        throw new Error(response.data.message || 'Lỗi khi từ chối người dùng');
      }
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id
            ? { ...u, admin_verify: 'Bị từ chối', admin_verify_status: 'rejected' }
            : u
        )
      );
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi từ chối người dùng');
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

  const handleLockUser = async (user) => {
    if (window.confirm(`Bạn có chắc muốn khóa tài khoản ${user.name}?`)) {
      try {
      const response = await lockUserService(user.id);
        if (response.data.status) {
          // Cập nhật UI ngay lập tức
          setUsers(prevUsers =>
            prevUsers.map(u =>
              u.id === user.id
                ? { ...u, is_locked: 1 }
                : u
            )
          );
          alert('Đã khóa tài khoản thành công');
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
        if (response.data.status) {
          // Cập nhật UI ngay lập tức
          setUsers(prevUsers =>
            prevUsers.map(u =>
              u.id === user.id
                ? { ...u, is_locked: null }
                : u
            )
          );
          alert('Đã mở khóa tài khoản thành công');
        }
      } catch (err) {
        setFormError(err.response?.data?.message || 'Lỗi khi mở khóa tài khoản');
      }
    }
  };
const renderImage = (url, type, errorKey) => {
  if (!url || imageErrors[errorKey]) {
    return (
      <div className={styles.placeholder}>
        <p style={{ width: '300px' }}>Chưa cập nhật hoặc không thể tải ảnh</p>
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

  if (loading) return <div className={styles.mainContent}><Loading message="Đang tải dữ liệu..." /></div>;
  if (error) return <div className={`${styles.mainContent} text-red-600`}>Lỗi: {error}</div>;

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
       
      </div>

      <h1 className={styles.pageTitle}>Quản Lý Người Dùng</h1>
      <p className={styles.pageSubtitle}>Quản lý tài khoản và quyền hạn người dùng hệ thống</p>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={roleFilter}
            onChange={handleRoleFilterChange}
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

      <div className={styles.dataTable}>
        <table className="w-full" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className={styles.dataTableCell}>ID</th>
              <th className={styles.dataTableCell}>Họ và tên</th>
              <th className={styles.dataTableCell}>Email</th>
              <th className={styles.dataTableCell}>Số điện thoại</th>
              <th className={styles.dataTableCell}>Vai trò</th>
              {/* <th className={styles.dataTableCell}>Ngày tạo</th> */}
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
                  <span
                    className={`${styles.statusBadge} ${
                      styles[`role${user.role_name.replace(/\s/g, '')}`] || styles.roleUser
                    }`}
                  >
                    {user.role_name}
                  </span>
                </td>
                {/* <td className={styles.dataTableCell} data-label="Ngày tạo">{user.createdDate}</td> */}
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
                        
                        {/* Thay thế nút xóa bằng nút khóa/mở khóa */}
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

      <div className={styles.pagination}>{renderPagination()}</div>

      {showUserModal && (
        <div className={styles.modal} role="dialog" aria-modal="true" onClick={closeUserModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h2>
              <button className={styles.modalClose} onClick={closeUserModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className="text-red-600 text-sm mb-4">{formError}</div>}
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Nhập họ và tên"
                  value={userForm.full_name}
                  onChange={handleFormChange}
                  className={clientErrors.full_name || formError?.includes('họ và tên') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.full_name && <p className={styles.errorMsg}>{clientErrors.full_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email <span className={styles.required}>*</span></label>
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập email"
                  value={userForm.email}
                  onChange={handleFormChange}
                  className={clientErrors.email || formError?.includes('email') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.email && <p className={styles.errorMsg}>{clientErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Nhập số điện thoại"
                  value={userForm.phone}
                  onChange={handleFormChange}
                  className={clientErrors.phone || formError?.includes('số điện thoại') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.phone && <p className={styles.errorMsg}>{clientErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                <input
                  type="date"
                  name="birth_date"
                  value={userForm.birth_date}
                  onChange={handleFormChange}
                  className={clientErrors.birth_date || formError?.includes('ngày sinh') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.birth_date && <p className={styles.errorMsg}>{clientErrors.birth_date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giới tính</label>
                <select
                  name="gender"
                  value={userForm.gender}
                  onChange={handleFormChange}
                  className={clientErrors.gender || formError?.includes('giới tính') ? styles.inputError : styles.modalInput}
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
                {clientErrors.gender && <p className={styles.errorMsg}>{clientErrors.gender}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Nhập địa chỉ"
                  value={userForm.address}
                  onChange={handleFormChange}
                  className={clientErrors.address || formError?.includes('địa chỉ') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.address && <p className={styles.errorMsg}>{clientErrors.address}</p>}
              </div>
              {modalMode === 'add' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mật khẩu <span className={styles.required}>*</span></label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Nhập mật khẩu"
                      value={userForm.password}
                      onChange={handleFormChange}
                      className={clientErrors.password || formError?.includes('mật khẩu') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.password && <p className={styles.errorMsg}>{clientErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu <span className={styles.required}>*</span></label>
                    <input
                      type="password"
                      name="password_confirmation"
                      placeholder="Xác nhận mật khẩu"
                      value={userForm.password_confirmation}
                      onChange={handleFormChange}
                      className={clientErrors.password_confirmation || formError?.includes('mật khẩu') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.password_confirmation && <p className={styles.errorMsg}>{clientErrors.password_confirmation}</p>}
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Tên ngân hàng {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                <input
                  type="text"
                  name="bank_name"
                  placeholder="Nhập tên ngân hàng"
                  value={userForm.bank_name}
                  onChange={handleFormChange}
                  className={clientErrors.bank_name || formError?.includes('ngân hàng') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.bank_name && <p className={styles.errorMsg}>{clientErrors.bank_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số tài khoản ngân hàng {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                <input
                  type="text"
                  name="bank_account"
                  placeholder="Nhập số tài khoản"
                  value={userForm.bank_account}
                  onChange={handleFormChange}
                  className={clientErrors.bank_account || formError?.includes('tài khoản') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.bank_account && <p className={styles.errorMsg}>{clientErrors.bank_account}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chi nhánh ngân hàng {modalMode === 'add' && <span className={styles.required}>*</span>}</label>
                <input
                  type="text"
                  name="bank_branch"
                  placeholder="Nhập chi nhánh ngân hàng"
                  value={userForm.bank_branch}
                  onChange={handleFormChange}
                  className={clientErrors.bank_branch || formError?.includes('chi nhánh') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.bank_branch && <p className={styles.errorMsg}>{clientErrors.bank_branch}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số CMND/CCCD <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="identity_number"
                  placeholder="Nhập số CMND/CCCD"
                  value={userForm.identity_number}
                  onChange={handleFormChange}
                  className={clientErrors.identity_number || formError?.includes('CMND/CCCD') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.identity_number && <p className={styles.errorMsg}>{clientErrors.identity_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ngày cấp CMND/CCCD <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  name="identity_issue_date"
                  value={userForm.identity_issue_date}
                  onChange={handleFormChange}
                  className={clientErrors.identity_issue_date || formError?.includes('ngày cấp') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.identity_issue_date && <p className={styles.errorMsg}>{clientErrors.identity_issue_date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nơi cấp CMND/CCCD <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="identity_issued_by"
                  placeholder="Nhập nơi cấp"
                  value={userForm.identity_issued_by}
                  onChange={handleFormChange}
                  className={clientErrors.identity_issued_by || formError?.includes('nơi cấp') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.identity_issued_by && <p className={styles.errorMsg}>{clientErrors.identity_issued_by}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ảnh căn cước mặt trước {(modalMode === 'add' || !selectedUser?.id_card_front_url) && <span className={styles.required}>*</span>}</label>
                {modalMode === 'edit' && selectedUser?.id_card_front_url && (
                  <div className="mt-2">
                    <p className="text-sm mb-2">Ảnh hiện tại:</p>
                    {renderImage(selectedUser.id_card_front_url, 'ID Card Front', 'id_card_front')}
                    <p><a href={selectedUser.id_card_front_url} target="_blank" rel="noopener noreferrer">Xem file gốc</a></p>
                  </div>
                )}
                {previewUrls.id_card_front && (
                  <div className="mt-2">
                    <p className="text-sm mb-2">Xem trước ảnh mới:</p>
                    <img src={previewUrls.id_card_front} alt="Preview ID Card Front" className={styles.fixedImage} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files[0], setIdCardFront, 'id_card_front')}
                  className={clientErrors.id_card_front || formError?.includes('căn cước mặt trước') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.id_card_front && <p className={styles.errorMsg}>{clientErrors.id_card_front}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ảnh căn cước mặt sau {(modalMode === 'add' || !selectedUser?.id_card_back_url) && <span className={styles.required}>*</span>}</label>
                {modalMode === 'edit' && selectedUser?.id_card_back_url && (
                  <div className="mt-2">
                    <p className="text-sm mb-2">Ảnh hiện tại:</p>
                    {renderImage(selectedUser.id_card_back_url, 'ID Card Back', 'id_card_back')}
                    <p><a href={selectedUser.id_card_back_url} target="_blank" rel="noopener noreferrer">Xem file gốc</a></p>
                  </div>
                )}
                {previewUrls.id_card_back && (
                  <div className="mt-2">
                    <p className="text-sm mb-2">Xem trước ảnh mới:</p>
                    <img src={previewUrls.id_card_back} alt="Preview ID Card Back" className={styles.fixedImage} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files[0], setIdCardBack, 'id_card_back')}
                  className={clientErrors.id_card_back || formError?.includes('căn cước mặt sau') ? styles.inputError : styles.modalInput}
                />
                {clientErrors.id_card_back && <p className={styles.errorMsg}>{clientErrors.id_card_back}</p>}
              </div>
              {userForm.accountType === 'business' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Chức vụ <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      name="position"
                      placeholder="Nhập chức vụ"
                      value={userForm.position || ''}
                      onChange={handleFormChange}
                      className={clientErrors.position || formError?.includes('chức vụ') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.position && <p className={styles.errorMsg}>{clientErrors.position}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tên tổ chức/doanh nghiệp <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      name="organization_name"
                      placeholder="Nhập tên tổ chức"
                      value={userForm.organization_name || ''}
                      onChange={handleFormChange}
                      className={clientErrors.organization_name || formError?.includes('tên tổ chức') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.organization_name && <p className={styles.errorMsg}>{clientErrors.organization_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mã số thuế <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      name="tax_code"
                      placeholder="Nhập mã số thuế"
                      value={userForm.tax_code || ''}
                      onChange={handleFormChange}
                      className={clientErrors.tax_code || formError?.includes('mã số thuế') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.tax_code && <p className={styles.errorMsg}>{clientErrors.tax_code}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ngày cấp giấy phép kinh doanh <span className={styles.required}>*</span></label>
                    <input
                      type="date"
                      name="business_license_issue_date"
                      value={userForm.business_license_issue_date || ''}
                      onChange={handleFormChange}
                      className={clientErrors.business_license_issue_date || formError?.includes('ngày cấp giấy') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.business_license_issue_date && <p className={styles.errorMsg}>{clientErrors.business_license_issue_date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nơi cấp giấy phép kinh doanh <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      name="business_license_issued_by"
                      placeholder="Nhập nơi cấp"
                      value={userForm.business_license_issued_by || ''}
                      onChange={handleFormChange}
                      className={clientErrors.business_license_issued_by || formError?.includes('nơi cấp giấy') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.business_license_issued_by && <p className={styles.errorMsg}>{clientErrors.business_license_issued_by}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Giấy chứng nhận đăng ký kinh doanh {(modalMode === 'add' || !selectedUser?.business_license_url) && <span className={styles.required}>*</span>}</label>
                    {modalMode === 'edit' && selectedUser?.business_license_url && (
                      <div className="mt-2">
                        <p className="text-sm mb-2">File hiện tại:</p>
                        {imageErrors.business_license ? (
                          <p className={styles.errorMsg}>Không thể tải file giấy chứng nhận</p>
                        ) : (
                          <p><a href={selectedUser.business_license_url} target="_blank" rel="noopener noreferrer">Xem file</a></p>
                        )}
                      </div>
                    )}
                    {previewUrls.business_license && (
                      <div className="mt-2">
                        <p className="text-sm mb-2">Xem trước file mới: {businessLicense?.name}</p>
                        {['pdf'].includes(businessLicense?.name.split('.').pop().toLowerCase()) ? (
                          <a href={previewUrls.business_license} target="_blank" rel="noopener noreferrer">Xem PDF</a>
                        ) : (
                          <p>File Word không hỗ trợ xem trước</p>
                        )}
                      </div>
                    )}
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
                              business_license: 'Vui lòng tải lên file PDF hoặc Word (.pdf, .doc, .docx).',
                            });
                            setBusinessLicense(null);
                            setPreviewUrls(prev => ({ ...prev, business_license: null }));
                          } else {
                            handleFileChange(file, setBusinessLicense, 'business_license');
                          }
                        }
                      }}
                      className={clientErrors.business_license || formError?.includes('giấy chứng nhận') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.business_license && <p className={styles.errorMsg}>{clientErrors.business_license}</p>}
                  </div>
                </>
              )}
              {userForm.accountType === 'auction' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phương thức liên hệ trực tuyến <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      name="online_contact_method"
                      placeholder="Nhập phương thức liên hệ"
                      value={userForm.online_contact_method || ''}
                      onChange={handleFormChange}
                      className={clientErrors.online_contact_method || formError?.includes('liên hệ trực tuyến') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.online_contact_method && <p className={styles.errorMsg}>{clientErrors.online_contact_method}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số chứng chỉ <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      name="certificate_number"
                      placeholder="Nhập số chứng chỉ"
                      value={userForm.certificate_number || ''}
                      onChange={handleFormChange}
                      className={clientErrors.certificate_number || formError?.includes('số chứng chỉ') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.certificate_number && <p className={styles.errorMsg}>{clientErrors.certificate_number}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ngày cấp chứng chỉ <span className={styles.required}>*</span></label>
                    <input
                      type="date"
                      name="certificate_issue_date"
                      value={userForm.certificate_issue_date || ''}
                      onChange={handleFormChange}
                      className={clientErrors.certificate_issue_date || formError?.includes('ngày cấp chứng chỉ') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.certificate_issue_date && <p className={styles.errorMsg}>{clientErrors.certificate_issue_date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nơi cấp chứng chỉ <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      name="certificate_issued_by"
                      placeholder="Nhập nơi cấp"
                      value={userForm.certificate_issued_by || ''}
                      onChange={handleFormChange}
                      className={clientErrors.certificate_issued_by || formError?.includes('nơi cấp chứng chỉ') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.certificate_issued_by && <p className={styles.errorMsg}>{clientErrors.certificate_issued_by}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ảnh thẻ đấu giá viên mặt trước {(modalMode === 'add' || !selectedUser?.auctioneer_card_front_url) && <span className={styles.required}>*</span>}</label>
                    {modalMode === 'edit' && selectedUser?.auctioneer_card_front_url && (
                      <div className="mt-2">
                        <p className="text-sm mb-2">Ảnh hiện tại:</p>
                        {renderImage(selectedUser.auctioneer_card_front_url, 'Auctioneer Card Front', 'auctioneer_card_front')}
                        <p><a href={selectedUser.auctioneer_card_front_url} target="_blank" rel="noopener noreferrer">Xem file gốc</a></p>
                      </div>
                    )}
                    {previewUrls.auctioneer_card_front && (
                      <div className="mt-2">
                        <p className="text-sm mb-2">Xem trước ảnh mới:</p>
                        <img src={previewUrls.auctioneer_card_front} alt="Preview Auctioneer Card Front" className={styles.fixedImage} />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e.target.files[0], setAuctioneerCardFront, 'auctioneer_card_front')}
                      className={clientErrors.auctioneer_card_front || formError?.includes('thẻ đấu giá viên mặt trước') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.auctioneer_card_front && <p className={styles.errorMsg}>{clientErrors.auctioneer_card_front}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ảnh thẻ đấu giá viên mặt sau {(modalMode === 'add' || !selectedUser?.auctioneer_card_back_url) && <span className={styles.required}>*</span>}</label>
                    {modalMode === 'edit' && selectedUser?.auctioneer_card_back_url && (
                      <div className="mt-2">
                        <p className="text-sm mb-2">Ảnh hiện tại:</p>
                        {renderImage(selectedUser.auctioneer_card_back_url, 'Auctioneer Card Back', 'auctioneer_card_back')}
                        <p><a href={selectedUser.auctioneer_card_back_url} target="_blank" rel="noopener noreferrer">Xem file gốc</a></p>
                      </div>
                    )}
                    {previewUrls.auctioneer_card_back && (
                      <div className="mt-2">
                        <p className="text-sm mb-2">Xem trước ảnh mới:</p>
                        <img src={previewUrls.auctioneer_card_back} alt="Preview Auctioneer Card Back" className={styles.fixedImage} />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e.target.files[0], setAuctioneerCardBack, 'auctioneer_card_back')}
                      className={clientErrors.auctioneer_card_back || formError?.includes('thẻ đấu giá viên mặt sau') ? styles.inputError : styles.modalInput}
                    />
                    {clientErrors.auctioneer_card_back && <p className={styles.errorMsg}>{clientErrors.auctioneer_card_back}</p>}
                  </div>
                </>
              )}
              {modalMode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Vai trò <span className={styles.required}>*</span></label>
                  <select
                    name="role_id"
                    value={userForm.role_id}
                    onChange={handleFormChange}
                    className={clientErrors.role_id || formError?.includes('vai trò') ? styles.inputError : styles.modalInput}
                  >
                    <option value="">-- Chọn vai trò --</option>
                    {roles.map(role => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {clientErrors.role_id && <p className={styles.errorMsg}>{clientErrors.role_id}</p>}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimarySave} onClick={handleSaveUser}>
                Lưu
              </button>
              <button className={styles.btnSecondary} onClick={closeUserModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedUser && (
        <div className={styles.modal} role="dialog" aria-modal="true" onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Người Dùng</h2>
              <button className={styles.modalClose} onClick={closeViewModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p><strong>ID:</strong> {selectedUser.id}</p>
              <p><strong>Họ và tên:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Số điện thoại:</strong> {selectedUser.phone}</p>
              <p><strong>Vai trò:</strong> {selectedUser.role_name}</p>
              <p><strong>Loại tài khoản:</strong> {selectedUser.accountType === 'personal' ? 'Cá nhân' : selectedUser.accountType === 'business' ? 'Doanh nghiệp' : 'Đấu giá viên'}</p>
              <p><strong>Ngày sinh:</strong> {selectedUser.birth_date}</p>
              <p><strong>Giới tính:</strong> {selectedUser.gender === 'male' ? 'Nam' : selectedUser.gender === 'female' ? 'Nữ' : selectedUser.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}</p>
              <p><strong>Địa chỉ:</strong> {selectedUser.address}</p>
              <p><strong>Tên ngân hàng:</strong> {selectedUser.bank_name}</p>
              <p><strong>Số tài khoản ngân hàng:</strong> {selectedUser.bank_account}</p>
              <p><strong>Chi nhánh ngân hàng:</strong> {selectedUser.bank_branch}</p>
              <p><strong>Số CMND/CCCD:</strong> {selectedUser.identity_number}</p>
              <p><strong>Ngày cấp CMND/CCCD:</strong> {selectedUser.identity_issue_date}</p>
              <p><strong>Nơi cấp CMND/CCCD:</strong> {selectedUser.identity_issued_by}</p>
              <div className="mt-2">
                <p><strong>Ảnh căn cước mặt trước:</strong></p>
                {renderImage(selectedUser.id_card_front_url, 'ID Card Front', 'id_card_front')}
                {selectedUser.id_card_front_url && !imageErrors.id_card_front && (
                  <p><a href={selectedUser.id_card_front_url} target="_blank" rel="noopener noreferrer">Xem file gốc</a></p>
                )}
              </div>
              <div className="mt-2">
                <p><strong>Ảnh căn cước mặt sau:</strong></p>
                {renderImage(selectedUser.id_card_back_url, 'ID Card Back', 'id_card_back')}
                {selectedUser.id_card_back_url && !imageErrors.id_card_back && (
                  <p><a href={selectedUser.id_card_back_url} target="_blank" rel="noopener noreferrer">Xem file gốc</a></p>
                )}
              </div>
              {selectedUser.accountType === 'business' && (
                <>
                  <p><strong>Chức vụ:</strong> {selectedUser.position || 'Chưa cập nhật'}</p>
                  <p><strong>Tên tổ chức/doanh nghiệp:</strong> {selectedUser.organization_name || 'Chưa cập nhật'}</p>
                  <p><strong>Mã số thuế:</strong> {selectedUser.tax_code || 'Chưa cập nhật'}</p>
                  <p><strong>Ngày cấp giấy phép kinh doanh:</strong> {selectedUser.business_license_issue_date}</p>
                  <p><strong>Nơi cấp giấy phép kinh doanh:</strong> {selectedUser.business_license_issued_by || 'Chưa cập nhật'}</p>
                  <div className="mt-2">
                    <p><strong>Giấy chứng nhận đăng ký kinh doanh:</strong></p>
                    {imageErrors.business_license || !selectedUser.business_license_url ? (
                      <p>Chưa cập nhật hoặc không thể tải file</p>
                    ) : (
                      <p><a href={selectedUser.business_license_url} target="_blank" rel="noopener noreferrer">Xem file</a></p>
                    )}
                  </div>
                </>
              )}
              {selectedUser.accountType === 'auction' && (
                <>
                  <p><strong>Phương thức liên hệ trực tuyến:</strong> {selectedUser.online_contact_method || 'Chưa cập nhật'}</p>
                  <p><strong>Số chứng chỉ:</strong> {selectedUser.certificate_number || 'Chưa cập nhật'}</p>
                  <p><strong>Ngày cấp chứng chỉ:</strong> {selectedUser.certificate_issue_date}</p>
                  <p><strong>Nơi cấp chứng chỉ:</strong> {selectedUser.certificate_issued_by || 'Chưa cập nhật'}</p>
                  <div className="mt-2">
                    <p><strong>Ảnh thẻ đấu giá viên mặt trước:</strong></p>
                    {renderImage(selectedUser.auctioneer_card_front_url, 'Auctioneer Card Front', 'auctioneer_card_front')}
                    {selectedUser.auctioneer_card_front_url && !imageErrors.auctioneer_card_front && (
                      <p><a href={selectedUser.auctioneer_card_front_url} target="_blank" rel="noopener noreferrer">Xem file gốc</a></p>
                    )}
                  </div>
                  <div className="mt-2">
                    <p><strong>Ảnh thẻ đấu giá viên mặt sau:</strong></p>
                    {renderImage(selectedUser.auctioneer_card_back_url, 'Auctioneer Card Back', 'auctioneer_card_back')}
                    {selectedUser.auctioneer_card_back_url && !imageErrors.auctioneer_card_back && (
                      <p><a href={selectedUser.auctioneer_card_back_url} target="_blank" rel="noopener noreferrer">Xem file gốc</a></p>
                    )}
                  </div>
                </>
              )}
              <p><strong>Ngày tạo:</strong> {selectedUser.createdDate}</p>
              <p><strong>Trạng thái duyệt:</strong> {selectedUser.admin_verify}</p>
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