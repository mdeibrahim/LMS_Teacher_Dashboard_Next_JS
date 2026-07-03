import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const requestUrl = config.url || "";
    const isAuthRoute =
      requestUrl.includes("/auth/login/") ||
      requestUrl.includes("/auth/register/");

    if (isAuthRoute) {
      return config;
    }

    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("teacher_access_token") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
