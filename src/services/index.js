/**
 * Central export file cho tất cả services
 * Giúp import dễ dàng hơn: import { getContracts, getAuctionSessions } from '../../services'
 */

// Auth services
export * from './authService';

// User services
export * from './userService';

// Category services
export * from './categoryService';

// News services
export * from './newsService';

// Contract services
export * from './contractService';

// Auction Session services
export * from './auctionSessionService';

// Auction Asset services
export * from './auctionAssetService';

// Profile services
export * from './profileService';

// Bid services
export * from './bidService';

// Payment services
export * from './paymentService';

// Auction Item services
export * from './auctionItemService';

// API instance (nếu cần dùng trực tiếp)
export { default as api } from './api';

