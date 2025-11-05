import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import AdminNews from "../admin/news/AdminNews";
import '@fortawesome/fontawesome-free/css/all.min.css';

function Adminnews() {
  return (
    <AdminLayout>
      <AdminNews />
    </AdminLayout>
  );
}

export default Adminnews;
