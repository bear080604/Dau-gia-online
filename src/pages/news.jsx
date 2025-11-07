import React, { useEffect } from "react";
import Header from "../header/header";
import  News from "../news/news";
import Footer from "../footer/footer";
import '@fortawesome/fontawesome-free/css/all.min.css';


function NewsPage() {
  useEffect(() => {
    document.title = "Tin tức - Đấu giá khải bảo";
  }, []);

  return (
    <div>
      <Header />
      <News />
      <Footer />
    </div>
  );
}

export default NewsPage;
