import React from "react";
import Sidebar from "../admin/Header/Header";
import Users from "../admin/Users/Users";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminUsers() {
  return (
    <div>
      <Sidebar />
      <Users />
    </div>
  );
}

export default AdminUsers;
