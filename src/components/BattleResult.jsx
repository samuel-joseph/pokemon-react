import { useEffect } from "react"; import { useNavigate } from "react-router-dom"; import { useTeam } from "./TeamContext"; // adjust path 
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

  const addOrUpdateLeaderBoard = async () => {
  try {
    // Fetch all current leaderboard data
    const leaderboard = await getRecord();

    // Find if the player already exists
    const existingPlayer = leaderboard.find(
      (player) => player.name.toLowerCase() === name.toLowerCase()
    );

    if (existingPlayer) {
      // Copy existing record
      const updatedRecord = [...existingPlayer.record];

      // Check if region already exists in the record
      const regionIndex = updatedRecord.findIndex(
        (r) => r.region.toLowerCase() === region.toLowerCase()
      );

      if (regionIndex >= 0) {
        // Region exists → increment win
        updatedRecord[regionIndex].win += 1;

        // Optional: update Pokémon if needed
        updatedRecord[regionIndex].pokemon = [...inventory];
      } else {
        // New region → add it
        updatedRecord.push({
          region,
          win: 1,
          pokemon: [...inventory],
        });
      }

      // Send updated record to backend
      await updateRecord({ name, record: updatedRecord });
      console.log(`✅ Updated record for ${name}`);
    } else {
      // New player → add record
      const newRecord = [
        {
          region,
          win: 1,
          pokemon: [...inventory],
        },
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
      // Reset player team
      setTeam([]);
      setInventory([]);
      setNpc([]);
      setNpcTeam([]);

      // Reset NPC team to full HP
      setNpcTeam(
        npc?.gymLeaders?.[0]?.pokemon?.map((p) => ({
          ...p,
          currentHP: p.hp,
        })) || []
      );

      const index = regions.findIndex((r) => r === region);

      // If player wins and trophy not already awarded
      if (outcome === "win" && trophy !== index + 1) {
        addTrophy();
        addOrUpdateLeaderBoard();
      }

      // Redirect to /region
      navigate("/region", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [outcome, setTeam, setNpcTeam, addTrophy, navigate, npc]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {outcome === "win" ? (
        <h1 className="text-5xl font-extrabold text-green-400 animate-bounce">
          🎉 Congratulations! You beat the Champion! 🎉
        </h1>
      ) : (
        <h1 className="text-6xl font-extrabold text-red-600 animate-pulse">
          ❌ You Lost ❌
        </h1>
      )}
    </div>
  );
};

export default BattleResult;
