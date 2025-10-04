import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRegionPokemons, fetchNpc } from "../services/pokemonService";
import PokemonDetails from "./PokemonDetails";
import { useTeam } from "../components/TeamContext";
import { useNavigate } from "react-router-dom";

function ShowRegionPokemon() {
  const { regionName } = useParams();
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const { inventory, addInventory, setRegion, setNpc, npc } = useTeam();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const pokemons = await fetchRegionPokemons(regionName);
        const npc = await fetchNpc(regionName);
        setNpc(npc);
        setPokemon(pokemons);
      } catch (error) {
        console.error("Error fetching Pokémons:", error);
      }
      setLoading(false);
      setRegion(regionName);
    }
    fetchData();
  }, [regionName]);

  // filter out Pokémon already in the team
  const availablePokemon = pokemon.filter(
    (poke) => !inventory.some((t) => t.id === poke.id)
  );

  const handleAddPokemon = (poke) => {
    addInventory(poke);
    // use new length instead of team.length
    const newTeamLength = inventory.length + 1;
    setSelectedPokemon(null);

    if (newTeamLength >= 6) {
      navigate("/stadium");
    }
  };


  if (selectedPokemon) {
    return (
      <PokemonDetails
        pokemon={selectedPokemon}
        onAdd={handleAddPokemon} // new prop
        onBack={() => setSelectedPokemon(null)}
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
        {regionName.charAt(0).toUpperCase() + regionName.slice(1)} Pokémons
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading Pokémon...</p>
      ) : availablePokemon.length === 0 ? (
        <p className="text-center text-gray-500">
          All Pokémon from this region are already in your team!
        </p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {availablePokemon.map((poke, index) => (
            <li
              key={index}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setSelectedPokemon(poke)}
            >
              <img
                src={poke.image}
                alt={poke.name}
                className="w-20 h-20 object-contain mb-2"
              />
              <span className="text-gray-700 font-semibold text-center">
                #{poke.id} {poke.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ShowRegionPokemon;
