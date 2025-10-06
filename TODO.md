# TODO List for Login and Header Update

- [x] Create UserContext for global user state management
- [x] Wrap App with UserProvider
- [x] Update login.jsx to set user on successful login and redirect to home
- [x] Update header.jsx to conditionally show user name and logout link when logged in
- [x] Test the functionality (login, redirect, header update, logout)

## Notes
- Assumed API returns { user: { name: '...', email: '...' } } on login
- Logout calls /logout API and clears user state
- Header shows "Xin chào, [name or email]" and "Đăng Xuất" when logged in
- Links updated to /login and /register
