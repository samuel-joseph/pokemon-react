import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeam } from "../components/TeamContext";
import { regions } from "../helper/region";
function Region() {
  const navigate = useNavigate();
  const { trophies, name } = useTeam();
  const [activeRegion, setActiveRegion] = useState(null);

  const handleRegionClick = (region) => {
    navigate(`/region/${region.toLowerCase()}`);
  };

  const unlockedRegions = regions.slice(0, trophies + 1);
  const lastUnlockedRegion = unlockedRegions[unlockedRegions.length - 1];

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center justify-center">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
      >
        ← Back
      </button>
      <h1 className="text-4xl font-bold text-red-600 mb-6 text-center">
        Regional Stadiums
      </h1>

      <div className="flex flex-col justify-center w-1/2 gap-4">
        {unlockedRegions.map((region) => {
          const isLast = region === lastUnlockedRegion;
          return (
            <button
              key={region}
              onClick={() => handleRegionClick(region)}
              onMouseEnter={() => setActiveRegion(region)}
              onMouseLeave={() => setActiveRegion(null)}
              className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-500
                ${
                  isLast
                    ? "bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 animate-gradient text-white hover:scale-105"
                    : "bg-white text-red-600 hover:bg-red-200"
                }
                ${activeRegion === region ? "scale-105" : ""}
              `}
            >
              {region}
            </button>
          );
        })}
      </div>

      {/* Gradient animation keyframes */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default Region;
