import React from "react";
import Sidebar from "../admin/Header/Header";
import AuctionAsset from "../admin/Auction-asset/Auction-asset";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminAuctionAsset() {
  return (
    <div>
      <Sidebar />
      <AuctionAsset />
    </div>
  );
}

export default AdminAuctionAsset;
