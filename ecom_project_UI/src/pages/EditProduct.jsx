import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaCloudUploadAlt, FaCalendarAlt, FaDollarSign, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { productService } from '../services/api';
import './AddProduct.css'; // Share AddProduct.css styles for visual consistency

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [quantity, setQuantity] = useState('');
  
  // Image states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Status states
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Parse dd-MM-yyyy to yyyy-MM-dd for HTML5 input type="date"
  const parseDateForInput = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // Check if year is first (yyyy-MM-dd) or last (dd-MM-yyyy)
        if (parts[2].length === 4) {
          // dd-MM-yyyy -> yyyy-MM-dd
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else if (parts[0].length === 4) {
          // yyyy-MM-dd (already correct)
          return dateStr;
        }
      }
    }
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Failed to parse date:', dateStr, e);
    }
    return '';
  };

  useEffect(() => {
    const loadProductData = async () => {
      setFetching(true);
      setError(null);
      try {
        const data = await productService.getProductById(id);
        if (data) {
          setName(data.name || '');
          setBrand(data.brand || '');
          setDesc(data.desc || '');
          setPrice(data.price || '');
          setCategory(data.category || '');
          setReleaseDate(parseDateForInput(data.releaseDate));
          setQuantity(data.quantity || '');

          // If the product has an image in the database, fetch the image as a Blob
          // and convert it into a File object. This ensures that if the user clicks 
          // save without changing the image, the original image is preserved rather 
          // than being wiped out by the backend file upload.
          if (data.imageName) {
            try {
              const imageUrl = productService.getProductImageUrl(id);
              // Fetch image as blob using axios
              const imageResponse = await axios.get(imageUrl, { responseType: 'blob' });
              
              const file = new File(
                [imageResponse.data], 
                data.imageName, 
                { type: data.imageType || 'image/png' }
              );
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            } catch (imgErr) {
              console.error('Failed to pre-fetch existing image blob:', imgErr);
              // If we fail to fetch, we can let user upload a new one
            }
          }
        } else {
          setError('Vehicle not found.');
        }
      } catch (err) {
        console.error('Failed to load vehicle details for editing:', err);
        setError('Error loading vehicle details. Please check the backend connection.');
      } finally {
        setFetching(false);
      }
    };

    loadProductData();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!name || !brand || !price || !category || !releaseDate || !quantity) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (parseFloat(price) <= 0) {
      setError('Price must be a positive number.');
      setLoading(false);
      return;
    }

    if (parseInt(quantity) < 0) {
      setError('Quantity cannot be negative.');
      setLoading(false);
      return;
    }

    try {
      // Format HTML5 date (yyyy-MM-dd) back to backend pattern (dd-MM-yyyy)
      const dateObj = new Date(releaseDate);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      const productPayload = {
        id: parseInt(id),
        name,
        brand,
        desc,
        price: parseFloat(price),
        category,
        releaseDate: formattedDate,
        quantity: parseInt(quantity),
      };

      await productService.updateProduct(id, productPayload, imageFile);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/product/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to update product:', err);
      const errorMsg = err.response?.data
        ? (typeof err.response.data === 'object' 
            ? (err.response.data.message || err.response.data.error || JSON.stringify(err.response.data)) 
            : err.response.data)
        : err.message || 'Failed to update vehicle. Ensure all inputs are correct and backend is responsive.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="add-product-page animate-fadeIn">
      <Link to={`/product/${id}`} className="back-link">
        <FaArrowLeft /> <span>Back to Details</span>
      </Link>

      <div className="form-header">
        <h1 className="form-title">
          <FaEdit className="title-icon" /> Edit Vehicle Details
        </h1>
        <p className="form-subtitle text-secondary">
          Modify specifications, pricing, stock, or upload a new design image for <strong>{name}</strong>.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && (
        <div className="alert alert-success">
          Vehicle details updated successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form glass-panel">
        <div className="form-grid">
          {/* Left Column: Image Upload Area */}
          <div className="form-image-column">
            <span className="form-label">Vehicle Imagery</span>
            <div className="upload-container">
              {imagePreview ? (
                <div className="image-preview-wrapper">
                  <img src={imagePreview} alt="Vehicle Preview" className="uploaded-preview-img" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="btn btn-danger remove-preview-btn"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label className="upload-dropzone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden-file-input"
                  />
                  <FaCloudUploadAlt className="upload-icon" />
                  <span className="upload-title">Choose image file</span>
                  <span className="upload-hint text-muted">Supports PNG, JPG, JPEG (Max 5MB)</span>
                </label>
              )}
            </div>
            <div className="image-field-info text-muted">
              <FaInfoCircle />
              <span>Updating the image will override the binary data stored in the database.</span>
            </div>
          </div>

          {/* Right Column: Inputs */}
          <div className="form-inputs-column">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Model Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Creta, City"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brand / Manufacturer *</label>
                <input
                  type="text"
                  placeholder="e.g. Hyundai, Honda"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea
                placeholder="Describe features, comfort, engine performance, specifications, etc."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Price (INR) *</label>
                <div className="input-with-icon-wrapper">
                  <FaDollarSign className="input-inner-icon text-muted" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-control input-padded-left"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  placeholder="e.g. Car, Bike, Accessory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Release Date *</label>
                <div className="input-with-icon-wrapper">
                  <FaCalendarAlt className="input-inner-icon text-muted" />
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="form-control input-padded-left"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(`/product/${id}`)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
