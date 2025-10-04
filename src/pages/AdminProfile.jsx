import React from "react";
import Sidebar from "../admin/Header/Header";
import Profile from "../admin/Profile/Profile";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminProfile() {
  return (
    <div>
      <Sidebar />
      <Profile />
    </div>
  );
}

export default AdminProfile;
