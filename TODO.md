# TODO: Add Follow Button to Home Page Auction Sessions

## Tasks
- [x] Modify Home component to fetch and manage user favorites state
- [x] Update AuctionItem component to include follow button with toggle functionality
- [x] Add CSS styles for the follow button in home.css
- [x] Test the follow/unfollow functionality with API integration
- [x] Handle authentication checks and error handling for API calls
- [x] Add "Phiên đấu giá theo dõi" section on home page

## Details
- Fetch favorites on page load using GET /my-favorites
- Add follow button next to bid button in AuctionItem
- Use POST /sessions/{id}/favorite to toggle favorite status
- Update local favorites state on successful toggle
- Style button with green for follow, red for unfollow
- Added favorites section between latest sessions and asset list
- Only show favorites section if user is logged in and has favorites
