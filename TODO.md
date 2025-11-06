# TODO: Replace Simple Loading Text with Loading Component

## Overview
Replace all instances of `<p>Đang tải dữ liệu...</p>` with the `<Loading message="Đang tải dữ liệu..." />` component for consistent loading UI across the app.

## Steps
- [ ] Import Loading component in src/infouser/profile.jsx and replace loading text
- [ ] Import Loading component in src/home/home.jsx and replace 3 instances of loading text
- [ ] Import Loading component in src/detail/detail.jsx and replace loading text
- [ ] Import Loading component in src/contract/contract.jsx and replace loading text
- [ ] Import Loading component in src/auction-session/auction-session.jsx and replace loading text
- [ ] Import Loading component in src/admin/Payment/Payment.jsx and replace loading text
- [ ] Import Loading component in src/admin/Payment/a and replace loading text
- [ ] Import Loading component in src/admin/Auction-session/Auction-session.jsx and replace loading text
- [ ] Import Loading component in src/admin/Dashboard/Dashboard.jsx and replace loading text
- [ ] Import Loading component in src/admin/EContract/EContract.jsx and replace loading text
- [ ] Import Loading component in src/admin/Auction-session/a and replace loading text
- [ ] Test loading effects across the app

## Notes
- Ensure Loading component is imported at the top of each file.
- Use `<Loading message="Đang tải dữ liệu..." />` to replace `<p>Đang tải dữ liệu...</p>`.
- Adjust for any custom styling if needed.
