// API service for backend integration
const API_BASE_URL = "http://localhost:8000/api";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(
      errorData.detail || "API request failed",
      response.status
    );
  }
  return response.json();
};

const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Network error - please check if the backend server is running",
      0
    );
  }
};

export const inventoryAPI = {
  // Get all inventory items
  list: async () => {
    return await apiCall("/inventory-items/");
  },

  // Get a specific inventory item
  get: async (itemId) => {
    return await apiCall(`/inventory-items/${itemId}`);
  },

  // Create a new inventory item
  create: async (itemData) => {
    return await apiCall("/inventory-items/", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  },

  // Update an inventory item
  update: async (itemId, itemData) => {
    return await apiCall(`/inventory-items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(itemData),
    });
  },

  // Delete an inventory item
  delete: async (itemId) => {
    return await apiCall(`/inventory-items/${itemId}`, {
      method: "DELETE",
    });
  },

  // Get low stock items
  getLowStock: async () => {
    return await apiCall("/inventory-items/low-stock/");
  },
};

// --- Orders API ---
export const ordersAPI = {
  // GET /api/orders/
  list: async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.skip != null) qs.set("skip", params.skip);
    if (params.limit != null) qs.set("limit", params.limit);
    const query = qs.toString();
    return await apiCall(`/orders/${query ? `?${query}` : ""}`);
  },

  // GET /api/orders/{id}
  get: async (orderId) => {
    return await apiCall(`/orders/${orderId}`);
  },

  // POST /api/orders/
  create: async (payload) => {
    return await apiCall("/orders/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // PUT /api/orders/{id}
  update: async (orderId, payload) => {
    return await apiCall(`/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // DELETE /api/orders/{id}
  delete: async (orderId) => {
    return await apiCall(`/orders/${orderId}`, {
      method: "DELETE",
    });
  },

  // (Optional) GET /api/orders/pending/
  listPending: async () => {
    return await apiCall(`/orders/pending/`);
  },
};

export const recommendationsAPI = {
  // Get all recommendations
  list: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.priority) queryParams.append("priority", params.priority);
    if (params.category) queryParams.append("category", params.category);
    if (params.skip) queryParams.append("skip", params.skip);
    if (params.limit) queryParams.append("limit", params.limit);

    const query = queryParams.toString();
    return await apiCall(`/recommendations/${query ? `?${query}` : ""}`);
  },

  // Get a specific recommendation
  get: async (recommendationId) => {
    return await apiCall(`/recommendations/${recommendationId}`);
  },

  // Create a new recommendation
  create: async (recommendationData) => {
    return await apiCall("/recommendations/", {
      method: "POST",
      body: JSON.stringify(recommendationData),
    });
  },

  // Get high priority recommendations
  getHighPriority: async () => {
    return await apiCall("/recommendations/high-priority/");
  },
};

export const intelligenceSignalsAPI = {
  // Get all intelligence signals
  list: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append("skip", params.skip);
    if (params.limit) queryParams.append("limit", params.limit);

    const query = queryParams.toString();
    return await apiCall(`/intelligence-signals/${query ? `?${query}` : ""}`);
  },

  // Get a specific intelligence signal
  get: async (signalId) => {
    return await apiCall(`/intelligence-signals/${signalId}`);
  },

  // Create a new intelligence signal
  create: async (signalData) => {
    return await apiCall("/intelligence-signals/", {
      method: "POST",
      body: JSON.stringify(signalData),
    });
  },
};

// Health check endpoint
export const healthCheck = async () => {
  try {
    const response = await fetch("http://localhost:8000/");
    return await response.json();
  } catch (error) {
    throw new ApiError("Cannot connect to backend server", 0);
  }
};

export { ApiError };
