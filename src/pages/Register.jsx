import React, { useEffect } from "react";
import Header from "../header/header";
import  RegisterForm from "../register/register";
import Footer from "../footer/footer";
import '@fortawesome/fontawesome-free/css/all.min.css';


function Register() {
  useEffect(() => {
    document.title = "Đăng ký - Đấu giá khải bảo";
  }, []);

  return (
    <div>
      <Header />
      <RegisterForm />
      <Footer />
    </div>
  );
}

export default Register ;
