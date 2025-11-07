import React, { useEffect } from "react";
import About from "../about/about";
import Header from "../header/header";
import Footer from "../footer/footer";
function AboutPage() {
  useEffect(() => {
    document.title = "Giới thiệu - Đấu giá khải bảo";
  }, []);

  return (
    <div>
        <Header />
      <About />
      <Footer />
    </div>
  );
}

export default AboutPage;
