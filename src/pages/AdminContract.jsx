import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Contract from "../admin/Contract/Contract";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminContract() {
  return (
    <AdminLayout>
      <Contract />
    </AdminLayout>
  );
}

export default AdminContract;
