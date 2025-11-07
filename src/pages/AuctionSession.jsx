import React, { useEffect } from "react";
import AuctionSession from "../auction-session/auction-session";
import  Footer from "../footer/footer";
import Header from "../header/header";

function AuctionSessionPageUser() {
  useEffect(() => {
    document.title = "Đấu giá trực tuyến - Đấu giá khải bảo";
  }, []);

  return (
    <div>
        <Header />
      <AuctionSession />
      <Footer />
    </div>
  );
}

export default AuctionSessionPageUser;
