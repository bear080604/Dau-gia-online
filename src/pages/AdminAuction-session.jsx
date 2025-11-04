import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import AuctionSession from "../admin/Auction-session/Auction-session";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AuctionSessionPage() {
  return (
    <AdminLayout>
      <AuctionSession />
    </AdminLayout>
  );
}

export default AuctionSessionPage;
