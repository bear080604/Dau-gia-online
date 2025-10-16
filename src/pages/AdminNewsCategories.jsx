import React from "react";
import Sidebar from "../admin/Header/Header";
import Categories from "../admin/categories/AdminNewsCategories";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AdminNewsCategories() {
  return (
    <div>
      <Sidebar />
      <Categories />
    </div>
  );
}

export default AdminNewsCategories;
