import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaTrash, FaEdit, FaShoppingCart, FaArrowLeft, FaCalendarAlt, FaWarehouse, FaTag } from 'react-icons/fa';
import { productService } from '../services/api';
import { CartContext } from '../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getProductById(id);
        if (data) {
          setProduct(data);
        } else {
          setError('Vehicle not found.');
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError('Failed to fetch details. The product may not exist or the backend is offline.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.deleteProduct(product.id);
      navigate('/', { state: { alertMessage: 'Vehicle successfully removed from inventory.', alertType: 'success' } });
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Error deleting vehicle. Please try again.');
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="detail-error-container glass-panel">
        <h2>Oops! Something went wrong</h2>
        <p className="text-secondary">{error || 'Unable to retrieve vehicle information.'}</p>
        <Link to="/" className="btn btn-primary">
          <FaArrowLeft /> Back to Inventory
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.quantity <= 0;

  return (
    <div className="product-detail-page animate-fadeIn">
      {/* Back Link */}
      <Link to="/" className="back-link">
        <FaArrowLeft /> <span>Back to Inventory</span>
      </Link>

      <div className="detail-grid">
        {/* Left Column: Image */}
        <div className="detail-image-section glass-panel">
          {!imageError && product.imageName ? (
            <img
              src={productService.getProductImageUrl(product.id)}
              alt={product.name}
              className="detail-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="detail-image-placeholder">
              <span className="placeholder-brand-large">{product.brand}</span>
              <span className="placeholder-title-large">{product.name}</span>
              <span className="placeholder-sub-large text-muted">Image Unavailable</span>
            </div>
          )}
        </div>

        {/* Right Column: Information */}
        <div className="detail-info-section glass-panel">
          <div className="detail-meta">
            <span className="detail-brand">{product.brand}</span>
            <span className="badge badge-purple">
              <FaTag className="meta-icon" /> {product.category || 'Vehicle'}
            </span>
          </div>

          <h1 className="detail-title">{product.name}</h1>

          {/* Pricing & Stock Banner */}
          <div className="price-stock-banner">
            <div className="detail-price-box">
              <span className="price-label-large">Showroom Price</span>
              <span className="price-val-large">{formatPrice(product.price)}</span>
            </div>

            <div className="detail-stock-box">
              <span className="stock-label">Stock Status</span>
              {isOutOfStock ? (
                <span className="badge badge-danger">Out of Stock</span>
              ) : product.quantity <= 3 ? (
                <span className="badge badge-danger">Only {product.quantity} Left!</span>
              ) : (
                <span className="badge badge-success">Available ({product.quantity} units)</span>
              )}
            </div>
          </div>

          {/* Features / Details Table */}
          <div className="specifications-panel">
            <h3 className="panel-subtitle">Vehicle Overview</h3>
            <div className="specs-list">
              {product.releaseDate && (
                <div className="spec-item">
                  <div className="spec-icon-wrapper text-secondary">
                    <FaCalendarAlt />
                  </div>
                  <div className="spec-text">
                    <span className="spec-label">Release Year</span>
                    <span className="spec-value">
                      {new Date(product.releaseDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )}

              <div className="spec-item">
                <div className="spec-icon-wrapper text-secondary">
                  <FaWarehouse />
                </div>
                <div className="spec-text">
                  <span className="spec-label">Warehouse Stock</span>
                  <span className="spec-value">{product.quantity} units in stock</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="detail-description">
            <h3 className="panel-subtitle">Description</h3>
            <p>{product.desc || 'No description provided for this vehicle.'}</p>
          </div>

          {/* Cart Actions */}
          {!isOutOfStock && (
            <div className="cart-selector-row">
              <div className="qty-picker">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="qty-btn"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                  className="qty-btn"
                  disabled={quantity >= product.quantity}
                >
                  +
                </button>
              </div>

              <button onClick={handleAddToCart} className="btn btn-primary detail-buy-btn">
                <FaShoppingCart />
                <span>{addedMessage ? 'Added to Cart!' : 'Add to Cart'}</span>
              </button>
            </div>
          )}

          {/* Admin Management Actions */}
          <div className="admin-actions-row">
            <Link to={`/edit-product/${product.id}`} className="btn btn-secondary action-btn-edit">
              <FaEdit />
              <span>Edit Details</span>
            </Link>

            <button onClick={() => setShowConfirmDelete(true)} className="btn btn-danger action-btn-delete">
              <FaTrash />
              <span>Remove Vehicle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="modal-backdrop">
          <div className="delete-modal glass-panel animate-scaleIn">
            <h3>Confirm Deletion</h3>
            <p className="text-secondary">
              Are you sure you want to remove <strong>{product.name}</strong> from the inventory? This action is permanent and cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger" disabled={deleting}>
                {deleting ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
