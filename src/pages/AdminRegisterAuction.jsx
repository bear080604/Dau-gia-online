import React from "react";
import Sidebar from "../admin/Header/Header";
import RegisterAuction from "../admin/Register-auction/register-auction";
import '@fortawesome/fontawesome-free/css/all.min.css';

function RegisterAuctionPage() {
  return (
    <div>
      <Sidebar />
      <RegisterAuction />
    </div>
  );
}

export default RegisterAuctionPage;
