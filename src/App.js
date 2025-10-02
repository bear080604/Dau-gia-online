import React from 'react';
import Home from './pages/Home';
import Detail from './pages/Detail';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Remove unused import for AuctionPage here, as it's used in Detail

function App (){
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/home' element={<Home/>} />
          <Route path='/auction-items/:id' element={<Detail/>} /> {/* Changed to match Link in Home */}
          <Route path='/auction' element={<Home/>} /> {/* Optional: redirect or use Home; adjust as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;