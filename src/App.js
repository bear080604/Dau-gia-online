import React from 'react';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Register from './pages/Register';
import Login from './pages/login';
import Auction from './pages/Auction';

import  AuctionSessionPageUser  from './pages/AuctionSession'; 
import  ContactPage  from './pages/contact';
import AdminSettings from './pages/AdminSettings';
import Admindashboard from './pages/AdminDashboard';
import AdminReport from './pages/AdminReport';
import AdminContract from './pages/AdminContract';
import AdminEContract from './pages/AdminEContract';
import AdminHistory from './pages/AdminHistory';
import AdminUsers from './pages/AdminUsers';
import AdminPayment from './pages/AdminPayment';
import AdminNotification from './pages/AdminNotification';
import AdminAuctionAsset from './pages/AdminAuctionAsset';
import AdminProfile from './pages/AdminProfile';
import AuctionSessionPage from './pages/AdminAuction-session';

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
          <Route path = '/auction' element = {<Auction />} /> 
          <Route path = '/auction-session' element = {<AuctionSessionPageUser />} />
          <Route path = '/contact' element = {<ContactPage />} />
          <Route path = '/admin/settings' element = {<AdminSettings />} />
          <Route path = '/admin/dashboard' element = {<Admindashboard />} />
          <Route path = '/admin' element = {<Admindashboard />} />
          <Route path = '/admin/report' element = {<AdminReport />} />
          <Route path = '/admin/contract' element = {<AdminContract />} />
          <Route path = '/admin/econtract' element = {<AdminEContract />} />
          <Route path = '/admin/history' element = {<AdminHistory />} />
          <Route path = '/admin/users' element = {<AdminUsers />} />
          <Route path = '/admin/payment' element = {<AdminPayment />} />
          <Route path = '/admin/notification' element = {<AdminNotification />} />
          <Route path = '/admin/auction-asset' element = {<AdminAuctionAsset />} />
          <Route path = '/admin/profile' element = {<AdminProfile />} />
          <Route path = '/admin/auction-session' element = {<AuctionSessionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
