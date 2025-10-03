import React from "react";
import Sidebar from "../admin/Header/Header";
import Dashboard from "../admin/Dashboard/Dashboard";
import '@fortawesome/fontawesome-free/css/all.min.css';

function Index() {
  return (
    <div>
      <Sidebar />
      <Dashboard />
    </div>
  );
}

export default Index;
