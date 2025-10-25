import * as authService from "./authService";
const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "http://localhost:3000";

export const getAllRecord = async () => {
  const response = await fetch(`${API_URL}/api/record`);
  if (!response.ok) {
    throw new Error(`Failed to fetch record`);
  }
  const data = await response.json();
  return data;
};

export const getRecord = async (name) => {
  const token = authService.getToken();
  const response = await fetch(`${API_URL}/api/record/${name}`, {
    method: "GET",
    "Content-Type": "application/json",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data;
};

export const updateRecord = async (name, { record }) => {
  const token = authService.getToken();
  try {
    const res = await fetch(`${API_URL}/api/record/${name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ record }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to update player");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error updating player:", err);
    throw err;
  }
};

export const incrementRegionWin = async ({ name, region }) => {
  const token = authService.getToken();
  try {
    const res = await fetch(`${API_URL}/api/record/${name}/update/${region}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to update player");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error updating record: ", err);
    throw err;
  }
};
