import React from "react";
import Header from "../header/header";
import ConfirmReset from "../ConfirmReset/ConfirmReset";
import Footer from "../footer/footer";
import '@fortawesome/fontawesome-free/css/all.min.css';


function Confirm() {
  return (
    <div>
      <Header />
      <ConfirmReset />
      <Footer />
    </div>
  );
}

export default Confirm;
