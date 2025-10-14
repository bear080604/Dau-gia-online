import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext';
import ProtectedRoute from './ProtectedRoute';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Register from './pages/Register';
import Login from './pages/login';
import Auction from './pages/Auction';
import AuctionSessionPageUser from './pages/AuctionSession';
import ContactPage from './pages/contact';
import ContractPage from './pages/contract';
import PaymentPage from './pages/payment';
import AdminSettings from './pages/AdminSettings';
import Admindashboard from './pages/AdminDashboard';
import AdminReport from './pages/AdminReport';
import AdminContract from './pages/AdminContract';
import AdminEContract from './pages/AdminEContract';
import AdminAdshowauction from './pages/AdminShowAuction';
import AdminHistory from './pages/AdminHistory';
import AdminUsers from './pages/AdminUsers';
import AdminPayment from './pages/AdminPayment';
import AdminNotification from './pages/AdminNotification';
import AdminAuctionAsset from './pages/AdminAuctionAsset';
import AdminProfile from './pages/AdminProfile';
import AuctionSessionPage from './pages/AdminAuction-session';
import ProfilePage from './pages/profile';
import AccessDenied from './AccessDenied';
import { ToastContainer } from 'react-toastify';
import RegisterAuctionPage from './pages/AdminRegisterAuction';
import News from './pages/news';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <ToastContainer />
          <Routes>
            {/* Public Routes (không cần bảo vệ) */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/auction/:id" element={<Auction />} />
            <Route path="/auction" element={<Auction />} />
            <Route path="/auction-session" element={<AuctionSessionPageUser />} />
            <Route path="/auction-session/:id" element={<Detail />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/contract" element={<ContractPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/news" element={<News />} />


            {/* Public Routes (ngăn truy cập nếu đã đăng nhập) */}
            <Route
              path="/register"
              element={
                <ProtectedRoute restrictIfLoggedIn={true}>
                  <Register />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <ProtectedRoute restrictIfLoggedIn={true}>
                  <Login />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes (yêu cầu DauGiaVien) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admindashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Admindashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/report"
              element={
                <ProtectedRoute>
                  <AdminReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/contract"
              element={
                <ProtectedRoute>
                  <AdminContract />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/econtract"
              element={
                <ProtectedRoute>
                  <AdminEContract />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/history"
              element={
                <ProtectedRoute>
                  <AdminHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payment"
              element={
                <ProtectedRoute>
                  <AdminPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notification"
              element={
                <ProtectedRoute>
                  <AdminNotification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/auction-asset"
              element={
                <ProtectedRoute>
                  <AdminAuctionAsset />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute>
                  <AdminProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/auction-session"
              element={
                <ProtectedRoute>
                  <AuctionSessionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/showauction/:id"
              element={
                <ProtectedRoute>
                  <AdminAdshowauction />
             </ProtectedRoute>
             }
             />
            <Route
              path="/admin/register-auction"
              element={
                <ProtectedRoute>
                  <RegisterAuctionPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;