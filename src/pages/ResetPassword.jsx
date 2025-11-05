import React from "react";
import Header from "../header/header";
import  ResetPassword from "../ResetPassword/ResetPassword";
import Footer from "../footer/footer";
import '@fortawesome/fontawesome-free/css/all.min.css';


function Reset() {
  return (
    <div>
      <Header />
      <ResetPassword />
      <Footer />
    </div>
  );
}

export default Reset;
