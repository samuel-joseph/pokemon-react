import { useEffect, useState } from "react";
import TeamSelection from "../components/TeamSelection";
import Battle from "../components/Battle";
import BattleResult from "../components/BattleResult";
import { useTeam } from "../components/TeamContext";

const Stadium = () => {
  const [stage, setStage] = useState("team");
  const [outcome, setOutcome] = useState(null);
  
  // ✅ Hook must be inside the component body
  const { npc, inventory, setTeam } = useTeam();

  useEffect(()=>setTeam([]),[])

  const renderStage = () => {
    // ✅ Fallback check — if missing data, redirect to default
    if (!npc || !inventory || inventory.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Oops! Something went wrong.
          </h2>
          <p className="text-gray-600 mb-6">
            Your team or the opponent data was not found.
          </p>
          <a
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition"
          >
            Return Home
          </a>
        </div>
      );
    }

    switch (stage) {
      case "team":
        return <TeamSelection onNext={() => setStage("battle")} />;
      case "battle":
        return (
          <Battle
            onNext={(result) => {
              setOutcome(result);
              setStage("result");
            }}
          />
        );
      case "result":
        return <BattleResult outcome={outcome} />;
      default:
        return <div>Unknown stage</div>;
    }
  };

  return <div>{renderStage()}</div>;
};

export default Stadium;
