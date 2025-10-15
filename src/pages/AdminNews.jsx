import React from "react";
import Sidebar from "../admin/Header/Header";
import AdminNews from "../admin/news/AdminNews";
import '@fortawesome/fontawesome-free/css/all.min.css';

function Adminnews() {
  return (
    <div>
      <Sidebar />
      <AdminNews />
    </div>
  );
}

export default Adminnews;
