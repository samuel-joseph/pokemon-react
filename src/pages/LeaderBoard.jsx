import React, { useEffect, useState } from "react";
import { getRecord } from "../services/pokemonService";

const Leaderboard = () => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await getRecord();

        const formatted = data.map((player) => {
          const records = Array.isArray(player.record) ? player.record : [];

          const totalWins = records.reduce(
            (sum, r) => sum + (r.win || 0),
            0
          );

          const trophies = "🏆".repeat(totalWins);

          return { name: player.name || "Unknown", trophies, totalWins };
        });

        // Optional: sort descending by wins
        formatted.sort((a, b) => b.totalWins - a.totalWins);

        setLeaderboards(formatted);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRecords();
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Leaderboard</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {leaderboards.map((player) => (
          <li key={player.name} style={{ margin: "8px 0", fontSize: "1.2rem" }}>
            <strong>{player.name}:</strong> {player.trophies || "No wins yet"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
