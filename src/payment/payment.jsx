import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './payment.css';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [processing, setProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [receiverName, setReceiverName] = useState('N/A');

  const contractId = searchParams.get('contract_id');

  const vnFormatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  const formatDateTime = (isoString) => {
    return vnFormatter.format(new Date(isoString));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(price));
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const closeToast = () => {
    setShowToast(false);
  };

  const fetchContractDetails = async (contractId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToastMessage('Cần đăng nhập lại!', 'error');
      navigate('/login');
      return null;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}contracts/${contractId}`, {
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Accept": "application/json" 
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();

      if (data.status) {
        return data.contract;
      } else {
        throw new Error(data.message || 'Lỗi dữ liệu hợp đồng');
      }
    } catch (error) {
      showToastMessage('Lỗi tải thông tin hợp đồng: ' + error.message, 'error');
      return null;
    }
  };

  const fetchOrganizationName = async (orgId) => {
    if (!orgId) return 'N/A';

    const token = localStorage.getItem('token');
    if (!token) return 'N/A';

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}showuser`, {
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Accept": "application/json" 
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();

      if (data.status && Array.isArray(data.users)) {
        const orgUser = data.users.find(u => u.user_id == orgId);
        return orgUser ? orgUser.full_name : 'N/A';
      } else {
        throw new Error('Lỗi dữ liệu user');
      }
    } catch (error) {
      showToastMessage('Lỗi tải thông tin tổ chức: ' + error.message, 'error');
      return 'N/A';
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      showToastMessage('⚠️ Vui lòng chọn phương thức thanh toán!', 'warning');
      return;
    }

    if (paymentMethod !== 'vnpay') {
      showToastMessage('Chỉ hỗ trợ thanh toán VNPAY trong test này', 'warning');
      return;
    }

    setProcessing(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.REACT_APP_API_URL}contracts/${contractId}/pay-online`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();

      if (data.status && data.payment_url) {
        // Redirect sang trang VNPAY sandbox
        window.location.href = data.payment_url;
      } else {
        throw new Error(data.message || 'Không lấy được URL thanh toán');
      }
    } catch (error) {
      showToastMessage('Lỗi tạo URL thanh toán: ' + error.message, 'error');
      setProcessing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!contractId) {
        setError('Không tìm thấy ID hợp đồng!');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Cần đăng nhập lại!', 'error');
        navigate('/login');
        return;
      }

      setLoading(true);
      const contractData = await fetchContractDetails(contractId);
      
      if (contractData) {
        setContract(contractData);
        
        // Fetch organization name
        const orgName = await fetchOrganizationName(contractData.session?.auction_org_id);
        setReceiverName(orgName);
        
        showToastMessage('Tải thông tin hợp đồng thành công!', 'success');
      } else {
        setError('Không tải được thông tin hợp đồng!');
      }
      
      setLoading(false);
    };

    init();
  }, [contractId, navigate]);

  if (loading) {
    return (
      <div className="qr-container">
        <div className="qr-loading">
          <i className="fas fa-spinner fa-spin"></i> Đang tải thông tin thanh toán...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="qr-container">
        <div className="qr-error">{error}</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="qr-container">
        <div className="qr-error">Không tìm thấy thông tin hợp đồng!</div>
      </div>
    );
  }

  const item = contract.session?.item;
  const winnerName = contract.winner?.full_name || 'N/A';

  return (
    <div className="qr-container">
      <div id="qr-content">
        <div className="qr-payment-details">
          <div className="qr-section" id="qr-contract-info">
            <h2><i className="fas fa-box"></i> Thông Tin Hợp Đồng</h2>
            
            <div className="qr-item-image">
              <img 
                src={item?.image_url || ''} 
                alt={item?.name || 'Sản phẩm'} 
              />
            </div>
            
            <div className="qr-item-name">
              Phiên Đấu Giá: {item?.name || 'N/A'} {item?.description ? `(${item.description})` : ''}
            </div>
            
            <div className="qr-info-item">
              <i className="fas fa-calendar"></i> Ngày: {formatDateTime(contract.signed_date)}
            </div>
            
            <div className="qr-info-item">
              <i className="fas fa-trophy"></i> Người Chiến Thắng: {winnerName}
            </div>
            
            <div className="qr-total-amount">
              <i className="fas fa-money-bill-wave"></i> Số Tiền Cần Thanh Toán: {formatPrice(contract.final_price)}
            </div>
            
            <div className="qr-info-item">
              <i className="fas fa-user-tie"></i> Người Nhận (Tổ Chức Đấu Giá): {receiverName}
            </div>
          </div>

          <div className="qr-section">
            <h2><i className="fas fa-credit-card"></i> Phương Thức Thanh Toán</h2>
            
            <div className="qr-payment-method">
              <label className={paymentMethod === 'vnpay' ? 'qr-selected' : ''}>
                <input 
                  type="radio" 
                  name="qr-method" 
                  value="vnpay" 
                  checked={paymentMethod === 'vnpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <i className="fas fa-qrcode" style={{marginRight: '10px', color: '#007bff'}}></i>
                Xác Nhận Thanh Toán Qua VNPay
              </label>
            </div>

            {paymentMethod === 'vnpay' && (
              <div className="qr-qr-section">
                <p><i className="fas fa-mobile-alt"></i> Quét Mã QR Để Thanh Toán:</p>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VNPAY:${contract.final_price}`} 
                  alt="QR VNPay" 
                />
                <p>Chủ Tài Khoản: Công Ty Đấu Giá Khải Bảo</p>
              </div>
            )}

            <button 
              className="qr-confirm-btn" 
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <><i className="fas fa-spinner fa-spin"></i> Đang Xử Lý...</>
              ) : (
                <><i className="fas fa-check-circle"></i> Test Thanh Toán VNPAY</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`qr-toast qr-${toastType} show`}>
          <i className="fas fa-info-circle"></i>
          <span>{toastMessage}</span>
          <span className="qr-close-toast" onClick={closeToast}>&times;</span>
        </div>
      )}
    </div>
  );
};

export default Payment;