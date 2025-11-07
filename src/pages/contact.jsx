import React, { useEffect } from "react";
import Contact from "../contact/contact";
import Header from "../header/header";
import Footer from "../footer/footer";
function ContactPage() {
  useEffect(() => {
    document.title = "Liên hệ bán tài sản - Đấu giá khải bảo";
  }, []);

  return (
    <div>
        <Header />
      <Contact />
      <Footer />
    </div>
  );
}

export default ContactPage;
