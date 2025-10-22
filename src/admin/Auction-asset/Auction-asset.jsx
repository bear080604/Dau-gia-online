import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Auction-asset.module.css';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

function AuctionAsset() {
   const navigate = useNavigate();
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
  const [auctionOrgs, setAuctionOrgs] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isLoadingAuctionOrgs, setIsLoadingAuctionOrgs] = useState(true);
  const [assetForm, setAssetForm] = useState({
    name: '',
    category: '',
    owner: '',
    auctionOrgId: '',
    startingPrice: '',
    description: '',
    imageUrls: [],
    extraImages: [],
    urlFile: null,
    files: [],
    removedImageUrls: [],
    status: 'ChoDuyet',
  });

  const itemsPerPage = 5;
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://127.0.0.1:8000';

  const formatNumber = (value) => {
    if (!value) return '';
    const cleaned = value.replace(/[^\d]/g, '');
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseNumber = (value) => {
    return value.replace(/\./g, '');
  };

  const formatAssetData = (asset, categories) => {
    console.log('Formatting asset:', asset);
    console.log('Categories:', categories);
    const category = categories.find((cat) => cat.name === asset.category);
    console.log('Found category:', category);
    const imageUrl = asset.image_url ? `${BASE_URL}${asset.image_url}` : 'https://example.com/placeholder.jpg';

    return {
      id: asset.id ?? 'N/A',
      name: asset.name ?? 'Không xác định',
      category: category ? category.name : 'Không xác định',
      categoryId: category ? category.id.toString() : '',
      owner: asset.owner?.name ?? 'Không xác định',
      ownerId: asset.owner?.id?.toString() ?? '',
      auctionOrgId: asset.auction_org_id?.toString() ?? '',
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
      imageUrls: [imageUrl],
      urlFile: asset.url_file ? `${BASE_URL}${asset.url_file}` : '',
      rawCreatedAt: asset.created_at ?? '',
      extraImages: asset.images?.map((img) => (img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`)) || [],
    };
  };

  // Fetch extra images for a specific asset
  const fetchExtraImages = async (itemId) => {
    try {
      console.log('Fetching extra images for itemId:', itemId);
      const response = await axios.get(`${BASE_URL}/api/auction-items/${itemId}/images`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('API response for extra images:', response.data);
      const images = response.data.data || [];
      const imageUrls = images.map((img) => {
        const path = typeof img === 'string' ? img : img.url || img.image_url || '';
        if (!path) {
          console.warn(`Invalid image path for itemId ${itemId}:`, img);
          return null;
        }
        return path.startsWith('http') ? path : `${BASE_URL}${path}`;
      }).filter(Boolean);
      console.log('Generated extra image URLs:', imageUrls);
      return imageUrls;
    } catch (error) {
      console.error(`Error fetching extra images for itemId ${itemId}:`, error.response?.data || error);
      return [];
    }
  };

  // Fetch auction organizations (users with role ToChucDauGia)
// Fetch auction organizations (users with role_id = 8 for AuctionOrganization)
useEffect(() => {
  const fetchAuctionOrgs = async () => {
    try {
      setIsLoadingAuctionOrgs(true);
      const response = await axios.get(`${BASE_URL}/api/showuser`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('Dữ liệu API tổ chức đấu giá:', response.data);
      const users = response.data.users || [];
      const toChucDauGiaUsers = users
        .filter((user) => user.role_id === 8) // Sửa từ user.role thành user.role_id
        .map((user) => ({
          id: user.user_id.toString(),
          name: user.full_name,
        }));
      setAuctionOrgs(toChucDauGiaUsers);
    } catch (error) {
      console.error('Lỗi khi lấy tổ chức đấu giá:', error.response?.data || error);
      alert(
        `Không thể tải danh sách tổ chức đấu giá: ${
          error.response?.data?.message || 'Vui lòng thử lại.'
        }`
      );
    } finally {
      setIsLoadingAuctionOrgs(false);
    }
  };
  fetchAuctionOrgs();
}, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/categories`);
        console.log('Dữ liệu API danh mục:', response.data);
        const categoriesData = response.data.data || [];
        const normalizedCategories = categoriesData.map((cat) => ({
          id: cat.category_id || cat.id,
          name: cat.name,
          description: cat.description,
        }));
        setCategories(normalizedCategories);
      } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error.response?.data || error);
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
        console.log('Token:', localStorage.getItem('token'));
        const response = await axios.get(`${BASE_URL}/api/products`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Dữ liệu API tài sản:', response.data);
        const assetsData = response.data.data || [];
        const formattedAssets = await Promise.all(
          assetsData.map(async (asset) => {
            if (!asset.id) {
              console.warn('Asset missing ID:', asset);
              return { ...formatAssetData(asset, categories), extraImages: [] };
            }
            const formatted = formatAssetData(asset, categories);
            // Use extraImages from API response if available, otherwise fetch
            const extraImages = asset.images?.length
              ? asset.images.map((img) => (img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`))
              : await fetchExtraImages(asset.id);
            return { ...formatted, extraImages };
          })
        );
        console.log('Formatted Assets:', formattedAssets);
        setAssets(formattedAssets.sort((a, b) => new Date(b.rawCreatedAt || 0) - new Date(a.rawCreatedAt || 0)));
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu tài sản:', error.response?.data || error);
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
        category: asset.categoryId || '',
        owner: asset.ownerId,
        auctionOrgId: asset.auctionOrgId || '',
        startingPrice: formatNumber(asset.startingPriceValue.toString()),
        description: asset.description,
        imageUrls: asset.imageUrls,
        extraImages: asset.extraImages,
        urlFile: asset.urlFile,
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
        auctionOrgId: '',
        startingPrice: '',
        description: '',
        imageUrls: [],
        extraImages: [],
        urlFile: null,
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
    console.log('Selected Asset Extra Images:', asset.extraImages);
    try {
      const response = await axios.get(`${BASE_URL}/api/auction-items/${asset.id}/bids`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
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
    console.log(`Form change: ${name}=${value}`);
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
      imageUrls: newImageUrls,
      files: files,
    }));
  };

  const handleExtraImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setAssetForm((prev) => ({
      ...prev,
      extraImages: [...prev.extraImages, ...newImageUrls],
      files: [...(prev.files || []), ...files],
    }));
  };

  const handleUrlFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAssetForm((prev) => ({
        ...prev,
        urlFile: file.name,
        files: [...(prev.files || []), file],
      }));
    }
  };

  const handleRemoveImage = (index, type = 'image') => {
    setAssetForm((prev) => {
      let updatedUrls, updatedFiles, updatedRemovedUrls;
      if (type === 'image') {
        updatedUrls = prev.imageUrls.filter((_, i) => i !== index);
        updatedFiles = prev.files?.filter((_, i) => i !== index) || [];
        updatedRemovedUrls = modalMode === 'edit' ? [...(prev.removedImageUrls || []), prev.imageUrls[index]] : prev.removedImageUrls;
      } else if (type === 'extra') {
        updatedUrls = prev.extraImages.filter((_, i) => i !== index);
        updatedFiles = prev.files?.filter((_, i) => i >= prev.imageUrls.length && i < prev.imageUrls.length + index) || [];
        updatedRemovedUrls = modalMode === 'edit' ? [...(prev.removedImageUrls || []), prev.extraImages[index]] : prev.removedImageUrls;
      }
      return {
        ...prev,
        imageUrls: type === 'image' ? updatedUrls : prev.imageUrls,
        extraImages: type === 'extra' ? updatedUrls : prev.extraImages,
        files: updatedFiles,
        removedImageUrls: updatedRemovedUrls,
      };
    });
  };

  const handleSaveAsset = async () => {
    console.log('Saving asset with form:', assetForm);
    if (!assetForm.name.trim()) {
      alert('Tên tài sản không được để trống!');
      return;
    }
    if (!assetForm.category || isNaN(parseInt(assetForm.category))) {
      alert('Vui lòng chọn danh mục hợp lệ!');
      return;
    }
    if (!assetForm.auctionOrgId || isNaN(parseInt(assetForm.auctionOrgId))) {
      alert('Vui lòng chọn tổ chức đấu giá!');
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
        category_id: parseInt(assetForm.category),
        owner_id: ownerId,
        auction_org_id: parseInt(assetForm.auctionOrgId),
        name: assetForm.name,
        description: assetForm.description,
        starting_price: parseFloat(rawPrice),
        status: assetForm.status,
        removed_image_urls: assetForm.removedImageUrls,
      };
      const formData = new FormData();
      Object.keys(payload).forEach((key) => formData.append(key, payload[key]));
      if (assetForm.files?.length > 0) {
        assetForm.files.forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });
      }
      if (assetForm.urlFile && typeof assetForm.urlFile === 'object') {
        formData.append('url_file', assetForm.urlFile);
      }

      if (modalMode === 'add') {
        await axios.post(`${BASE_URL}/api/auction-items`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Thêm tài sản thành công!');
      } else {
        await axios.put(`${BASE_URL}/api/auction-items/${selectedAsset.id}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Cập nhật tài sản thành công!');
      }

      const refreshResponse = await axios.get(`${BASE_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const assetsData = refreshResponse.data.data || [];
      const formattedAssets = await Promise.all(
        assetsData.map(async (asset) => {
          const formatted = formatAssetData(asset, categories);
          const extraImages = asset.images?.length
            ? asset.images.map((img) => (img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`))
            : await fetchExtraImages(asset.id);
          return { ...formatted, extraImages };
        })
      );
      setAssets(formattedAssets.sort((a, b) => new Date(b.rawCreatedAt || 0) - new Date(a.rawCreatedAt || 0)));
      closeAssetModal();
    } catch (error) {
      console.error('Lỗi khi lưu tài sản:', error.response?.data || error);
      alert(
        `Lỗi khi lưu tài sản: ${
          error.response?.data?.message || 'Vui lòng kiểm tra lại thông tin và thử lại.'
        }`
      );
    }
  };

  const handleDeleteAsset = async (asset) => {
    if (window.confirm('Bạn có chắc muốn xóa tài sản này?')) {
      try {
        await axios.delete(`${BASE_URL}/api/auction-items/${asset.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        alert('Xóa tài sản thành công!');
        const response = await axios.get(`${BASE_URL}/api/products`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const assetsData = response.data.data || [];
        const formattedAssets = await Promise.all(
          assetsData.map(async (asset) => {
            const formatted = formatAssetData(asset, categories);
            const extraImages = asset.images?.length
              ? asset.images.map((img) => (img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`))
              : await fetchExtraImages(asset.id);
            return { ...formatted, extraImages };
          })
        );
        setAssets(formattedAssets);
      } catch (error) {
        console.error('Lỗi khi xóa tài sản:', error.response?.data || error);
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
        `${BASE_URL}/api/auction-items/${asset.id}`,
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
      const response = await axios.get(`${BASE_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const assetsData = response.data.data || [];
      const formattedAssets = await Promise.all(
        assetsData.map(async (asset) => {
          const formatted = formatAssetData(asset, categories);
          const extraImages = asset.images?.length
            ? asset.images.map((img) => (img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`))
            : await fetchExtraImages(asset.id);
          return { ...formatted, extraImages };
        })
      );
      setAssets(formattedAssets);
    } catch (error) {
      console.error('Lỗi khi duyệt tài sản:', error.response?.data || error);
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
        `${BASE_URL}/api/auction-items/${selectedAsset.id}`,
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
      const response = await axios.get(`${BASE_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const assetsData = response.data.data || [];
      const formattedAssets = await Promise.all(
        assetsData.map(async (asset) => {
          const formatted = formatAssetData(asset, categories);
          const extraImages = asset.images?.length
            ? asset.images.map((img) => (img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`))
            : await fetchExtraImages(asset.id);
          return { ...formatted, extraImages };
        })
      );
      setAssets(formattedAssets);
      closeRejectModal();
    } catch (error) {
      console.error('Lỗi khi từ chối tài sản:', error.response?.data || error);
      alert(
        `Lỗi khi từ chối tài sản: ${
          error.response?.data?.message || 'Vui lòng thử lại.'
        }`
      );
    }
  };
 const handleCreateAuction = (asset) => {
    navigate('/admin/auction-session');
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
            <th>Tổ chức đấu giá</th>
            <th>Giá khởi điểm</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {isLoadingCategories || isLoadingAssets || isLoadingAuctionOrgs ? (
            <tr>
              <td colSpan="9">Đang tải dữ liệu...</td>
            </tr>
          ) : currentAssets.length > 0 ? (
            currentAssets.map((asset) => (
              <tr key={asset.id}>
                <td data-label="Mã TS">{asset.id}</td>
                <td data-label="Tên tài sản">{asset.name}</td>
                <td data-label="Danh mục">{asset.category}</td>
                <td data-label="Chủ sở hữu">{asset.owner}</td>
                <td data-label="Tổ chức đấu giá">
                  {auctionOrgs.find((org) => org.id === asset.auctionOrgId)?.name || 'Không xác định'}
                </td>
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
              <td colSpan="9">Không có tài sản nào</td>
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
                <label htmlFor="auctionOrgId">Tổ chức đấu giá</label>
                <select
                  id="auctionOrgId"
                  name="auctionOrgId"
                  value={assetForm.auctionOrgId}
                  onChange={handleFormChange}
                >
                  <option value="">Chọn tổ chức đấu giá</option>
                  {isLoadingAuctionOrgs ? (
                    <option value="" disabled>
                      Đang tải tổ chức đấu giá...
                    </option>
                  ) : auctionOrgs.length > 0 ? (
                    auctionOrgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Không có tổ chức đấu giá
                    </option>
                  )}
                </select>
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
                <label htmlFor="images">Ảnh chính</label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <div className={styles.imagePreview}>
                  {assetForm.imageUrls.map((url, index) => (
                    <div key={index} className={styles.imageContainer}>
                      <img
                        src={url}
                        alt={`Preview ${index}`}
                        className={styles.previewImage}
                        onError={() => console.log(`Failed to load main image: ${url}`)}
                      />
                      <button
                        type="button"
                        className={styles.removeImageBtn}
                        onClick={() => handleRemoveImage(index, 'image')}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="extraImages">Hình ảnh bổ sung</label>
                <input
                  type="file"
                  id="extraImages"
                  name="extraImages"
                  accept="image/*"
                  multiple
                  onChange={handleExtraImageChange}
                />
                <div className={styles.imagePreview}>
                  {assetForm.extraImages.length > 0 ? (
                    assetForm.extraImages.map((url, index) => (
                      <div key={index} className={styles.imageContainer}>
                        <img
                          src={url}
                          alt={`Extra Preview ${index}`}
                          className={styles.previewImage}
                          onError={() => console.log(`Failed to load extra image: ${url}`)}
                        />
                        <button
                          type="button"
                          className={styles.removeImageBtn}
                          onClick={() => handleRemoveImage(index, 'extra')}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>Không có hình ảnh bổ sung</p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="urlFile">Tệp đính kèm</label>
                <input
                  type="file"
                  id="urlFile"
                  name="urlFile"
                  accept=".pdf,.doc,.docx"
                  onChange={handleUrlFileChange}
                />
                {assetForm.urlFile && (
                  <div className={styles.fileNamePreview}>
                    Tệp đã chọn: {assetForm.urlFile}
                  </div>
                )}
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
                <strong>Tổ chức đấu giá:</strong>{' '}
                {auctionOrgs.find((org) => org.id === selectedAsset.auctionOrgId)?.name || 'Không xác định'}
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
                <strong>Ảnh chính:</strong>
                <div className={styles.imagePreview}>
                  {selectedAsset.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Asset ${index}`}
                      className={styles.previewImage}
                      onError={() => console.log(`Failed to load main image: ${url}`)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <strong>Hình ảnh bổ sung:</strong>
                <div className={styles.imagePreview}>
                  {selectedAsset.extraImages.length > 0 ? (
                    selectedAsset.extraImages.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Extra ${index}`}
                        className={styles.previewImage}
                        onError={() => console.log(`Failed to load extra image: ${url}`)}
                      />
                    ))
                  ) : (
                    <p>Không có hình ảnh bổ sung</p>
                  )}
                </div>
              </div>
              <div>
                <strong>Tệp đính kèm:</strong>
                {selectedAsset.urlFile ? (
                  <div className={styles.fileNamePreview}>
                    Tệp: <a href={selectedAsset.urlFile} target="_blank" rel="noopener noreferrer">{selectedAsset.urlFile.split('/').pop()}</a>
                  </div>
                ) : (
                  <p>Không có tệp đính kèm</p>
                )}
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