import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Roles from "../admin/Roles/Roles";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminRoles() {
  return (
    <AdminLayout>
      <Roles />
    </AdminLayout>
  );
}

export default AdminRoles;
