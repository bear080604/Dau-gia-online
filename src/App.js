import React from 'react';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Register from './pages/Register';
import Login from './pages/login';
import Auction from './pages/Auction';
import AdminSettings from './pages/AdminSettings';
import Admindashboard from './pages/AdminDashboard';
import AdminReport from './pages/AdminReport';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Remove unused import for AuctionPage here, as it's used in Detail

function App (){
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/home' element={<Home/>} />
          <Route path='/detail/:id' element={<Detail/>} /> {/* Changed to match Link in Home */}
          <Route path='/auction' element={<Auction/>} /> {/* Optional: redirect or use Home; adjust as needed */}
          <Route path = '/register' element = {<Register />} />
          <Route path = '/login' element = {<Login />} />
          <Route path = '/admin/settings' element = {<AdminSettings />} />
          <Route path = '/admin/dashboard' element = {<Admindashboard />} />
          <Route path = '/admin/report' element = {<AdminReport />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
