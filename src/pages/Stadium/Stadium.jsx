import { useState } from "react";
import TeamSelection from "../../components/TeamSelection";
import Battle from "../../components/Battle";
import BattleResult from "../../components/BattleResult";

const Stadium = () => {
  const [stage, setStage] = useState("team");
  const [outcome, setOutcome] = useState(null); // win or lose

  const renderStage = () => {
    switch (stage) {
      case "team":
        return <TeamSelection onNext={() => setStage("battle")} />;
      case "battle":
        return <Battle onNext={(result) => { 
          setOutcome(result); 
          setStage("result"); 
        }} />;
      case "result":
        return <BattleResult outcome={outcome} />;
      default:
        return <div>Unknown stage</div>;
    }
  };

  return <div className="p-6">{renderStage()}</div>;
};

export default Stadium;
