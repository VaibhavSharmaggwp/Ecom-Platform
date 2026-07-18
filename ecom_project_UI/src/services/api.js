import axios from 'axios';

// Get API base URL from Vite environment variables or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const productService = {
  // Fetch all products
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // Fetch single product by id
  getProductById: async (id) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },

  // Add a product with multipart file upload
  addProduct: async (productData, imageFile) => {
    const formData = new FormData();
    // Blob containing product metadata as JSON
    formData.append(
      'product',
      new Blob([JSON.stringify(productData)], { type: 'application/json' })
    );
    formData.append('imageFile', imageFile);

    const response = await api.post('/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update a product
  updateProduct: async (id, productData, imageFile) => {
    const formData = new FormData();
    formData.append(
      'product',
      new Blob([JSON.stringify(productData)], { type: 'application/json' })
    );
    if (imageFile) {
      formData.append('imageFile', imageFile);
    } else {
      // If no new image was selected, we need to pass a dummy or keep the old one.
      // Wait, the backend @RequestPart MultipartFile imageFile is required in updateProduct!
      // Let's check ProductController: @RequestPart MultipartFile imageFile is indeed not marked required=false.
      // Let's create an empty file or fetch the existing one if no new image is provided,
      // or send the original image data. Usually, the simplest is to send the same file or require it.
      // To prevent errors, we will create a small placeholder blob or require users to provide/re-upload an image,
      // or we can pass a dummy blob with the original name.
      // Let's pass a small empty blob to avoid HTTP 400 Bad Request error if not provided.
      // Wait, if no new image is selected, how do we send it? We can send a small blob:
      const dummyFile = new File([""], "placeholder.png", { type: "image/png" });
      formData.append('imageFile', dummyFile);
    }

    const response = await api.put(`/product/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },

  // Search products by keyword
  searchProducts: async (keyword) => {
    const response = await api.get(`/products/search`, {
      params: { keyword },
    });
    return response.data;
  },

  // Generate the URL to fetch the product image directly
  getProductImageUrl: (id) => {
    return `${API_BASE_URL}/product/${id}/image`;
  },
};

export default api;
