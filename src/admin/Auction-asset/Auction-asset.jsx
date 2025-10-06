import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Auction-asset.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function AuctionAsset() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [assets, setAssets] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);
  const [assetForm, setAssetForm] = useState({
    code: '',
    name: '',
    category: '',
    owner: '',
    startingPrice: '',
    description: '',
    imageUrl: '',
    status: 'ChoDuyet',
  });

  const itemsPerPage = 5;
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  // Fetch assets from API
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get(`${API_URL}products`);
        const formattedAssets = response.data.data.map(asset => ({
          id: `#TS-${asset.id.toString().padStart(3, '0')}`,
          name: asset.name,
          category: asset.category,
          categoryId: asset.category === 'Bất động sản' ? '1' :
                      asset.category === 'Xe cộ' ? '2' :
                      asset.category === 'Đồ cổ' ? '3' :
                      asset.category === 'Nghệ thuật' ? '4' : '5',
          owner: asset.owner.name,
          ownerId: asset.owner.id.toString(),
          startingPrice: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(asset.starting_price),
          startingPriceValue: parseFloat(asset.starting_price),
          status: asset.status === 'ChoDauGia' ? 'Chờ đấu giá' :
                  asset.status === 'ChoDuyet' ? 'Chờ duyệt' :
                  asset.status === 'DangDauGia' ? 'Đang đấu giá' :
                  asset.status === 'DaBan' ? 'Đã bán' : 'Hủy',
          statusClass: asset.status === 'ChoDuyet' ? 'statusChoduyet' :
                       asset.status === 'ChoDauGia' ? 'statusChodau' :
                       asset.status === 'DangDauGia' ? 'statusDangdau' :
                       asset.status === 'DaBan' ? 'statusDaban' : 'statusHuy',
          createdDate: asset.created_at ? new Date(asset.created_at).toISOString().split('T')[0] : 'N/A',
          description: asset.description,
          imageUrl: asset.image_url || 'https://example.com/placeholder.jpg',
        }));
        setAssets(formattedAssets);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu tài sản:', error.response?.data || error);
        alert(`Không thể tải dữ liệu tài sản: ${error.response?.data?.message || 'Vui lòng thử lại.'}`);
      }
    };

    fetchAssets();
  }, []);

  // Apply filters
  const applyFilters = () => {
    return assets.filter(asset => {
      const searchMatch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = !statusFilter || asset.status.toLowerCase().includes(statusFilter.toLowerCase());
      const categoryMatch = !categoryFilter || asset.categoryId.toLowerCase().includes(categoryFilter.toLowerCase());
      return searchMatch && statusMatch && categoryMatch;
    });
  };

  const filteredAssets = applyFilters();
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
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

  const openAssetModal = (mode, asset = null) => {
    setModalMode(mode);
    if (asset) {
      setAssetForm({
        code: asset.id,
        name: asset.name,
        category: asset.categoryId,
        owner: asset.ownerId,
        startingPrice: asset.startingPriceValue.toString(),
        description: asset.description,
        imageUrl: asset.imageUrl,
        status: asset.status === 'Chờ duyệt' ? 'ChoDuyet' :
                asset.status === 'Chờ đấu giá' ? 'ChoDauGia' :
                asset.status === 'Đang đấu giá' ? 'DangDauGia' :
                asset.status === 'Đã bán' ? 'DaBan' : 'Huy',
      });
    } else {
      setAssetForm({
        code: '',
        name: '',
        category: '',
        owner: '',
        startingPrice: '',
        description: '',
        imageUrl: '',
        status: 'ChoDuyet',
      });
    }
    setShowAssetModal(true);
  };

  const closeAssetModal = () => {
    setShowAssetModal(false);
  };

  const openViewModal = async (asset) => {
    setSelectedAsset(asset);
    try {
      const response = await axios.get(`${API_URL}auction-profiles/${asset.id.replace('#TS-', '')}/bids`);
      setBidHistory(response.data.data);
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử bid:', error.response?.data || error);
      setBidHistory([]);
    }
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setBidHistory([]);
  };

  const openRejectModal = (asset) => {
    setSelectedAsset(asset);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAssetForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveAsset = async () => {
    // Client-side validation
    if (!assetForm.name.trim()) {
      alert('Tên tài sản không được để trống!');
      return;
    }
    if (!assetForm.category) {
      alert('Vui lòng chọn danh mục!');
      return;
    }
    if (!assetForm.owner || isNaN(parseInt(assetForm.owner))) {
      alert('ID chủ sở hữu không hợp lệ!');
      return;
    }
    if (!assetForm.startingPrice || isNaN(parseFloat(assetForm.startingPrice)) || parseFloat(assetForm.startingPrice) <= 0) {
      alert('Giá khởi điểm phải là số dương!');
      return;
    }

    try {
      const assetData = {
        name: assetForm.name,
        description: assetForm.description,
        starting_price: parseFloat(assetForm.startingPrice),
        status: assetForm.status,
        category: assetForm.category === '1' ? 'Bất động sản' :
                  assetForm.category === '2' ? 'Xe cộ' :
                  assetForm.category === '3' ? 'Đồ cổ' :
                  assetForm.category === '4' ? 'Nghệ thuật' : 'Thiết bị điện tử',
        owner_id: parseInt(assetForm.owner),
        image_url: assetForm.imageUrl,
      };

      if (modalMode === 'edit') {
        await axios.put(`${API_URL}/auction-profiles/${assetForm.code.replace('#TS-', '')}`, assetData);
        alert('Cập nhật tài sản thành công!');
      } else {
        await axios.post(`${API_URL}/auction-profiles`, assetData);
        alert('Thêm tài sản thành công!');
      }

      // Refresh assets
      const response = await axios.get(`${API_URL}/auction-profiles`);
      const formattedAssets = response.data.data.map(asset => ({
        id: `#TS-${asset.id.toString().padStart(3, '0')}`,
        name: asset.name,
        category: asset.category,
        categoryId: asset.category === 'Bất động sản' ? '1' :
                    asset.category === 'Xe cộ' ? '2' :
                    asset.category === 'Đồ cổ' ? '3' :
                    asset.category === 'Nghệ thuật' ? '4' : '5',
        owner: asset.owner.name,
        ownerId: asset.owner.id.toString(),
        startingPrice: new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(asset.starting_price),
        startingPriceValue: parseFloat(asset.starting_price),
        status: asset.status === 'ChoDauGia' ? 'Chờ đấu giá' :
                asset.status === 'ChoDuyet' ? 'Chờ duyệt' :
                asset.status === 'DangDauGia' ? 'Đang đấu giá' :
                asset.status === 'DaBan' ? 'Đã bán' : 'Hủy',
        statusClass: asset.status === 'ChoDuyet' ? 'statusChoduyet' :
                     asset.status === 'ChoDauGia' ? 'statusChodau' :
                     asset.status === 'DangDauGia' ? 'statusDangdau' :
                     asset.status === 'DaBan' ? 'statusDaban' : 'statusHuy',
        createdDate: asset.created_at ? new Date(asset.created_at).toISOString().split('T')[0] : 'N/A',
        description: asset.description,
        imageUrl: asset.image_url || 'https://example.com/placeholder.jpg',
      }));
      setAssets(formattedAssets);
      closeAssetModal();
    } catch (error) {
      console.error('Lỗi khi lưu tài sản:', error.response?.data || error);
      alert(`Lỗi khi lưu tài sản: ${error.response?.data?.message || 'Vui lòng thử lại.'}`);
    }
  };

  const handleDeleteAsset = async (asset) => {
    if (window.confirm('Bạn có chắc muốn xóa tài sản này?')) {
      try {
        await axios.delete(`${API_URL}/auction-profiles/${asset.id.replace('#TS-', '')}`);
        alert('Xóa tài sản thành công!');
        const response = await axios.get(`${API_URL}/auction-profiles`);
        const formattedAssets = response.data.data.map(asset => ({
          id: `#TS-${asset.id.toString().padStart(3, '0')}`,
          name: asset.name,
          category: asset.category,
          categoryId: asset.category === 'Bất động sản' ? '1' :
                      asset.category === 'Xe cộ' ? '2' :
                      asset.category === 'Đồ cổ' ? '3' :
                      asset.category === 'Nghệ thuật' ? '4' : '5',
          owner: asset.owner.name,
          ownerId: asset.owner.id.toString(),
          startingPrice: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(asset.starting_price),
          startingPriceValue: parseFloat(asset.starting_price),
          status: asset.status === 'ChoDauGia' ? 'Chờ đấu giá' :
                  asset.status === 'ChoDuyet' ? 'Chờ duyệt' :
                  asset.status === 'DangDauGia' ? 'Đang đấu giá' :
                  asset.status === 'DaBan' ? 'Đã bán' : 'Hủy',
          statusClass: asset.status === 'ChoDuyet' ? 'statusChoduyet' :
                       asset.status === 'ChoDauGia' ? 'statusChodau' :
                       asset.status === 'DangDauGia' ? 'statusDangdau' :
                       asset.status === 'DaBan' ? 'statusDaban' : 'statusHuy',
          createdDate: asset.created_at ? new Date(asset.created_at).toISOString().split('T')[0] : 'N/A',
          description: asset.description,
          imageUrl: asset.image_url || 'https://example.com/placeholder.jpg',
        }));
        setAssets(formattedAssets);
      } catch (error) {
        console.error('Lỗi khi xóa tài sản:', error.response?.data || error);
        alert(`Lỗi khi xóa tài sản: ${error.response?.data?.message || 'Vui lòng thử lại.'}`);
      }
    }
  };

  const handleApproveAsset = async (asset) => {
    try {
      await axios.put(`${API_URL}/auction-profiles/${asset.id.replace('#TS-', '')}/status`, {
        status: 'ChoDauGia',
      });
      alert('Duyệt tài sản thành công!');
      const response = await axios.get(`${API_URL}/auction-profiles`);
      const formattedAssets = response.data.data.map(asset => ({
        id: `#TS-${asset.id.toString().padStart(3, '0')}`,
        name: asset.name,
        category: asset.category,
        categoryId: asset.category === 'Bất động sản' ? '1' :
                    asset.category === 'Xe cộ' ? '2' :
                    asset.category === 'Đồ cổ' ? '3' :
                    asset.category === 'Nghệ thuật' ? '4' : '5',
        owner: asset.owner.name,
        ownerId: asset.owner.id.toString(),
        startingPrice: new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(asset.starting_price),
        startingPriceValue: parseFloat(asset.starting_price),
        status: asset.status === 'ChoDauGia' ? 'Chờ đấu giá' :
                asset.status === 'ChoDuyet' ? 'Chờ duyệt' :
                asset.status === 'DangDauGia' ? 'Đang đấu giá' :
                asset.status === 'DaBan' ? 'Đã bán' : 'Hủy',
        statusClass: asset.status === 'ChoDuyet' ? 'statusChoduyet' :
                     asset.status === 'ChoDauGia' ? 'statusChodau' :
                     asset.status === 'DangDauGia' ? 'statusDangdau' :
                     asset.status === 'DaBan' ? 'statusDaban' : 'statusHuy',
        createdDate: asset.created_at ? new Date(asset.created_at).toISOString().split('T')[0] : 'N/A',
        description: asset.description,
        imageUrl: asset.image_url || 'https://example.com/placeholder.jpg',
      }));
      setAssets(formattedAssets);
    } catch (error) {
      console.error('Lỗi khi duyệt tài sản:', error.response?.data || error);
      alert(`Lỗi khi duyệt tài sản: ${error.response?.data?.message || 'Vui lòng thử lại.'}`);
    }
  };

  const handleRejectAsset = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }
    try {
      await axios.put(`${API_URL}/auction-profiles/${selectedAsset.id.replace('#TS-', '')}/status`, {
        status: 'Huy',
        reject_reason: rejectReason,
      });
      alert(`Từ chối tài sản thành công với lý do: ${rejectReason}`);
      closeRejectModal();
      const response = await axios.get(`${API_URL}/auction-profiles`);
      const formattedAssets = response.data.data.map(asset => ({
        id: `#TS-${asset.id.toString().padStart(3, '0')}`,
        name: asset.name,
        category: asset.category,
        categoryId: asset.category === 'Bất động sản' ? '1' :
                    asset.category === 'Xe cộ' ? '2' :
                    asset.category === 'Đồ cổ' ? '3' :
                    asset.category === 'Nghệ thuật' ? '4' : '5',
        owner: asset.owner.name,
        ownerId: asset.owner.id.toString(),
        startingPrice: new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(asset.starting_price),
        startingPriceValue: parseFloat(asset.starting_price),
        status: asset.status === 'ChoDauGia' ? 'Chờ đấu giá' :
                asset.status === 'ChoDuyet' ? 'Chờ duyệt' :
                asset.status === 'DangDauGia' ? 'Đang đấu giá' :
                asset.status === 'DaBan' ? 'Đã bán' : 'Hủy',
        statusClass: asset.status === 'ChoDuyet' ? 'statusChoduyet' :
                     asset.status === 'ChoDauGia' ? 'statusChodau' :
                     asset.status === 'DangDauGia' ? 'statusDangdau' :
                     asset.status === 'DaBan' ? 'statusDaban' : 'statusHuy',
        createdDate: asset.created_at ? new Date(asset.created_at).toISOString().split('T')[0] : 'N/A',
        description: asset.description,
        imageUrl: asset.image_url || 'https://example.com/placeholder.jpg',
      }));
      setAssets(formattedAssets);
    } catch (error) {
      console.error('Lỗi khi từ chối tài sản:', error.response?.data || error);
      alert(`Lỗi khi từ chối tài sản: ${error.response?.data?.message || 'Vui lòng thử lại.'}`);
    }
  };

  const handleCreateAuction = (asset) => {
    alert('Link qua bên trang quản lý phiên đấu giá');
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Chờ duyệt': 'statusChoduyet',
      'Chờ đấu giá': 'statusChodau',
      'Đang đấu giá': 'statusDangdau',
      'Đã bán': 'statusDaban',
      'Hủy': 'statusHuy',
    };
    return statusMap[status] || 'statusChoduyet';
  };

  const getActionButtons = (asset) => {
    const buttons = [];

    if (asset.status === 'Chờ duyệt') {
      buttons.push(
        <button key="approve" className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => handleApproveAsset(asset)}>
          <i className="fa fa-check" aria-hidden="true"></i>
        </button>
      );
      buttons.push(
        <button key="reject" className={`${styles.btn} ${styles.btnDanger}`} onClick={() => openRejectModal(asset)}>
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
      );
    } else if (asset.status === 'Chờ đấu giá') {
      buttons.push(
        <button key="create-auction" className={`${styles.btn} ${styles.btnWarning}`} onClick={() => handleCreateAuction(asset)}>
          <i className="fa fa-gavel" aria-hidden="true"></i>
        </button>
      );
      buttons.push(
        <button key="edit" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openAssetModal('edit', asset)}>
          <i className="fa fa-pencil" aria-hidden="true"></i>
        </button>
      );
      buttons.push(
        <button key="delete" className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteAsset(asset)}>
          <i className="fa fa-trash" aria-hidden="true"></i>
        </button>
      );
    } else {
      buttons.push(
        <button key="edit" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openAssetModal('edit', asset)}>
          <i className="fa fa-pencil" aria-hidden="true"></i>
        </button>
      );
      buttons.push(
        <button key="delete" className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteAsset(asset)}>
          <i className="fa fa-trash" aria-hidden="true"></i>
        </button>
      );
    }

    buttons.push(
      <button key="view" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openViewModal(asset)}>
        <i className="fa fa-eye" aria-hidden="true"></i>
      </button>
    );

    return buttons;
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm tài sản..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className={styles.userProfile}>
          <div className={styles.notificationBell}>
            <i className="fas fa-bell"></i>
          </div>
          <div className={styles.profileAvatar}>QT</div>
        </div>
      </div>

      <h1 className={styles.pageTitle}>Quản Lý Tài Sản Đấu Giá</h1>
      <p className={styles.pageSubtitle}>Quản lý và theo dõi các tài sản được đưa ra đấu giá</p>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select className={styles.filterSelect} value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Chờ đấu giá">Chờ đấu giá</option>
            <option value="Đang đấu giá">Đang đấu giá</option>
            <option value="Đã bán">Đã bán</option>
            <option value="Hủy">Hủy</option>
          </select>
          <select className={styles.filterSelect} value={categoryFilter} onChange={handleCategoryFilterChange}>
            <option value="">Tất cả danh mục</option>
            <option value="1">Bất động sản</option>
            <option value="2">Xe cộ</option>
            <option value="3">Đồ cổ</option>
            <option value="4">Nghệ thuật</option>
            <option value="5">Thiết bị điện tử</option>
          </select>
        </div>
        <button className={styles.addBtn} onClick={() => openAssetModal('add')}>
          <i className="fas fa-plus"></i>
          Thêm tài sản mới
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Mã TS</th>
            <th>Tên tài sản</th>
            <th>Danh mục</th>
            <th>Chủ sở hữu</th>
            <th>Giá khởi điểm</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentAssets.map(asset => (
            <tr key={asset.id}>
              <td data-label="Mã TS">{asset.id}</td>
              <td data-label="Tên tài sản">{asset.name}</td>
              <td data-label="Danh mục">{asset.category}</td>
              <td data-label="Chủ sở hữu">{asset.owner}</td>
              <td data-label="Giá khởi điểm">{asset.startingPrice}</td>
              <td data-label="Trạng thái">
                <span className={`${styles.statusBadge} ${styles[getStatusClass(asset.status)]}`}>{asset.status}</span>
              </td>
              <td data-label="Ngày tạo">{asset.createdDate}</td>
              <td data-label="Hành động">
                <div className={styles.actionButtons}>
                  {getActionButtons(asset)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        {renderPagination()}
      </div>

      {/* Add/Edit Asset Modal */}
      {showAssetModal && (
        <div className={styles.modal} onClick={closeAssetModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa tài sản' : 'Thêm tài sản mới'}
              </h2>
              <span className={styles.modalClose} onClick={closeAssetModal}>×</span>
            </div>
            <div className={styles.modalBody}>
              <div>
                <label htmlFor="code">Mã tài sản</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  placeholder="Nhập mã tài sản (VD: TS001)"
                  value={assetForm.code}
                  onChange={handleFormChange}
                  disabled={modalMode === 'edit'}
                />
              </div>
              <div>
                <label htmlFor="name">Tên tài sản</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nhập tên tài sản"
                  value={assetForm.name}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="category">Danh mục</label>
                <select
                  id="category"
                  name="category"
                  value={assetForm.category}
                  onChange={handleFormChange}
                >
                  <option value="">Chọn danh mục</option>
                  <option value="1">Bất động sản</option>
                  <option value="2">Xe cộ</option>
                  <option value="3">Đồ cổ</option>
                  <option value="4">Nghệ thuật</option>
                  <option value="5">Thiết bị điện tử</option>
                </select>
              </div>
              <div>
                <label htmlFor="owner">Chủ sở hữu (ID User)</label>
                <input
                  type="number"
                  id="owner"
                  name="owner"
                  placeholder="Nhập ID chủ sở hữu"
                  value={assetForm.owner}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="startingPrice">Giá khởi điểm (VND)</label>
                <input
                  type="number"
                  id="startingPrice"
                  name="startingPrice"
                  placeholder="Nhập giá khởi điểm"
                  step="0.01"
                  value={assetForm.startingPrice}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Nhập mô tả tài sản"
                  value={assetForm.description}
                  onChange={handleFormChange}
                ></textarea>
              </div>
              <div>
                <label htmlFor="imageUrl">URL ảnh</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  placeholder="Nhập URL ảnh"
                  value={assetForm.imageUrl}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label htmlFor="status">Trạng thái</label>
                <select
                  id="status"
                  name="status"
                  value={assetForm.status}
                  onChange={handleFormChange}
                >
                  <option value="ChoDuyet">Chờ duyệt</option>
                  <option value="ChoDauGia">Chờ đấu giá</option>
                  <option value="DangDauGia">Đang đấu giá</option>
                  <option value="DaBan">Đã bán</option>
                  <option value="Huy">Hủy</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveAsset}>Lưu</button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeAssetModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* View Asset Modal */}
      {showViewModal && selectedAsset && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Tài Sản</h2>
              <span className={styles.modalClose} onClick={closeViewModal}>×</span>
            </div>
            <div className={styles.modalBody}>
              <p><strong>Mã tài sản:</strong> {selectedAsset.id}</p>
              <p><strong>Tên tài sản:</strong> {selectedAsset.name}</p>
              <p><strong>Danh mục:</strong> {selectedAsset.category}</p>
              <p><strong>Chủ sở hữu:</strong> {selectedAsset.owner}</p>
              <p><strong>Giá khởi điểm:</strong> {selectedAsset.startingPrice}</p>
              <p><strong>Trạng thái:</strong> {selectedAsset.status}</p>
              <p><strong>Ngày tạo:</strong> {selectedAsset.createdDate}</p>
              <p><strong>Mô tả:</strong> {selectedAsset.description}</p>
              <p><strong>URL ảnh:</strong> <a href={selectedAsset.imageUrl} target="_blank" rel="noopener noreferrer">{selectedAsset.imageUrl}</a></p>
              <div className={styles.orderHistory}>
                <h3>Lịch sử lượt bid</h3>
                <table className={styles.orderTable}>
                  <thead>
                    <tr>
                      <th>Mã bid</th>
                      <th>Người bid</th>
                      <th>Giá bid</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bidHistory.length > 0 ? (
                      bidHistory.map(bid => (
                        <tr key={bid.id}>
                          <td>{bid.id}</td>
                          <td>{bid.user_name}</td>
                          <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bid.amount)}</td>
                          <td>{new Date(bid.created_at).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">Không có lịch sử bid</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeViewModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Asset Modal */}
      {showRejectModal && selectedAsset && (
        <div className={styles.modal} onClick={closeRejectModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Từ Chối Tài Sản</h2>
              <span className={styles.modalClose} onClick={closeRejectModal}>×</span>
            </div>
            <div className={styles.modalBody}>
              <p>Bạn đang từ chối tài sản: <strong>{selectedAsset.name}</strong></p>
              <div>
                <label htmlFor="rejectReason">Lý do từ chối</label>
                <textarea
                  id="rejectReason"
                  placeholder="Nhập lý do từ chối tài sản..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleRejectAsset}>Xác nhận từ chối</button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeRejectModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuctionAsset;