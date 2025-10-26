import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTeam } from "./TeamContext";
import { regions } from "../helper/region";
import { getToken } from "../services/authService";
import { updateRecord, incrementRegionWin, getRecord } from "../services/recordService";

const BattleResult = ({ outcome }) => {
  const navigate = useNavigate();
  const {
    team,
    setTeam,
    setNpcTeam,
    setNpc,
    addTrophy,
    npc,
    trophy,
    region,
    inventory,
    setInventory,
    name,
    npcTeam,
  } = useTeam();

  useEffect(() => {
    if (outcome === "win") handleWin();
    else handleLoss();
  }, [outcome]);

  // 🏆 Handle winning logic
  const handleWin = async () => {
    const token = getToken();
    if (token && name) {
      try {
        // Backend handles both increment and creation
        await incrementRegionWin(name, region);

        // Update trophy if needed
        const index = regions.findIndex((r) => r === region);
        if (trophy !== index + 1) addTrophy();

      } catch (err) {
        console.error("Error updating win record:", err);
      }

      setTimeout(() => resetAndRedirect(), 5000);
    } else {
      // Not logged in, redirect to signup
      setTimeout(() => {
        navigate("/signup", { state: { battleWon: true } });
      }, 5000);
    }
  };


  const handleLoss = () => {
    setTimeout(() => resetAndRedirect(), 5000);
  };

  const resetAndRedirect = () => {
    setTeam([]);
    setInventory([]);
    setNpc([]);
    setNpcTeam([]);

    setNpcTeam(
      npc?.gymLeaders?.[0]?.pokemon?.map((p) => ({
        ...p,
        currentHP: p.hp,
      })) || []
    );
    if(getToken())
      navigate("/");
    else navigate("/signup")
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-6">
      {outcome === "win" ? (
        <>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-green-400 mb-4 animate-bounce text-center">
            🎉 Congratulations! 🎉
          </h1>
          <p className="text-xl sm:text-2xl text-white text-center">
            You defeated the Champion of {region}!
          </p>
        </>
      ) : (
        <>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-red-600 mb-4 animate-pulse text-center">
            ❌ You Lost ❌
          </h1>
          <p className="text-xl sm:text-2xl text-white text-center">
            Better luck next time! Try again to defeat the Champion of {region}.
          </p>
        </>
      )}

      {/* Teams Display */}
      <div className="mt-10 w-full max-w-4xl">
        {/* Player Team */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2 text-center">Your Team</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {team.map((poke, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <img
                  src={poke.sprite_front || poke.image}
                  alt={poke.name}
                  className="w-20 h-20 object-contain"
                />
                <p className="text-white font-medium">{poke.name}</p>
                <p className="text-sm text-gray-300">HP: {poke.currentHP}/{poke.hp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* NPC Team */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2 text-center">Opponent Team</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {npcTeam?.map((poke, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <img
                  src={poke.sprite_front || poke.image}
                  alt={poke.name}
                  className="w-20 h-20 object-contain"
                />
                <p className="text-white font-medium">{poke.name}</p>
                <p className="text-sm text-gray-300">HP: {poke.currentHP}/{poke.hp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fainted Pokémon */}
        {inventory?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2 text-center">Fainted Pokémon</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {inventory.map((poke, idx) => (
                <div key={idx} className="flex flex-col items-center opacity-50">
                  <img
                    src={poke.sprite_front || poke.image}
                    alt={poke.name}
                    className="w-20 h-20 object-contain"
                  />
                  <p className="text-white font-medium">{poke.name}</p>
                  <p className="text-sm text-gray-300">HP: 0/{poke.hp}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <p className="text-gray-300 italic animate-pulse">
          Redirecting back to regions...
        </p>
      </div>
    </div>
  );
};

export default BattleResult;
