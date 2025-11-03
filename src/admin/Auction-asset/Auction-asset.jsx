// Auction-asset.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './Auction-asset.module.css';
import axios from 'axios'; // Giả sử sử dụng axios cho API calls, hoặc fetch
import NotificationBell from "../NotificationBell";

// API Base URL
const API_BASE = 'http://localhost:8000/api';
const BASE_IMAGE_URL = 'http://localhost:8000';
const BASE_FILE_URL = 'http://localhost:8000';

// Status mapping: API -> UI
const statusMap = {
  'ChoDuyet': 'Chờ duyệt',
  'ChoDauGia': 'Chờ đấu giá',
  'DangDauGia': 'Đang đấu giá',
  'DaBan': 'Đã bán',
  'Huy': 'Hủy'
};
const reverseStatusMap = Object.fromEntries(Object.entries(statusMap).map(([k, v]) => [v, k]));

// Format price to VND
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(price));
};

// Format date
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

// Auth helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Assume token from login
  return {
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// API call helper with auth
const apiCall = async (url, options = {}) => {
  const defaultOptions = {
    headers: getAuthHeaders(),
    ...options
  };
  if (options.body instanceof FormData) {
    // Không set Content-Type cho FormData
    delete defaultOptions.headers['Content-Type'];
  } else if (options.body) {
    defaultOptions.headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(url, defaultOptions);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }
  return response.json();
};

const AuctionAsset = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentAssetId, setCurrentAssetId] = useState(null);
  const [currentAssetData, setCurrentAssetData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    owner: '',
    ownerId: '',
    startingPrice: '',
    description: '',
    status: 'ChoDuyet',
    images: null,
    extraImages: [],
    urlFile: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [extraImagePreviews, setExtraImagePreviews] = useState([]);
  const [fileNamePreview, setFileNamePreview] = useState('Không có tệp đính kèm');
  const [viewBody, setViewBody] = useState('');
  const [noData, setNoData] = useState(false);
    const [open, setOpen] = useState(false);
  const togglePopup = (e) => {
    e.stopPropagation(); // tránh đóng liền sau khi mở
    setOpen((prev) => !prev);
  };
  const fileInputRef = useRef(null);
  const extraFileInputRef = useRef(null);
  const urlFileInputRef = useRef(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Lỗi khi tải danh mục!');
    }
  };

  // Fetch assets
  const fetchAssets = async () => {
    try {
      console.log('Fetching assets...');
      const response = await fetch(`${API_BASE}/products`);
      const data = await response.json();
      console.log('API Response:', data);
      const mappedAssets = (data.data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: typeof item.category === 'string' ? item.category : item.category?.name || item.category || 'N/A',
        owner: item.owner?.name || 'N/A',
        ownerId: item.owner?.id || null,
        ownerEmail: item.owner?.email || 'N/A',
        ownerPhone: item.owner?.email || 'N/A',
        ownerAddress: item.owner?.address || 'N/A',
        price: formatPrice(item.starting_price),
        rawPrice: item.starting_price,
        status: statusMap[item.status] || item.status,
        rawStatus: item.status,
        description: item.description || '',
        createdDate: formatDate(item.created_at),
        imageUrl: item.image_url ? BASE_IMAGE_URL + item.image_url : null,
        urlFile: item.url_file ? BASE_FILE_URL + item.url_file : null,
        auctionOrgId: item.auction_org_id
      }));
      console.log('Mapped assets:', mappedAssets);
      setAssets(mappedAssets);
      setNoData(mappedAssets.length === 0);
    } catch (error) {
      console.error('Error fetching assets:', error);
      alert('Lỗi khi tải tài sản: ' + error.message);
      setNoData(true);
    }
  };

  // Get auction org name
  const getAuctionOrgName = async (orgId) => {
    if (!orgId) return 'N/A';
    try {
      const data = await apiCall(`${API_BASE}/auction-orgs/${orgId}`);
      return data.data ? data.data.name : 'N/A';
    } catch (error) {
      console.error('Error fetching auction org:', error);
      return 'N/A';
    }
  };

  // Populate category options
  const categoryOptions = categories.map(cat => (
    <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
  ));

  // Filter and paginate assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || asset.status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesCategory = !categoryFilter || asset.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);

  // Render table rows
  const renderTableRows = () => {
    return currentAssets.map(asset => {
      const actionButtons = getActionButtons(asset.id, asset.status);
      return (
        <tr key={asset.id} className={styles.active}>
          <td data-label="Mã TS">{asset.id}</td>
          <td data-label="Tên tài sản">{asset.name}</td>
          <td data-label="Danh mục">{asset.category}</td>
          <td data-label="Chủ sở hữu">{asset.owner}</td>
          <td data-label="Giá khởi điểm">{asset.price}</td>
          <td data-label="Trạng thái">
            <span className={`${styles.statusBadge} ${styles[`status${asset.rawStatus}`]}`}>
              {asset.status}
            </span>
          </td>
          <td data-label="Hành động">
            <div className={styles.actionButtons}>
              {actionButtons}
              <button className={styles.btn + ' ' + styles.btnPrimary} onClick={() => openViewModal(asset.id)}>
                <i className="fa fa-eye"></i>
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  // Get action buttons
  const getActionButtons = (id, status) => {
    let buttons = [];
    if (status === 'Chờ duyệt') {
      buttons.push(
        <button key="approve" className={styles.btn + ' ' + styles.btnSuccess} onClick={() => approveAsset(id)}>
          <i className="fa fa-check"></i>
        </button>,
        <button key="reject" className={styles.btn + ' ' + styles.btnDanger} onClick={() => openRejectModal(id)}>
          <i className="fa fa-times"></i>
        </button>
      );
    } else {
      buttons.push(
        <button key="edit" className={styles.btn + ' ' + styles.btnEdit} onClick={() => openEditModal(id)}>
          <i className="fa fa-pencil"></i>
        </button>,
        <button key="delete" className={styles.btn + ' ' + styles.btnDanger} onClick={() => deleteAsset(id)}>
          <i className="fa fa-trash"></i>
        </button>
      );
    }
    return buttons;
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    // Prev
    pages.push(
      <button
        key="prev"
        className={`${styles.paginationBtn} ${currentPage === 1 ? styles.paginationBtnDisabled : ''}`}
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      >
        &lt;
      </button>
    );
    // Pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.paginationBtn} ${i === currentPage ? styles.paginationBtnActive : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    // Next
    pages.push(
      <button
        key="next"
        className={`${styles.paginationBtn} ${currentPage === totalPages ? styles.paginationBtnDisabled : ''}`}
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      >
        &gt;
      </button>
    );
    return <div className={styles.pagination}>{pages}</div>;
  };

  // Modal functions
  const openAddModal = () => {
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    setFormData({
      ...formData,
      name: '',
      category: '',
      owner: loggedUser?.full_name || 'N/A',
      ownerId: loggedUser?.user_id || '',
      startingPrice: '',
      description: '',
      status: 'ChoDuyet',
      images: null,
      extraImages: [],
      urlFile: null
    });
    setImagePreview('');
    setExtraImagePreviews([]);
    setFileNamePreview('Không có tệp đính kèm');
    setIsEditMode(false);
    setCurrentAssetId(null);
    setShowAddModal(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (extraFileInputRef.current) extraFileInputRef.current.value = '';
    if (urlFileInputRef.current) urlFileInputRef.current.value = '';
  };

  const openEditModal = async (id) => {
    setCurrentAssetId(id);
    try {
      const data = await apiCall(`${API_BASE}/auction-items/${id}`);
      const assetData = data.data || data;
      setCurrentAssetData(assetData);
      setFormData({
        name: assetData.name || '',
        category: assetData.category_id || '',
        owner: assetData.owner?.name || 'N/A',
        ownerId: assetData.owner?.id || '',
        startingPrice: parseFloat(assetData.starting_price) || '',
        description: assetData.description || '',
        status: assetData.status || 'ChoDuyet',
        images: null,
        extraImages: [],
        urlFile: null
      });
      setIsEditMode(true);
      // Preview main image
      if (assetData.image_url) {
        const fullImageUrl = BASE_IMAGE_URL + assetData.image_url;
        setImagePreview(
          <div className={styles.imageContainer}>
            <img src={fullImageUrl} alt="Preview" className={styles.previewImage} />
            <button type="button" className={styles.removeImageBtn} onClick={removeImage}>
              &times;
            </button>
          </div>
        );
      }
      // Extra images
      const extraImages = assetData.images || [];
      setExtraImagePreviews(extraImages.map(img => {
        const imgUrl = img.image_url || img.url || '';
        if (!imgUrl) return null;
        const fullImageUrl = BASE_IMAGE_URL + imgUrl;
        return (
          <div key={img.image_id || img.id} className={styles.imageContainer}>
            <img src={fullImageUrl} alt="Extra" className={styles.previewImage} />
            <button type="button" className={styles.removeImageBtn} onClick={() => removeExtraImage(img.image_id || img.id)}>
              &times;
            </button>
          </div>
        );
      }).filter(Boolean));
      // File
      if (assetData.url_file) {
        const fullFileUrl = BASE_FILE_URL + assetData.url_file;
        const fileName = assetData.url_file.split('/').pop() || 'file_unknown';
        setFileNamePreview(
          <span>Tệp đã chọn: <a href={fullFileUrl} target="_blank" rel="noopener noreferrer">{fileName}</a></span>
        );
      }
      setShowAddModal(true);
    } catch (error) {
      console.error('Error loading asset:', error);
      alert('Lỗi khi tải tài sản: ' + error.message);
    }
  };

  const openViewModal = async (id) => {
    try {
      const data = await apiCall(`${API_BASE}/auction-items/${id}`);
      const assetData = data.data || data;
      const auctionOrgName = await getAuctionOrgName(assetData.auction_org_id);
      const ownerId = assetData.owner?.id;
      const ownerName = assetData.owner?.name || 'N/A';
      const ownerEmail = assetData.owner?.email || 'N/A';
      const ownerPhone = assetData.owner?.phone || 'N/A';
      const ownerAddress = assetData.owner?.address || 'N/A';
      const bidHistory = assetData.sessions ? assetData.sessions.flatMap(s => s.bids || []).map(bid => ({
        id: bid.id,
        user: bid.user?.name || 'N/A',
        amount: bid.amount,
        created_at: bid.created_at
      })) : [];
      const fullImageUrl = assetData.image_url ? BASE_IMAGE_URL + assetData.image_url : '';
      const fullFileUrl = assetData.url_file ? BASE_FILE_URL + assetData.url_file : '';
      const fileName = assetData.url_file ? assetData.url_file.split('/').pop() || 'file_unknown' : '';
      const extraImagesHtml = (assetData.images || []).map(img => {
        const imgUrl = img.image_url || img.url || '';
        if (!imgUrl) return '';
        const fullImgUrl = BASE_IMAGE_URL + imgUrl;
        return <img key={img.id} src={fullImgUrl} alt="Extra" className={styles.previewImage} />;
      }).filter(Boolean);
      const bidHistoryHtml = bidHistory.length > 0 ? bidHistory.map(bid => (
        <tr key={bid.id}>
          <td>{bid.id}</td>
          <td>{bid.user}</td>
          <td>{formatPrice(bid.amount)}</td>
          <td>{formatDate(bid.created_at)}</td>
        </tr>
      )) : <tr><td colSpan="4">Không có lịch sử bid</td></tr>;
      setViewBody(
        <div>
          <p><strong>Mã tài sản:</strong> {assetData.id}</p>
          <p><strong>Tên tài sản:</strong> {assetData.name || 'N/A'}</p>
          <p><strong>Danh mục:</strong> {assetData.category?.name || assetData.category || 'N/A'}</p>
          <p><strong>Chủ sở hữu:</strong> {ownerName}</p>
          <p><strong>Email:</strong> {ownerEmail}</p>
          <p><strong>STD:</strong> {ownerPhone}</p>
          <p><strong>Địa chỉ:</strong> {ownerAddress}</p>
          <p><strong>Giá khởi điểm:</strong> {formatPrice(assetData.starting_price)}</p>
          <p><strong>Trạng thái:</strong> {statusMap[assetData.status] || assetData.status}</p>
          <p><strong>Ngày tạo:</strong> {formatDate(assetData.created_at)}</p>
          <p><strong>Mô tả:</strong> {assetData.description || 'N/A'}</p>
          <div>
            <strong>Ảnh chính:</strong>
            <div className={styles.imagePreview}>
              {fullImageUrl ? <img src={fullImageUrl} alt="Asset" className={styles.previewImage} /> : <p>Không có ảnh</p>}
            </div>
          </div>
          <div>
            <strong>Hình ảnh bổ sung:</strong>
            <div className={styles.imagePreview}>
              {extraImagesHtml.length > 0 ? extraImagesHtml : <p>Không có hình ảnh bổ sung</p>}
            </div>
          </div>
          <div>
            <strong>Tệp đính kèm:</strong>
            {fullFileUrl ? (
              <div className={styles.fileNamePreview}>
                Tệp: <a href={fullFileUrl} target="_blank" rel="noopener noreferrer">{fileName}</a>
              </div>
            ) : <p>Không có tệp đính kèm</p>}
          </div>
          <div className={styles.orderHistory}>
            <h3>Lịch sử lượt bid</h3>
            <table className={styles.orderTable}>
              <thead>
                <tr><th>Mã bid</th><th>Người bid</th><th>Giá bid</th><th>Thời gian</th></tr>
              </thead>
              <tbody>{bidHistoryHtml}</tbody>
            </table>
          </div>
        </div>
      );
      setShowViewModal(true);
    } catch (error) {
      console.error('Error loading asset details:', error);
      alert('Lỗi khi tải chi tiết tài sản: ' + error.message);
    }
  };

  const openRejectModal = (id) => {
    setCurrentAssetId(id);
    const asset = assets.find(a => a.id === id);
    setRejectReason('');
    // Note: In React, better to use state for this, but for simplicity, use ref or direct set
    setShowRejectModal(true);
  };

  const closeModal = (modal) => {
    if (modal === 'add') setShowAddModal(false);
    if (modal === 'view') setShowViewModal(false);
    if (modal === 'reject') setShowRejectModal(false);
    if (modal === 'add') {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      owner: '',
      ownerId: '',
      startingPrice: '',
      description: '',
      status: 'ChoDuyet',
      images: null,
      extraImages: [],
      urlFile: null
    });
    setImagePreview('');
    setExtraImagePreviews([]);
    setFileNamePreview('Không có tệp đính kèm');
  };

  // File handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(
        <div className={styles.imageContainer}>
          <img src={url} alt="Preview" className={styles.previewImage} />
          <button type="button" className={styles.removeImageBtn} onClick={removeImage}>
            &times;
          </button>
        </div>
      );
      setFormData(prev => ({ ...prev, images: file }));
    }
  };

  const handleExtraImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file, idx) => (
      <div key={idx} className={styles.imageContainer} data-file-index={idx}>
        <img src={URL.createObjectURL(file)} alt={`Extra ${idx}`} className={styles.previewImage} />
        <button type="button" className={styles.removeImageBtn} onClick={(event) => removeExtraImagePreview(event, idx)}>
          &times;
        </button>
      </div>
    ));
    setExtraImagePreviews(previews);
    setFormData(prev => ({ ...prev, extraImages: files }));
  };

  const handleUrlFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileNamePreview(<span>Tệp đã chọn: {file.name}</span>);
      setFormData(prev => ({ ...prev, urlFile: file }));
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, images: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExtraImagePreview = (event, idx) => {
    event.stopPropagation();
    setExtraImagePreviews(prev => prev.filter((_, i) => i !== idx));
    // Note: To remove from files array, you'd need to reconstruct FileList, but for simplicity, keep as is
  };

  const removeExtraImage = async (imageId) => {
    if (imageId && currentAssetId) {
      try {
        await apiCall(`${API_BASE}/auction-items/images/${imageId}`, { method: 'DELETE' });
        alert('Xóa ảnh thành công!');
        openEditModal(currentAssetId);
      } catch (error) {
        alert('Lỗi xóa ảnh: ' + error.message);
      }
    }
  };

  // Save asset
  const saveAsset = async () => {
    const { name, category, ownerId, startingPrice, description, status, images, extraImages = [], urlFile } = formData;
    if (!name || !category || !ownerId || !startingPrice) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', name);
    formDataToSend.append('category_id', category);
    formDataToSend.append('owner_id', ownerId);
    formDataToSend.append('starting_price', startingPrice);
    formDataToSend.append('description', description);
    formDataToSend.append('status', status);

    if (images) formDataToSend.append('image', images);
    if (urlFile) formDataToSend.append('url_file', urlFile);
    (extraImages || []).forEach(file => formDataToSend.append('extra_images[]', file));

    if (isEditMode) {
      formDataToSend.append('_method', 'PUT');
    }

    const url = isEditMode ? `${API_BASE}/auction-items/${currentAssetId}` : `${API_BASE}/auction-items`;

    try {
      const result = await apiCall(url, { method: 'POST', body: formDataToSend });
      if (result.status) {
        alert('Lưu thành công!');
        closeModal('add');
        fetchAssets();
      } else {
        alert('Lỗi: ' + (result.message || 'Không thể lưu!'));
      }
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Lỗi khi lưu: ' + error.message);
    }
  };

  // Approve, delete, etc.
  const approveAsset = async (id) => {
    try {
      const result = await apiCall(`${API_BASE}/auction-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'ChoDauGia' })
      });
      if (result.status) {
        alert('Duyệt thành công!');
        fetchAssets();
      } else {
        alert('Lỗi: ' + (result.message || 'Không thể duyệt!'));
      }
    } catch (error) {
      alert('Lỗi khi duyệt: ' + error.message);
    }
  };

  const deleteAsset = async (id) => {
    if (window.confirm(`Xóa tài sản ${id}?`)) {
      try {
        const result = await apiCall(`${API_BASE}/auction-items/${id}`, { method: 'DELETE' });
        if (result.status) {
          alert('Xóa thành công!');
          fetchAssets();
        } else {
          alert('Lỗi: ' + (result.message || 'Không thể xóa!'));
        }
      } catch (error) {
        alert('Lỗi khi xóa: ' + error.message);
      }
    }
  };

  const rejectAsset = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }
    try {
      const result = await apiCall(`${API_BASE}/auction-items/${currentAssetId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Huy', description: rejectReason })
      });
      if (result.status) {
        alert(`Từ chối thành công với lý do: ${rejectReason}`);
        closeModal('reject');
        fetchAssets();
      } else {
        alert('Lỗi: ' + (result.message || 'Không thể từ chối!'));
      }
    } catch (error) {
      alert('Lỗi khi từ chối: ' + error.message);
    }
  };

  // Update filters
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.classList.contains(styles.modal)) {
        closeModal('add');
        closeModal('view');
        closeModal('reject');
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Init
  useEffect(() => {
    fetchCategories();
    fetchAssets();
  }, []);

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
         <div>
              <div onClick={togglePopup} style={{ cursor: "pointer" }}>
                <i className="fa-solid fa-bell fa-lg"></i>
              </div>

              <NotificationBell open={open} onClose={() => setOpen(false)} />
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
            {categories.map(cat => (
              <option key={cat.category_id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button className={styles.addBtn} onClick={openAddModal}>
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
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {renderTableRows()}
        </tbody>
      </table>

      {noData && filteredAssets.length === 0 && (
        <div className={styles.noData}>
          Không có dữ liệu tài sản nào. Hãy thử thêm mới hoặc kiểm tra API.
        </div>
      )}

      {renderPagination()}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className={`${styles.modal} ${styles.active}`} onClick={() => closeModal('add')}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{isEditMode ? 'Chỉnh sửa tài sản' : 'Thêm tài sản mới'}</h2>
              <span className={styles.modalClose} onClick={() => closeModal('add')}>&times;</span>
            </div>
            <div className={styles.modalBody}>
              <div>
                <label htmlFor="name">Tên tài sản</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Nhập tên tài sản"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="category">Danh mục</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Chọn danh mục</option>
                  {categoryOptions}
                </select>
              </div>
              <div>
                <label htmlFor="owner">Chủ sở hữu</label>
                <input
                  type="text"
                  id="owner"
                  value={formData.owner}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="startingPrice">Giá khởi điểm (VND)</label>
                <input
                  type="number"
                  id="startingPrice"
                  placeholder="Nhập giá khởi điểm (VD: 1000000)"
                  step="0.01"
                  value={formData.startingPrice}
                  onChange={e => setFormData(prev => ({ ...prev, startingPrice: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  placeholder="Nhập mô tả tài sản"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="images">Ảnh chính</label>
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <div className={styles.imagePreview}>{imagePreview}</div>
              </div>
              <div>
                <label htmlFor="extraImages">Hình ảnh bổ sung</label>
                <input
                  type="file"
                  id="extraImages"
                  accept="image/*"
                  multiple
                  ref={extraFileInputRef}
                  onChange={handleExtraImagesChange}
                />
                <div className={styles.imagePreview}>
                  {extraImagePreviews.length > 0 ? extraImagePreviews : <p>Không có hình ảnh bổ sung</p>}
                </div>
              </div>
              <div>
                <label htmlFor="urlFile">Tệp đính kèm</label>
                <input
                  type="file"
                  id="urlFile"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  ref={urlFileInputRef}
                  onChange={handleUrlFileChange}
                />
                <div className={styles.fileNamePreview}>{fileNamePreview}</div>
              </div>
              <div>
                <label htmlFor="status">Trạng thái</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
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
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveAsset}>
                Lưu
              </button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => closeModal('add')}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className={`${styles.modal} ${styles.active}`} onClick={() => closeModal('view')}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi Tiết Tài Sản</h2>
              <span className={styles.modalClose} onClick={() => closeModal('view')}>&times;</span>
            </div>
            <div className={styles.modalBody}>{viewBody}</div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => closeModal('view')}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className={`${styles.modal} ${styles.active}`} onClick={() => closeModal('reject')}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Từ Chối Tài Sản</h2>
              <span className={styles.modalClose} onClick={() => closeModal('reject')}>&times;</span>
            </div>
            <div className={styles.modalBody}>
              <p>Bạn đang từ chối tài sản: <strong>{assets.find(a => a.id === currentAssetId)?.name || ''}</strong></p>
              <div>
                <label htmlFor="rejectReason">Lý do từ chối</label>
                <textarea
                  id="rejectReason"
                  placeholder="Nhập lý do từ chối tài sản..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnDanger}`} onClick={rejectAsset}>
                Xác nhận từ chối
              </button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => closeModal('reject')}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionAsset;