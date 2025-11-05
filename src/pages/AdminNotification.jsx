import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Notification from "../admin/Notification/Notification";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminNotification() {
  return (
    <AdminLayout>
      <Notification />
    </AdminLayout>
  );
}

export default AdminNotification;
