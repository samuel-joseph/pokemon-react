const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "http://localhost:3000";

export const signup = async (username, password, pokemon) => {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ username, password, pokemon }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Signup failed");
  }

  // ✅ Auto login after signup
  try {
    const loginRes = await login(username, password);
    return loginRes; // return same format as login
  } catch (err) {
    console.error("Auto login failed:", err);
    return data;
  }
};

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();

  if (res.ok && data.token) {
    setToken(data.token);
  } else {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const logout = () => localStorage.clear();

export const getToken = () => localStorage.getItem("token");

export const setToken = (token) => {
  localStorage.setItem("token", token);
};
