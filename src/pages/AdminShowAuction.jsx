import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Adshowauction from "../admin/adshow-auction/adshowauction";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminAdshowauction() {
  return (
    <AdminLayout>
      <Adshowauction />
    </AdminLayout>
  );
}

export default AdminAdshowauction;
