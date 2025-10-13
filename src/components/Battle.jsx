import { useEffect, useState } from "react";
import { useTeam } from "./TeamContext";
import pokeball from "../assets/pokeball.png";
import { typeEffectiveness } from "../helper/typeEffectiveness";
import { motion } from "framer-motion";
import { addNarate } from "../services/pokemonService";
import { speakEleven, speakSynthesis } from "../services/ttsService";
import { typeColors } from "../helper/typeColor";
import BattleMessage from "./BattleMessage";

const Battle = ({ onNext }) => {
  const { team, setTeam, npcTeam, setNpcTeam, setInventory } = useTeam();

  const [npcChargeMove, setNpcChargeMove] = useState(null);
  const [playerChargeMove, setPlayerChargeMove] = useState(null);

  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [movesEnabled, setMovesEnabled] = useState(true);
  const [npcAttacking, setNpcAttacking] = useState(false);
  const [isTeamHit, setIsTeamHit] = useState(false);
  const [allowSwap, setAllowSwap] = useState(true);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [npcHit, setNpcHit] = useState(false);
  const [npcDamage, setNpcDamage] = useState(null);
  const [playerDamage, setPlayerDamage] = useState(null);

  const [battleMessage, setBattleMessage] = useState("");



  const currentPokemon = team[0];
  const reserve = team.slice(1);
  const currentNpc = npcTeam[0];
  const reserveNpc = npcTeam.slice(1);

  const HIDE_MOVE_TIMER = 3500;
  const INBETWEEN_HIT_TIME = 3000;
  const POKEMON_ATTACK_TIME = 2500;
  const BG_COLOR_TIME = 3200;



  const RECHARGE_MOVE_IDS = [
  63, 416, 314, 338, 321, 377, 437, 773, 764, 881
];

const CHARGING_MOVE_IDS = [
  76, 19, 91, 314, 338, 321 // Solar Beam, Fly, Dig, Blast Burn, Frenzy Plant, Hydro Cannon
];
  
  

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => { 
      if (!currentPokemon || !currentNpc) onNext(!currentPokemon ? "lose" : "win")
  },[currentNpc,currentPokemon, onNext])

  // helper: get a stat like speed
  const getStatValue = (poke, statName, fallback = 50) => {
    if (!poke) return fallback;
    if (poke[statName] !== undefined) return poke[statName];
    if (Array.isArray(poke.stats)) {
      const s = poke.stats.find((x) => x.name === statName || x.stat?.name === statName);
      return s ? s.base ?? s.base_stat ?? fallback : fallback;
    }
    return fallback;
  };



// Helper to get effective stat including stages
const getEffectiveStat = (pokemon, statName) => {
  const statEntry = pokemon.stats.find((s) => s.name.toLowerCase() === statName.toLowerCase());
  if (!statEntry) return 0;

  const stage = statEntry.stage ?? 0;
  const base = statEntry.base ?? 0;

  if (["accuracy", "evasion"].includes(statName.toLowerCase())) {
    return base * (1 + 0.25 * stage);
  } else {
    return stage >= 0
      ? Math.floor(base * (2 + stage) / 2)
      : Math.floor(base * 2 / (2 - stage));
  }
};

// Damage calculation helper with stats, stages, and type effectiveness
const calculateDamage = (attacker, defender, move) => {
  if (!move || move.power == null) return { damage: 0, effectiveness: "normal" };

  let hits = 1;
  if (move.max_hits && move.min_hits) {
    hits = Math.floor(Math.random() * (move.max_hits - move.min_hits + 1)) + move.min_hits;
  }

  // Determine which stats to use
  const attackStat = move.damage_class === "physical" ? "attack" : "special-attack";
  const defenseStat = move.damage_class === "physical" ? "defense" : "special-defense";

  const effectiveAttack = getEffectiveStat(attacker, attackStat);
  const effectiveDefense = getEffectiveStat(defender, defenseStat);

  // Type effectiveness
  const effectiveness = (defender.types ?? []).reduce(
    (mult, t) => mult * (typeEffectiveness[move.type]?.[t] ?? 1),
    1
  );

  // Core damage formula
  const baseDamage = (((2 * attacker.level / 5 + 2) * move.power * effectiveAttack / effectiveDefense) / 50 + 2);

  // Apply random factor and hits
  const damage = Math.floor(baseDamage * effectiveness * (Math.random() * 0.15 + 0.925) * hits);

  return { 
    damage,
    effectiveness: effectiveness < 1 ? "not very effective" : effectiveness > 1 ? "super effective" : "normal"
  };
};



  const capitalize = (str) => str?.charAt(0).toUpperCase() + str?.slice(1);

  const handleNarration = async (attacker, move, defender, outcome, hpRemaining) => {
    let narrationText = "";

    try {
      const response = await addNarate({
        attacker,
        move,
        defender,
        outcome,
        hpRemaining,
      });

      if (response?.message === "Failed to generate narration.") {
        throw new Error("Backend failed to generate AI narration");
      }

      narrationText = response.message;
    } catch (err) {
      console.warn("Using fallback narration:", err);
          // Make sure names are capitalized
      const outcomePhrase = outcome === "normal" ? "" : `It was ${outcome}.`;
      const attackerName = typeof attacker === "string" ? capitalize(attacker) : attacker.name;
      const defenderName = typeof defender === "string" ? capitalize(defender) : defender.name;

      narrationText = `${attackerName} used ${move} on ${defenderName}. ${outcomePhrase}`;
  }


  // }

  setBattleMessage(narrationText);
  // speakEleven(narrationText);
  // speakSynthesis(narrationText);
};




  // Choose best move for NPC by expected damage
  const chooseNpcMove = (npc, target) => {
    if (!npc?.moves?.length) return null;
    let best = npc.moves[0];
    let bestScore = -Infinity;
    for (const m of npc.moves) {
      const dmg = calculateDamage(npc, target, m).damage;
      if (dmg > bestScore) {
        bestScore = dmg;
        best = m;
      }
    }
    return best;
  };

const applyStatusBuffMove = async (attacker, defender, move, attackerIsPlayer) => {
  if (!move?.stat_changes?.length) return attacker;
  // Determine who the target is: self or opponent
  const targetIsSelf =
    move.category_name === "net-good-stats" ||
    move.category_name === "damage+raise" ||
    move.category_name === "damage+lower";
  const targetUpdater = targetIsSelf
    ? attackerIsPlayer
      ? setTeam
      : setNpcTeam
    : attackerIsPlayer
      ? setNpcTeam
      : setTeam;
  const target = targetIsSelf ? attacker : defender;

  let updatedTarget = { ...target };

  // Update state
  targetUpdater((prev) => {
    const copy = [...prev];
    const index = copy.findIndex((p) => p.id === target.id);
    if (index === -1) return prev;

    const current = copy[index];
    const updatedStats = [...current.stats]; // Keep it an array

    move.stat_changes.forEach(({ stat, change }) => {
      const statName = stat.name.toLowerCase();

      // Find the stat entry in the array
      let statEntry = updatedStats.find((s) => s.name === statName);
      if (!statEntry) {
        // Initialize if not present
        statEntry = { name: statName, base: 0, stage: 0 };
        updatedStats.push(statEntry);
      }

      // Update stage, clamped between -6 and 6
      statEntry.stage = Math.max(-6, Math.min(6, (statEntry.stage ?? 0) + change));
    });

    // Update target
    updatedTarget = { ...current, stats: updatedStats };
    copy[index] = updatedTarget;
    return copy;
  });


  // Display battle message
  const targetName = targetIsSelf ? attacker.name : defender.name;
  const messages = move.stat_changes.map(({ stat, change }) => {
    const desc = change > 0 ? "rose!" : "fell!";
    return `${targetName}'s used ${move.name} ${stat.name} ${desc}`;
  }).join(" ");
  await wait(1500);
  handleNarration(messages, "", "", "", "");
  // setBattleMessage(messages);
  await wait(1500);

  return updatedTarget;
};





  const performAttack = async (attacker, defenderSide, move, attackerIsPlayer) => {
    if (!attacker || !move || !defenderSide) return false;

      // setBattleMessage(`${attacker.name} used ${move.name}!`);
      
      // attacker.recharging = true;

    // Accuracy check
    const hitRoll = Math.random() * 100;
    if (hitRoll > (move.accuracy ?? 100)) {
      // Move missed
      await handleNarration(
        attacker.name,
        move.name,
        defenderSide.name,
        "missed",
        ((defenderSide.currentHP ?? defenderSide.maxHP) / defenderSide.maxHP) * 100
      );

      setBattleMessage(`${attacker.name}'s ${move.name} missed!`);

      if (attackerIsPlayer) {
        setPlayerAttacking(true);
        await wait(INBETWEEN_HIT_TIME);
        setPlayerAttacking(false);
      } else {
        setNpcAttacking(true);
        await wait(INBETWEEN_HIT_TIME);
        setNpcAttacking(false);
      }

      return false; // attack missed
    }

    // Move hits, calculate damage
    const { damage, effectiveness } = calculateDamage(attacker, defenderSide, move);
    const newHP = Math.max((defenderSide.currentHP ?? defenderSide.maxHP) - damage, 0);
    
    if (move.drain !== 0) {
    const drainAmount = Math.floor(damage * (Math.abs(move.drain) / 100));

    // setBattleMessage((prev) => {
    //   if (move.drain > 0) {
    //     return `${attacker.name} absorbed health!`;
    //   } else {
    //     return `${attacker.name} was hurt by recoil!`;
    //   }
    // });

    if (attackerIsPlayer) {
      setTeam((prev) => {
        const copy = [...prev];
        const current = copy[0];
        const maxHP = current.maxHP;
        let newHP = current.currentHP ?? maxHP;

        if (move.drain > 0) {
          // Heal for % of damage
          newHP = Math.min(newHP + drainAmount, maxHP);
        } else if(move.drain < 0) {
          // Recoil damage
          newHP = Math.max(newHP - drainAmount, 0);
        }

        copy[0] = { ...current, currentHP: newHP };
        return copy;
      });
    } else {
      setNpcTeam((prev) => {
        const copy = [...prev];
        const current = copy[0];
        const maxHP = current.maxHP;
        let newHP = current.currentHP ?? maxHP;

        if (move.drain > 0) {
          newHP = Math.min(newHP + drainAmount, maxHP);
        } else if(move.drain < 0) {
          newHP = Math.max(newHP - drainAmount, 0);
        }

        copy[0] = { ...current, currentHP: newHP };
        return copy;
      });
    }

    await wait(1000);
    }

    // Super-effective background flash
    if (effectiveness === "super effective") {
      changeBgColor(move.type);
    }

    await handleNarration(
      attacker.name,
      move.name,
      defenderSide.name,
      effectiveness,
      (newHP / defenderSide.maxHP) * 100
    );

    // --- Reduce PP and remove if 0 ---
    if (attacker.moves) {
      const moveIndex = attacker.moves.findIndex((m) => m.name === move.name);
      if (moveIndex !== -1) {
        attacker.moves[moveIndex].pp = Math.max((attacker.moves[moveIndex].pp ?? 1) - 1, 0);
        if (attacker.moves[moveIndex].pp === 0) {
          attacker.moves.splice(moveIndex, 1);
        }
      }
    }

    // Update team / npcTeam state
    if (attackerIsPlayer) {
      setTeam((prev) => {
        const copy = [...prev];
        copy[0] = { ...copy[0], moves: [...attacker.moves] };
        return copy;
      });
    } else {
      setNpcTeam((prev) => {
        const copy = [...prev];
        copy[0] = { ...copy[0], moves: [...attacker.moves] };
        return copy;
      });
    }

    // --- Apply damage and animate ---
    if (attackerIsPlayer) {
      setPlayerAttacking(true);
      await wait(POKEMON_ATTACK_TIME);
      setPlayerAttacking(false);

      setNpcHit(true);
      await wait(INBETWEEN_HIT_TIME);
      setNpcHit(false);

      setNpcDamage(damage);
      await wait(1000);
      setNpcDamage(null);

      if (newHP <= 0) {
        setBattleMessage(`${defenderSide.name} fainted!`);
        setInventory((prev) => [...prev, defenderSide]);
        setNpcTeam((prev) => prev.slice(1));
        return true;
      } else {
        setNpcTeam((prev) => {
          const copy = [...prev];
          if (copy[0]) copy[0] = { ...copy[0], currentHP: newHP };
          return copy;
        });
        return false;
      }
    } else {
      setNpcAttacking(true);
      await wait(POKEMON_ATTACK_TIME);
      setNpcAttacking(false);

      setIsTeamHit(true);
      await wait(INBETWEEN_HIT_TIME);
      setIsTeamHit(false);

      setPlayerDamage(damage);
      await wait(1000);
      setPlayerDamage(null);

      if (newHP <= 0) {
        setBattleMessage(`${defenderSide.name} fainted!`);
        setInventory((prev) => [...prev, defenderSide]);
        setTeam((prev) => prev.slice(1));
        return true;
      } else {
        setTeam((prev) => {
          const copy = [...prev];
          if (copy[0]) copy[0] = { ...copy[0], currentHP: newHP };
          return copy;
        });
        return false;
      }
    }
  };


  const handlePlayerAttack = async (playerMove) => {
  if (!currentPokemon || !currentNpc || !movesEnabled) return;
  setMovesEnabled(false);
  setAllowSwap(false);

  let npcMove = chooseNpcMove(currentNpc, currentPokemon);

  // ===== TURN ORDER =====
  const playerPrio = playerMove?.priority ?? 0;
  const npcPrio = npcMove?.priority ?? 0;
  let playerFirst;
  if (playerPrio > npcPrio) playerFirst = true;
  else if (playerPrio < npcPrio) playerFirst = false;
  else {
    const playerSpeed = getStatValue(currentPokemon, "speed", 50);
    const npcSpeed = getStatValue(currentNpc, "speed", 50);
    playerFirst = playerSpeed >= npcSpeed;
  }
  let npcFainted = false;
  let playerFainted = false;

  // ===== EXECUTION =====
    if (playerFirst) {

      if (
        playerMove.category_name === "net-good-stats") {
        // ✅ Apply stat changes only (no damage)
        await applyStatusBuffMove(currentPokemon, currentNpc, playerMove, true);
      } else {
        // ✅ Only do damage for non-status moves
        npcFainted = await performAttack(currentPokemon, currentNpc, playerMove, true);
        if (playerMove.category_name === "damage+raise"
          || playerMove.category_name === "damage+lower")
          await applyStatusBuffMove(currentPokemon, currentNpc, playerMove, true);
      }
      if (!npcFainted) {
        await wait(3000);
        if (npcMove.category_name === "net-good-stats") { 
          await applyStatusBuffMove(currentNpc, currentPokemon, npcMove, false);
        } else {
          playerFainted = await performAttack(currentNpc, currentPokemon, npcMove, false);
          if (npcMove.category_name === "damage+raise"
          || npcMove.category_name === "damage+lower")
            await applyStatusBuffMove(currentNpc, currentPokemon, npcMove, false);
        }
      } else {
        setAllowSwap(true);
      }
    } else {
      if (npcMove.category_name === "net-good-stats") {
        await applyStatusBuffMove(currentNpc, currentPokemon, npcMove, false);
      } else {
        playerFainted = await performAttack(currentNpc, currentPokemon, npcMove, false);
        if (npcMove.category_name === "damage+raise"
          || npcMove.category_name === "damage+lower")
          await applyStatusBuffMove(currentNpc, currentPokemon, npcMove, false);
      }
      if (!playerFainted) {
        await wait(3000);
        if (playerMove.category_name === "net-good-stats") { 
          await applyStatusBuffMove(currentPokemon, currentNpc, playerMove, true);
        } else {
          playerFainted = await performAttack(currentPokemon, currentNpc, playerMove, true);
          if (playerMove.category_name === "damage+raise"
          || playerMove.category_name === "damage+lower")
            await applyStatusBuffMove(currentPokemon, currentNpc, playerMove, true);
        }
      } else {
      setAllowSwap(true);
    }
  }

  await wait(HIDE_MOVE_TIMER);
  setMovesEnabled(true);
  setAllowSwap(true);
};


  // Swap Pokémon (by swapping array indices)
  const handleSwapPokemon = async (idx) => {
    await wait(1000); // debounce
    if (!allowSwap || !movesEnabled) return;
    setAllowSwap(false);
    setMovesEnabled(false);
    const previosPokemon = currentPokemon.name;
    setTeam((prev) => {
      const newTeam = [...prev];
      [newTeam[0], newTeam[idx + 1]] = [newTeam[idx + 1], newTeam[0]];
      return newTeam;
    });
    const newPokemon = team[idx + 1].name;
    // await speakSynthesis(`Come back, ${previosPokemon}! Go, ${newPokemon}!`);
    // NPC gets a free attack after swap
    await wait(3000);
    if (npcTeam.length > 0) {
      const npcMove = chooseNpcMove(currentNpc, currentPokemon);
      if (npcMove) await performAttack(currentNpc, currentPokemon, npcMove, false);
    }

    await wait(HIDE_MOVE_TIMER);
    setMovesEnabled(true);
    setAllowSwap(true);
  };


    // Animate background change
  const changeBgColor = (type) => {
    const color = typeColors[type] || "#FFFFFF";
    setBgColor(color);

    // revert back after 2 seconds
    setTimeout(() => {
      setBgColor("#FFFFFF");
    }, BG_COLOR_TIME);
  };

  return (
    <div
      className="flex flex-col h-screen relative"
      style={{
        backgroundColor: bgColor,
        transition: "background-color 2s ease-in-out",
      }}>
      {/* NPC Team Icons */}
      <div className="absolute top-4 left-4 flex space-x-2">
        {reserveNpc.map((poke, idx) => (
          <img key={idx} src={pokeball} alt={poke.name} className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
        ))}
      </div>

      {/* Top Half: Current NPC */}
      <div className="flex flex-row justify-center items-center mt-8 gap-16">
        <div className="text-left mb-2">
          <h3 className="text-xl font-bold">{currentNpc?.name}</h3>
          <p>Level {currentNpc?.level || 50}</p>
          <div className="w-full max-w-xs h-4 bg-gray-300 rounded-full mt-1">
            <div
              className="h-4 bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentNpc?.currentHP / currentNpc?.maxHP) * 100 || 100}%` }}
            />
              {npcDamage && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -20 }}
                transition={{ duration: 1 }}
                className="absolute text-red-500 font-bold text-lg"
              >
                -{npcDamage}
              </motion.div>
            )}
          </div>
        </div>

        <motion.img
          src={currentNpc?.sprite_front}
          alt={currentNpc?.name}
          className="w-32 h-32 object-contain sm:w-40 sm:h-40 ml-8"
          style={{ opacity: npcHit ? 0.25 : 1, transition: "opacity 0.1s ease-in-out" }}
          animate={npcAttacking ? { x: -50, y: 50 } : { x: 0 }}
          transition={{ duration: 0.5, yoyo: 1 }}
        />
      </div>

      {/* Bottom Half: Player */}
      <div className="flex flex-col justify-end items-center mt-8">
        <div className="flex flex-row items-center gap-16">
          <motion.img
            src={currentPokemon?.sprite_back}
            alt={currentPokemon?.name}
            className="w-32 h-32 object-contain sm:w-40 sm:h-40"
            style={{ opacity: isTeamHit ? 0.25 : 1, transition: "opacity 0.1s ease-in-out" }}
            animate={playerAttacking ? { x: 50, y: -50 } : { x: 0, y: 0 }}
            transition={{ duration: 0.5 }}
          />
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mt-2">{currentPokemon?.name}</h3>
            <p>Level {currentPokemon?.level || 50}</p>
            <div className="w-full max-w-xs h-4 bg-gray-300 rounded-full mt-1">
              <div
                className="h-4 bg-green-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(currentPokemon?.currentHP / currentPokemon?.maxHP) * 100}%`
                }}
              />
                {playerDamage && (
                  <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -20 }}
                    transition={{ duration: 1 }}
                    className="absolute text-red-500 font-bold text-lg"
                  >
                    -{playerDamage}
                  </motion.div>
                )}
            </div>
          </div>
        </div>

        {/* Moveset */}
        <div className={`grid grid-cols-2 gap-4 w-full max-w-md mt-2 mb-4 ${movesEnabled ? "" : "hidden"}`}>
          {currentPokemon?.moves?.map((move, idx) => (
            <button
              key={idx}
              onClick={() => movesEnabled && handlePlayerAttack(move)}
              className="bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {move.name}
            </button>
          ))}
        </div>
        {/* Player Team Icons */}
        {allowSwap &&
          <div className="flex space-x-2 mb-4">
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
        {!movesEnabled &&
          <div className="w-half border-2 border-black bg-white text-black p-2 text-center text-sm font-mono whitespace-pre-line rounded-md">
            {battleMessage}
          </div>
        }
      </div>
    </div>
  );
};

export default Battle;
