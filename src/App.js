import React from 'react';
import Home from './pages/Home';
import Detail from './pages/Detail';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuctionPage from './pages/Auction';

function App (){
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/home' element={<Home/>} />
          <Route path='/detail' element={<Detail/>} />
          <Route path='/auction' element={<AuctionPage/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
