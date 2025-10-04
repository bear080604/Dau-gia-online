import React from "react";
import Sidebar from "../admin/Header/Header";
import Contract from "../admin/Contract/Contract";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminContract() {
  return (
    <div>
      <Sidebar />
      <Contract />
    </div>
  );
}

export default AdminContract;
