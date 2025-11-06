import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children, restrictIfLoggedIn = false }) => {
  const { user, isValidating } = useUser();
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
  if (isValidating) {
    return <div>Đang xác thực thông tin người dùng...</div>;
  }

  if (restrictIfLoggedIn) {
    if (user) {
      return <Navigate to="/home" replace />;
    }
    return children;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role_id !== 2 && user.role_id !== 5) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;