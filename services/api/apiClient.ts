import axios from "axios";

// The application authenticates API requests with its NextAuth session cookie.
// Keep requests on this deployment by default; never copy credentials into localStorage.
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/auth/login"
    ) {
      window.location.assign("/auth/login");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
