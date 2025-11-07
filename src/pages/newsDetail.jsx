import React, { useEffect } from "react";
import Header from "../header/header";
import  News from "../news-detail/news-detail";
import Footer from "../footer/footer";
import '@fortawesome/fontawesome-free/css/all.min.css';


function NewsDetail() {
  useEffect(() => {
    document.title = "Chi tiết tin tức - Đấu giá khải bảo";
  }, []);

  return (
    <div>
      <Header />
      <News />
      <Footer />
    </div>
  );
}

export default NewsDetail;
