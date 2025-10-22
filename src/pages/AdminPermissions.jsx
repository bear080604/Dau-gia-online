import React from "react";
import Sidebar from "../admin/Header/Header";
import Permissions from "../admin/Permissions/Permissions";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminPermissions() {
  return (
    <div>
      <Sidebar />
      <Permissions />
    </div>
  );
}

export default AdminPermissions;
