import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();

  // Kiểm tra nếu user không tồn tại hoặc role không phải "Administrator"
  if (!user || user.role !== 'Administrator') {
    console.warn('Access denied: User is not an Administrator or not logged in');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;