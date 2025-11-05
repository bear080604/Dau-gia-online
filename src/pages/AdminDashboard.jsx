import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Dashboard from "../admin/Dashboard/Dashboard";
import '@fortawesome/fontawesome-free/css/all.min.css';

function Index() {
  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
}

export default Index;
