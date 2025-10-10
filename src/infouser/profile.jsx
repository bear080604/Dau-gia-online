import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './profile.module.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showBankPopup, setShowBankPopup] = useState(false);
  const [bankPopupMode, setBankPopupMode] = useState('add');
  const [editingBankId, setEditingBankId] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    id: null,
    fullName: '',
    username: '',
    accountType: '',
    email: '',
    phone: '',
    address: '',
    idCardFront: '',
    idCardBack: '',
    bankName: '',
    bankAccount: '',
    createdAt: '',
    emailVerifiedAt: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Vui lòng đăng nhập để xem thông tin cá nhân');
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('authToken');
            setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            navigate('/login');
            return;
          }
          throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        if (data.status && data.user) {
          setUserData({
            id: data.user.user_id || null,
            fullName: data.user.full_name || 'Chưa cập nhật',
            username: data.user.email ? data.user.email.split('@')[0] : 'Chưa cập nhật',
            accountType: data.user.role === 'User' ? 'Cá nhân' :
                        data.user.role === 'Administrator' ? 'Quản trị viên' :
                        data.user.role === 'ToChucDauGia' ? 'Tổ chức đấu giá' :
                        data.user.role === 'DauGiaVien' ? 'Đấu giá viên' :
                        data.user.role === 'ChuyenVienTTC' ? 'Chuyên viên TTC' :
                        data.user.role === 'DonViThuc' ? 'Đơn vị thực' : 'Chưa xác định',
            email: data.user.email || 'Chưa cập nhật',
            phone: data.user.phone || 'Chưa cập nhật',
            address: data.user.address || 'Chưa cập nhật',
            idCardFront: data.user.id_card_front || '',
            idCardBack: data.user.id_card_back || '',
            bankName: data.user.bank_name || 'Chưa cập nhật',
            bankAccount: data.user.bank_account || 'Chưa cập nhật',
            createdAt: data.user.created_at || 'Chưa cập nhật',
            emailVerifiedAt: data.user.email_verified_at || 'Chưa cập nhật'
          });
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
  }, [navigate]);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!userData.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Vui lòng đăng nhập để xem hợp đồng');
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:8000/api/contracts', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('authToken');
            setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            navigate('/login');
            return;
          }
          throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        if (data.status && Array.isArray(data.contracts)) {
          const filteredContracts = data.contracts.filter(
            contract => contract.winner_id === userData.id
          );
          const formattedContracts = filteredContracts.map(contract => ({
            id: contract.contract_id,
            sessionName: contract.session.item.name,
            finalPrice: new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(parseFloat(contract.final_price)),
            signDate: new Date(contract.signed_date).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              timeZone: 'Asia/Ho_Chi_Minh'
            }),
            status: contract.status === 'DaThanhToan' ? 'Đã Thanh Toán' : 'Chờ Thanh Toán'
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
  }, [userData.id, navigate]);

  const handleTabChange = (tab) => setActiveTab(tab);
  const openProfilePopup = () => setShowProfilePopup(true);
  const closeProfilePopup = () => setShowProfilePopup(false);
  const openBankPopup = () => {
    setBankPopupMode('add');
    setShowBankPopup(true);
  };
  const closeBankPopup = () => setShowBankPopup(false);

  const handleEditBank = (accountId) => {
    setBankPopupMode('edit');
    setEditingBankId(accountId);
    setShowBankPopup(true);
  };

  const handleDeleteBank = (accountId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
      alert(`Đã xóa tài khoản ngân hàng #${accountId}`);
    }
  };

  const handleSaveBank = () => {
    alert('Tài khoản ngân hàng đã được lưu!');
    closeBankPopup();
  };

  const handleSaveProfile = () => {
    alert('Thông tin cá nhân đã được cập nhật!');
    closeProfilePopup();
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login');
          return;
        }
        throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status) {
        localStorage.removeItem('authToken');
        setUserData({
          id: null,
          fullName: '',
          username: '',
          accountType: '',
          email: '',
          phone: '',
          address: '',
          idCardFront: '',
          idCardBack: '',
          bankName: '',
          bankAccount: '',
          createdAt: '',
          emailVerifiedAt: ''
        });
        alert('Đăng xuất thành công');
        navigate('/login');
      } else {
        throw new Error(data.message || 'Lỗi đăng xuất');
      }
    } catch (err) {
      setError(err.message);
      alert('Lỗi đăng xuất: ' + err.message);
    }
  };

  const handleUploadImage = (side) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        alert(`Đã tải lên ảnh mặt ${side === 'front' ? 'trước' : 'sau'} CCCD`);
      }
    };
    input.click();
  };

  const renderTabContent = () => {
    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p>{error}</p>;

    switch (activeTab) {
      case 'profile':
        return (
          <div className={styles.tabPane} id="profile">
            <div className={styles.infoSection}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Họ và tên:</span>
                  <div className={styles.infoValue}>{userData.fullName}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tên đăng nhập:</span>
                  <div className={styles.infoValue}>{userData.username}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Loại tài khoản:</span>
                  <div className={styles.infoValue}>{userData.accountType}</div>
                </div>
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
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ngày tạo:</span>
                  <div className={styles.infoValue}>{userData.createdAt}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email xác minh:</span>
                  <div className={styles.infoValue}>{userData.emailVerifiedAt}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ngân hàng:</span>
                  <div className={styles.infoValue}>{userData.bankName}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Số tài khoản:</span>
                  <div className={styles.infoValue}>{userData.bankAccount}</div>
                </div>
              </div>
            </div>
            <div className={styles.infoSection}>
              <div className={styles.sectionTitle}>Thông tin định danh</div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ảnh căn cước công dân:</span>
                  <div className={styles.photoSection}>
                    <div className={styles.photoItem}>
                      <span className={styles.photoLabel}>Mặt trước</span>
                      <div className={styles.photoPlaceholder} onClick={() => handleUploadImage('front')}>
                        {userData.idCardFront ? (
                          <img src={`http://localhost:8000/${userData.idCardFront}`} alt="ID Front" style={{ maxWidth: '100px' }} />
                        ) : (
                          '[Ảnh mặt trước]'
                        )}
                      </div>
                    </div>
                    <div className={styles.photoItem}>
                      <span className={styles.photoLabel}>Mặt sau</span>
                      <div className={styles.photoPlaceholder} onClick={() => handleUploadImage('back')}>
                        {userData.idCardBack ? (
                          <img src={`http://localhost:8000/${userData.idCardBack}`} alt="ID Back" style={{ maxWidth: '100px' }} />
                        ) : (
                          '[Ảnh mặt sau]'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                    <button className={`${styles.btn} ${styles.btnDelete}`} onClick={() => handleDeleteBank(1)}>
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
              {loading && <p>Đang tải dữ liệu...</p>}
              {error && <p>{error}</p>}
              {!loading && !error && contracts.length === 0 && <p>Không có hợp đồng nào.</p>}
              {!loading && !error && contracts.length > 0 && (
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
                    {contracts.map(contract => (
                      <tr key={contract.id}>
                        <td className={styles.contractId}>{contract.id}</td>
                        <td>{contract.sessionName}</td>
                        <td className={styles.contractPrice}>{contract.finalPrice}</td>
                        <td>{contract.signDate}</td>
                        <td>
                          <span className={`${styles.contractStatus} ${contract.status === 'Đã Thanh Toán' ? styles.statusPaid : styles.statusWaiting}`}>
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
                  <button className={styles.btn} onClick={() => alert('Đã áp dụng bộ lọc')}>Lọc</button>
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
                <input type="password" className={styles.formControl} placeholder="Nhập mật khẩu hiện tại" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mật khẩu mới</label>
                <input type="password" className={styles.formControl} placeholder="Nhập mật khẩu mới" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Xác nhận mật khẩu mới</label>
                <input type="password" className={styles.formControl} placeholder="Nhập lại mật khẩu mới" />
              </div>
              <button className={styles.btn}>Đổi mật khẩu</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderContentTitle = () => {
    switch (activeTab) {
      case 'profile': return 'Thông tin cá nhân';
      case 'bank': return 'Tài khoản ngân hàng';
      case 'contracts': return 'Danh sách hợp đồng';
      case 'payment-history': return 'Lịch sử thanh toán';
      case 'password': return 'Đổi mật khẩu';
      default: return 'Thông tin cá nhân';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{userData.fullName ? userData.fullName[0] : 'N/A'}</div>
          <div className={styles.username}>{userData.username}</div>
          <div className={styles.accountType}>{userData.accountType}</div>
        </div>
        <ul className={styles.sidebarMenu}>
          <li>
            <a
              href="#"
              className={activeTab === 'profile' ? styles.active : ''}
              onClick={(e) => { e.preventDefault(); handleTabChange('profile'); }}
            >
              Thông tin cá nhân
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'bank' ? styles.active : ''}
              onClick={(e) => { e.preventDefault(); handleTabChange('bank'); }}
            >
              Tài khoản ngân hàng
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'contracts' ? styles.active : ''}
              onClick={(e) => { e.preventDefault(); handleTabChange('contracts'); }}
            >
              Danh sách hợp đồng
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'payment-history' ? styles.active : ''}
              onClick={(e) => { e.preventDefault(); handleTabChange('payment-history'); }}
            >
              Lịch sử thanh toán
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'password' ? styles.active : ''}
              onClick={(e) => { e.preventDefault(); handleTabChange('password'); }}
            >
              Đổi mật khẩu
            </a>
          </li>
          <li><a href="#">Đấu giá của tôi</a></li>
          <li><a href="#">Lịch sử đấu giá</a></li>
          <li>
            <a
              href="#"
              onClick={handleLogout}
            >
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
        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>
      </div>

      {showProfilePopup && (
        <div className={`${styles.popupOverlay} ${styles.active}`} id="profilePopup">
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <div className={styles.popupTitle}>Chỉnh sửa thông tin cá nhân</div>
              <button className={styles.popupClose} onClick={closeProfilePopup}>&times;</button>
            </div>
            <div className={styles.popupBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Họ và tên</label>
                  <input type="text" className={styles.formControl} defaultValue={userData.fullName} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input type="email" className={styles.formControl} defaultValue={userData.email} />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Số điện thoại</label>
                  <input type="tel" className={styles.formControl} defaultValue={userData.phone} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Địa chỉ</label>
                  <input type="text" className={styles.formControl} defaultValue={userData.address} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ảnh căn cước</label>
                <div className={styles.photoSection}>
                  <div className={styles.photoItem}>
                    <span className={styles.photoLabel}>Mặt trước</span>
                    <div className={styles.photoPlaceholder} onClick={() => handleUploadImage('front')}>
                      Tải lên ảnh mặt trước
                    </div>
                  </div>
                  <div className={styles.photoItem}>
                    <span className={styles.photoLabel}>Mặt sau</span>
                    <div className={styles.photoPlaceholder} onClick={() => handleUploadImage('back')}>
                      Tải lên ảnh mặt sau
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.popupFooter}>
              <button className={styles.btn} onClick={closeProfilePopup}>Hủy</button>
              <button className={`${styles.btn} ${styles.btnEdit}`} onClick={handleSaveProfile}>Lưu thay đổi</button>
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
              <button className={styles.popupClose} onClick={closeBankPopup}>&times;</button>
            </div>
            <div className={styles.popupBody}>
              <div className={styles.bankForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ngân hàng</label>
                  <select className={styles.formControl} id="bankName">
                    <option value="">Chọn ngân hàng</option>
                    <option value="vcb">Vietcombank</option>
                    <option value="ab">Agribank</option>
                    <option value="vietinbank">VietinBank</option>
                    <option value="bidv">BIDV</option>
                    <option value="techcombank">Techcombank</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Số tài khoản</label>
                  <input type="text" className={styles.formControl} id="accountNumber" placeholder="Nhập số tài khoản" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Chủ tài khoản</label>
                  <input type="text" className={styles.formControl} id="accountHolder" defaultValue={userData.fullName} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Chi nhánh</label>
                  <input type="text" className={styles.formControl} id="bankBranch" placeholder="Nhập chi nhánh ngân hàng" />
                </div>
              </div>
            </div>
            <div className={styles.popupFooter}>
              <button className={styles.btn} onClick={closeBankPopup}>Hủy</button>
              <button className={`${styles.btn} ${styles.btnEdit}`} onClick={handleSaveBank}>Lưu tài khoản</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;