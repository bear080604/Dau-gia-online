import React, { useEffect } from "react";
import Contract from "../contract/contract";
import Header from "../header/header";
import Footer from "../footer/footer";
function ContractPage() {
  useEffect(() => {
    document.title = "Hợp đồng - Đấu giá khải bảo";
  }, []);

  return (
    <div>
        <Header />
      <Contract />
      <Footer />
    </div>
  );
}

export default ContractPage;
