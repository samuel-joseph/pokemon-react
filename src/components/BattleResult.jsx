import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTeam } from "./TeamContext"; // adjust path
import { regions } from "../helper/region";
import { getRecord, addRecord, updateRecord } from "../services/pokemonService";

const BattleResult = ({ outcome }) => {
  const navigate = useNavigate();
  const {
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
  } = useTeam();

  // Add or update leaderboard for the current player
  const addOrUpdateLeaderBoard = async () => {
    try {
      const leaderboard = await getRecord();
      const existingPlayer = leaderboard.find(
        (player) => player.name.toLowerCase() === name.toLowerCase()
      );

      if (existingPlayer) {
        const updatedRecord = [...existingPlayer.record];
        const regionIndex = updatedRecord.findIndex(
          (r) => r.region.toLowerCase() === region.toLowerCase()
        );

        if (regionIndex >= 0) {
          updatedRecord[regionIndex].win += 1;
          updatedRecord[regionIndex].pokemon = [...inventory];
        } else {
          updatedRecord.push({
            region,
            win: 1,
            pokemon: [...inventory],
          });
        }

        await updateRecord({ name, record: updatedRecord });
        console.log(`✅ Updated record for ${name}`);
      } else {
        const newRecord = [
          { region, win: 1, pokemon: [...inventory] },
        ];
        await addRecord({ name, record: newRecord });
        console.log(`✅ Added new player ${name}`);
      }
    } catch (err) {
      console.error("❌ Failed to update leaderboard:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset player team & inventory
      setTeam([]);
      setInventory([]);
      setNpc([]);
      setNpcTeam([]);

      // Reset NPC team HP
      setNpcTeam(
        npc?.gymLeaders?.[0]?.pokemon?.map((p) => ({
          ...p,
          currentHP: p.hp,
        })) || []
      );

      const index = regions.findIndex((r) => r === region);

      // Award trophy if player won
      if (outcome === "win" && trophy !== index + 1) {
        addTrophy();
        addOrUpdateLeaderBoard();
      }

      // Redirect to region page
      navigate("/region", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [outcome, setTeam, setNpcTeam, addTrophy, navigate, npc]);

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
      <div className="mt-8">
        <p className="text-gray-300 italic animate-pulse">
          Redirecting back to regions...
        </p>
      </div>
    </div>
  );
};

export default BattleResult;
