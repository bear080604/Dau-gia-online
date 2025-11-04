import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Profile from "../admin/Profile/Profile";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminProfile() {
  return (
    <AdminLayout>
      <Profile />
    </AdminLayout>
  );
}

export default AdminProfile;
