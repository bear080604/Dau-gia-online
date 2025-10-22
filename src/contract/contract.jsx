import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './contract.css';

const Contract = () => {
  const [contracts, setContracts] = useState([]);
  const [econtracts, setEcontracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const CONTRACTS_API_URL = `${process.env.REACT_APP_BASE_URL || 'http://localhost:8000'}/api/contracts`;
  const ECONTRACTS_API_URL = `${process.env.REACT_APP_BASE_URL || 'http://localhost:8000'}/api/econtracts`;
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';

  const vnFormatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  const formatDateTime = (isoString) => {
    return vnFormatter.format(new Date(isoString));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        throw new Error('Cần đăng nhập lại!');
      }

      // Fetch contracts
      const contractResponse = await fetch(CONTRACTS_API_URL, {
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Accept": "application/json" 
        }
      });

      if (!contractResponse.ok) throw new Error(`HTTP ${contractResponse.status}: ${contractResponse.statusText}`);
      const contractData = await contractResponse.json();

      // Fetch e-contracts
      const econtractResponse = await fetch(ECONTRACTS_API_URL, {
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Accept": "application/json" 
        }
      });

      if (!econtractResponse.ok) throw new Error(`HTTP ${econtractResponse.status}: ${econtractResponse.statusText}`);
      const econtractData = await econtractResponse.json();

      if (contractData.status) {
        const allContracts = contractData.contracts || [];
        const userContracts = allContracts.filter(contract => 
          contract.winner_id == user.user_id || (contract.winner && contract.winner.user_id == user.user_id)
        );
        
        setContracts(userContracts);

        if (userContracts.length > 0) {
          showToastMessage(`Tải ${userContracts.length} hợp đồng thành công!`, 'success');
        } else {
          showToastMessage('Không có hợp đồng phù hợp.', 'warning');
        }
      } else {
        throw new Error(contractData.message || 'Lỗi dữ liệu hợp đồng');
      }

      if (econtractData.status) {
        setEcontracts(econtractData.econtracts || []);
      } else {
        throw new Error(econtractData.message || 'Lỗi dữ liệu hợp đồng điện tử');
      }
    } catch (error) {
      setError('Lỗi: ' + error.message);
      showToastMessage('Lỗi tải hợp đồng: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'ChoThanhToan':
        return { text: 'Chờ Thanh Toán', className: 'pending' };
      case 'DaThanhToan':
        return { text: 'Đã Thanh Toán', className: 'paid' };
      case 'Huy':
        return { text: 'Hủy', className: 'cancelled' };
      default:
        return { text: status, className: 'pending' };
    }
  };

  const getEcontractUrl = (sessionId) => {
    const econtract = econtracts.find(ec => ec.session_id === sessionId);
    return econtract ? `${BASE_URL}${econtract.file_url}` : '#';
  };

  return (
    <div className="contract-container">
      <h2>
        <i className="fa-solid fa-list"></i> Danh Sách Hợp Đồng
      </h2>

      {loading && (
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
        </div>
      )}

      {error && (
        <div className="error">{error}</div>
      )}

      {!loading && !error && contracts.length === 0 && (
        <div className="no-contracts">Chưa có hợp đồng nào bạn thắng.</div>
      )}

      {!loading && !error && contracts.length > 0 && (
        <table className="contract-table">
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
            {contracts.map((contract) => {
              const statusInfo = getStatusInfo(contract.status);
              const itemName = contract.session?.item?.name || 'N/A';
              
              return (
                <tr key={contract.contract_id}>
                  <td data-label="Mã Hợp Đồng">{contract.contract_id}</td>
                  <td data-label="Tên Phiên">{itemName}</td>
                  <td data-label="Giá Cuối (VND)">{formatPrice(parseFloat(contract.final_price))}</td>
                  <td data-label="Ngày Ký">{contract.signed_date ? formatDateTime(contract.signed_date) : 'Chưa ký'}</td>
                  <td data-label="Trạng Thái">
                    <span className={`status ${statusInfo.className}`}>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td data-label="Hành Động">
                    {contract.status === 'ChoThanhToan' && (
                      <Link 
                        to={`/payment?contract_id=${contract.contract_id}`}
                        className="btn btn-pay"
                      >
                        <i className="fa-solid fa-credit-card"></i> Thanh Toán
                      </Link>
                    )}
                    <a 
                      href={getEcontractUrl(contract.session_id)}
                      className="btn btn-view"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa-solid fa-file-pdf"></i> Xem Hợp Đồng
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={`toast ${toastType} show`}>
          <i className="fas fa-info-circle"></i>
          <span>{toastMessage}</span>
          <span className="close-toast" onClick={closeToast}>&times;</span>
        </div>
      )}
    </div>
  );
};

export default Contract;