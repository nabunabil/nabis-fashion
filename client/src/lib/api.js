const getApiOrigin = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return window.location.origin;
  }
  return "http://localhost:5000";
};

const API_ORIGIN = getApiOrigin();
const BASE_URL = `${API_ORIGIN.replace(/\/$/, "")}/api`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  // Default headers
  const headers = {
    "Accept": "application/json",
    ...options.headers,
  };

  // If body is not FormData, set Content-Type to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    if (typeof options.body === "object") {
      options.body = JSON.stringify(options.body);
    }
  }

  // Include credentials (cookies) for better-auth session
  const config = {
    ...options,
    headers,
    credentials: "include", // Essential for session cookies
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is empty
    const contentType = response.headers.get("content-type");
    let data = null;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    if (!response.ok) {
      const error = new Error(data?.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${path}:`, error);
    throw error;
  }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
