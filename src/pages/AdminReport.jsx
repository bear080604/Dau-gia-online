import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Report from "../admin/Report/Report";
import '@fortawesome/fontawesome-free/css/all.min.css';

function Index() {
  return (
    <AdminLayout>
      <Report />
    </AdminLayout>
  );
}

export default Index;
