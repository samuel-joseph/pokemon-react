const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "http://localhost:3000";

export const fetchRegionPokemons = async (region) => {
  const response = await fetch(`${API_URL}/api/region/${region}`);
  if (!response.ok) {
    throw new Error("Failed to fetch Pokémons for the specified region");
  }
  const data = await response.json();
  return data.pokemons;
};

export const fetchPokemons = async () => {
  const response = await fetch(`${API_URL}/api/pokemon`);
  if (!response.ok) {
    throw new Error("Failed to fetch Pokémons");
  }
  const data = await response.json();
  return data.pokemons;
};

// Fetch all NPCs
export const fetchAllNpc = async () => {
  const response = await fetch(`${API_URL}/api/npc`);
  if (!response.ok) {
    throw new Error("Failed to fetch NPCs");
  }
  const data = await response.json();
  return data; // returns an array of regions with gymLeaders and Pokémon
};

// Fetch a single NPC by ID or name
export const fetchNpc = async (id) => {
  const response = await fetch(`${API_URL}/api/npc/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NPC with id ${id}`);
  }
  const data = await response.json();
  return data; // returns a single NPC object
};

export const addNarate = async ({
  attacker,
  move,
  defender,
  outcome,
  hpRemaining,
}) => {
  try {
    const res = await fetch(`${API_URL}/api/ai/comentate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attacker, move, defender, outcome, hpRemaining }),
    });

    // Check for non-OK status
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to add narration");
    }

    // Parse JSON exactly once
    const data = await res.json();

    console.log("Narration response data:", data);

    // Return the same structure as backend
    return data; // e.g. { message: "Pidgeot unleashes a Hyper Beam..." }
  } catch (err) {
    console.error("Error adding narration:", err);
    return { message: "Failed to generate narration." };
  }
};
