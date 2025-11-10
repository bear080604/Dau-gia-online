# REFACTOR PROFILE.JSX - TODO LIST

## Mục tiêu
Tách file profile.jsx (~1400 dòng) thành các components nhỏ hơn, dễ quản lý và tái sử dụng.

## Cấu trúc thư mục mới
```
src/infouser/
├── profile.jsx (Main - ~200 dòng)
├── profile.module.css
├── components/
│   ├── ProfileSidebar.jsx
│   ├── ProfileSidebar.module.css
│   ├── tabs/
│   │   ├── ProfileInfoTab.jsx
│   │   ├── BankTab.jsx
│   │   ├── ContractsTab.jsx
│   │   ├── PaymentHistoryTab.jsx
│   │   ├── PasswordTab.jsx
│   │   ├── AuctionHistoryTab.jsx
│   │   ├── MyAuctionsTab.jsx
│   │   └── FavoritesTab.jsx
│   ├── popups/
│   │   ├── ProfileEditPopup.jsx
│   │   └── BankPopup.jsx
│   └── shared/
│       ├── InfoSection.jsx
│       ├── InfoGrid.jsx
│       ├── PhotoUpload.jsx
│       └── DataTable.jsx
├── hooks/
│   ├── useUserData.js
│   ├── useBankData.js
│   ├── useContracts.js
│   ├── useAuctionHistory.js
│   ├── useMyAuctions.js
│   └── useFavorites.js
└── services/
    ├── profileService.js (API calls cho profile)
    └── bankService.js (API calls cho bank)
```

## Tiến độ

### Phase 1: Services Layer ✅
- [x] Tạo profileService.js
- [x] Tạo bankService.js
- [x] Cập nhật userService.js (nếu cần)

### Phase 2: Custom Hooks
- [ ] useUserData.js - Quản lý user data & profile updates
- [ ] useBankData.js - Quản lý bank accounts
- [ ] useContracts.js - Fetch contracts data
- [ ] useAuctionHistory.js - Fetch auction history
- [ ] useMyAuctions.js - Fetch my auctions
- [ ] useFavorites.js - Fetch favorites

### Phase 3: Shared Components
- [ ] InfoSection.jsx - Reusable info section wrapper
- [ ] InfoGrid.jsx - Grid layout for info items
- [ ] PhotoUpload.jsx - Photo upload component
- [ ] DataTable.jsx - Reusable table component

### Phase 4: Tab Components
- [ ] ProfileInfoTab.jsx
- [ ] BankTab.jsx
- [ ] ContractsTab.jsx
- [ ] PaymentHistoryTab.jsx
- [ ] PasswordTab.jsx
- [ ] AuctionHistoryTab.jsx
- [ ] MyAuctionsTab.jsx
- [ ] FavoritesTab.jsx

### Phase 5: Popup Components
- [ ] ProfileEditPopup.jsx
- [ ] BankPopup.jsx

### Phase 6: Sidebar Component
- [ ] ProfileSidebar.jsx
- [ ] ProfileSidebar.module.css

### Phase 7: Main Profile Refactor
- [ ] Refactor profile.jsx để sử dụng các components mới
- [ ] Test tất cả chức năng
- [ ] Cleanup code không dùng

## Ghi chú
- Giữ nguyên profile.module.css, chỉ tạo CSS riêng cho Sidebar
- Tất cả API calls phải đi qua services layer
- Sử dụng custom hooks để quản lý state và side effects
- Components phải reusable và independent
