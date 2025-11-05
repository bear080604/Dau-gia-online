import React from "react";
import AdminLayout from "../admin/Header/AdminLayout";
import Assetcategories from "../admin/Assets-categories/AdminAssetCategories";
import '@fortawesome/fontawesome-free/css/all.min.css';

function AssetCategoriesPage() {
  return (
    <AdminLayout>
      <Assetcategories />
    </AdminLayout>
  );
}

export default AssetCategoriesPage;
