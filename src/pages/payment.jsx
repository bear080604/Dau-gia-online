import React, { useEffect } from "react";
import Payment from "../payment/payment";
import Header from "../header/header";
import Footer from "../footer/footer";
function PaymentPage() {
  useEffect(() => {
    document.title = "Thanh toán - Đấu giá khải bảo";
  }, []);

  return (
    <div>
        <Header />
      <Payment />
      <Footer />
    </div>
  );
}

export default PaymentPage;
