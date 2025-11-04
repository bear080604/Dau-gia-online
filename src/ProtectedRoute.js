import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children, restrictIfLoggedIn = false }) => {
  const { user } = useUser();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (restrictIfLoggedIn && user && !hasShownToast.current) {
      hasShownToast.current = true;
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
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role_id (giả sử 2 là Admin, 3 là NhanVien)
  if (user.role_id !== 2 && user.role_id !== 3) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;