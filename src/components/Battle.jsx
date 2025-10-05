import { useEffect, useState } from "react";
import { useTeam } from "./TeamContext";
import pokeball from "../assets/pokeball.png";
import { typeEffectiveness } from "../helper/typeEffectiveness";
import { motion } from "framer-motion";

const Battle = () => {
  const { team, setTeam, npcTeam, setNpcTeam, setInventory } = useTeam();

  // const [currentPokemon, setCurrentPokemon] = useState(null);
  // const [currentNpc, setCurrentNpc] = useState(null);
  const [movesEnabled, setMovesEnabled] = useState(true);
  const [npcAttacking, setNpcAttacking] = useState(false);
  const [isTeamHit, setIsTeamHit] = useState(false);
  const [allowSwap, setAllowSwap] = useState(true);

  let currentPokemon = team[0];
  let reserve = team.slice(1);
  let currentNpc = npcTeam[0];
  let reserveNpc = npcTeam.slice(1);

  const HIDE_MOVE_TIMER = 3000;

  // helper wait function (returns a promise)
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Initialize current Pokémon and remove from arrays
  useEffect(() => {
    if (team.length > 0 && !currentPokemon) {
      const [first, ...rest] = team;
      setCurrentPokemon(first);
      setTeam(rest);
    }

    if (npcTeam.length > 0 && !currentNpc) {
      const [firstNpc, ...restNpc] = npcTeam;
      setCurrentNpc(firstNpc);
      setNpcTeam(restNpc);
    }
  }, [team, npcTeam, currentPokemon, currentNpc, setTeam, setNpcTeam]);

  if (!currentPokemon || !currentNpc) return <p>Loading battle...</p>;

  // Swap current Pokémon
  const handleSwapPokemon = async (idx) => {
    setAllowSwap(false);
  setMovesEnabled(false);

  setTeam((prev) => {
    const newTeam = [...prev];
    [newTeam[0], newTeam[idx + 1]] = [newTeam[idx + 1], newTeam[0]];
    return newTeam;
  });

  await wait(3000);
  await handleNpcAttack();

  await wait(HIDE_MOVE_TIMER);
  setMovesEnabled(true);
};


  // Calculate type effectiveness
  const getEffectiveness = (moveType, targetTypes) =>
    targetTypes.reduce(
      (multiplier, targetType) =>
        multiplier * (typeEffectiveness[moveType]?.[targetType] ?? 1),
      1
    );

  // Choose best move for NPC
  const chooseNpcMove = (npc, targetPokemon) => {
    if (!npc?.moves?.length) return null;
    let bestMove = npc.moves[0];
    let bestMultiplier = 0;
    npc.moves.forEach((move) => {
      const score = move.power * getEffectiveness(move.type, targetPokemon.types);
      if (score > bestMultiplier) {
        bestMultiplier = score;
        bestMove = move;
      }
    });
    return bestMove;
  };

  const handleNpcAttack = async () => {
    if (!currentNpc || !currentPokemon) return;
    setNpcAttacking(true);

    // NPC attack animation (move forward)
    await wait(500);

    // Flicker effect for currentPokemon
    setIsTeamHit(true);
    await wait(500);
    setIsTeamHit(false);

    // Calculate damage
    const npcMove = chooseNpcMove(currentNpc, currentPokemon);
    if (!npcMove) {
      setNpcAttacking(false);
      return;
    }

    const damage = npcMove.power * (Math.random() * 0.15 + 0.925);
    const newHP = Math.max(currentPokemon.currentHP - damage, 0);

    if (newHP <= 0) {
      // Current Pokémon faints
      setInventory((prev) => [...prev, currentPokemon]);
      setTeam((prev) => prev.slice(1)); // remove fainted
      setAllowSwap(true);
    } else {
      // Update HP for active Pokémon
      setTeam((prev) => {
        const newTeam = [...prev];
        newTeam[0] = { ...newTeam[0], currentHP: newHP };
        return newTeam;
      });
    }

    setNpcAttacking(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b relative">
      {/* NPC Team Icons */}
      <div className="absolute top-4 left-4 flex space-x-2">
        {reserveNpc.map((poke, idx) => (
          <img key={idx} src={pokeball} alt={poke.name} className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
        ))}
      </div>

      {/* Top Half: Current NPC */}
      <div className="flex flex-row justify-center items-center mt-8 gap-16">
        <div className="text-left mb-2">
          <h3 className="text-xl font-bold">{currentNpc.name}</h3>
          <p>Level {currentNpc.level || 50}</p>
          <div className="w-full max-w-xs h-4 bg-gray-300 rounded-full mt-1">
            <div
              className="h-4 bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentNpc.currentHP / currentNpc.maxHP) * 100 || 100}%` }}
            />
          </div>
        </div>

        <motion.img
          src={currentNpc.sprite_front}
          alt={currentNpc.name}
          className="w-32 h-32 object-contain sm:w-40 sm:h-40 ml-8"
          animate={npcAttacking ? { x: -50, y: 50 } : { x: 0 }}
          transition={{ duration: 0.5, yoyo: 1 }}
          onAnimationComplete={() => handleNpcAttack}
        />
      </div>

      {/* Bottom Half: Player */}
      <div className="flex flex-col justify-end items-center mt-8">
        <div className="flex flex-row items-center gap-16">
          <img
            src={currentPokemon.sprite_back}
            alt={currentPokemon.name}
            className="w-32 h-32 object-contain sm:w-40 sm:h-40"
            style={{ opacity: isTeamHit ? 0.25 : 1, transition: "opacity 0.1s ease-in-out" }}
          />
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mt-2">{currentPokemon.name}</h3>
            <p>Level {currentPokemon.level || 50}</p>
            <div className="w-full max-w-xs h-4 bg-gray-300 rounded-full mt-1">
              <div
                className="h-4 bg-green-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(currentPokemon.currentHP / currentPokemon.maxHP) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Moveset */}
        <div className={`grid grid-cols-2 gap-4 w-full max-w-md mt-2 mb-4 ${movesEnabled ? "" : "hidden"}`}>
          {currentPokemon.moves?.map((move, idx) => (
            <button key={idx} className="bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition">
              {move.name}
            </button>
          ))}
        </div>

        {/* Player Team Icons */}
        {allowSwap &&
        <div className={`flex space-x-2 mb-4`}>
          {reserve.map((poke, idx) => (
            <img
              key={idx}
              src={poke.image}
              alt={poke.name}
              className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer"
              onClick={() => movesEnabled && handleSwapPokemon(idx)}
            />
          ))}
          </div>
        }
      </div>
    </div>
  );
};

export default Battle;
