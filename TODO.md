# Upgrade WebSocket to Socket.IO in Detail Page

## Tasks
- [x] Import Socket.IO client in detai.jsx
- [x] Replace native WebSocket with Socket.IO connection
- [x] Join auction room on connection
- [x] Listen for 'bid_update' and 'status_update' events
- [x] Update currentBidPrice and auctionItem status on events
- [x] Add connection status updates
- [x] Handle disconnections and reconnections
- [x] Remove old WebSocket code
- [x] Update status_update to handle full auctionItem updates
- [ ] Test the implementation
