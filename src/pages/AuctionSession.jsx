import React from "react";
import AuctionSession from "../auction-session/auction-session";
import  Footer from "../footer/footer";
import Header from "../header/header";

function AuctionSessionPageUser() {
  return (
    <div>
        <Header />
      <AuctionSession />
      <Footer />
    </div>
  );
}

export default AuctionSessionPageUser;
