import React, { useContext, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaCar, FaShoppingCart, FaPlus, FaSearch } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { getCartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchVal, setSearchVal] = useState(initialSearch);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleClearSearch = () => {
    setSearchVal('');
    navigate('/');
  };

  return (
    <header className="navbar-header glass-panel">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={handleClearSearch}>
          <FaCar className="logo-icon" />
          <span className="logo-text">
            Auto<span className="text-highlight">Vibe</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="navbar-search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search vehicles, brands, or categories..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <FaSearch />
            </button>
          </div>
        </form>

        {/* Navigation Links */}
        <nav className="navbar-links">
          <Link to="/" className="nav-link" onClick={handleClearSearch}>
            Inventory
          </Link>
          <Link to="/add-product" className="nav-link btn-add-vehicle">
            <FaPlus className="nav-icon" />
            <span>Add Vehicle</span>
          </Link>
          <Link to="/cart" className="nav-link cart-link" aria-label="Shopping Cart">
            <div className="cart-icon-wrapper">
              <FaShoppingCart className="cart-icon" />
              {getCartCount() > 0 && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
