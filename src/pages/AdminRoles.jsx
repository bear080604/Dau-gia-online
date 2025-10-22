import React from "react";
import Sidebar from "../admin/Header/Header";
import Roles from "../admin/Roles/Roles";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminRoles() {
  return (
    <div>
      <Sidebar />
      <Roles />
    </div>
  );
}

export default AdminRoles;
