import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRegionPokemons, fetchNpc } from "../services/pokemonService";
import PokemonDetails from "./PokemonDetails";
import { useTeam } from "../components/TeamContext";
import { getBuddyPokemon } from "../services/buddyService";

function ShowRegionPokemon() {
  const { regionName } = useParams();
  const [pokemon, setPokemon] = useState([]);
  const [buddyPokemons, setBuddyPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const { inventory, addInventory, setRegion, setNpc, setNpcTeam, setInventory, name } = useTeam();
  const navigate = useNavigate();

  useEffect(() => {
    if (showInstructions) return; // wait for name and skip while instructions showing

    setInventory([]);
    setNpc([]);
    setNpcTeam([]);

    async function fetchData() {
      setLoading(true);
      try {
        let buddyPokemonsData = [];
        if (name && name !== "") {
          buddyPokemonsData = await getBuddyPokemon(name);
          setBuddyPokemons(buddyPokemonsData);
        }

        const pokemonsData = await fetchRegionPokemons(regionName);
        const npcData = await fetchNpc(regionName);

        setNpc(npcData);
        setPokemon(pokemonsData);
      } catch (error) {
        console.error("Error fetching Pokémons:", error);
      } finally {
        setLoading(false);
        setRegion(regionName);
      }
    }

    fetchData();
  }, [regionName, name, showInstructions]);

  const availablePokemon = pokemon.filter(
    (poke) => !inventory.some((t) => t.id === poke.id)
  );

  const handleAddPokemon = (poke) => {
    addInventory(poke);
    const newTeamLength = inventory.length + 1;
    setSelectedPokemon(null);

    if (newTeamLength >= 6) {
      navigate("/stadium");
    }
  };

  const handleContinue = () => {
    setShowInstructions(false);
  };

  if (showInstructions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Welcome, {name}!</h2>
        <p className="text-lg text-gray-700 mb-6 text-center max-w-md">
          Before heading to the Stadium, you must first choose 6 Pokémon to form your team. 
          Pick wisely, as each region has unique Pokémon waiting for you!
        </p>
        <button
          onClick={handleContinue}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  if (selectedPokemon) {
    return (
      <PokemonDetails
        pokemon={selectedPokemon}
        onAdd={handleAddPokemon}
        onBack={() => setSelectedPokemon(null)}
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto overflow-y-auto overscroll-none">
      <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
        {regionName.charAt(0).toUpperCase() + regionName.slice(1)} Region
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading Pokémon...</p>
      ) : (
        <>
          {/* 🧢 Trainer’s Captured Pokémon */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
            Your Pokémon
          </h2>
          {buddyPokemons.length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-10">
              {buddyPokemons.map((poke, index) => (
                <li
                  key={`buddy-${index}`}
                  className="bg-yellow-100 rounded-xl shadow-md p-4 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer"
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
          ) : (
            <p className="text-center text-gray-500 mb-10">
              You haven’t caught any Pokémon yet.
            </p>
          )}

          {/* 🌿 Wild Pokémon */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
            Region Pokémon
          </h2>
          {availablePokemon.length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {availablePokemon.map((poke, index) => (
                <li
                  key={`wild-${index}`}
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
          ) : (
            <p className="text-center text-gray-500">
              No more wild Pokémon available in this region.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default ShowRegionPokemon;
