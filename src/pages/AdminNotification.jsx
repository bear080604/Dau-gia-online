import React from "react";
import Sidebar from "../admin/Header/Header";
import Notification from "../admin/Notification/Notification";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminNotification() {
  return (
    <div>
      <Sidebar />
      <Notification />
    </div>
  );
}

export default AdminNotification;
