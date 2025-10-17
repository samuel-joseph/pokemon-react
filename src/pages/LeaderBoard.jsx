import React, { useEffect, useState } from "react";
import { getAllRecord } from "../services/recordService";

const Leaderboard = () => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchLeaderboard = async () => {
    try {
      const data = await getAllRecord();

      // Sort the leaderboard
      const sorted = [...data].sort((a, b) => {
        // 1️⃣ Compare by number of regions (record count)
        const recordDiff = b.record.length - a.record.length;
        if (recordDiff !== 0) return recordDiff;

        // 2️⃣ If equal, compare by highest win count in any region
        const aMaxWins = Math.max(...a.record.map(r => r.wins || 0));
        const bMaxWins = Math.max(...b.record.map(r => r.wins || 0));

        return bMaxWins - aMaxWins;
      });

      console.log("Sorted leaderboard:", sorted);
      setLeaderboards(sorted);
    } catch (err) {
      setError("Failed to load leaderboard data.");
      console.error(err);
    }
  };

  fetchLeaderboard();
}, []);

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
            {leaderboards.map((trainer, index) => {
              const totalWins = trainer.record.reduce(
                (sum, r) => sum + (r.win || 0),
                0
              );

              return (
                <li
                  key={trainer.name}
                  onClick={() =>
                    setSelectedTrainer(
                      selectedTrainer?.name === trainer.name ? null : trainer
                    )
                  }
                  className="py-4 px-2 hover:bg-yellow-50 transition duration-200 rounded-lg cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-gray-700">
                        #{index + 1}
                      </span>
                      <span className="text-lg font-semibold text-gray-800 capitalize">
                        {trainer.name}
                      </span>
                    </div>

                    <span className="text-gray-500 font-medium text-sm">
                      {"🏆".repeat(totalWins)}
                    </span>
                  </div>

                  {/* Show details only if selected */}
                  {selectedTrainer?.name === trainer.name && (
                    <div className="mt-4 ml-6 border-t border-gray-300 pt-3 space-y-3">
                      {trainer.record.map((data, i) => (
                        <div
                          key={i}
                          className="bg-yellow-50 p-3 rounded-lg shadow-sm"
                        >
                          <p className="font-semibold text-gray-700">
                            Region: {data.region}
                          </p>
                          <p className="text-gray-600">Wins: {"🏆".repeat(data.win)}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {data.pokemon.map((poke, idx) => (
                              <img
                                key={idx}
                                src={poke.image}
                                alt={poke.name}
                                className="w-12 h-12 rounded-full border border-gray-300"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
