import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addBuddyPokemon } from "../services/buddyService";
import pokeballImg from "../assets/pokeball.png";
import { useTeam } from "../components/TeamContext";

export default function CatchingPokemon() {
  const location = useLocation();
  const navigate = useNavigate();
  const pokemon = location.state?.pokemon;
  const { name } = useTeam();

  if (!pokemon) {
    navigate("/roam");
    return null;
  }

  const username = name;
  const [pokeballs, setPokeballs] = useState(6);
  const [isThrowing, setIsThrowing] = useState(false);
  const [caught, setCaught] = useState(false);
  const [message, setMessage] = useState("");
  const [rotation, setRotation] = useState(0);
  const [pokemonPosition, setPokemonPosition] = useState({ top: "40%", left: "50%" });
  const [ballPosition, setBallPosition] = useState({ bottom: "20%", left: "50%" });
  const [isShaking, setIsShaking] = useState(false);

  // Pokémon idle movement
  useEffect(() => {
    const interval = setInterval(() => {
      setPokemonPosition({
        top: `${35 + Math.random() * 30}%`,
        left: `${30 + Math.random() * 40}%`,
      });

      const maxLevel =
        pokemon.base_experience >= 300
          ? 100
          : pokemon.base_experience >= 200
          ? 75
          : 65;

      const minLevel = 60;
      const randomLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

      pokemon.level = randomLevel;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const throwPokeball = async () => {
    if (isThrowing || pokeballs <= 0) return;

    const throwModifier = (6 - pokeballs) * .02
    let baseRate = throwModifier +
      pokemon.base_experience >= 300
        ? 0.05
        : pokemon.base_experience >= 200
        ? 0.15
        : 0.55;
      
    let catchRate = baseRate + throwModifier;
    catchRate = Math.min(Math.max(catchRate, 0.05), 0.95);
    
    setIsThrowing(true);
    setMessage("Throwing Pokéball...");

    // Start rolling animation
    let rot = 0;
    const rotateInterval = setInterval(() => {
      rot += 10;
      setRotation(rot);
    }, 16);

    // Pokéball flies toward Pokémon
    setBallPosition({
      bottom: pokemonPosition.top,
      left: pokemonPosition.left,
    });

    await new Promise((r) => setTimeout(r, 800));

    // Pokémon gets sucked in immediately
    setCaught(true);
    setMessage(`${pokemon.name} was pulled in!`);
    await new Promise((r) => setTimeout(r, 600));

    // Stop rolling
    clearInterval(rotateInterval);
    setRotation(0);

    // Pokéball shaking animation
    setIsShaking(true);
    for (let i = 1; i <= 3; i++) {
      setMessage(`Shake ${i}...`);
      await new Promise((r) => setTimeout(r, 600));
    }
    setIsShaking(false);

    const success = Math.random() < catchRate;

    if (success) {
      setMessage(`Gotcha! ${pokemon.name} was caught!`);
      await new Promise((r) => setTimeout(r, 1000));
      try {
        setMessage("Adding to your profile...");
        
        await addBuddyPokemon(pokemon, username);
        await new Promise((r) => setTimeout(r, 800));
        navigate("/profile", { state: { pokemon } });
      } catch (err) {
        console.error(err);
        setMessage("Error adding Pokémon. Please try again.");
      }
    } else {
      setMessage("Oh no! It broke free!");
      setCaught(false);
      setPokeballs((prev) => prev - 1);
      await new Promise((r) => setTimeout(r, 800));
    }

    // Reset Pokéball
    setBallPosition({ bottom: "20%", left: "50%" });
    setIsThrowing(false);
  };

  return (
    <div className="relative h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-300 to-green-300 overflow-hidden">
      {/* Pokémon */}
      <img
        src={pokemon.sprite_front}
        alt={pokemon.name}
        className={`absolute transition-all duration-500 ${
          caught ? "scale-0" : "scale-100"
        }`}
        style={{
          top: pokemonPosition.top,
          left: pokemonPosition.left,
          transform: "translate(-50%, -50%)",
          width: "150px",
        }}
      />

      {/* Pokéball */}
      {pokeballs > 0 && (
        <img
          src={pokeballImg}
          alt="Pokéball"
          onClick={throwPokeball}
          className={`absolute cursor-pointer transition-transform ${
            isThrowing ? "opacity-100" : "hover:scale-110"
          } ${isShaking ? "animate-shake" : ""}`}
          style={{
            bottom: ballPosition.bottom,
            left: ballPosition.left,
            width: "70px",
            height: "70px",
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transition: "all .8s ease-out",
          }}
        />
      )}

      {/* Status */}
      <div className="absolute top-4 left-4 text-xl font-bold text-left text-gray-800">
        {message || "Tap the Pokéball to catch!"}
        <div className="text-sm mt-2">Pokéballs left: {pokeballs}</div>
      </div>

      {/* Out of Pokéballs overlay */}
      {pokeballs <= 0 && !caught && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-white text-2xl">
          <p>You ran out of Pokéballs!</p>
          <button
            className="mt-4 bg-yellow-400 px-6 py-2 rounded-lg text-black font-semibold"
            onClick={() => navigate("/roam")}
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}
