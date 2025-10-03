import React from "react";
import Sidebar from "../admin/Header/Header";
import Report from "../admin/Report/Report";
import '@fortawesome/fontawesome-free/css/all.min.css';

function Index() {
  return (
    <div>
      <Sidebar />
      <Report />
    </div>
  );
}

export default Index;
