import React from 'react';
import { Link } from 'react-router-dom';

const AccessDenied = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Access Denied</h2>
      <p>You do not have permission to access this page.</p>
      <Link to="/">Return to Home</Link>
    </div>
  );
};

export default AccessDenied;