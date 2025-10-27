import React, { useEffect, useState } from "react";
import { useTeam } from "./TeamContext";
import { useNavigate } from "react-router-dom";
import pokeball from "../assets/pokeball.png";

const TeamSelection = ({ onNext }) => {
  const navigate = useNavigate();
  const {
    inventory,
    team,
    addTeam,
    removeInventory,
    removeTeam,
    region,
    npc,
    addNpcTeam,
    npcTeam
  } = useTeam();

  const [allowChanges, setAllowChanges] = useState(false);
  const [showNpc, setShowNpc] = useState(true);
  const [showInstruction, setShowInstruction] = useState(true); // <-- new

  // Redirect if team has less than 6 Pokémon
  useEffect(() => {
    if (allowChanges && inventory.length < 6) {
      navigate(`/region/${region}`);
    }
  }, [inventory, navigate, region]);

  // Automatically continue to battle when 3 Pokémon are selected
  useEffect(() => {
    if (team.length === 3) {
      const timer = setTimeout(() => {
        if (!npc || !npc.gymLeaders || npc.gymLeaders.length === 0) {
          navigate("/");
          return;
        }
        onNext();

        const leader = npc.gymLeaders[0];
        const npcPokemon = [...leader.pokemon];
        const finalBoss = npcPokemon.pop();

        // randomly add NPCs until 4 slots are filled
        while (npcPokemon.length > 3) {
          const randomIndex = Math.floor(Math.random() * npcPokemon.length);
          const chosen = npcPokemon.splice(randomIndex, 1)[0];
          addNpcTeam(chosen);
        }

        if (finalBoss) {
          addNpcTeam(finalBoss);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [team, npc, onNext, addNpcTeam]);

  // ⬇️ Instruction screen before everything loads
  if (showInstruction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-4">
        <h2 className="text-3xl font-bold text-blue-700 mb-4 text-center">
          Get Ready for Battle!
        </h2>
        <p className="text-lg text-gray-700 mb-6 text-center max-w-md">
          Choose <span className="font-semibold text-blue-800">3 Pokémon</span> from your team to
          battle against the region’s Gym Leader.
          Pick wisely — strategy and balance matter!
        </p>
        <button
          onClick={() => setShowInstruction(false)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  // ⬇️ Main Team Selection and NPC View
  return (
    <div className="p-4 md:p-8 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      {/* Your Team Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Your Team
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {inventory.map((poke) => (
            <li
              key={poke.id}
              className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center hover:scale-105 transform transition duration-300 cursor-pointer"
              onClick={() => addTeam(poke)}
            >
              <div className="w-20 h-20 flex items-center justify-center">
                <img
                  src={poke.sprite_front}
                  alt={poke.name}
                  className="max-w-full max-h-full"
                />
              </div>
              <span className="font-semibold capitalize text-gray-700 mb-2">
                {poke.name}
              </span>
              {allowChanges && (
                <button
                  className="mt-2 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeInventory(poke.id);
                  }}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* Current Team Pokéballs */}
        {team?.length > 0 && (
          <ul className="flex gap-3 justify-center mt-6">
            {team.map((poke) => (
              <li
                key={poke.id}
                className="cursor-pointer hover:scale-110 transition"
                onClick={() => removeTeam(poke)}
              >
                <img
                  src={pokeball}
                  alt="pokeball"
                  className="w-10 h-10"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* NPC Section */}
      {showNpc && npc && (
        <>
          
          <div className="flex justify-center mb-8">
          {team.length >= 3 ? (
            <span className="bg-yellow-500 text-white text-xl font-bold px-6 py-2 rounded-full shadow-md animate-pulse">
              Pokémon battle is about to start!
            </span>
          ) : (
            <span className="bg-red-500 text-white text-xl font-bold px-6 py-2 rounded-full shadow-md">
              VERSUS
            </span>
          )}
        </div>


          <div key={npc.region}>
            {npc && npc.gymLeaders.map((leader) => (
              <div
                key={leader.name}
                className="mb-10 bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold capitalize mb-4 text-center text-gray-800">
                  {leader.name}
                </h3>
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                  {leader.pokemon.map((poke) => (
                    <li
                      key={poke.id}
                      className="bg-gray-50 rounded-lg shadow-md p-3 flex flex-col items-center hover:scale-105 transform transition duration-300"
                    >
                      <div className="w-20 h-20 flex items-center justify-center">
                        <img
                          src={poke.sprite_front}
                          alt={poke.name}
                          className="max-w-full max-h-full"
                        />
                      </div>
                      <span className="font-semibold capitalize text-gray-700">
                        {poke.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TeamSelection;
