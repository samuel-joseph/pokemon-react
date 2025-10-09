import React, { useEffect, useState } from "react";
import { getRecord } from "../services/pokemonService";

const Leaderboard = () => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await getRecord();

        const formatted = data
          .map((player) => {
            const records = Array.isArray(player.record) ? player.record : [];

            const totalWins = records.reduce(
              (sum, r) => sum + (r.win || 0),
              0
            );

            return {
              name: player.name || "Unknown",
              trophies: "🏆".repeat(totalWins),
              totalWins,
            };
          })
          .filter((player) => player.totalWins > 0)
          .sort((a, b) => b.totalWins - a.totalWins);

        setLeaderboards(formatted);
      } catch (err) {
        setError("Failed to load leaderboard data.");
        console.error(err);
      }
    };

    fetchRecords();
  }, []);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-yellow-600 mb-8">
          🏆 Pokémon Champions Leaderboard 🏆
        </h2>

        {leaderboards.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No champions yet. Win battles to earn your trophies!
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {leaderboards.map((player, index) => (
              <li
                key={player.name}
                className="flex justify-between items-center py-4 px-2 hover:bg-yellow-50 transition duration-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-700">
                    #{index + 1}
                  </span>
                  <span className="text-lg font-semibold text-gray-800 capitalize">
                    {player.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-xl">
                    {"🏆".repeat(player.totalWins)}
                  </span>
                  <span className="text-gray-500 font-medium text-sm">
                    ({player.totalWins})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
