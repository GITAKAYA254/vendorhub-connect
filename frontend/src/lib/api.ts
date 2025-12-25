// MCP API Service Layer
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  getImageUrl(url: string | undefined | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      // If a token is stored in localStorage (login via header flow), attach it
      const storedToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const authHeader = storedToken
        ? { Authorization: `Bearer ${storedToken}` }
        : {};

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
          ...options?.headers,
        },
        // keep cookie flow working for existing cookie-based auth
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.message || "Request failed" };
      }

      const body = await response.json();
      // Unwrap standard API response
      if (
        body &&
        typeof body === "object" &&
        "success" in body &&
        "data" in body
      ) {
        return { data: body.data };
      }
      return { data: body };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Auth APIs
  async getUser() {
    return this.request<{ user: User }>("/api/auth/user");
  }

  async register(
    email: string,
    password: string,
    name: string,
    isVendor: boolean = false
  ) {
    return this.request<{ user: User; token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, isVendor }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request("/api/auth/logout", { method: "POST" });
  }

  // Vendor APIs
  async createVendor(data: Partial<Vendor>) {
    return this.request<{ vendor: Vendor }>("/api/vendors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getVendor(id: string) {
    return this.request<{ vendor: Vendor }>(`/api/vendors/${id}`);
  }

  // Product APIs
  async createProduct(data: FormData) {
    // Note: FormData requires no Content-Type header (browser sets multipart/boundary)
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const authHeader = storedToken
      ? { Authorization: `Bearer ${storedToken}` }
      : {};

    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        body: data,
        headers: {
          ...authHeader,
        },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        return { error: error.message || "Upload failed" };
      }
      const body = await response.json();
      return { data: body.data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async getProducts(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request<{ products: Product[]; pagination: Pagination }>(
      `/api/products?${params}`
    );
  }

  async getMyProducts(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request<{ products: Product[]; pagination: Pagination }>(
      `/api/products/me?${params}`
    );
  }

  async getProduct(id: string) {
    return this.request<{ product: Product }>(`/api/products/${id}`);
  }

  async getRelatedProducts(id: string) {
    return this.request<{ products: Product[] }>(`/api/products/${id}/related`);
  }

  async updateProduct(id: string, data: Partial<Product> | FormData) {
    const isFormData = data instanceof FormData;
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const authHeader = storedToken
      ? { Authorization: `Bearer ${storedToken}` }
      : {};

    const options: RequestInit = {
      method: "PUT",
      headers: {
        ...authHeader,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      body: isFormData ? (data as FormData) : JSON.stringify(data),
      credentials: "include", // Ensure cookies are sent
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, options);

      if (!response.ok) {
        const error = await response.json();
        return { error: error.message || "Update failed" };
      }
      const body = await response.json();
      return { data: body.data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async deleteProduct(id: string) {
    return this.request(`/api/products/${id}`, { method: "DELETE" });
  }

  // Job APIs
  async createJob(data: Partial<Job>) {
    return this.request<{ job: Job }>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getJobs(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request<{ jobs: Job[]; pagination: Pagination }>(
      `/api/jobs?${params}`
    );
  }

  async getJob(id: string) {
    return this.request<{ job: Job }>(`/api/jobs/${id}`);
  }

  async updateJob(id: string, data: Partial<Job>) {
    return this.request<{ job: Job }>(`/api/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteJob(id: string) {
    return this.request(`/api/jobs/${id}`, { method: "DELETE" });
  }

  // Task APIs
  async createTask(data: Partial<Task>) {
    return this.request<{ task: Task }>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTasks(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request<{ tasks: Task[]; pagination: Pagination }>(
      `/api/tasks?${params}`
    );
  }

  async getTask(id: string) {
    return this.request<{ task: Task }>(`/api/tasks/${id}`);
  }

  async updateTask(id: string, data: Partial<Task>) {
    return this.request<{ task: Task }>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/api/tasks/${id}`, { method: "DELETE" });
  }

  // Payment APIs
  async initiatePayment(data: {
    amount: number;
    phoneNumber: string;
    orderId: string;
    provider?: string;
  }) {
    return this.request<{ payment: any; providerResponse: any }>(
      "/api/payments/initiate",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getPaymentStatus(id: string) {
    return this.request<{ payment: any }>(`/api/payments/${id}`);
  }

  // Review APIs
  async getProductReviews(productId: string) {
    return this.request<{ reviews: any[]; averageRating: number; total: number }>(
      `/api/reviews/product/${productId}`
    );
  }

  async addProductReview(productId: string, data: { rating: number; comment: string }) {
    return this.request<{ review: any }>(`/api/reviews/product/${productId}`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  async getVendorReviews(vendorId: string) {
    return this.request<{ reviews: any[]; averageRating: number; total: number }>(
      `/api/reviews/vendor/${vendorId}`
    );
  }

  async addVendorReview(vendorId: string, data: { rating: number; comment: string }) {
    return this.request<{ review: any }>(`/api/reviews/vendor/${vendorId}`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  // Search API
  async search(query: string) {
    return this.request<SearchResults>(
      `/api/search?q=${encodeURIComponent(query)}`
    );
  }

  // Vendor Payment Methods
  async getMyPaymentMethods() {
    return this.request<{ methods: VendorPaymentMethod[] }>("/api/vendor-payment-methods");
  }

  async getVendorPaymentMethods(vendorId: string) {
    return this.request<{ methods: Partial<VendorPaymentMethod>[] }>(`/api/vendor-payment-methods/vendor/${vendorId}`);
  }

  async updatePaymentMethod(data: { type: string; config: any; isActive?: boolean }) {
    return this.request<{ method: VendorPaymentMethod }>("/api/vendor-payment-methods", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async removePaymentMethod(type: string) {
    return this.request<{ message: string }>(`/api/vendor-payment-methods/${type}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiService();

// Type definitions
export interface User {
  id: string;
  email: string;
  name: string;
  isVendor: boolean;
  vendorId?: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  userId: string;
  name: string;
  description: string;
  logo?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  vendorId: string;
  name?: string; // Frontend display helper
  title?: string; // Backend field
  description: string;
  price: number;
  category: string;
  image?: string; // Primary image
  images?: string[]; // All images
  stock: number;
  createdAt: string;
}

export interface Job {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: "open" | "in_progress" | "completed";
  createdAt: string;
}

export interface Task {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  dueDate?: string;
  createdAt: string;
}

export interface SearchResults {
  products: Product[];
  jobs: Job[];
  tasks: Task[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages?: number;
}

export interface VendorPaymentMethod {
  id: string;
  vendorId: string;
  type: 'MPESA' | 'CARD' | 'CASH';
  config: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
