import React, { useEffect } from "react";
import Header from "../header/header";
import Guide from "../guide/guide";
import Footer from "../footer/footer";

function GuidePage() {
  useEffect(() => {
    document.title = "Hướng dẫn sử dụng - Đấu giá khải bảo";
  }, []);

  return (
    <div>
      <Header />
      <Guide />
      <Footer />
    </div>
  );
}

export default GuidePage;
