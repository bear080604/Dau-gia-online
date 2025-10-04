import React from "react";
import Sidebar from "../admin/Header/Header";
import AuctionSession from "../admin/Auction-session/Auction-session";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AuctionSessionPage() {
  return (
    <div>
      <Sidebar />
      <AuctionSession />
    </div>
  );
}

export default AuctionSessionPage;
