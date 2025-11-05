import React from 'react';
import Sidebar from './Header';
import TopHeader from './TopHeader';
import styles from './AdminLayout.module.css';

const AdminLayout = ({ children }) => {
  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <TopHeader />
        <div className={styles.pageContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
