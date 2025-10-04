export async function fetchRegionPokemons(region) {
  const response = await fetch(
    // `https://pokemon-api-w3cz.onrender.com/api/region/${region}`
    `http://localhost:3000/api/region/${region}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch Pokémons for the specified region");
  }
  const data = await response.json();
  console.log("What is response in service? ", data);
  return data.pokemons;
}

export async function fetchPokemons() {
  const response = await fetch("http://localhost:3000/api/pokemon");
  if (!response.ok) {
    throw new Error("Failed to fetch Pokémons");
  }
  const data = await response.json();
  return data.pokemons;
}

// Fetch all NPCs
export async function fetchAllNpc() {
  const response = await fetch(`http://localhost:3000/api/npc`);
  if (!response.ok) {
    throw new Error("Failed to fetch NPCs");
  }
  const data = await response.json();
  return data; // returns an array of regions with gymLeaders and Pokémon
}

// Fetch a single NPC by ID or name
export async function fetchNpc(id) {
  const response = await fetch(`http://localhost:3000/api/npc/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NPC with id ${id}`);
  }
  const data = await response.json();
  return data; // returns a single NPC object
}
