import React, { useState } from "react";

const PokemonDetails = ({ pokemon, onBack, onAdd }) => {
  const [showMoves, setShowMoves] = useState(false);
  const [showBack, setShowBack] = useState(false);

  if (!pokemon) return null;

  return (
    <div className="p-6 text-center">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-4 capitalize">{pokemon.name}</h1>

      {/* Toggle front/back sprite */}
      <img
        src={showBack ? pokemon.sprite_back : pokemon.sprite_front}
        alt={pokemon.name}
        className="mx-auto mb-4 w-32 h-32 cursor-pointer"
        onClick={() => setShowBack(!showBack)}
      />

      {/* Types */}
      {pokemon.types && (
        <div className="mb-4">
          {pokemon.types.map((type, index) => (
            <span
              key={index}
              className="inline-block bg-blue-200 text-blue-800 text-sm px-3 py-1 rounded-full mr-2 capitalize"
            >
              {type}
            </span>
          ))}
        </div>
      )}

      {/* Add to Team button */}
      <button
        onClick={() => onAdd(pokemon)}
        className="mb-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Add to Team
      </button>

      {/* Toggle between Stats and Moves */}
      {!showMoves ? (
        <div
          className="bg-gray-100 p-4 rounded-lg shadow-lg max-w-md mx-auto cursor-pointer hover:shadow-xl transition"
          onClick={() => setShowMoves(true)}
        >
          <h2 className="text-xl font-semibold mb-4">Stats</h2>
          <ul className="space-y-3">
            {pokemon.stats?.map((stat, index) => {
              const percentage = Math.min((stat.base / 255) * 100, 100);
              return (
                <li
                  key={index}
                  className="w-full bg-gray-300 rounded-full h-6 relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-green-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <span className="relative z-10 text-white font-medium text-sm flex justify-between px-2">
                    <span className="capitalize">{stat.name}</span>
                    <span>{stat.base}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm text-gray-500 italic">Click to view moves</p>
        </div>
      ) : (
        <div
          className="bg-gray-100 p-4 rounded-lg shadow-lg max-w-md mx-auto"
          onClick={() => setShowMoves(false)}
        >
          <h2 className="text-xl font-semibold mb-4">Moves</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pokemon.moves?.map((move, index) => (
              <li
                key={index}
                className="bg-white border rounded-lg p-3 shadow-sm text-left"
              >
                <h3 className="text-lg font-semibold capitalize mb-2 text-center">
                  {move.name}
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    <span className="capitalize">{move.type}</span>
                  </p>
                  <p>
                    <span className="font-medium">Power:</span>{" "}
                    <span className="capitalize">{move.power || "not applicable"}</span>
                  </p>
                  <p>
                    <span className="font-medium">Class:</span>{" "}
                    <span className="capitalize">{move.damage_class}</span>
                  </p>
                  <p>
                    <span className="font-medium">Accuracy:</span> {move.accuracy}
                  </p>
                  <p>
                    <span className="font-medium">PP:</span> {move.pp}
                  </p>
                  <p className="italic text-gray-600">{move.effect_entries}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-gray-500 italic">Click to view stats</p>
        </div>
      )}
    </div>
  );
};

export default PokemonDetails;
