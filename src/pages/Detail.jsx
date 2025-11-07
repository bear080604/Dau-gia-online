import React, { useEffect } from "react";
import Header from "../header/header"; // Adjust path if needed
import AuctionPage from "../detail/detail"; // Fixed typo: detai -> detail (assuming file is detail.js)
import Footer from "../footer/footer";

const Detail = () => {
  useEffect(() => {
    document.title = "Chi tiết đấu giá - Đấu giá khải bảo";
  }, []);

  return (
    <div>
      <Header />
      <AuctionPage />
      <Footer />
    </div>
  );
};

export default Detail;