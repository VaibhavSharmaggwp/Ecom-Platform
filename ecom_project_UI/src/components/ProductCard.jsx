import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaEye } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import { productService } from '../services/api';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const [imageError, setImageError] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  // Format price to Indian Rupees (INR)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 1500);
  };

  // Determine stock availability
  const isOutOfStock = product.quantity <= 0;

  return (
    <article className="product-card glass-panel">
      {/* Product Image */}
      <div className="product-image-container">
        {!imageError && product.imageName ? (
          <img
            src={productService.getProductImageUrl(product.id)}
            alt={product.name}
            className="product-image"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder">
            <span className="placeholder-brand">{product.brand}</span>
            <span className="placeholder-title">{product.name}</span>
            <span className="placeholder-sub text-muted">No Image Available</span>
          </div>
        )}
        <div className="product-category-tag">
          <span className="badge badge-cyan">{product.category || 'Vehicle'}</span>
        </div>
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span className="badge badge-danger">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <div className="brand-and-date">
          <span className="product-brand">{product.brand}</span>
          {product.releaseDate && (
            <span className="product-release-date">
              {new Date(product.releaseDate).getFullYear() || product.releaseDate}
            </span>
          )}
        </div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.desc}</p>

        <div className="product-price-row">
          <div className="price-label">Price</div>
          <div className="product-price">{formatPrice(product.price)}</div>
        </div>

        {/* Action Buttons */}
        <div className="product-actions">
          <Link to={`/product/${product.id}`} className="btn btn-secondary btn-view-details" title="View Details">
            <FaEye />
            <span>Details</span>
          </Link>
          <button
            onClick={handleAddToCart}
            className={`btn btn-primary btn-add-to-cart ${isOutOfStock ? 'disabled-btn' : ''}`}
            disabled={isOutOfStock}
            title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          >
            <FaShoppingCart />
            <span>{addedMessage ? 'Added!' : 'Buy'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
