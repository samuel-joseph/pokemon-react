import { getToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "http://localhost:3000";

export const addBuddyPokemon = async (pokemon, username) => {
  const token = getToken();
  if (!token || !username) throw new Error("User not logged in");
  try {
    const res = await fetch(`${API_URL}/api/buddy/${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pokemon),
    });

    if (!res.ok) throw new Error("Failed to add buddy Pokémon");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to add buddy Pokémon:", err);
    throw err;
  }
};

export const getBuddyPokemon = async (username) => {
  try {
    // check if user already has a buddy pokemon
    const res = await fetch(`${API_URL}/api/buddy/${username}`);
    if (!res.ok) throw new Error("Failed to fetch buddy");

    const data = await res.json();
    console.log(data);
    // return the buddy Pokémon list or an empty array if none
    return data.pokemon || [];
  } catch (err) {
    console.error("Error fetching buddy Pokémon:", err);
    return [];
  }
};
