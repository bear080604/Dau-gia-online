import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Categories from "../admin/categories/AdminNewsCategories";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminNewsCategories() {
  return (
    <AdminLayout>
      <Categories />
    </AdminLayout>
  );
}

export default AdminNewsCategories;
