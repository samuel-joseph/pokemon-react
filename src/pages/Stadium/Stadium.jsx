import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeamSelection from "../../components/TeamSelection";
import Battle from "../../components/Battle";
// import other future components here, e.g. Scoreboard, Summary, etc.

const Stadium = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState("team");

  // Redirect to "/" if this component is accessed via refresh (optional fallback)
  useEffect(() => {
    if (window.location.pathname !== "/stadium") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const renderStage = () => {
    switch (stage) {
      case "team":
        return <TeamSelection onNext={() => setStage("battle")} />;
      case "battle":
        return <Battle onNext={() => setStage("scoreboard")} />;
      case "scoreboard":
        return <div>Scoreboard Component (coming soon)</div>;
      default:
        return <div>Unknown stage</div>;
    }
  };

  return <div className="p-6">{renderStage()}</div>;
};

export default Stadium;
