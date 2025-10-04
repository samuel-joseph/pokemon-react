import React, { useEffect, useState } from "react";
import { useTeam } from "./TeamContext";
import { useNavigate } from "react-router-dom";

const TeamSelection = () => {
  const navigate = useNavigate();
  const { team, removePokemon, region, npc } = useTeam();
  const [allowChanges, setAllowChanges] = useState(false);
  const [showNpc, setShowNpc] = useState(true);

  // Redirect if team has less than 6 Pokémon
  useEffect(() => {
    if (team.length < 6) {
      navigate(`/region/${region}`);
    }
  }, [team, navigate, region]);

  // Check if team reached 6 Pokémon
  useEffect(() => {
    if (team.length === 6) {
      const wantsChanges = window.confirm(
        "You have selected 6 Pokémon. Do you want to make changes?"
      );
      if (wantsChanges) {
        setAllowChanges(true);
        setShowNpc(false);
      } else {
        setAllowChanges(false);
        setShowNpc(true);
      }
    } else {
      setAllowChanges(false);
      setShowNpc(true);
    }
  }, [team]);

  return (
   <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Your Team Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Your Team</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {team.map((poke) => (
            <li
              key={poke.id}
              className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center hover:scale-105 transform transition duration-300"
            >
              <div className="w-20 h-20 flex items-center justify-center">
                <img
                  src={poke.sprite_front}
                  alt={poke.name}
                  className="max-w-full max-h-full"
                />
              </div>
              <span className="font-semibold capitalize text-gray-700 mb-2">{poke.name}</span>
              {allowChanges && (
                <button
                  className="mt-2 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm transition"
                  onClick={() => removePokemon(poke.id)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* VERSUS Banner */}
      {showNpc && (
        <>
          <div className="flex justify-center mb-8">
            <span className="bg-red-500 text-white text-xl font-bold px-6 py-2 rounded-full shadow-md">
              VERSUS
            </span>
          </div>

          {/* NPC Section */}
          <div key={npc.region}>
            {npc.gymLeaders.map((leader) => (
              <div key={leader.name} className="mb-10 bg-white rounded-xl shadow-lg p-6">
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
                      <span className="font-semibold capitalize text-gray-700">{poke.name}</span>
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
