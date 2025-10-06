import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeam } from "../components/TeamContext";
import { regions } from "../helper/region";

function Region() {
  const navigate = useNavigate();
  const { trophies } = useTeam();
  const [activeRegion, setActiveRegion] = useState(null);

  const handleRegionClick = (region) => {
    navigate(`/region/${region.toLowerCase()}`); 
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-red-600 mb-6 text-center">
        Regional Stadiums
      </h1>

      <div className="flex flex-col justify-center w-1/2 gap-4">
        {regions.slice(0, trophies+1).map((region) => (
          <button
            key={region}
            onClick={() => handleRegionClick(region)}
            className={`px-6 py-3 rounded-lg font-semibold text-red-600 bg-white shadow-md hover:bg-red-200 transition-colors ${
              activeRegion === region ? "bg-red-600 text-white" : ""
            }`}
          >
            {region}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Region;
