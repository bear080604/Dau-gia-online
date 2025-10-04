import React from "react";
import Sidebar from "../admin/Header/Header";
import Payment from "../admin/Payment/Payment";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminPayment() {
  return (
    <div>
      <Sidebar />
      <Payment />
    </div>
  );
}

export default AdminPayment;
