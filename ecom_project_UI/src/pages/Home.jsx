import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import { FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  // Fetch products based on search query
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = [];
        if (searchQuery.trim()) {
          data = await productService.searchProducts(searchQuery);
        } else {
          data = await productService.getAllProducts();
        }
        setProducts(data);
        
        // Dynamically compute categories from response
        const uniqueCategories = ['All', ...new Set(data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        // Reset selected category to All on search change
        setSelectedCategory('All');
        setFilteredProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Unable to fetch products. Please ensure the backend server is running and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  // Filter products when category or products state changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  return (
    <div className="home-page-container">
      {/* Hero Banner */}
      <section className="hero-section glass-panel">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title glow-text-cyan">
            Drive Your <span className="text-highlight">Passion</span>
          </h1>
          <p className="hero-subtitle">
            Explore our curated inventory of ultra-premium SUVs, luxurious sedans, and high-performance vehicles.
          </p>
        </div>
      </section>

      {/* Category Filter Controls */}
      <section className="filters-section">
        <div className="filters-header">
          <h2 className="section-title">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Catalog'}
          </h2>
          <span className="results-count">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'vehicle' : 'vehicles'} found
          </span>
        </div>
        <div className="category-scroll-container">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-pill ${selectedCategory === cat ? 'active-pill' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product Listings Grid */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger error-alert">
          <FaExclamationTriangle className="alert-icon" />
          <div className="error-message-content">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-secondary retry-btn">
              <FaSyncAlt /> Retry
            </button>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-catalog-container glass-panel">
          <h3>No Vehicles Found</h3>
          <p className="text-secondary">
            {searchQuery 
              ? "We couldn't find any matches for your search. Try checking spelling or search for something else."
              : "No vehicles available in this category at the moment."}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button 
              onClick={() => {
                setSelectedCategory('All');
                window.history.pushState({}, '', '/');
                window.location.reload();
              }} 
              className="btn btn-primary clear-filters-btn"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
