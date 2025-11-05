import React from "react";
import Header from "../header/header";
import  ForgotPassword from "../ForgotPassword/ForgotPassword";
import Footer from "../footer/footer";
import '@fortawesome/fontawesome-free/css/all.min.css';


function Forgot() {
  return (
    <div>
      <Header />
      <ForgotPassword />
      <Footer />
    </div>
  );
}

export default Forgot;
