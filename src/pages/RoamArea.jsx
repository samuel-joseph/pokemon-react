import { useState, useEffect } from "react";
import bush from "../assets/bush.png";
import down from "../assets/trainer-down.png";
import up from "../assets/trainer-up.png";
import left from "../assets/trainer-left.png";
import right from "../assets/trainer-right.png";
import { fetchPokemons } from "../services/pokemonService";

export default function RoamArea() {
  const [position, setPosition] = useState({ x: 2, y: 2 });
  const [direction, setDirection] = useState("down"); // trainer facing
  const [gridSize] = useState(7); // smaller grid for mobile
  const [pokemons, setPokemons] = useState([]);

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  useEffect(() => {
    const getPokemons = async () => {
      try {
        const data = await fetchPokemons();
        const randomPokemons = shuffleArray(data);

        const occupied = new Set();
        const placedPokemons = randomPokemons
          .slice(0, Math.min(gridSize * gridSize - 1, 8)) // fewer Pokémon
          .map((poke) => {
            let x, y, key;
            do {
              x = Math.floor(Math.random() * gridSize);
              y = Math.floor(Math.random() * gridSize);
              key = `${x},${y}`;
            } while (occupied.has(key) || (x === position.x && y === position.y));
            occupied.add(key);
            return { ...poke, position: { x, y }, visible: false };
          });

        setPokemons(placedPokemons);
      } catch (error) {
        console.error("Error fetching Pokémons:", error);
      }
    };

    getPokemons();
  }, [gridSize]);

  // Movement function
  const handleMovement = (dx, dy) => {
    setPosition((prev) => {
      const newX = Math.min(gridSize - 1, Math.max(0, prev.x + dx));
      const newY = Math.min(gridSize - 1, Math.max(0, prev.y + dy));

      // update direction
      if (dx === -1) setDirection("left");
      if (dx === 1) setDirection("right");
      if (dy === -1) setDirection("up");
      if (dy === 1) setDirection("down");

      return { x: newX, y: newY };
    });
  };

  // Keyboard movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowUp": handleMovement(0, -1); break;
        case "ArrowDown": handleMovement(0, 1); break;
        case "ArrowLeft": handleMovement(-1, 0); break;
        case "ArrowRight": handleMovement(1, 0); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mobile movement
  const move = (dir) => {
    switch (dir) {
      case "up": handleMovement(0, -1); break;
      case "down": handleMovement(0, 1); break;
      case "left": handleMovement(-1, 0); break;
      case "right": handleMovement(1, 0); break;
    }
  };

  // Reveal nearby Pokémon
  useEffect(() => {
    setPokemons((prev) =>
      prev.map((p) => {
        const dx = Math.abs(p.position.x - position.x);
        const dy = Math.abs(p.position.y - position.y);
        return { ...p, visible: dx <= 1 && dy <= 1 };
      })
    );
  }, [position]);

  const encounteredPokemon = pokemons.find(
    (p) => p.position.x === position.x && p.position.y === position.y
  );

  // Dynamic cell size for mobile screens
  const cellSize = `min(12vw, 60px)`;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-200 p-2">
      {/* World Grid */}
      <div
        className="relative border-4 border-green-700"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize})`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize})`,
          gap: "2px",
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, i) => {
          const x = i % gridSize;
          const y = Math.floor(i / gridSize);
          const isPlayer = x === position.x && y === position.y;
          const pokemon = pokemons.find((p) => p.position.x === x && p.position.y === y);

          return (
            <div
              key={i}
              className={`relative flex items-center justify-center border border-green-300 ${
                !isPlayer ? "bg-green-400" : ""
              }`}
              style={{ width: cellSize, height: cellSize }}
            >
              {pokemon && (
                <img
                  src={bush}
                  alt="bush"
                  className="absolute w-full h-full object-cover"
                  style={{opacity: `${pokemon.visible ? "0.5" : "1"}`}}
                />
              )}

              {pokemon && pokemon.visible && (
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="absolute top-0 left-0 w-full h-full z-10 object-fill"
                />
              )}

              {isPlayer && (
                <img
                  src={
                    direction === "up"
                      ? up
                      : direction === "down"
                      ? down
                      : direction === "left"
                      ? left
                      : right
                  }
                  alt="trainer"
                  className="absolute top-0 left-0 w-full h-full z-20 object-fill"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Encounter message */}
      {encounteredPokemon && (
        <div className="mt-3 text-lg font-bold text-red-600 text-center">
          You found a {encounteredPokemon.name}!
        </div>
      )}

      {/* Mobile Controls */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className="col-start-2 bg-yellow-400 p-3 rounded-xl" onClick={() => move("up")}>↑</button>
        <button className="bg-yellow-400 p-3 rounded-xl" onClick={() => move("left")}>←</button>
        <button className="bg-yellow-400 p-3 rounded-xl" onClick={() => move("down")}>↓</button>
        <button className="bg-yellow-400 p-3 rounded-xl" onClick={() => move("right")}>→</button>
      </div>
    </div>
  );
}
