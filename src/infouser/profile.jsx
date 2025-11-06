import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../UserContext';
import Loading from '../components/Loading';
import styles from './profile.module.css';

const Profile = () => {
  const { user, token, logout } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showBankPopup, setShowBankPopup] = useState(false);
  const [bankPopupMode, setBankPopupMode] = useState('add');
  const [editingBankId, setEditingBankId] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [auctionHistory, setAuctionHistory] = useState([]);
  const [myAuctions, setMyAuctions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bankError, setBankError] = useState(null);
  const [userData, setUserData] = useState({
    id: null,
    fullName: '', 
    username: '',
    accountType: '',
    role_id: null,
    email: '',
    phone: '',
    address: '',
    gender: 'male',
    identity_number: '',
    identity_issue_date: '',
    identity_issued_by: '',
    idCardFront: null,
    idCardFrontUrl: null,
    idCardBack: null,
    idCardBackUrl: null,
    bankName: '',
    bankAccount: '',
    bankBranch: '',
    createdAt: '',
    emailVerifiedAt: '',
    organization_name: '',
    position: '',
    tax_code: '',
    business_license: null,
    business_license_issue_date: '',
    business_license_issued_by: '',
    auctioneer_card_front: null,
    auctioneer_card_back: null,
    certificate_number: '',
    certificate_issue_date: '',
    certificate_issued_by: '',
    online_contact_method: '',
  });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    gender: 'male',
    identity_number: '',
    identity_issue_date: '',
    identity_issued_by: '',
    organization_name: '',
    position: '',
    tax_code: '',
    business_license: null,
    business_license_issue_date: '',
    business_license_issued_by: '',
    auctioneer_card_front: null,
    auctioneer_card_back: null,
    certificate_number: '',
    certificate_issue_date: '',
    certificate_issued_by: '',
    online_contact_method: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [bankData, setBankData] = useState({
    bankName: '',
    bankAccount: '',
    bankBranch: '',
    accountHolder: userData.fullName || '',
  });
  const navigate = useNavigate();

  useEffect(() => {
  if (userData.id) {
    // Chỉ set formData khi userData thực sự thay đổi
    setFormData({
      fullName: userData.fullName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: userData.address || '',
      gender: userData.gender || 'male',
      identity_number: userData.identity_number || '',
      identity_issue_date: userData.identity_issue_date || '',
      identity_issued_by: userData.identity_issued_by || '',
      organization_name: userData.organization_name || '',
      position: userData.position || '',
      tax_code: userData.tax_code || '',
      business_license: userData.business_license || null,
      business_license_issue_date: userData.business_license_issue_date || '',
      business_license_issued_by: userData.business_license_issued_by || '',
      auctioneer_card_front: userData.auctioneer_card_front || null,
      auctioneer_card_back: userData.auctioneer_card_back || null,
      certificate_number: userData.certificate_number || '',
      certificate_issue_date: userData.certificate_issue_date || '',
      certificate_issued_by: userData.certificate_issued_by || '',
      online_contact_method: userData.online_contact_method || '',
    });
  }
}, [userData]);

  useEffect(() => {
    if (!token) {
      setError('Vui lòng đăng nhập để xem thông tin cá nhân');
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log('API /user response:', data);

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            navigate('/login');
            return;
          }
          throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        }

        if (data.status && data.user) {
          const newUserData = {
            id: data.user.user_id || null,
            fullName: data.user.full_name || 'Chưa cập nhật',
            username: data.user.email ? data.user.email.split('@')[0] : 'Chưa cập nhật',
       
            accountType:
              data.user.role_id === 1
                ? 'Cá nhân'
                : data.user.role_id === 2
                ? 'Quản trị viên'
                : data.user.role_id === 5
                ? 'Đấu giá viên'
                : data.user.role_id === 9
                ? 'Doanh nghiệp'
                : // fallback sang giá trị role (chuỗi) cũ nếu cần
                data.user.role === 'ToChucDauGia'
                ? 'Tổ chức đấu giá'
                : data.user.role === 'ChuyenVienTTC'
                ? 'Chuyên viên TTC'
                : data.user.role === 'DonViThuc'
                ? 'Đơn vị thực'
                : 'Chưa xác định',

            role_id: data.user.role_id || null,
            email: data.user.email || 'Chưa cập nhật',
            phone: data.user.phone || 'Chưa cập nhật',
            address: data.user.address || 'Chưa cập nhật',
            gender: data.user.gender || 'male',
            identity_number: data.user.identity_number || 'Chưa cập nhật',
            identity_issue_date: data.user.identity_issue_date || 'Chưa cập nhật',
            identity_issued_by: data.user.identity_issued_by || 'Chưa cập nhật',
            idCardFront: data.user.id_card_front || null,
            idCardFrontUrl: data.user.id_card_front_url || null,
            idCardBack: data.user.id_card_back || null,
            idCardBackUrl: data.user.id_card_back_url || null,
            bankName: data.user.bank_name || 'Chưa cập nhật',
            bankAccount: data.user.bank_account || 'Chưa cập nhật',
            bankBranch: data.user.bank_branch || 'Chưa cập nhật',
            createdAt: data.user.created_at || 'Chưa cập nhật',
            emailVerifiedAt: data.user.email_verified_at || 'Chưa cập nhật',
            organization_name: data.user.organization_name || 'Chưa cập nhật',
            position: data.user.position || 'Chưa cập nhật',
            tax_code: data.user.tax_code || 'Chưa cập nhật',
            business_license: data.user.business_license || null,
            business_license_issue_date: data.user.business_license_issue_date || 'Chưa cập nhật',
            business_license_issued_by: data.user.business_license_issued_by || 'Chưa cập nhật',
            auctioneer_card_front: data.user.auctioneer_card_front || null,
            auctioneer_card_back: data.user.auctioneer_card_back || null,
            certificate_number: data.user.certificate_number || 'Chưa cập nhật',
            certificate_issue_date: data.user.certificate_issue_date || 'Chưa cập nhật',
            certificate_issued_by: data.user.certificate_issued_by || 'Chưa cập nhật',
            online_contact_method: data.user.online_contact_method || 'Chưa cập nhật',
          };
          setUserData(newUserData);
          console.log('Set userData:', newUserData);
        } else {
          throw new Error('Định dạng dữ liệu không hợp lệ');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, token]);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.vietqr.io/v2/banks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('API VietQR /banks response:', data);

      if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
      }

      if (data.code === '00' && Array.isArray(data.data)) {
        setBanks(data.data);
      } else {
        throw new Error('Dữ liệu ngân hàng không hợp lệ');
      }
    } catch (err) {
      setBankError('Lỗi tải danh sách ngân hàng: ' + err.message);
      console.error('Error fetching banks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userData.id) return;

    const fetchContracts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}contracts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            navigate('/login');
            return;
          }
          throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        if (data.status && Array.isArray(data.contracts)) {
          const filteredContracts = data.contracts.filter((contract) => contract.winner_id === userData.id);
          const formattedContracts = filteredContracts.map((contract) => ({
            id: contract.contract_id,
            sessionName: contract.session.item.name,
            finalPrice: new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(parseFloat(contract.final_price)),
            signDate: new Date(contract.signed_date).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              timeZone: 'Asia/Ho_Chi_Minh',
            }),
            status: contract.status === 'DaThanhToan' ? 'Đã Thanh Toán' : 'Chờ Thanh Toán',
          }));
          setContracts(formattedContracts);
        } else {
          throw new Error('Định dạng dữ liệu hợp đồng không hợp lệ');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [userData.id, navigate, token]);

  const fetchMyAuctions = async () => {
    console.log('Gọi API cho user_id:', userData.id);
    if (!userData.id) {
      console.error('userData.id is null or undefined');
      setError('Không thể lấy ID người dùng');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}products?owner_id=${userData.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log('API /products response:', data);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login');
          return;
        }
        if (response.status === 404) {
          setMyAuctions([]);
          throw new Error('Không tìm thấy sản phẩm nào của bạn.');
        }
        throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
      }

      const items = Array.isArray(data) ? data : data.data || [];
      if (!Array.isArray(items)) {
        throw new Error('Dữ liệu sản phẩm không đúng định dạng');
      }

      const formattedMyAuctions = items.map((item, index) => ({
        stt: index + 1,
        id: item.id,
        tenTaiSan: item.name || 'Chưa có tên',
        trangThai: mapStatus(item.status),
        thoiGian: item.created_at
          ? new Date(item.created_at).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              timeZone: 'Asia/Ho_Chi_Minh',
            })
          : 'Chưa có',
        xemChiTiet: `/auction/${item.id}`,
      }));

      setMyAuctions(formattedMyAuctions);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching my auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userData.id || !token) {
      setLoading(false);
      return;
    }

    fetchMyAuctions();
  }, [userData.id, token, navigate]);

  const fetchFavorites = async () => {
    if (!userData.id || !token) {
      setError('Không thể lấy danh sách yêu thích: Vui lòng đăng nhập');
      setLoading(false);
      return;
    }

    const BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE}my-favorites`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Lỗi API /favorites: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const favoritesArray = Array.isArray(data) ? data : data.favorites || data.data || [];

      if (!Array.isArray(favoritesArray)) {
        throw new Error('Dữ liệu yêu thích không hợp lệ');
      }

      const formattedFavorites = favoritesArray.map((fav, index) => ({
        stt: index + 1,
        id: fav.session_id || fav.id,
        tenTaiSan: fav.session?.item?.name || 'Chưa có tên',
        giaKhoiDiem: fav.session?.item?.starting_price
          ? new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(parseFloat(fav.session.item.starting_price))
          : 'Chưa có',
        thoiGian: fav.created_at
          ? new Date(fav.created_at).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              timeZone: 'Asia/Ho_Chi_Minh',
            })
          : 'Chưa có',
        xemChiTiet: `/auction-session/${fav.session_id}`,
    }));
      setFavorites(formattedFavorites);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách yêu thích');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctionHistory = async () => {
    if (!userData.id || !token) {
      setError('Không thể lấy lịch sử đấu giá: Vui lòng đăng nhập');
      setLoading(false);
      return;
    }

    const BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

    try {
      setLoading(true);
      setError(null);

      const [profileRes, productRes] = await Promise.all([
        fetch(`${BASE}auction-profiles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${BASE}products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }),
      ]);

      if (profileRes.status === 401 || productRes.status === 401) {
        localStorage.removeItem('token');
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      if (!profileRes.ok) {
        const err = await profileRes.text();
        throw new Error(`Lỗi API /auction-profiles: ${profileRes.status} - ${err}`);
      }
      if (!productRes.ok) {
        const err = await productRes.text();
        throw new Error(`Lỗi API /products: ${productRes.status} - ${err}`);
      }

      const profileData = await profileRes.json();
      const productData = await productRes.json();

      const productsArray = Array.isArray(productData) ? productData : productData.data || [];
      const itemMap = new Map();
      productsArray.forEach((p) => {
        if (p && p.id !== undefined) itemMap.set(p.id, p.name || '');
      });

      const profilesArray = Array.isArray(profileData)
        ? profileData
        : profileData.profiles || profileData.data || [];

      if (!Array.isArray(profilesArray)) {
        throw new Error('Dữ liệu hồ sơ đấu giá không hợp lệ');
      }

      const formattedAuctionHistory = profilesArray
        .filter((profile) => profile.user_id === userData.id)
        .map((profile, index) => {
          const session = profile.session || {};
          const sessionItemId = session.item_id || session.item?.id || profile.session_id;
          const itemNameFromProducts = itemMap.get(sessionItemId);
          const tenPhien = itemNameFromProducts || session?.item?.name || `Phiên đấu giá #${sessionItemId || ''}`;

          return {
            stt: index + 1,
            tenPhien,
            tenTaiSan: session?.item?.name || itemNameFromProducts || 'Chưa có tên tài sản',
            trangThai: mapProfileStatus(profile.status),
            thoiGianDauGia: profile.created_at
              ? new Date(profile.created_at).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  timeZone: 'Asia/Ho_Chi_Minh',
                })
              : 'Chưa có',
            ketQua: profile.is_paid
              ? profile.status === 'DaDuyet'
                ? 'Được tham gia'
                : profile.status === 'TuChoi'
                ? 'Bị từ chối'
                : 'Chờ duyệt'
              : 'Chưa nộp cọc',
            xemChiTiet: `/auction/${sessionItemId || ''}`,
          };
        });

      setAuctionHistory(formattedAuctionHistory);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải lịch sử đấu giá');
      console.error('Error fetching auction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'auction-history' && userData.id && token) {
      fetchAuctionHistory();
    }
  }, [activeTab, userData.id, token, navigate]);

  useEffect(() => {
    if (activeTab === 'favorites' && userData.id && token) {
      fetchFavorites();
    }
  }, [activeTab, userData.id, token, navigate]);

  const mapStatus = (status) => {
    const statusMap = {
      ChoDuyet: 'Chờ duyệt',
      ChoDauGia: 'Chờ đấu giá',
      DangDauGia: 'Đang đấu giá',
      DaBan: 'Đã bán',
      Huy: 'Hủy',
    };
    return statusMap[status] || status;
  };

  const mapProfileStatus = (status) => {
    const statusMap = {
      ChoDuyet: 'Chờ duyệt',
      DaDuyet: 'Đã duyệt',
      TuChoi: 'Từ chối',
    };
    return statusMap[status] || status;
  };

  const handleTabChange = (tab) => setActiveTab(tab);

  const openProfilePopup = () => setShowProfilePopup(true);
  const closeProfilePopup = () => setShowProfilePopup(false);

  const openBankPopup = () => {
    setBankPopupMode('add');
    setBankData({
      bankName: '',
      bankAccount: '',
      bankBranch: '',
      accountHolder: userData.fullName,
    });
    setShowBankPopup(true);
    fetchBanks();
  };

  const closeBankPopup = () => {
    setShowBankPopup(false);
    setBankError(null);
  };

  const handleEditBank = (accountId) => {
    setBankPopupMode('edit');
    setEditingBankId(accountId);
    setBankData({
      bankName: userData.bankName !== 'Chưa cập nhật' ? userData.bankName : '',
      bankAccount: userData.bankAccount !== 'Chưa cập nhật' ? userData.bankAccount : '',
      bankBranch: userData.bankBranch !== 'Chưa cập nhật' ? userData.bankBranch : '',
      accountHolder: userData.fullName,
    });
    setShowBankPopup(true);
    fetchBanks();
  };

  const handleDeleteBank = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}user/update/${userData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            bank_name: null,
            bank_account: null,
            bank_branch: null,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            navigate('/login');
            return;
          }
          throw new Error(data.message || 'Lỗi khi xóa tài khoản ngân hàng');
        }

        if (data.status) {
          setUserData((prev) => ({
            ...prev,
            bankName: 'Chưa cập nhật',
            bankAccount: 'Chưa cập nhật',
            bankBranch: 'Chưa cập nhật',
          }));
          alert('Xóa tài khoản ngân hàng thành công!');
        } else {
          throw new Error(data.message || 'Lỗi từ server');
        }
      } catch (err) {
        setError(err.message);
        alert(`Lỗi: ${err.message}`);
      }
    }
  };

  const handleBankInputChange = (e) => {
    const { id, value } = e.target;
    setBankData((prev) => ({
      ...prev,
      [id === 'bankName' ? 'bankName' : id === 'bankAccount' ? 'bankAccount' : id]: value,
    }));
  };

  const handleSaveBank = async () => {
    try {
      if (!bankData.bankName || !bankData.bankAccount || !bankData.bankBranch) {
        setBankError('Vui lòng nhập đầy đủ tên ngân hàng, số tài khoản và chi nhánh');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}user/update/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bank_name: bankData.bankName,
          bank_account: bankData.bankAccount,
          bank_branch: bankData.bankBranch,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login');
          return;
        }
        if (response.status === 422) {
          const errors = data.errors || {};
          const errorMessages = Object.values(errors).flat().join(', ');
          throw new Error(errorMessages || 'Dữ liệu không hợp lệ');
        }
        throw new Error(data.message || 'Lỗi khi lưu tài khoản ngân hàng');
      }

      if (data.status) {
        setUserData((prev) => ({
          ...prev,
          bankName: data.user.bank_name || 'Chưa cập nhật',
          bankAccount: data.user.bank_account || 'Chưa cập nhật',
          bankBranch: data.user.bank_branch || 'Chưa cập nhật',
        }));
        alert('Lưu tài khoản ngân hàng thành công!');
        closeBankPopup();
      } else {
        throw new Error(data.message || 'Lỗi từ server');
      }
    } catch (err) {
      setBankError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
  try {
    const payload = new FormData();
    
    // === KIỂM TRA VÀ CHỈ THÊM CÁC TRƯỜNG CÓ THAY ĐỔI ===
    let hasChanges = false;

    // Danh sách các trường cơ bản
    const baseFields = [
      { field: 'full_name', formKey: 'fullName', userKey: 'fullName' },
      { field: 'email', formKey: 'email', userKey: 'email' },
      { field: 'phone', formKey: 'phone', userKey: 'phone' },
      { field: 'address', formKey: 'address', userKey: 'address' },
      { field: 'gender', formKey: 'gender', userKey: 'gender' },
      { field: 'identity_number', formKey: 'identity_number', userKey: 'identity_number' },
      { field: 'identity_issue_date', formKey: 'identity_issue_date', userKey: 'identity_issue_date' },
      { field: 'identity_issued_by', formKey: 'identity_issued_by', userKey: 'identity_issued_by' }
    ];

    // Kiểm tra và thêm các trường có thay đổi
    baseFields.forEach(({ field, formKey, userKey }) => {
      const formValue = formData[formKey];
      const userValue = userData[userKey];
      
      // Chỉ thêm nếu có giá trị và khác với giá trị hiện tại
      if (formValue !== undefined && formValue !== null && formValue !== '' && 
          formValue !== userValue && formValue !== 'Chưa cập nhật') {
        payload.append(field, formValue);
        hasChanges = true;
        console.log(`Added ${field}:`, formValue);
      }
    });

    // === XỬ LÝ TRƯỜNG CHO DOANH NGHIỆP (role_id = 9) ===
    if (userData.role_id === 9) {
      const businessFields = [
        { field: 'organization_name', formKey: 'organization_name', userKey: 'organization_name' },
        { field: 'position', formKey: 'position', userKey: 'position' },
        { field: 'tax_code', formKey: 'tax_code', userKey: 'tax_code' },
        { field: 'business_license_issue_date', formKey: 'business_license_issue_date', userKey: 'business_license_issue_date' },
        { field: 'business_license_issued_by', formKey: 'business_license_issued_by', userKey: 'business_license_issued_by' }
      ];

      businessFields.forEach(({ field, formKey, userKey }) => {
        const formValue = formData[formKey];
        const userValue = userData[userKey];
        
        if (formValue !== undefined && formValue !== null && formValue !== '' && 
            formValue !== userValue && formValue !== 'Chưa cập nhật') {
          payload.append(field, formValue);
          hasChanges = true;
          console.log(`Added business ${field}:`, formValue);
        }
      });

      // Xử lý file business_license
      if (formData.business_license instanceof File) {
        payload.append('business_license', formData.business_license);
        hasChanges = true;
        console.log('Added business_license file');
      }
    }

    // === XỬ LÝ TRƯỜNG CHO ĐẤU GIÁ VIÊN (role_id = 5) ===
    if (userData.role_id === 5) {
      const auctionFields = [
        { field: 'certificate_number', formKey: 'certificate_number', userKey: 'certificate_number' },
        { field: 'certificate_issue_date', formKey: 'certificate_issue_date', userKey: 'certificate_issue_date' },
        { field: 'certificate_issued_by', formKey: 'certificate_issued_by', userKey: 'certificate_issued_by' },
        { field: 'online_contact_method', formKey: 'online_contact_method', userKey: 'online_contact_method' }
      ];

      auctionFields.forEach(({ field, formKey, userKey }) => {
        const formValue = formData[formKey];
        const userValue = userData[userKey];
        
        if (formValue !== undefined && formValue !== null && formValue !== '' && 
            formValue !== userValue && formValue !== 'Chưa cập nhật') {
          payload.append(field, formValue);
          hasChanges = true;
          console.log(`Added auction ${field}:`, formValue);
        }
      });

      // Xử lý file auctioneer cards
      if (formData.auctioneer_card_front instanceof File) {
        payload.append('auctioneer_card_front', formData.auctioneer_card_front);
        hasChanges = true;
        console.log('Added auctioneer_card_front file');
      }
      
      if (formData.auctioneer_card_back instanceof File) {
        payload.append('auctioneer_card_back', formData.auctioneer_card_back);
        hasChanges = true;
        console.log('Added auctioneer_card_back file');
      }
    }

    // === KIỂM TRA NẾU KHÔNG CÓ THAY ĐỔI ===
    if (!hasChanges) {
      alert('Không có thay đổi nào để cập nhật');
      return;
    }

    console.log('Sending PUT request to update user profile with changes:', hasChanges);

    // === GỬI REQUEST ===
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}user/update/${userData.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: payload,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }
      if (response.status === 422) {
        const errors = data.errors || {};
        const errorMessages = Object.values(errors).flat().join(', ');
        throw new Error(errorMessages || 'Dữ liệu không hợp lệ');
      }
      if (response.status === 400) {
        throw new Error(data.message || 'Bad Request: Không có dữ liệu để cập nhật');
      }
      throw new Error(data.message || `Lỗi khi cập nhật thông tin: ${response.status}`);
    }

    if (data.status) {
      // Cập nhật state với dữ liệu mới từ server
      setUserData((prev) => ({
        ...prev,
        fullName: data.user.full_name || prev.fullName,
        email: data.user.email || prev.email,
        phone: data.user.phone || prev.phone,
        address: data.user.address || prev.address,
        gender: data.user.gender || prev.gender,
        identity_number: data.user.identity_number || prev.identity_number,
        identity_issue_date: data.user.identity_issue_date || prev.identity_issue_date,
        identity_issued_by: data.user.identity_issued_by || prev.identity_issued_by,
        idCardFront: data.user.id_card_front || prev.idCardFront,
        idCardFrontUrl: data.user.id_card_front ? `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}storage/${data.user.id_card_front}` : prev.idCardFrontUrl,
        idCardBack: data.user.id_card_back || prev.idCardBack,
        idCardBackUrl: data.user.id_card_back ? `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}storage/${data.user.id_card_back}` : prev.idCardBackUrl,
        organization_name: data.user.organization_name || prev.organization_name,
        position: data.user.position || prev.position,
        tax_code: data.user.tax_code || prev.tax_code,
        business_license: data.user.business_license || prev.business_license,
        business_license_issue_date: data.user.business_license_issue_date || prev.business_license_issue_date,
        business_license_issued_by: data.user.business_license_issued_by || prev.business_license_issued_by,
        auctioneer_card_front: data.user.auctioneer_card_front || prev.auctioneer_card_front,
        auctioneer_card_back: data.user.auctioneer_card_back || prev.auctioneer_card_back,
        certificate_number: data.user.certificate_number || prev.certificate_number,
        certificate_issue_date: data.user.certificate_issue_date || prev.certificate_issue_date,
        certificate_issued_by: data.user.certificate_issued_by || prev.certificate_issued_by,
        online_contact_method: data.user.online_contact_method || prev.online_contact_method,
      }));
      alert('Cập nhật thông tin cá nhân thành công!');
      closeProfilePopup();
    } else {
      throw new Error(data.message || 'Lỗi từ server');
    }
  } catch (err) {
    setError(err.message);
    alert(`Lỗi: ${err.message}`);
  }
};

  const handleChangePassword = async () => {
    try {
      if (!passwordData.newPassword || !passwordData.confirmPassword) {
        alert('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('Mật khẩu mới và xác nhận mật khẩu không khớp');
        return;
      }
      if (passwordData.newPassword.length < 6) {
        alert('Mật khẩu mới phải có ít nhất 6 ký tự');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}user/update/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: passwordData.newPassword,
          password_confirmation: passwordData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login');
          return;
        }
        if (response.status === 422) {
          const errors = data.errors || {};
          const errorMessages = Object.values(errors).flat().join(', ');
          throw new Error(errorMessages || 'Dữ liệu không hợp lệ');
        }
        throw new Error(data.message || 'Lỗi khi đổi mật khẩu');
      }

      if (data.status) {
        alert('Đổi mật khẩu thành công!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        throw new Error(data.message || 'Lỗi từ server');
      }
    } catch (err) {
      setError(err.message);
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleUploadImage = async (side) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const formDataUpload = new FormData();
        formDataUpload.append(side === 'front' ? 'id_card_front' : 'id_card_back', file);

        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}user/update/${userData.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formDataUpload,
          });

          const data = await response.json();

          if (!response.ok) {
            if (response.status === 401) {
              localStorage.removeItem('token');
              setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
              navigate('/login');
              return;
            }
            if (response.status === 422) {
              const errors = data.errors || {};
              const errorMessages = Object.values(errors).flat().join(', ');
              throw new Error(errorMessages || 'Dữ liệu không hợp lệ');
            }
            throw new Error(data.message || 'Lỗi khi tải ảnh');
          }

          if (data.status && data.user) {
            setUserData((prev) => ({
              ...prev,
              idCardFront: data.user.id_card_front || prev.idCardFront,
              idCardFrontUrl: data.user.id_card_front_url || prev.idCardFrontUrl,
              idCardBack: data.user.id_card_back || prev.idCardBack,
              idCardBackUrl: data.user.id_card_back_url || prev.idCardBackUrl,
            }));
            alert(`Tải ảnh mặt ${side === 'front' ? 'trước' : 'sau'} thành công`);
          } else {
            throw new Error('Phản hồi không hợp lệ từ server');
          }
        } catch (err) {
          setError(err.message);
          alert(`Lỗi: ${err.message}`);
        }
      }
    };
    input.click();
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login');
          return;
        }
        throw new Error(`Yêu cầu thất bại với mã trạng thái ${response.status}`);
      }

      const data = await response.json();
      if (data.status) {
        await logout();
        localStorage.removeItem('token');
        alert('Đăng xuất thành công');
        navigate('/login');
      } else {
        throw new Error(data.message || 'Đăng xuất thất bại');
      }
    } catch (err) {
      setError('Lỗi đăng xuất: ' + err.message);
      alert('Lỗi đăng xuất: ' + err.message);
    }
  };

  const renderTabContent = () => {
    if (loading) return <Loading />;
    if (error) return (
      <div className={styles.error}>
        <p>{error}</p>
        {activeTab === 'auction-history' && (
          <button
            className={styles.btn}
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchAuctionHistory();
            }}
          >
            Thử lại
          </button>
        )}
      </div>
    );

    const formatDate = (date) => {
      return date && date !== 'Chưa cập nhật' ? new Date(date).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) : 'Chưa cập nhật';
    };

    switch (activeTab) {
      case 'profile':
        return (
          <div className={styles.tabPane} id="profile">
            <div className={styles.infoSection}>
              <div className={styles.sectionTitle}>
                {userData.role_id === 9 ? 'Thông tin cá nhân người đại diện doanh nghiệp' : 'Thông tin cá nhân'}
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Họ và tên:</span>
                  <div className={styles.infoValue}>{userData.fullName}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Giới tính:</span>
                  <div className={styles.infoValue}>{userData.gender === 'male' ? 'Nam' : 'Nữ'}</div>
                </div>
                {userData.role_id === 9 && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Chức vụ:</span>
                    <div className={styles.infoValue}>{userData.position}</div>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email:</span>
                  <div className={styles.infoValue}>{userData.email}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Số điện thoại:</span>
                  <div className={styles.infoValue}>{userData.phone}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Địa chỉ:</span>
                  <div className={styles.infoValue}>{userData.address}</div>
                </div>
              </div>
            </div>
            <div className={styles.infoSection}>
              <div className={styles.sectionTitle}>Thông tin định danh</div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Số CCCD:</span>
                  <div className={styles.infoValue}>{userData.identity_number}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ngày cấp:</span>
                  <div className={styles.infoValue}>{formatDate(userData.identity_issue_date)}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Nơi cấp:</span>
                  <div className={styles.infoValue}>{userData.identity_issued_by}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ảnh căn cước công dân:</span>
                  <div className={styles.photoSection}>
                    <div className={styles.photoItem}>
                      <span className={styles.photoLabel}>Mặt trước</span>
                      <div
                        className={styles.photoPlaceholder}
                        onClick={() => handleUploadImage('front')}
                        style={{ cursor: 'pointer', position: 'relative' }}
                      >
                        {userData.idCardFrontUrl ? (
                          <img
                            src={userData.idCardFrontUrl}
                            alt="CCCD Mặt trước"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '150px',
                              objectFit: 'contain',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className={styles.placeholderText}
                            style={{
                              padding: '50px 10px',
                              textAlign: 'center',
                              color: '#999',
                              border: '2px dashed #ccc',
                              borderRadius: '4px',
                              backgroundColor: '#f9f9f9',
                            }}
                          >
                            [Ảnh mặt trước]<br />
                            <small>Click để tải lên</small>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.photoItem}>
                      <span className={styles.photoLabel}>Mặt sau</span>
                      <div
                        className={styles.photoPlaceholder}
                        onClick={() => handleUploadImage('back')}
                        style={{ cursor: 'pointer', position: 'relative' }}
                      >
                        {userData.idCardBackUrl ? (
                          <img
                            src={userData.idCardBackUrl}
                            alt="CCCD Mặt sau"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '150px',
                              objectFit: 'contain',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className={styles.placeholderText}
                            style={{
                              padding: '50px 10px',
                              textAlign: 'center',
                              color: '#999',
                              border: '2px dashed #ccc',
                              borderRadius: '4px',
                              backgroundColor: '#f9f9f9',
                            }}
                          >
                            [Ảnh mặt sau]<br />
                            <small>Click để tải lên</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {userData.role_id === 9 && (
              <>
                <div className={styles.infoSection}>
                  <div className={styles.sectionTitle}>Thông tin doanh nghiệp</div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Tên tổ chức:</span>
                      <div className={styles.infoValue}>{userData.organization_name}</div>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Mã số thuế:</span>
                      <div className={styles.infoValue}>{userData.tax_code}</div>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Giấy phép kinh doanh:</span>
                      <div className={styles.infoValue}>
                        {userData.business_license ? (
                          <a href={userData.business_license} target="_blank" rel="noopener noreferrer">
                            Xem giấy phép
                          </a>
                        ) : (
                          'Chưa cập nhật'
                        )}
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Ngày cấp giấy phép:</span>
                      <div className={styles.infoValue}>{formatDate(userData.business_license_issue_date)}</div>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Nơi cấp giấy phép:</span>
                      <div className={styles.infoValue}>{userData.business_license_issued_by}</div>
                    </div>
                  </div>
                </div>
                <div className={styles.infoSection}>
                  <div className={styles.sectionTitle}>Tài khoản ngân hàng</div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Ngân hàng:</span>
                      <div className={styles.infoValue}>{userData.bankName}</div>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Chi nhánh ngân hàng:</span>
                      <div className={styles.infoValue}>{userData.bankBranch}</div>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Số tài khoản:</span>
                      <div className={styles.infoValue}>{userData.bankAccount}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {userData.role_id === 5 && (
              <div className={styles.infoSection}>
                <div className={styles.sectionTitle}>Thông tin đấu giá viên</div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Thẻ đấu giá (mặt trước):</span>
                    <div className={styles.photoSection}>
                      <div className={styles.photoItem}>
                        {userData.auctioneer_card_front ? (
                          <img
                            src={userData.auctioneer_card_front}
                            alt="Thẻ đấu giá mặt trước"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '150px',
                              objectFit: 'contain',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className={styles.placeholderText}
                            style={{
                              padding: '50px 10px',
                              textAlign: 'center',
                              color: '#999',
                              border: '2px dashed #ccc',
                              borderRadius: '4px',
                              backgroundColor: '#f9f9f9',
                            }}
                          >
                            [Thẻ mặt trước]<br />
                            <small>Chưa cập nhật</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Thẻ đấu giá (mặt sau):</span>
                    <div className={styles.photoSection}>
                      <div className={styles.photoItem}>
                        {userData.auctioneer_card_back ? (
                          <img
                            src={userData.auctioneer_card_back}
                            alt="Thẻ đấu giá mặt sau"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '150px',
                              objectFit: 'contain',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className={styles.placeholderText}
                            style={{
                              padding: '50px 10px',
                              textAlign: 'center',
                              color: '#999',
                              border: '2px dashed #ccc',
                              borderRadius: '4px',
                              backgroundColor: '#f9f9f9',
                            }}
                          >
                            [Thẻ mặt sau]<br />
                            <small>Chưa cập nhật</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Số chứng chỉ:</span>
                    <div className={styles.infoValue}>{userData.certificate_number}</div>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ngày cấp chứng chỉ:</span>
                    <div className={styles.infoValue}>{formatDate(userData.certificate_issue_date)}</div>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Nơi cấp chứng chỉ:</span>
                    <div className={styles.infoValue}>{userData.certificate_issued_by}</div>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Phương thức liên hệ trực tuyến:</span>
                    <div className={styles.infoValue}>{userData.online_contact_method}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'bank':
        return (
          <div className={styles.tabPane} id="bank">
            <div className={styles.infoSection}>
              {userData.bankName !== 'Chưa cập nhật' && userData.bankAccount !== 'Chưa cập nhật' ? (
                <div className={styles.bankAccount}>
                  <div className={styles.bankHeader}>
                    <div className={styles.bankName}>{userData.bankName}</div>
                    <div className={styles.accountNumber}>{userData.bankAccount}</div>
                  </div>
                  <div className={styles.accountHolder}>Chủ tài khoản: {userData.fullName}</div>
                  <div className={styles.bankActions}>
                    <button className={`${styles.btn} ${styles.btnEdit}`} onClick={() => handleEditBank(1)}>
                      <i className="fa fa-pencil" aria-hidden="true"></i>
                    </button>
                    <button className={`${styles.btn} ${styles.btnDelete}`} onClick={() => handleDeleteBank()}>
                      <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <p>Không có thông tin tài khoản ngân hàng.</p>
              )}
              <button className={styles.btn} onClick={openBankPopup}>Thêm tài khoản ngân hàng</button>
            </div>
          </div>
        );

      case 'contracts':
        return (
          <div className={styles.tabPane} id="contracts">
            <div className={styles.infoSection}>
              {contracts.length === 0 ? (
                <p>Không có hợp đồng nào.</p>
              ) : (
                <table className={styles.contractTable}>
                  <thead>
                    <tr>
                      <th>Mã Hợp Đồng</th>
                      <th>Tên Phiên</th>
                      <th>Giá Cuối (VND)</th>
                      <th>Ngày Ký</th>
                      <th>Trạng Thái</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr key={contract.id}>
                        <td className={styles.contractId}>{contract.id}</td>
                        <td>{contract.sessionName}</td>
                        <td className={styles.contractPrice}>{contract.finalPrice}</td>
                        <td>{contract.signDate}</td>
                        <td>
                          <span
                            className={`${styles.contractStatus} ${
                              contract.status === 'Đã Thanh Toán' ? styles.statusPaid : styles.statusWaiting
                            }`}
                          >
                            {contract.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.contractActions}>
                            {contract.status === 'Chờ Thanh Toán' && (
                              <Link
                                to={`/payment?contract_id=${contract.id}`}
                                className={`${styles.actionBtn} ${styles.payment}`}
                              >
                                <i className="fas fa-comment-dollar"></i> Thanh Toán
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );

      case 'payment-history':
        return (
          <div className={styles.tabPane} id="payment-history">
            <div className={styles.infoSection}>
              <div className={styles.paymentFilters}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Từ ngày</label>
                  <input type="date" className={styles.formControl} id="fromDate" />
                </div>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Đến ngày</label>
                  <input type="date" className={styles.formControl} id="toDate" />
                </div>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Trạng thái</label>
                  <select className={styles.formControl} id="statusFilter">
                    <option value="">Tất cả</option>
                    <option value="completed">Thành công</option>
                    <option value="pending">Đang chờ</option>
                    <option value="failed">Thất bại</option>
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label className={styles.formLabel}>Phương thức</label>
                  <select className={styles.formControl} id="methodFilter">
                    <option value="">Tất cả</option>
                    <option value="bank">Chuyển khoản</option>
                    <option value="credit">Thẻ tín dụng</option>
                    <option value="ewallet">Ví điện tử</option>
                  </select>
                </div>
                <div className={styles.filterGroup} style={{ alignSelf: 'flex-end' }}>
                  <button className={styles.btn} onClick={() => alert('Đã áp dụng bộ lọc')}>
                    Lọc
                  </button>
                </div>
              </div>
              <div className={styles.paymentHistory}>
                <p>Lịch sử thanh toán chưa được triển khai.</p>
              </div>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className={styles.tabPane} id="password">
            <div className={styles.infoSection}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className={styles.formControl}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mật khẩu mới</label>
                <input
                  type="password"
                  className={styles.formControl}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className={styles.formControl}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
              <button className={styles.btn} onClick={handleChangePassword}>
                Đổi mật khẩu
              </button>
            </div>
          </div>
        );

      case 'auction-history':
        return (
          <div className={styles.tabPane} id="auction-history">
            <div className={styles.infoSection}>
              {auctionHistory.length === 0 ? (
                <p>Không có lịch sử đấu giá.</p>
              ) : (
                <table className={styles.contractTable}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên phiên đấu giá</th>
                      <th>Trạng thái</th>
                      <th>Thời gian nộp hồ sơ</th>
                      <th>Kết quả</th>
                      <th>Xem chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auctionHistory.map((item) => (
                      <tr key={item.stt}>
                        <td>{item.stt}</td>
                        <td>{item.tenPhien}</td>
                        <td>
                          <span
                            className={`${styles.contractStatus} ${
                              item.trangThai === 'Đã duyệt' ? styles.statusPaid : styles.statusWaiting
                            }`}
                          >
                            {item.trangThai}
                          </span>
                        </td>
                        <td>{item.thoiGianDauGia}</td>
                        <td>
                          <span
                            className={`${styles.contractStatus} ${
                              item.ketQua === 'Được tham gia' ? styles.statusPaid : styles.statusWaiting
                            }`}
                          >
                            {item.ketQua}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={item.xemChiTiet}
                            className={`${styles.actionBtn} ${styles.viewDetails}`}
                          >
                            <i className="fas fa-eye"></i> Xem
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );

      case 'my-auctions':
        return (
          <div className={styles.tabPane} id="my-auctions">
            <div className={styles.infoSection}>
              {myAuctions.length === 0 ? (
                <p>Không có sản phẩm đấu giá nào của bạn.</p>
              ) : (
                <table className={styles.contractTable}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên tài sản</th>
                      <th>Trạng thái</th>
                      <th>Thời gian tạo</th>
                      <th>Xem chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAuctions.map((item) => (
                      <tr key={item.id}>
                        <td>{item.stt}</td>
                        <td>{item.tenTaiSan}</td>
                        <td>
                          <span
                            className={`${styles.contractStatus} ${
                              item.trangThai === 'Đã bán' || item.trangThai === 'Hủy'
                                ? styles.statusPaid
                                : styles.statusWaiting
                            }`}
                          >
                            {item.trangThai}
                          </span>
                        </td>
                        <td>{item.thoiGian}</td>
                        <td>
                          <Link
                            to={item.xemChiTiet}
                            className={`${styles.actionBtn} ${styles.viewDetails}`}
                          >
                            <i className="fas fa-eye"></i> Xem chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      case 'favorites':
  return (
    <div className={styles.tabPane} id="favorites">
      <div className={styles.infoSection}>
        {favorites.length === 0 ? (
          <p>Không có sản phẩm yêu thích nào.</p>
        ) : (
          <table className={styles.contractTable}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên tài sản</th>
                <th>Giá khởi điểm</th>
                <th>Thời gian thêm</th>
                <th>Xem chi tiết</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map((item) => (
                <tr key={item.id}>
                  <td>{item.stt}</td>
                  <td>{item.tenTaiSan}</td>
                  <td className={styles.contractPrice}>{item.giaKhoiDiem}</td>
                  <td>{item.thoiGian}</td>
                  <td>
                    <Link
                      to={item.xemChiTiet}
                      className={`${styles.actionBtn} ${styles.viewDetails}`}
                    >
                      <i className="fas fa-eye"></i> Xem chi tiết
                    </Link>
                  </td>
                  <td>
                    <button
                      className={`${styles.actionBtn} ${styles.btnDanger}`}
                      // onClick={() => handleRemoveFavorite(item.id)}
                      title="Xóa khỏi danh sách yêu thích"
                    >
                      <i className="fas fa-trash"></i> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

      default:
        return null;
    }
  };

  const renderContentTitle = () => {
    switch (activeTab) {
      case 'profile':
        return userData.role_id === 9 ? 'Thông tin cá nhân người đại diện doanh nghiệp' : 'Thông tin cá nhân';
      case 'bank':
        return 'Tài khoản ngân hàng';
      case 'contracts':
        return 'Danh sách hợp đồng';
      case 'payment-history':
        return 'Lịch sử thanh toán';
      case 'password':
        return 'Đổi mật khẩu';
      case 'auction-history':
        return 'Lịch sử đấu giá';
      case 'my-auctions':
        return 'Đấu giá của tôi';
      case 'favorites':
        return 'Yêu thích';
      default:
        return 'Thông tin cá nhân';
    }
  };

  const isAdminOrDauGiaVien = userData.accountType === 'Quản trị viên' || userData.accountType === 'Đấu giá viên';

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{userData.fullName ? userData.fullName[0] : 'N/A'}</div>
          <div className={styles.fullName}>{userData.fullName}</div>
          <div className={styles.accountType}>{userData.accountType}</div>
        </div>
        <ul className={styles.sidebarMenu}>
          <li>
            <a
              href="#"
              className={activeTab === 'profile' ? styles.active : ''}
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('profile');
              }}
            >
              {userData.role_id === 9 ? 'Thông tin cá nhân người đại diện' : 'Thông tin cá nhân'}
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'bank' ? styles.active : ''}
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('bank');
              }}
            >
              Tài khoản ngân hàng
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'contracts' ? styles.active : ''}
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('contracts');
              }}
            >
              Danh sách hợp đồng
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'payment-history' ? styles.active : ''}
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('payment-history');
              }}
            >
              Lịch sử thanh toán
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'password' ? styles.active : ''}
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('password');
              }}
            >
              Đổi mật khẩu
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'my-auctions' ? styles.active : ''}
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('my-auctions');
              }}
            >
              Đấu giá của tôi
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'auction-history' ? styles.active : ''}
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('auction-history');
              }}
            >
              Lịch sử đấu giá
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'favorites' ? styles.active : ''}
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('favorites');
              }}
            >
              Yêu thích
            </a>
          </li>
          {isAdminOrDauGiaVien && (
            <li>
              <Link to="/admin" className={activeTab === 'admin' ? styles.active : ''}>
                Quản trị
              </Link>
            </li>
          )}
          <li>
            <a href="#" onClick={handleLogout}>
              Đăng xuất
            </a>
          </li>
        </ul>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <div className={styles.contentTitle}>{renderContentTitle()}</div>
          {activeTab === 'profile' && !error && (
            <button className={`${styles.btn} ${styles.btnEdit}`} onClick={openProfilePopup}>
              <i className="fa fa-pencil" aria-hidden="true"></i>
            </button>
          )}
        </div>
        <div className={styles.tabContent}>{renderTabContent()}</div>
      </div>

      {showProfilePopup && (
        <div className={`${styles.popupOverlay} ${styles.active}`} id="profilePopup">
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <div className={styles.popupTitle}>Chỉnh sửa thông tin cá nhân</div>
              <button className={styles.popupClose} onClick={closeProfilePopup}>
                &times;
              </button>
            </div>
            <div className={styles.popupBody}>
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Họ và tên</label>
                  <input
                    type="text"
                    className={styles.formControl}
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Giới tính</label>
                  <select
                    className={styles.formControl}
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                {userData.role_id === 9 && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Chức vụ</label>
                    <input
                      type="text"
                      className={styles.formControl}
                      name="position"
                      value={formData.position || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    className={styles.formControl}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Số điện thoại</label>
                  <input
                    type="tel"
                    className={styles.formControl}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Địa chỉ</label>
                  <input
                    type="text"
                    className={styles.formControl}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Thông tin căn cước công dân</label>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số CCCD</label>
                    <input
                      type="text"
                      className={styles.formControl}
                      name="identity_number"
                      value={formData.identity_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ngày cấp</label>
                    <input
                      type="date"
                      className={styles.formControl}
                      name="identity_issue_date"
                      value={
                        formData.identity_issue_date && formData.identity_issue_date !== 'Chưa cập nhật'
                          ? new Date(formData.identity_issue_date).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nơi cấp</label>
                    <input
                      type="text"
                      className={styles.formControl}
                      name="identity_issued_by"
                      value={formData.identity_issued_by}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className={styles.photoSection}>
                  <div className={styles.photoItem}>
                    <span className={styles.photoLabel}>Mặt trước</span>
                    <div
                      className={styles.photoPlaceholder}
                      onClick={() => handleUploadImage('front')}
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      {userData.idCardFrontUrl ? (
                        <img
                          src={userData.idCardFrontUrl}
                          alt="CCCD Mặt trước"
                          style={{
                            maxWidth: '100px',
                            maxHeight: '150px',
                            objectFit: 'contain',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className={styles.placeholderText}
                          style={{
                            padding: '50px 10px',
                            textAlign: 'center',
                            color: '#999',
                            border: '2px dashed #ccc',
                            borderRadius: '4px',
                            backgroundColor: '#f9f9f9',
                          }}
                        >
                          [Ảnh mặt trước]<br />
                          <small>Click để tải lên</small>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.photoItem}>
                    <span className={styles.photoLabel}>Mặt sau</span>
                    <div
                      className={styles.photoPlaceholder}
                      onClick={() => handleUploadImage('back')}
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      {userData.idCardBackUrl ? (
                        <img
                          src={userData.idCardBackUrl}
                          alt="CCCD Mặt sau"
                          style={{
                            maxWidth: '100px',
                            maxHeight: '150px',
                            objectFit: 'contain',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className={styles.placeholderText}
                          style={{
                            padding: '50px 10px',
                            textAlign: 'center',
                            color: '#999',
                            border: '2px dashed #ccc',
                            borderRadius: '4px',
                            backgroundColor: '#f9f9f9',
                          }}
                        >
                          [Ảnh mặt sau]<br />
                          <small>Click để tải lên</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {userData.role_id === 9 && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Thông tin doanh nghiệp</label>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tên tổ chức</label>
                      <input
                        type="text"
                        className={styles.formControl}
                        name="organization_name"
                        value={formData.organization_name || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Mã số thuế</label>
                      <input
                        type="text"
                        className={styles.formControl}
                        name="tax_code"
                        value={formData.tax_code || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Giấy phép kinh doanh</label>
                      <input
                        type="file"
                        className={styles.formControl}
                        name="business_license"
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            business_license: e.target.files[0],
                          }));
                        }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Ngày cấp giấy phép</label>
                      <input
                        type="date"
                        className={styles.formControl}
                        name="business_license_issue_date"
                        value={formData.business_license_issue_date || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Nơi cấp giấy phép</label>
                      <input
                        type="text"
                        className={styles.formControl}
                        name="business_license_issued_by"
                        value={formData.business_license_issued_by || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}
              {userData.role_id === 5 && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Thông tin đấu giá viên</label>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Thẻ đấu giá (mặt trước)</label>
                      <input
                        type="file"
                        className={styles.formControl}
                        name="auctioneer_card_front"
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            auctioneer_card_front: e.target.files[0],
                          }));
                        }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Thẻ đấu giá (mặt sau)</label>
                      <input
                        type="file"
                        className={styles.formControl}
                        name="auctioneer_card_back"
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            auctioneer_card_back: e.target.files[0],
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Số chứng chỉ</label>
                      <input
                        type="text"
                        className={styles.formControl}
                        name="certificate_number"
                        value={formData.certificate_number || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Ngày cấp chứng chỉ</label>
                      <input
                        type="date"
                        className={styles.formControl}
                        name="certificate_issue_date"
                        value={formData.certificate_issue_date || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Nơi cấp chứng chỉ</label>
                      <input
                        type="text"
                        className={styles.formControl}
                        name="certificate_issued_by"
                        value={formData.certificate_issued_by || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Phương thức liên hệ trực tuyến</label>
                      <input
                        type="text"
                        className={styles.formControl}
                        name="online_contact_method"
                        value={formData.online_contact_method || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.popupFooter}>
              <button className={styles.btn} onClick={closeProfilePopup}>
                Hủy
              </button>
              <button className={`${styles.btn} ${styles.btnEdit}`} onClick={handleSaveProfile}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
      {showBankPopup && (
        <div className={`${styles.popupOverlay} ${styles.active}`} id="bankPopup">
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <div className={styles.popupTitle}>
                {bankPopupMode === 'add' ? 'Thêm tài khoản ngân hàng' : 'Chỉnh sửa tài khoản ngân hàng'}
              </div>
              <button className={styles.popupClose} onClick={closeBankPopup}>
                &times;
              </button>
            </div>
            <div className={styles.popupBody}>
              {bankError && <p className={styles.error}>{bankError}</p>}
              {loading && <p>Đang tải danh sách ngân hàng...</p>}
              <div className={styles.bankForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ngân hàng</label>
                  <select
                    className={`${styles.formControl} ${styles.bankSelect}`}
                    id="bankName"
                    value={bankData.bankName}
                    onChange={handleBankInputChange}
                  >
                    <option value="">Chọn ngân hàng</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.name} data-logo={bank.logo}>
                        {bank.shortName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Số tài khoản</label>
                  <input
                    type="text"
                    className={styles.formControl}
                    id="bankAccount"
                    value={bankData.bankAccount}
                    onChange={handleBankInputChange}
                    placeholder="Nhập số tài khoản"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Chi nhánh</label>
                  <input
                    type="text"
                    className={styles.formControl}
                    id="bankBranch"
                    value={bankData.bankBranch}
                    onChange={handleBankInputChange}
                    placeholder="Nhập chi nhánh ngân hàng"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Chủ tài khoản</label>
                  <input
                    type="text"
                    className={styles.formControl}
                    id="accountHolder"
                    value={bankData.accountHolder}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className={styles.popupFooter}>
              <button className={styles.btn} onClick={closeBankPopup}>
                Hủy
              </button>
              <button className={`${styles.btn} ${styles.btnEdit}`} onClick={handleSaveBank}>
                Lưu tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;