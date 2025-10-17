const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "http://localhost:3000";

export const signup = async (username, password, pokemonsUsed) => {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ username, password, pokemonsUsed }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Signup failed");
  }
  return data;
};

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (res.ok && data.token) {
    localStorage.setItem("token", data.token);
  }

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
};

export const logout = () => localStorage.removeItem("item");

export const getToken = () => {
  return localStorage.getItem("token");
};
