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
  const [modalMode, setModalMode] = useState('add');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [assets, setAssets] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [assetForm, setAssetForm] = useState({
    name: '',
    category: '',
    owner: '',
    startingPrice: '',
    description: '',
    imageUrls: [],
    files: [],
    removedImageUrls: [],
    status: 'ChoDuyet',
  });

  const itemsPerPage = 5;
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

  const formatNumber = (value) => {
    if (!value) return '';
    const cleaned = value.replace(/[^\d]/g, '');
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseNumber = (value) => {
    return value.replace(/\./g, '');
  };

  const formatAssetData = (asset, categories) => {
    
    const category = categories.find((cat) =>
      cat.name === asset.category
    );
    
    // const imageUrls = asset.image_url
    //   ? typeof asset.image_url === 'string'
    //     ? JSON.parse(asset.image_url)
    //     : asset.image_url
    //   : [];
    const imageUrls = asset.image_url
  ? typeof asset.image_url === 'string'
    ? asset.image_url.startsWith('[') // nếu JSON array
      ? JSON.parse(asset.image_url)
      : asset.image_url.split(',') // tách bằng dấu phẩy
    : asset.image_url
  : [];

    return {
      id: asset.id ?? 'N/A',
      name: asset.name ?? 'Không xác định',
      category: category ? category.name : 'Không xác định',
      categoryId: category ? category.id.toString() : '', // Lưu category_id từ danh mục tìm thấy
      owner: asset.owner?.name ?? 'Không xác định',
      ownerId: asset.owner?.id?.toString() ?? '',
      startingPrice: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(parseFloat(asset.starting_price ?? 0)),
      startingPriceValue: parseFloat(asset.starting_price ?? 0),
      status:
        asset.status === 'ChoDauGia'
          ? 'Chờ đấu giá'
          : asset.status === 'ChoDuyet'
          ? 'Chờ duyệt'
          : asset.status === 'DangDauGia'
          ? 'Đang đấu giá'
          : asset.status === 'DaBan'
          ? 'Đã bán'
          : 'Hủy',
      statusClass:
        asset.status === 'ChoDuyet'
          ? 'statusChoduyet'
          : asset.status === 'ChoDauGia'
          ? 'statusChodau'
          : asset.status === 'DangDauGia'
          ? 'statusDangdau'
          : asset.status === 'DaBan'
          ? 'statusDaban'
          : 'statusHuy',
      createdDate: asset.created_at
        ? new Date(asset.created_at).toLocaleDateString('vi-VN')
        : 'Không xác định',
      description: asset.description ?? '',
      imageUrls: imageUrls.length > 0 ? imageUrls : ['https://example.com/placeholder.jpg'],
      rawCreatedAt: asset.created_at ?? '',
    };
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}categories`);
       
        const categoriesData = response.data.data || [];
        const normalizedCategories = categoriesData.map((cat) => ({
          id: cat.category_id || cat.id,
          name: cat.name,
          description: cat.description,
        }));
        setCategories(normalizedCategories);
      } catch (error) {
  
        alert(
          `Không thể tải danh mục: ${
            error.response?.data?.message || 'Vui lòng thử lại.'
          }`
        );
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoadingAssets(true);
        const response = await axios.get(`${API_URL}products`);
   
        const formattedAssets = response.data.data
          .map((asset) => formatAssetData(asset, categories))
          .sort((a, b) => new Date(b.rawCreatedAt || 0) - new Date(a.rawCreatedAt || 0));
        setAssets(formattedAssets);
      } catch (error) {
       
        alert(
          `Không thể tải dữ liệu tài sản: ${
            error.response?.data?.message || 'Vui lòng thử lại.'
          }`
        );
      } finally {
        setIsLoadingAssets(false);
      }
    };
    fetchAssets();
  }, [categories]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setAssetForm((prev) => ({
        ...prev,
        owner: parsedUser['user_id']?.toString() || '',
      }));
    }
  }, []);

  const applyFilters = () => {
    return assets.filter((asset) => {
      const searchMatch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch =
        !statusFilter ||
        asset.status.toLowerCase().includes(statusFilter.toLowerCase());
      const categoryMatch =
        !categoryFilter ||
        asset.categoryId.toString() === categoryFilter.toString();
   
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
          className={`${styles.paginationBtn} ${
            currentPage === i ? styles.paginationBtnActive : ''
          }`}
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
    setSelectedAsset(asset);
    if (asset) {
   
      setAssetForm({
        name: asset.name,
        category: asset.categoryId || '', // Sử dụng categoryId từ formatAssetData
        owner: asset.ownerId,
        startingPrice: formatNumber(asset.startingPriceValue.toString()),
        description: asset.description,
        imageUrls: asset.imageUrls,
        files: [],
        removedImageUrls: [],
        status:
          asset.status === 'Chờ duyệt'
            ? 'ChoDuyet'
            : asset.status === 'Chờ đấu giá'
            ? 'ChoDauGia'
            : asset.status === 'Đang đấu giá'
            ? 'DangDauGia'
            : asset.status === 'Đã bán'
            ? 'DaBan'
            : 'Huy',
      });
    } else {
      const userData = localStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      setAssetForm({
        name: '',
        category: '',
        owner: parsedUser ? parsedUser['user_id']?.toString() || '' : '',
        startingPrice: '',
        description: '',
        imageUrls: [],
        files: [],
        removedImageUrls: [],
        status: 'ChoDuyet',
      });
    }
    setShowAssetModal(true);
  };

  const closeAssetModal = () => {
    setShowAssetModal(false);
    setSelectedAsset(null);
  };

  const openViewModal = async (asset) => {
    setSelectedAsset(asset);
    try {
      const response = await axios.get(`${API_URL}auction-items/${asset.id}/bids`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setBidHistory(response.data.data);
    } catch (error) {
   
      setBidHistory([]);
    }
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setBidHistory([]);
    setSelectedAsset(null);
  };

  const openRejectModal = (asset) => {
    setSelectedAsset(asset);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedAsset(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'startingPrice') {
      const formattedValue = formatNumber(value);
      setAssetForm((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setAssetForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setAssetForm((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ...newImageUrls],
      files: [...(prev.files || []), ...files],
    }));
  };

  const handleRemoveImage = (index) => {
    setAssetForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
      files: prev.files?.filter((_, i) => i !== index) || [],
      removedImageUrls:
        modalMode === 'edit'
          ? [...(prev.removedImageUrls || []), prev.imageUrls[index]]
          : prev.removedImageUrls,
    }));
  };

  const handleSaveAsset = async () => {
   
    if (!assetForm.name.trim()) {
      alert('Tên tài sản không được để trống!');
      return;
    }
    if (!assetForm.category || isNaN(parseInt(assetForm.category))) {
      alert('Vui lòng chọn danh mục hợp lệ!');
      return;
    }
    const ownerId = parseInt(assetForm.owner);
    if (!ownerId || isNaN(ownerId)) {
      alert('ID chủ sở hữu không hợp lệ! Vui lòng đăng nhập lại.');
      return;
    }
    const rawPrice = parseNumber(assetForm.startingPrice);
    if (!rawPrice || isNaN(parseFloat(rawPrice)) || parseFloat(rawPrice) <= 0) {
      alert('Giá khởi điểm phải là số dương!');
      return;
    }

    try {
      const payload = {
        category_id: parseInt(assetForm.category), // Gửi category_id
        owner_id: ownerId,
        name: assetForm.name,
        description: assetForm.description,
        starting_price: parseFloat(rawPrice),
        status: assetForm.status,
        removed_image_urls: assetForm.removedImageUrls,
      };
    

      if (assetForm.files?.length > 0 && modalMode === 'add') {
        const formData = new FormData();
        formData.append('category_id', payload.category_id);
        formData.append('owner_id', payload.owner_id);
        formData.append('name', payload.name);
        formData.append('description', payload.description);
        formData.append('starting_price', payload.starting_price);
        formData.append('status', payload.status);
        assetForm.files.forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });

        await axios.post(`${API_URL}auction-items`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Thêm tài sản thành công!');
      } else {
        await axios.put(`${API_URL}auction-items/${selectedAsset.id}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        alert('Cập nhật tài sản thành công!');
      }

      const refreshResponse = await axios.get(`${API_URL}products`);
      const formattedAssets = refreshResponse.data.data
        .map((asset) => formatAssetData(asset, categories))
        .sort((a, b) => new Date(b.rawCreatedAt || 0) - new Date(a.rawCreatedAt || 0));
      setAssets(formattedAssets);
      closeAssetModal();
    } catch (error) {
    
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Vui lòng kiểm tra lại thông tin và thử lại.';
      alert(`Lỗi khi lưu tài sản: ${errorMessage}`);
    }
  };

  const handleDeleteAsset = async (asset) => {
    if (window.confirm('Bạn có chắc muốn xóa tài sản này?')) {
      try {
        await axios.delete(`${API_URL}auction-items/${asset.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        alert('Xóa tài sản thành công!');
        const response = await axios.get(`${API_URL}products`);
        const formattedAssets = response.data.data
          .map((asset) => formatAssetData(asset, categories))
          .sort((a, b) => new Date(b.rawCreatedAt || 0) - new Date(a.rawCreatedAt || 0));
        setAssets(formattedAssets);
      } catch (error) {
       
        alert(
          `Lỗi khi xóa tài sản: ${
            error.response?.data?.message || 'Vui lòng thử lại.'
          }`
        );
      }
    }
  };

  const handleApproveAsset = async (asset) => {
    try {
      await axios.put(
        `${API_URL}auction-items/${asset.id}`,
        {
          status: 'ChoDauGia',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('Duyệt tài sản thành công!');
      const response = await axios.get(`${API_URL}products`);
      const formattedAssets = response.data.data
        .map((asset) => formatAssetData(asset, categories))
        .sort((a, b) => new Date(b.rawCreatedAt || 0) - new Date(a.rawCreatedAt || 0));
      setAssets(formattedAssets);
    } catch (error) {
   
      alert(
        `Lỗi khi duyệt tài sản: ${
          error.response?.data?.message || 'Vui lòng thử lại.'
        }`
      );
    }
  };

  const handleRejectAsset = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }
    try {
      await axios.put(
        `${API_URL}auction-items/${selectedAsset.id}`,
        {
          status: 'Huy',
          reject_reason: rejectReason,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert(`Từ chối tài sản thành công với lý do: ${rejectReason}`);
      const response = await axios.get(`${API_URL}products`);
      const formattedAssets = response.data.data
        .map((asset) => formatAssetData(asset, categories))
        .sort((a, b) => new Date(b.rawCreatedAt || 0) - new Date(a.rawCreatedAt || 0));
      setAssets(formattedAssets);
      closeRejectModal();
    } catch (error) {
      
      alert(
        `Lỗi khi từ chối tài sản: ${
          error.response?.data?.message || 'Vui lòng thử lại.'
        }`
      );
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
        <button
          key="approve"
          className={`${styles.btn} ${styles.btnSuccess}`}
          onClick={() => handleApproveAsset(asset)}
        >
          <i className="fa fa-check" aria-hidden="true"></i>
        </button>
      );
      buttons.push(
        <button
          key="reject"
          className={`${styles.btn} ${styles.btnDanger}`}
          onClick={() => openRejectModal(asset)}
        >
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
      );
    } else if (asset.status === 'Chờ đấu giá') {
      buttons.push(
        <button
          key="create-auction"
          className={`${styles.btn} ${styles.btnWarning}`}
          onClick={() => handleCreateAuction(asset)}
        >
          <i className="fa fa-gavel" aria-hidden="true"></i>
        </button>
      );
      buttons.push(
        <button
          key="edit"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => openAssetModal('edit', asset)}
        >
          <i className="fa fa-pencil" aria-hidden="true"></i>
        </button>
      );
      buttons.push(
        <button
          key="delete"
          className={`${styles.btn} ${styles.btnDanger}`}
          onClick={() => handleDeleteAsset(asset)}
        >
          <i className="fa fa-trash" aria-hidden="true"></i>
        </button>
      );
    }

    buttons.push(
      <button
        key="view"
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={() => openViewModal(asset)}
      >
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
      <p className={styles.pageSubtitle}>
        Quản lý và theo dõi các tài sản được đưa ra đấu giá
      </p>

      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Chờ đấu giá">Chờ đấu giá</option>
            <option value="Đang đấu giá">Đang đấu giá</option>
            <option value="Đã bán">Đã bán</option>
            <option value="Hủy">Hủy</option>
          </select>
          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
          >
            <option value="">Tất cả danh mục</option>
            {isLoadingCategories ? (
              <option value="" disabled>
                Đang tải danh mục...
              </option>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                Không có danh mục
              </option>
            )}
          </select>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => openAssetModal('add')}
        >
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
          {isLoadingCategories || isLoadingAssets ? (
            <tr>
              <td colSpan="8">Đang tải dữ liệu...</td>
            </tr>
          ) : currentAssets.length > 0 ? (
            currentAssets.map((asset) => (
              <tr key={asset.id}>
                <td data-label="Mã TS">{asset.id}</td>
                <td data-label="Tên tài sản">{asset.name}</td>
                <td data-label="Danh mục">{asset.category}</td>
                <td data-label="Chủ sở hữu">{asset.owner}</td>
                <td data-label="Giá khởi điểm">{asset.startingPrice}</td>
                <td data-label="Trạng thái">
                  <span
                    className={`${styles.statusBadge} ${styles[getStatusClass(asset.status)]}`}
                  >
                    {asset.status}
                  </span>
                </td>
                <td data-label="Ngày tạo">{asset.createdDate}</td>
                <td data-label="Hành động">
                  <div className={styles.actionButtons}>
                    {getActionButtons(asset)}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">Không có tài sản nào</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className={styles.pagination}>{renderPagination()}</div>

      {/* Add/Edit Asset Modal */}
      {showAssetModal && (
        <div className={styles.modal} onClick={closeAssetModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'edit' ? 'Chỉnh sửa tài sản' : 'Thêm tài sản mới'}
              </h2>
              <span className={styles.modalClose} onClick={closeAssetModal}>
                ×
              </span>
            </div>
            <div className={styles.modalBody}>
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
                  {isLoadingCategories ? (
                    <option value="" disabled>
                      Đang tải danh mục...
                    </option>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Không có danh mục
                    </option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="owner">Chủ sở hữu (ID User)</label>
                <input
                  type="number"
                  id="owner"
                  name="owner"
                  value={assetForm.owner}
                  disabled
                />
              </div>
              <div>
                <label htmlFor="startingPrice">Giá khởi điểm (VND)</label>
                <input
                  type="text"
                  id="startingPrice"
                  name="startingPrice"
                  placeholder="Nhập giá khởi điểm (VD: 1.000.000)"
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
                <label htmlFor="images">Hình ảnh</label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
                <div className={styles.imagePreview}>
                  {assetForm.imageUrls.map((url, index) => (
                    <div key={index} className={styles.imageContainer}>
                      <img
                        src={url}
                        alt={`Preview ${index}`}
                        className={styles.previewImage}
                      />
                      <button
                        type="button"
                        className={styles.removeImageBtn}
                        onClick={() => handleRemoveImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
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
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSaveAsset}
              >
                Lưu
              </button>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={closeAssetModal}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Asset Modal */}
      {showViewModal && selectedAsset && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Tài Sản</h2>
              <span className={styles.modalClose} onClick={closeViewModal}>
                ×
              </span>
            </div>
            <div className={styles.modalBody}>
              <p>
                <strong>Mã tài sản:</strong> {selectedAsset.id}
              </p>
              <p>
                <strong>Tên tài sản:</strong> {selectedAsset.name}
              </p>
              <p>
                <strong>Danh mục:</strong> {selectedAsset.category}
              </p>
              <p>
                <strong>Chủ sở hữu:</strong> {selectedAsset.owner}
              </p>
              <p>
                <strong>Giá khởi điểm:</strong> {selectedAsset.startingPrice}
              </p>
              <p>
                <strong>Trạng thái:</strong> {selectedAsset.status}
              </p>
              <p>
                <strong>Ngày tạo:</strong> {selectedAsset.createdDate}
              </p>
              <p>
                <strong>Mô tả:</strong> {selectedAsset.description}
              </p>
              <div>
                <strong>Hình ảnh:</strong>
                <div className={styles.imagePreview}>
                  {selectedAsset.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Asset ${index}`}
                      className={styles.previewImage}
                    />
                  ))}
                </div>
              </div>
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
                      bidHistory.map((bid) => (
                        <tr key={bid.id}>
                          <td>{bid.id}</td>
                          <td>{bid.user_name || bid.user}</td>
                          <td>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(bid.amount)}
                          </td>
                          <td>
                            {new Date(bid.created_at || bid.time).toLocaleString('vi-VN')}
                          </td>
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
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={closeViewModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Asset Modal */}
      {showRejectModal && selectedAsset && (
        <div className={styles.modal} onClick={closeRejectModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Từ Chối Tài Sản</h2>
              <span className={styles.modalClose} onClick={closeRejectModal}>
                ×
              </span>
            </div>
            <div className={styles.modalBody}>
              <p>
                Bạn đang từ chối tài sản: <strong>{selectedAsset.name}</strong>
              </p>
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
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleRejectAsset}
              >
                Xác nhận từ chối
              </button>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={closeRejectModal}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuctionAsset;