import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Payment from "../admin/Payment/Payment";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminPayment() {
  return (
    <AdminLayout>
      <Payment />
    </AdminLayout>
  );
}

export default AdminPayment;
