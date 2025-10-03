import React from "react";
import Sidebar from "../admin/Header/Header";
import Home from "../home/home";
import '@fortawesome/fontawesome-free/css/all.min.css';


function Index() {
  return (
    <div>
      <Sidebar />
      <Home />
    </div>
  );
}

export default Index;
