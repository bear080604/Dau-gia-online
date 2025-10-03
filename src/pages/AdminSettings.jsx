import React from "react";
import Sidebar from "../admin/Header/Header";
import Settings from "../admin/Settings/Settings";
import '@fortawesome/fontawesome-free/css/all.min.css';


function Index() {
  return (
    <div>
      <Sidebar />
      <Settings />
    </div>
  );
}

export default Index;
