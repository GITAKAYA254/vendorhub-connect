// MCP API Service Layer
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
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

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Auth APIs
  async getUser() {
    return this.request<User>("/api/auth/user");
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
    return this.request<Vendor>("/api/vendors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getVendor(id: string) {
    return this.request<Vendor>(`/api/vendors/${id}`);
  }

  // Product APIs
  async createProduct(data: Partial<Product>) {
    return this.request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProducts(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request<Product[]>(`/api/products?${params}`);
  }

  async getProduct(id: string) {
    return this.request<Product>(`/api/products/${id}`);
  }

  async updateProduct(id: string, data: Partial<Product>) {
    return this.request<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/api/products/${id}`, { method: "DELETE" });
  }

  // Job APIs
  async createJob(data: Partial<Job>) {
    return this.request<Job>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getJobs(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request<Job[]>(`/api/jobs?${params}`);
  }

  async getJob(id: string) {
    return this.request<Job>(`/api/jobs/${id}`);
  }

  async updateJob(id: string, data: Partial<Job>) {
    return this.request<Job>(`/api/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteJob(id: string) {
    return this.request(`/api/jobs/${id}`, { method: "DELETE" });
  }

  // Task APIs
  async createTask(data: Partial<Task>) {
    return this.request<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTasks(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request<Task[]>(`/api/tasks?${params}`);
  }

  async getTask(id: string) {
    return this.request<Task>(`/api/tasks/${id}`);
  }

  async updateTask(id: string, data: Partial<Task>) {
    return this.request<Task>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/api/tasks/${id}`, { method: "DELETE" });
  }

  // Search API
  async search(query: string) {
    return this.request<SearchResults>(
      `/api/search?q=${encodeURIComponent(query)}`
    );
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
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
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
