import React, { useEffect } from "react";
import Header from "../header/header";
import Home from "../home/home";
import Footer from "../footer/footer";
import '@fortawesome/fontawesome-free/css/all.min.css';


function Index() {
  useEffect(() => {
    document.title = "Trang chủ - Đấu giá khải bảo";
  }, []);

  return (
    <div>
      <Header />
      <Home />
      <Footer />
    </div>
  );
}

export default Index;
