const API_URL = import.meta.env.VITE_API_URL;
// const API_URL = "http://localhost:3000";

export async function fetchRegionPokemons(region) {
  const response = await fetch(`${API_URL}/api/region/${region}`);
  if (!response.ok) {
    throw new Error("Failed to fetch Pokémons for the specified region");
  }
  const data = await response.json();
  return data.pokemons;
}

export async function fetchPokemons() {
  const response = await fetch(`${API_URL}/api/pokemon`);
  if (!response.ok) {
    throw new Error("Failed to fetch Pokémons");
  }
  const data = await response.json();
  return data.pokemons;
}

// Fetch all NPCs
export async function fetchAllNpc() {
  const response = await fetch(`${API_URL}/api/npc`);
  if (!response.ok) {
    throw new Error("Failed to fetch NPCs");
  }
  const data = await response.json();
  return data; // returns an array of regions with gymLeaders and Pokémon
}

// Fetch a single NPC by ID or name
export async function fetchNpc(id) {
  const response = await fetch(`${API_URL}/api/npc/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NPC with id ${id}`);
  }
  const data = await response.json();
  return data; // returns a single NPC object
}

export async function getRecord() {
  const response = await fetch(`${API_URL}/api/leaderboard`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NPC with id ${id}`);
  }
  const data = await response.json();
  return data;
}

export async function addRecord({ name, record }) {
  try {
    const res = await fetch(`${API_URL}/api/leaderboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, record }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to add player");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error adding player:", err);
  }
}

export async function updateRecord({ name, record }) {
  try {
    const res = await fetch(`${API_URL}/leaderboard/${name}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
}
