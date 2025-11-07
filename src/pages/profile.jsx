import React, { useEffect } from "react";
import Profile from "../infouser/profile";
import Header from "../header/header";
import Footer from "../footer/footer";
function ProfilePage() {
  useEffect(() => {
    document.title = "Thông tin cá nhân - Đấu giá khải bảo";
  }, []);

  return (
    <div>
        <Header />
      <Profile />
      <Footer />
    </div>
  );
}

export default ProfilePage;
