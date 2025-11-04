import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import AuctionAsset from "../admin/Auction-asset/Auction-asset";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminAuctionAsset() {
  return (
    <AdminLayout>
      <AuctionAsset />
    </AdminLayout>
  );
}

export default AdminAuctionAsset;
