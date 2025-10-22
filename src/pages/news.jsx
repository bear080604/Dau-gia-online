import React from "react";
import Header from "../header/header";
import  News from "../news/news";
import Footer from "../footer/footer";
import '@fortawesome/fontawesome-free/css/all.min.css';


function news() {
  return (
    <div>
      <Header />
      <News />
      <Footer />
    </div>
  );
}

export default news;
