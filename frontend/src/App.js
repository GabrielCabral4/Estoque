import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import StockMovements from './pages/StockMovements';
import LowStockProducts from './pages/LowStockProducts'; // Adicione esta linha
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/movements" element={<StockMovements />} />
        <Route path="/low_stocks" element={<LowStockProducts />} />
      </Routes>
    </Router>
  );
}

export default App;