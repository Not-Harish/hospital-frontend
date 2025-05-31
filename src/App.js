import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import DepartmentPage from './components/DepartmentPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/department" element={<DepartmentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
