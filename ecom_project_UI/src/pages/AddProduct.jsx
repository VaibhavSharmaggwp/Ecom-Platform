import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaCloudUploadAlt, FaCalendarAlt, FaDollarSign, FaInfoCircle } from 'react-icons/fa';
import { productService } from '../services/api';
import './AddProduct.css';

const AddProduct = () => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, JPEG).');
        return;
      }
      // Limit size to 5MB
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

    // Frontend validations
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

    if (!imageFile) {
      setError('Please select a product image to upload.');
      setLoading(false);
      return;
    }

    try {
      // Structure the data to match backend model expectations
      // Format releaseDate to dd-MM-yyyy if needed? Wait! The model uses:
      // @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-mm-yyyy")
      // Wait, let's look at Product.java line 30:
      // @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-mm-yyyy")
      // Note: "dd-mm-yyyy" in Java SimpleDateFormat actually means day-minute-year because lowercase 'm' stands for minutes!
      // But standard Dates might parse it as day-month-year, or the system might parse a string.
      // Let's format the date as 'dd-MM-yyyy' or 'dd-mm-yyyy' to be sure it matches the pattern!
      // In JavaScript, a date input returns 'yyyy-MM-dd'. We must transform it:
      const dateObj = new Date(releaseDate);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      const formattedDate = `${day}-${month}-${year}`; // e.g. 15-01-2024

      const productPayload = {
        id: 0, // Provide 0 explicitly to avoid Jackson deserialization failure on primitive int 'id'
        name,
        brand,
        desc,
        price: parseFloat(price),
        category,
        releaseDate: formattedDate,
        quantity: parseInt(quantity),
      };

      await productService.addProduct(productPayload, imageFile);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Failed to add product:', err);
      // Safely parse the error message. If response.data is an object, extract the message or details.
      const errorMsg = err.response?.data
        ? (typeof err.response.data === 'object' 
            ? (err.response.data.message || err.response.data.error || JSON.stringify(err.response.data)) 
            : err.response.data)
        : err.message || 'Failed to add vehicle. Please verify database connection and form parameters.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page animate-fadeIn">
      <Link to="/" className="back-link">
        <FaArrowLeft /> <span>Back to Inventory</span>
      </Link>

      <div className="form-header">
        <h1 className="form-title">
          <FaPlus className="title-icon" /> Register New Vehicle
        </h1>
        <p className="form-subtitle text-secondary">
          Add a high-end luxury or utility vehicle to the e-commerce inventory.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && (
        <div className="alert alert-success">
          Vehicle registered successfully! Redirecting to inventory...
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
              <span>Image will be uploaded directly to the database binary storage (LOB).</span>
            </div>
          </div>

          {/* Right Column: Inputs */}
          <div className="form-inputs-column">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Model Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Creta, City, Model S"
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
                  placeholder="e.g. Hyundai, Honda, Tesla"
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
                placeholder="Describe features, comfort, engine performance, specifications, warranty, etc."
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
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Register Vehicle'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
