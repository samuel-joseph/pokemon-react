import { useState, useEffect } from "react";

const LoadingScreen = () => {
  const [pokemonId, setPokemonId] = useState(Math.floor(Math.random() * 900) + 1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPokemonId(Math.floor(Math.random() * 900) + 1);
    }, 1500); // change image every 1.5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white relative overflow-hidden">
        <h1 className="absolute bottom-10 text-3xl font-bold text-yellow-400 animate-bounce">
        Loading Pokémon World...
      </h1>
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonId}.svg`}
        alt="Loading Pokémon"
        className="w-60 h-60 md:w-80 md:h-80 animate-pulse drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]"
      />
    </div>
  );
};

export default LoadingScreen