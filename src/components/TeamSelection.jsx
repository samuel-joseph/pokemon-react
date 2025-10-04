import React, { useEffect, useState } from "react";
import { useTeam } from "./TeamContext";
import { useNavigate } from "react-router-dom";
import pokeball from "../assets/pokeball.png";

const TeamSelection = () => {
  const navigate = useNavigate();
  const {
    inventory,
    team,
    addTeam,
    removeInventory,
    removeTeam,
    region,
    npc,
    setNpcTeam
  } = useTeam();

  const [allowChanges, setAllowChanges] = useState(false);
  const [showNpc, setShowNpc] = useState(true);

  // Redirect if team has less than 6 Pokémon
  useEffect(() => {
    if (allowChanges && inventory.length < 6) {
      navigate(`/region/${region}`);
    }
  }, [inventory, navigate, region]);

  useEffect(() => {
    if (team.length === 3) {
      setTimeout(() => {
        console.log("YES!")
        setNpcTeam()
      }, 3000)
    }
  })

  // Ask if user wants to make changes when team is full
  useEffect(() => {
    if (inventory.length === 6) {
      const wantsChanges = window.confirm(
        "You have selected 6 Pokémon. Do you want to make changes?"
      );
      setAllowChanges(wantsChanges);
      setShowNpc(!wantsChanges);
    }
  }, [inventory]);

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
              onClick={() => {addTeam(poke)}}
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
                    e.stopPropagation(); // prevent parent click
                    removeInventory(poke);
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
            <span className="bg-red-500 text-white text-xl font-bold px-6 py-2 rounded-full shadow-md">
              VERSUS
            </span>
          </div>

          <div key={npc.region}>
            {npc.gymLeaders.map((leader) => (
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
