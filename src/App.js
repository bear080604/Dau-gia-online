import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { UserProvider } from './UserContext';
import ProtectedRoute from './ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from './components/Loading';

// Public pages
import Home from './pages/Home';
import Detail from './pages/Detail';
import Register from './pages/Register';
import Login from './pages/login';
import Auction from './pages/Auction';
import AboutPage from './pages/About';
import AuctionSessionPageUser from './pages/AuctionSession';
import ContactPage from './pages/contact';
import ContractPage from './pages/contract';
import PaymentPage from './pages/payment';
import ProfilePage from './pages/profile';
import AccessDenied from './AccessDenied';
import News from './pages/news';
import NewsDetail from './pages/newsDetail';
import GuidePage from './pages/guide';
import CooperationPage from './pages/cooperation';
import ForgotPassword from './pages/ForgotPassword';
import ConfirmReset from './pages/ConfirmReset';
import ResetPassword from './pages/ResetPassword';

// Admin pages
import Admindashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
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
import RegisterAuctionPage from './pages/AdminRegisterAuction';
import Adminnews from './pages/AdminNews';
import AdminNewsCategories from './pages/AdminNewsCategories';
import AdminRoles from './pages/AdminRoles';
import AdminPermissions from './pages/AdminPermissions';
import AssetCategoriesPage from './pages/AdminAssetcategories';

// 🌟 ScrollToTop khi chuyển route
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000); // 1 second loading

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <div className="App">
        {isLoading && <Loading />}
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
            {/* ✅ Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/auction" element={<Auction />} />
            <Route path="/auction/:id" element={<Auction />} />
            <Route path="/auction-session" element={<AuctionSessionPageUser />} />
            <Route path="/auction-session/:id" element={<Detail />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/contract" element={<ContractPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/cooperation" element={<CooperationPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/confirm-reset/:token" element={<ConfirmReset />} />\
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* 🔐 Auth Routes (ngăn nếu đã login) */}
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

            {/* 🛡️ Admin Routes */}
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
              path="/admin/news"
              element={
                <ProtectedRoute>
                  <Adminnews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/news-categories"
              element={
                <ProtectedRoute>
                  <AdminNewsCategories />
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
              path="/admin/assets-categories"
              element={
                <ProtectedRoute>
                  <AssetCategoriesPage />
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
            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute>
                  <AdminRoles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <ProtectedRoute>
                  <AdminPermissions />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
    </>
  );
}

export default App;
