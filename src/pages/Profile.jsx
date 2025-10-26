import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getToken } from "../services/authService";
import { getBuddyPokemon, editBuddyPokemonList } from "../services/buddyService";
import { typeColors } from "../helper/typeColor";
import { useTeam } from "../components/TeamContext";


const Profile = () => {
  const token = getToken();
  const navigate = useNavigate();
  const [buddyList, setBuddyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewModes, setViewModes] = useState({});
  const { name } = useTeam();

  useEffect(() => {
    const fetchBuddy = async () => {
      if (!name) return;
      try {
        const buddies = await getBuddyPokemon(name);
        setBuddyList(buddies);
        const initialModes = {};
        buddies.forEach((p) => (initialModes[p.id] = "default"));
        setViewModes(initialModes);
      } catch (err) {
        console.error("Failed to fetch buddy Pokémon:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuddy();
  }, [name]);

  if (!token) return <Navigate to="/login" replace />;
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading your Pokémon...</p>
      </div>
    );

  const handleCardClick = (pokemonId) => {
    setViewModes((prev) => {
      const nextMode =
        prev[pokemonId] === "default"
          ? "moves"
          : prev[pokemonId] === "moves"
          ? "stats"
          : "default";
      return { ...prev, [pokemonId]: nextMode };
    });
  };

  const handleRemove = (pokemonName) => {
    setBuddyList((prev) => prev.filter((p) => p.name !== pokemonName));
  };


  // Inside handleSave
const handleSave = async () => {
  if (!name) return;
  setSaving(true);
  try {
    await editBuddyPokemonList(name, buddyList); // send full list
    alert("Your Pokémon updates have been saved!");
  } catch (err) {
    alert("Failed to save changes.");
    console.error(err);
  } finally {
    setSaving(false);
  }
};
  
  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
      >
        ← Back
      </button>

      {/* Save Button */}
      {buddyList.length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className={`absolute top-4 right-4 px-4 py-2 rounded-lg shadow-md ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          } transition`}
        >
          {saving ? "Saving..." : "💾 Save Changes"}
        </button>
      )}

      <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">
        {name}'s Profile
      </h1>

      {buddyList.length === 0 ? (
        <p className="text-lg text-center">You don’t have any Pokémon yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {buddyList.map((pokemon, index) => {
            const mode = viewModes[pokemon.id] || "default";
            return (
              <div
                key={`${pokemon.id}-${index}`}
                className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center hover:scale-105 transition-transform relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(pokemon.name)}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                >
                  ❌
                </button>

                <img
                  src={pokemon.sprite_front}
                  alt={pokemon.name}
                  className="w-24 h-24 cursor-pointer"
                  onClick={() => handleCardClick(pokemon.id)}
                />
                <h2 className="mt-2 text-lg font-semibold capitalize">
                  {pokemon.name}
                </h2>
                <p>Level: {pokemon.level}</p>

                {mode === "moves" && (
                  <div className="mt-2 w-full">
                    <h3 className="text-sm font-bold mb-1">Moves:</h3>
                    <ul className="text-xs">
                      {pokemon.moves.map((m) => (
                        <li
                          key={m.name}
                          className="px-1 py-0.5 rounded mb-1 inline-block text-white"
                          style={{ backgroundColor: typeColors[m.type] || "#777" }}
                        >
                          {m.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {mode === "stats" && (
                  <div className="mt-2 w-full">
                    <h3 className="text-sm font-bold mb-1">Stats:</h3>
                    {pokemon.stats.map((s) => (
                      <div key={s.name} className="mb-1">
                        <p className="text-xs capitalize">{s.name}</p>
                        <div className="w-full bg-gray-300 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(s.base, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {mode === "default" && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pokemon.types.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 rounded text-white text-xs"
                        style={{ backgroundColor: typeColors[type] || "#777" }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Profile;
