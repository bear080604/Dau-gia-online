import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Users from "../admin/Users/Users";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminUsers() {
  return (
    <AdminLayout>
      <Users />
    </AdminLayout>
  );
}

export default AdminUsers;
