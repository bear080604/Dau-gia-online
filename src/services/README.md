# Services Directory

Thư mục này chứa tất cả các service functions để gọi API. Các services này **có thể tái sử dụng cho cả admin và user**.

## Cấu trúc

```
services/
├── api.js                    # Axios instance với interceptors
├── index.js                  # Export tất cả services (import dễ dàng)
├── userService.js           # User API - dùng cho cả admin và user
├── categoryService.js       # Category API - dùng cho cả admin và user
├── newsService.js           # News API - dùng cho cả admin và user
├── contractService.js       # Contract API - dùng cho cả admin và user
├── auctionSessionService.js # Auction Session API - dùng cho cả admin và user
└── auctionAssetService.js  # Auction Asset API - chủ yếu cho admin
```

## Cách sử dụng

### 1. Import từng service riêng lẻ (Recommended)

```javascript
// Admin component
import { getContracts, updateContract } from '../../services/contractService';
import { getAuctionSessions } from '../../services/auctionSessionService';

// User component
import { getContracts } from '../../services/contractService';
import { getCurrentUser, updateUser } from '../../services/userService';
```

### 2. Import từ index.js (Tùy chọn)

```javascript
// Import tất cả từ một nơi
import { 
  getContracts, 
  getAuctionSessions, 
  getCurrentUser,
  getCategories 
} from '../../services';
```

## Ví dụ sử dụng

### Admin Component
```javascript
import { getContracts, updateContract } from '../../services/contractService';

const AdminContract = () => {
  useEffect(() => {
    const fetchData = async () => {
      const data = await getContracts(); // Lấy tất cả contracts
      // ...
    };
    fetchData();
  }, []);
};
```

### User Component
```javascript
import { getContracts } from '../../services/contractService';
import { getCurrentUser } from '../../services/userService';

const UserProfile = () => {
  useEffect(() => {
    const fetchData = async () => {
      const user = await getCurrentUser();
      const contracts = await getContracts(user.user_id); // Lấy contracts của user
      // ...
    };
    fetchData();
  }, []);
};
```

## Lợi ích

✅ **Tái sử dụng**: Một service có thể dùng cho cả admin và user  
✅ **Nhất quán**: Tất cả API calls đều qua axios instance  
✅ **Dễ bảo trì**: Thay đổi API chỉ cần sửa ở một nơi  
✅ **Tự động xử lý lỗi**: Interceptors tự động xử lý 401/403  
✅ **Type safety**: Dễ dàng thêm TypeScript sau này

## Lưu ý

- Admin thường có quyền truy cập tất cả dữ liệu
- User chỉ truy cập dữ liệu của chính họ (filtered by user_id)
- Một số service có thể nhận tham số để filter (ví dụ: `getContracts(userId)`)

