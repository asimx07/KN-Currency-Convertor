import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Converter from './pages/Converter';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Routes>
          <Route path="/" element={<Converter />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
