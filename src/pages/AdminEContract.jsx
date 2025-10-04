import React from "react";
import Sidebar from "../admin/Header/Header";
import EContract from "../admin/EContract/EContract";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminEContract() {
  return (
    <div>
      <Sidebar />
      <EContract />
    </div>
  );
}

export default AdminEContract;
