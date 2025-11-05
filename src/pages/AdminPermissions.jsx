import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Permissions from "../admin/Permissions/Permissions";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminPermissions() {
  return (
    <AdminLayout>
      <Permissions />
    </AdminLayout>
  );
}

export default AdminPermissions;
