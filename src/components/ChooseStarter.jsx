import { useEffect, useState } from "react";
import { fetchThreeStarters } from "../services/pokemonService";
import { addBuddyPokemon, getBuddyPokemon } from "../services/buddyService";
import { useTeam } from "./TeamContext";
import { getToken } from "../services/authService";
import { typeColors } from "../helper/typeColor";
import { useNavigate } from "react-router-dom"

import EvolutionScreen from "./EvolutionScreen";


const ChooseStarter = () => {
  const [loading, setLoading] = useState(true);
  const [starters, setStarters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showMoveSelect, setShowMoveSelect] = useState(false);
  const [selectedMoves, setSelectedMoves] = useState([]);
  const [showEvolution, setShowEvolution] = useState(false);

  const { name } = useTeam();
  const navigate = useNavigate();

  const username = name;
  const token = getToken();

  useEffect(() => {
    const init = async () => {
      if (!token || !username) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const buddyList = await getBuddyPokemon(username);
        if (buddyList.length > 0) {
          setSelected(buddyList[0]);
          setLoading(false);
          return;
        }

        const startersData = await fetchThreeStarters();
        setStarters(startersData);
        setLoading(false);
      } catch (err) {
        console.error("Error initializing starter selection:", err);
        setLoading(false);
      }
    };

    init();
  }, [token, username]);

  const handleChoose = async (pokemon) => {
    setSelected(pokemon);
    setShowMoveSelect(true);
  };

  const handleMoveSelect = (move) => {
    setSelectedMoves((prev) => {
      const alreadySelected = prev.some((m) => m.name === move.name);
      if (alreadySelected) return prev.filter((m) => m.name !== move.name);
      if (prev.length >= 4) return prev;
      return [...prev, move];
    });
  };

  const babyPokemon = (url) => {
    const match = url.match(/\/(\d+)(\.\w+)?$/);
    if (!match) return url;
    const num = parseInt(match[1], 10);
    const newNum = num - 2;
    return url.replace(/\/(\d+)(\.\w+)?$/, `/${newNum}$2`);
  };

  const getEvolutionFrames = (evolvedUrl, stages = 3) => {
  // Extract the numeric ID from the URL
  const match = evolvedUrl.match(/\/(\d+)\.gif$/);
  if (!match) return [evolvedUrl];

  const finalId = parseInt(match[1], 10);
  const frames = [];

  for (let i = stages - 1; i >= 0; i--) {
    const id = finalId - i;
    frames.push(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`
    );
  }

  return frames;
};


  const handleConfirmMoves = async () => {
  if (!selected) return;
  if (selectedMoves.length === 0)
    return alert("Please choose at least one move.");

  try {
    const pokemonWithMoves = {
      ...selected,
      level: 85,
      moves: selectedMoves,
    };

    await addBuddyPokemon(pokemonWithMoves, username);

    // Trigger evolution animation
    setShowMoveSelect(false);
    setShowEvolution(true);

  } catch (err) {
    console.error("Failed to add buddy with moves:", err);
  }
};


  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    );
  
  if (showEvolution && selected) {
  const frames = getEvolutionFrames(selected.sprite_front, 3);

  return (
    <EvolutionScreen
      pokemon={{ ...selected, frames }}
      onDone={() => {
        setShowEvolution(false);
        alert(`${selected.name} has joined your team!`);
        navigate("/profile")
      }}
    />
  );
}



  if (showMoveSelect && selected) {
    const movesList = selected.movesDB || [];
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-red-100 to-blue-100">
        <h2 className="text-2xl font-bold mb-4">
          Choose up to 4 moves for {selected.name}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg">
        {movesList.map((move) => {
          const bgColor = typeColors[move.type] || "#E5E5E5"; // fallback gray
          const isSelected = selectedMoves.some((m) => m.name === move.name);

          return (
            <button
              key={move.name}
              onClick={() => handleMoveSelect(move)}
              style={{
                backgroundColor: bgColor,
                color: "#fff",
                border: isSelected ? "3px solid #FFD700" : "1px solid #ccc",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
              className="p-3 rounded-lg text-center transition-transform transform hover:scale-105"
            >
              {move.name}
            </button>
          );
        })}
      </div>
        <button
          onClick={handleConfirmMoves}
          disabled={selectedMoves.length === 0}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Confirm Moves ({selectedMoves.length}/4)
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-red-100 to-blue-100">
      <h2 className="text-3xl font-extrabold mb-6 text-center">
        Choose your starter Pokémon
      </h2>
      <div className="flex gap-6 flex-wrap justify-center">
        {Object.values(starters).map((starter) => (
          <div
            key={starter.id}
            className="cursor-pointer hover:scale-105 transform transition-all rounded-xl shadow-2xl p-4 bg-white flex flex-col items-center w-40"
            onClick={() => handleChoose(starter)}
          >
            <img
              src={babyPokemon(starter.image)}
              alt={starter.name}
              className="w-32 h-32 mb-2"
            />
            <p className="capitalize font-semibold text-lg">{starter.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChooseStarter;
