import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children, restrictIfLoggedIn = false }) => {
  const { user } = useUser();
  const hasShownToast = useRef(false); // Theo dõi xem thông báo đã hiển thị chưa

  useEffect(() => {
    if (restrictIfLoggedIn && user && !hasShownToast.current) {
      hasShownToast.current = true; // Đánh dấu thông báo đã hiển thị
      toast.info('Bạn đã đăng nhập rồi!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [user, restrictIfLoggedIn]);

  if (restrictIfLoggedIn) {
    if (user) {
      return <Navigate to="/home" replace />;
    }
    return children;
  }

  if (!user) {
    console.warn('Access denied: User is not logged in');
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'DauGiaVien') {
    console.warn('Access denied: User is not a DauGiaVien');
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;