export const API_URL = "http://localhost:8080";

export const fileUrl = (path) => (path ? `${API_URL}${path}` : null);