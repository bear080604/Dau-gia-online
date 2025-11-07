import React, { useEffect } from "react";
import Header from "../header/header";
import AuctionPage from "../auction/auction";
import Footer from "../footer/footer";

const Auction = () => {
  useEffect(() => {
    document.title = "Đấu giá - Đấu giá khải bảo";
  }, []);

  return (
    <div>
      <Header />
      <AuctionPage />
      <Footer />
    </div>
  );
};
export default  Auction ;