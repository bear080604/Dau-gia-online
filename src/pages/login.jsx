import React, { useEffect } from "react";
import Header from "../header/header";
import  LoginForm from "../login/login";
import Footer from "../footer/footer";
import '@fortawesome/fontawesome-free/css/all.min.css';


function Login() {
  useEffect(() => {
    document.title = "Đăng nhập - Đấu giá khải bảo";
  }, []);

  return (
    <div>
      <Header />
      <LoginForm />
      <Footer />
    </div>
  );
}

export default Login  ;
