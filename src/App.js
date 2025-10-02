import React from 'react';
import Home from './pages/Home';
import Detail from './pages/Detail';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App (){
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/home' element={<Home/>} />
          <Route path='/detail' element={<Detail/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
