import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const MainContent = ({ rank1, isLoggedIn, pokemonIds }) => {
  const [pokemons, setPokemons] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!pokemonIds || pokemonIds.length === 0) return;

    // Prepare animated Pokémon using only those passed from App
    const sprites = pokemonIds.slice(0, 15).map((id) => ({
      id,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      vx: (Math.random() - 0.5) * 0.15, // smaller = slower movement
      vy: (Math.random() - 0.5) * 0.15,
    }));

    setPokemons(sprites);

    const animate = () => {
      setPokemons((prev) =>
        prev.map((p) => {
          let newX = p.x + p.vx * 0.5;
          let newY = p.y + p.vy * 0.5;

          // Bounce when hitting edges
          if (newX < 0) { newX = 0; p.vx = -p.vx; }
          if (newX > 95) { newX = 95; p.vx = -p.vx; }
          if (newY < 0) { newY = 0; p.vy = -p.vy; }
          if (newY > 95) { newY = 95; p.vy = -p.vy; }

          return { ...p, x: newX, y: newY, vx: p.vx, vy: p.vy };
        })
      );
      requestAnimationFrame(animate);
    };

    animate();
  }, [pokemonIds]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-start pt-16 text-center overflow-hidden bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300"
    >
      {/* Animated Pokémon Sprites */}
      {pokemons.map((p) => (
        <img
          key={p.id}
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${p.id}.gif`}
          alt={`pokemon-${p.id}`}
          className="absolute w-16 h-16 pointer-events-none opacity-80"
          style={{ top: `${p.y}%`, left: `${p.x}%` }}
        />
      ))}

      {rank1 && (
        <div className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-full shadow-lg animate-pulse mb-8">
          🔥 Rank #1: {rank1} 🔥
        </div>
      )}

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-pink-500 animate-gradient-text drop-shadow-lg mb-4">
        Pokémon App
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 mt-6 z-10">
        {isLoggedIn && (
          <Link
            to="/profile"
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
          >
            Go to Profile
          </Link>
        )}
        <Link
          to="/region"
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
        >
          Go to Stadium
        </Link>
        <Link
          to="/leaderboard"
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
        >
          Leader Board
        </Link>
        <Link
          to="/pokedex"
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
        >
          Go to Pokédex
        </Link>
      </div>

      <style>{`
        @keyframes gradient-slide {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradient-slide 5s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default MainContent;
