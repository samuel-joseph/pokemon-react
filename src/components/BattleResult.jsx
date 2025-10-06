import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTeam } from "./TeamContext"; // adjust path
import { regions } from "../helper/region";

const BattleResult = ({ outcome }) => {
  const navigate = useNavigate();
  const { setTeam, setNpcTeam, setNpc, addTrophy, npc, trophy, region, setInventory } = useTeam();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset player team
      setTeam([]);
      setInventory([]);
      setNpc([]);
      setNpcTeam([]);

      // Reset NPC team to full HP
      setNpcTeam(
        npc?.gymLeaders?.[0]?.pokemon?.map(p => ({
          ...p,
          currentHP: p.hp, // assuming `hp` is max hp
        })) || []
      );

      const index = regions.findIndex(r => r === region);
      // 🏆 If win, add trophy
      if (outcome === "win" && trophy != index + 1) {
        addTrophy();
      }

      // Redirect to /region
      navigate("/region", { replace: true });
    }, 3000); // show result for 3s before redirect

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
