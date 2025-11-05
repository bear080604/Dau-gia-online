import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Settings from "../admin/Settings/Settings";
import '@fortawesome/fontawesome-free/css/all.min.css';


function Index() {
  return (
    <AdminLayout>
      <Settings />
    </AdminLayout>
  );
}

export default Index;
