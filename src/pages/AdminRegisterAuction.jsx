import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import RegisterAuction from "../admin/Register-auction/register-auction";
import '@fortawesome/fontawesome-free/css/all.min.css';

function RegisterAuctionPage() {
  return (
    <AdminLayout>
      <RegisterAuction />
    </AdminLayout>
  );
}

export default RegisterAuctionPage;
