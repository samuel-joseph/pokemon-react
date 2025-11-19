import { useEffect, useState } from "react";
import { useTeam } from "./TeamContext";
import pokeball from "../assets/pokeball.png";
import { typeEffectiveness } from "../helper/typeEffectiveness";
import { motion } from "framer-motion";
import { addNarate, getMega } from "../services/pokemonService";
import { speakEleven, speakSynthesis } from "../services/ttsService";
import { typeColors } from "../helper/typeColor";
import BattleMessage from "./BattleMessage";
import Mega from "./Mega";
import { calculateHP } from "../helper/calculateHP.jsx";
import groundImage from "../assets/battle-background.png";



const Battle = ({ onNext, mode = "stadium" }) => {
  const { team, setTeam, npcTeam, setNpcTeam, setInventory } = useTeam();

  const [npcChargeMove, setNpcChargeMove] = useState(null);
  const [playerChargeMove, setPlayerChargeMove] = useState(null);

  // const [bgColor, setBgColor] = useState("#FFFFFF");
  const [movesEnabled, setMovesEnabled] = useState(true);
  const [npcAttacking, setNpcAttacking] = useState(false);
  const [isTeamHit, setIsTeamHit] = useState(false);
  const [allowSwap, setAllowSwap] = useState(true);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [npcHit, setNpcHit] = useState(false);
  const [npcDamage, setNpcDamage] = useState(null);
  const [playerDamage, setPlayerDamage] = useState(null);
  const [showMegaAnimation, setShowMegaAnimation] = useState(false);
  const [showMegaPrompt, setShowMegaPrompt] = useState(false);

  const [playerMoveFx, setPlayerMoveFx] = useState(null);
  const [npcMoveFx, setNpcMoveFx] = useState(null);


  const [playerCurrentMove, setPlayerCurrentMove] = useState(null);
  const [npcCurrentMove, setNpcCurrentMove] = useState(null);



  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [battleMessage, setBattleMessage] = useState("");
  
  const [allowNpcMega, setAllowNpcMega] = useState(true);
  const [allowUserMage, setAllowUserMega] = useState(true);

  const [defaultImage, setDefaultImage] = useState("");
  const [megaImage, setMegaImage] = useState("");


  const currentPokemon = team[0];
  const reserve = team.slice(1);
  const currentNpc = npcTeam[0];
  const reserveNpc = npcTeam.slice(1);

  const HIDE_MOVE_TIMER = 1500; 
  const INBETWEEN_HIT_TIME = 500;
  const POKEMON_ATTACK_TIME = 1500;
  const BG_COLOR_TIME = 1500;
  const FAINTED_DELAY = 500;
  const MESSAGE_DELAY = 1000;

  // const HIDE_MOVE_TIMER = 50; 
  // const INBETWEEN_HIT_TIME = 50;  
  // const POKEMON_ATTACK_TIME = 50; 
  // const BG_COLOR_TIME = 50; 
  // const FAINTED_DELAY = 50;
  // const MESSAGE_DELAY = 50;
  //for test



  const RECHARGE_MOVE_IDS = [
  63, 416, 314, 338, 321, 377, 437, 773, 764, 881
];

const CHARGING_MOVE_IDS = [
  76, 19, 91, 314, 338, 321 // Solar Beam, Fly, Dig, Blast Burn, Frenzy Plant, Hydro Cannon
];
  
  
  const playerCry = new Audio(currentPokemon?.cries?.latest);
  const npcCry = new Audio(currentNpc?.cries?.latest);

  playerCry.volume = 0.3;
  npcCry.volume = 0.3;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // const playRoar = (isPlayer) => {
  //   const pokemon_cry = isPlayer ? currentPokemon.cries.latest : currentNpc.cries.latest
  //   const roar = new Audio(pokemon_cry);
  //   roar.volume = .3;
  //   return roar.play();
  // }

  // useEffect(() => {
  //   playRoar(true);
  //   setTimeout(()=> playRoar(false),5000)
  // },[])



  const getTimeGradient = () => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    return "linear-gradient(to bottom, #FFEE88, #88C3FF)"; // Morning
  } else if (hour >= 12 && hour < 17) {
    return "linear-gradient(to bottom, #4FACFE, #00F2FE)"; // Noon
  } else if (hour >= 17 && hour < 20) {
    return "linear-gradient(to bottom, #FE9365, #FEB47B)"; // Sunset
  } else {
    return "linear-gradient(to bottom, #1E3C72, #2A5298)"; // Night
  }
};
  
  const [bgColor, setBgColor] = useState(getTimeGradient());
  const [nextBg, setNextBg] = useState(null);
  const [fade, setFade] = useState(false);

useEffect(() => {
  const updateColor = () => setBgColor(getTimeGradient());
  updateColor();

  const interval = setInterval(updateColor, 300000); // Update every 5 minutes
  return () => clearInterval(interval);
}, []);

  const unlockAudio = () => {
    if (audioUnlocked) return;
    const audio = new Audio();
    audio.play().catch(() => {}); // attempt silent play
    setAudioUnlocked(true);
    console.log("🔓 Audio unlocked for mobile.");
  };

  const playRoar = (isPlayer) => {
    // if (!pokemonCry) return;
    // const roar = new Audio(pokemonCry);
    // roar.volume = 0.3;
    // roar.play().catch((err) => console.warn("Audio play blocked:", err));
    if (!audioUnlocked) return;
    (isPlayer ? playerCry : npcCry).play().catch((err) => console.warn(err));
  };
  

  useEffect(() => {
    const handleBattleStart = () => {
      unlockAudio();
      // playRoar(team[0]?.cries?.latest);
      playRoar(true)
      setTimeout(() => playRoar(false), 4000);
    };

    handleBattleStart()
  },[])

  // call on first user action (e.g. clicking "Fight" or "Start")
  useEffect(() => {
    document.body.addEventListener("click", unlockAudio, { once: true });
    return () => document.body.removeEventListener("click", unlockAudio);
  }, []);

  useEffect(() => {
  if (allowUserMage && currentPokemon?.canMega) {
    setShowMegaPrompt(true);
  }
  }, [currentPokemon]);


  useEffect(() => { 
    if (!currentPokemon || !currentNpc) {
      if (mode === "training") {
        onNext("training-complete");
      } else if (mode === "capture") {
        onNext("capture-complete");
      } else {
        onNext(!currentPokemon ? "lose" : "win");
      }
    }
  const applyMegaForm = async () => {
    if (!currentNpc?.canMega) return;

    try {
      const megaForm = await getMega(currentNpc.name); // fetch mega form data
      if (!megaForm) return;
      const defaultImg = currentNpc.sprite_front
      setDefaultImage(defaultImg)
      setMegaImage(megaForm.sprite_front)
      setNpcTeam((prevTeam) => {
        const copy = [...prevTeam];
        copy[0] = {
          ...copy[0], // keep existing properties like level, moves, status, etc.
          name: megaForm.mega_name,
          currentHP: calculateHP(megaForm.stats[0].base, currentNpc.level),
          maxHP: calculateHP(megaForm.stats[0].base, currentNpc.level),
          sprite_back: megaForm.sprite_back,
          sprite_front: megaForm.sprite_front,
          stats: megaForm.stats,
          types: megaForm.types,
          canMega: false
        };
        return copy;
      });
      handleMegaEvolution(false)
      await wait(2000);
      // playRoar(currentNpc.cries?.latest);
      playRoar(false);
    } catch (err) {
      console.error("Failed to apply NPC Mega:", err);
    }
  };

  if(allowNpcMega) applyMegaForm();
  }, [currentNpc, currentPokemon, onNext, allowNpcMega])

  const handleMegaEvolution = (isPlayer) => {
    setShowMegaAnimation(true);
    setShowMegaPrompt(false)
    isPlayer ? setAllowUserMega(false) : setAllowNpcMega(false)
  };

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



  const getMoveFx = (type) => 
  new URL(`../assets/moveFX/${type}.png`, import.meta.url).href;



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

  // Add special case for Greninja Ash's Water Shuriken
  const bonus_min = attacker.name === "Greninja Ash" && move.name.toLowerCase() === "water-shuriken" ? 1 : 0;

  if (move.max_hits && move.min_hits) {
    const minHits = move.min_hits + bonus_min;
    hits = Math.floor(Math.random() * (move.max_hits - minHits + 1)) + minHits;
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
      const attackerName = typeof attacker === "string" ? capitalize(attacker) : attacker.name;
      const defenderName = typeof defender === "string" ? capitalize(defender) : defender.name;

      const KO = hpRemaining <= 0 ? `${defenderName} fainted!` : ""

      narrationText = `${attackerName} used ${move}. ${KO}`;
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
  await wait(MESSAGE_DELAY);
  handleNarration(messages, "", "", "", "");
  // setBattleMessage(messages);
  await wait(MESSAGE_DELAY);

  return updatedTarget;
};
  
  
  
  
  const applyStatusEffect = (pokemon, move) => {
  if (!move.ailment_name || pokemon.status) return; // no status move or already affected

    const ailment = move.ailment_name.toLowerCase();
    const damage_ailment = move.category_name === "damage+ailment";
    const roll = Math.random() * 100;

  // Default chance: 100% if none specified
  const chance = move.ailment_chance ?? 100;

  if (damage_ailment && roll > chance) return; 
  
  switch (ailment) {
    case "paralysis":
      pokemon.status = "paralyzed";
      pokemon.speed = Math.floor(pokemon.speed * 0.5);
      break;

    case "burn":
      pokemon.status = "burned";
      pokemon.attack = Math.floor(pokemon.attack * 0.5);
      break;

    case "poison":
      pokemon.status = "poisoned";
      break;

    case "badly-poisoned":
      pokemon.status = "badly poisoned";
      pokemon.toxicCounter = 1;
      break;

    case "sleep":
      pokemon.status = "asleep";
      pokemon.sleepTurns = Math.floor(Math.random() * 3) + 1;
      break;

    case "freeze":
      pokemon.status = "frozen";
      break;

    default:
      break;
  }
};

  
  
  
const getAttackAnimation = (move, isPlayer) => {
  if (!move?.damage_class) return {};

  // Physical = aggressive dash
  if (move.damage_class === "physical") {
    return {
      x: isPlayer ? 100 : -100, // move toward opponent
      y: isPlayer ? -110 : 120,
      duration: 0.3,
    };
  }

  // Special = small float forward
  if (move.damage_class === "special") {
    return {
      x: isPlayer ? 30 : -30,
      y: isPlayer ? -20 : 20,
      duration: 0.4,
    };
  }

  // Status or none = no movement
  return { x: 0, y: 0, duration: 0.2 };
};




  const performAttack = async (attacker, defenderSide, move, attackerIsPlayer) => {
    if (!attacker || !move || !defenderSide) return false;

    

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

    // --- Apply ailment if move has one ---
    if (move.damage_class === "status" && move.ailment_name) {
      if (attackerIsPlayer) {
        setNpcTeam((prev) => {
          const copy = [...prev];
          const current = copy[0];
          const updated = { ...current };
          applyStatusEffect(updated, move);
          copy[0] = updated;
          return copy;
        });
      } else {
        setTeam((prev) => {
          const copy = [...prev];
          const current = copy[0];
          const updated = { ...current };
          applyStatusEffect(updated, move);
          copy[0] = updated;
          return copy;
        });
      }
    }
    // Move hits, calculate damage
    const { damage, effectiveness } = calculateDamage(attacker, defenderSide, move);
    const newHP = Math.max((defenderSide.currentHP ?? defenderSide.maxHP) - damage, 0);
    
    if (move.drain !== 0) {
    const drainAmount = Math.floor(damage * (Math.abs(move.drain) / 100));

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
      // changeBgColor(move.type);
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

    const attackAnim = getAttackAnimation(move, attackerIsPlayer);
    
    // --- Apply damage and animate ---
    if (attackerIsPlayer) {
      setPlayerMoveFx(getMoveFx(move.type));
      setPlayerAttacking(true);
      await wait(attackAnim.duration * 1000);
      await wait(POKEMON_ATTACK_TIME);
      setPlayerAttacking(false);
      setPlayerMoveFx(null);

      setNpcHit(true);
      await wait(INBETWEEN_HIT_TIME);
      setNpcHit(newHP<=0);

      setNpcDamage(damage);
      await wait(1000);
      setNpcDamage(null);
      setNpcTeam((prev) => {
        const copy = [...prev];
        if (copy[0]) copy[0] = { ...copy[0], currentHP: Math.max(newHP,0) };
        return copy;
      });
      await wait(1000)
      if (newHP <= 0) {
          setNpcTeam((prev) => prev.slice(1));
          setNpcHit(false)
          setAllowSwap(true);
          // await wait(500);
          // playRoar(currentNpc.cries?.latest);
          playRoar(false)
        return true
      }
      else return false
    } else {
      setNpcMoveFx(getMoveFx(move.type));
      setNpcAttacking(true);
      await wait(attackAnim.duration * 1000);
      await wait(POKEMON_ATTACK_TIME);
      setNpcAttacking(false);
      setNpcMoveFx(null)

      setIsTeamHit(true);
      await wait(INBETWEEN_HIT_TIME);
      setIsTeamHit(newHP<=0);

      setPlayerDamage(damage);
      // await wait(1000);
      setPlayerDamage(null);
      setTeam((prev) => {
        const copy = [...prev];
        if (copy[0]) copy[0] = { ...copy[0], currentHP: Math.max(newHP,0) };
        return copy;
      });
      await wait(1000)
      if (newHP <= 0) {
          setInventory((prev) => [...prev, defenderSide]);
          setTeam((prev) => prev.slice(1));
          setIsTeamHit(false)
          setAllowSwap(true);
          // await wait(500);
        // playRoar(currentPokemon.cries?.latest); 
        playRoar(true)
        return true
      }
      else return false
    }
  };


  const handlePlayerAttack = async (playerMove) => {
  if (!audioUnlocked) return; 
  if (!currentPokemon || !currentNpc || !movesEnabled) return;
  setMovesEnabled(false);
  setAllowSwap(false);

    let npcMove = chooseNpcMove(currentNpc, currentPokemon);
    let npcFainted = false;
    let playerFainted = false;
    const playerStatus = processStatusEffects(currentPokemon, true);
    const npcStatus = processStatusEffects(currentNpc, false);

    setPlayerCurrentMove(playerMove);
    setNpcCurrentMove(npcMove);

    // If fainted from poison/burn etc., handle faint
    if (playerStatus.fainted) {
      setTeam((prev) => prev.slice(1));
      return;
    }
    if (npcStatus.fainted) {
      setNpcTeam((prev) => prev.slice(1));
      return;
    }

    // Skip turn if paralyzed/asleep/frozen
    if (playerStatus.skip) {
      await wait(FAINTED_DELAY);
      playerFainted = false;
      npcFainted = await performAttack(currentNpc, currentPokemon, npcMove, false);

      await wait(HIDE_MOVE_TIMER);
      setMovesEnabled(true);
      // setAllowSwap(true);
      setBattleMessage("");
      return;
    }

    if (npcStatus.skip) {
      await wait(FAINTED_DELAY);
      npcFainted = false;
      playerFainted = await performAttack(currentPokemon, currentNpc, playerMove, true);

      await wait(HIDE_MOVE_TIMER);
      setMovesEnabled(true);
      // setAllowSwap(true);
      setBattleMessage("");
      return;
    }

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

      playerFainted = applyStatusEffectsEndOfTurn(currentPokemon, true);
      
      if (!npcFainted && !playerFainted) {
        await wait(FAINTED_DELAY);
        if (npcMove.category_name === "net-good-stats") { 
          await applyStatusBuffMove(currentNpc, currentPokemon, npcMove, false);
        } else {
          playerFainted = await performAttack(currentNpc, currentPokemon, npcMove, false);
          if (npcMove.category_name === "damage+raise"
          || npcMove.category_name === "damage+lower")
            await applyStatusBuffMove(currentNpc, currentPokemon, npcMove, false);
        }
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
      npcFainted = applyStatusEffectsEndOfTurn(currentNpc, false);
      if (!playerFainted && !npcFainted) {
        await wait(FAINTED_DELAY);
        if (playerMove.category_name === "net-good-stats") { 
          await applyStatusBuffMove(currentPokemon, currentNpc, playerMove, true);
        } else {
          playerFainted = await performAttack(currentPokemon, currentNpc, playerMove, true);
          if (playerMove.category_name === "damage+raise"
          || playerMove.category_name === "damage+lower")
            await applyStatusBuffMove(currentPokemon, currentNpc, playerMove, true);
        }
      } 
  }

  await wait(HIDE_MOVE_TIMER);
  setMovesEnabled(true);
  // setAllowSwap(true);
  setBattleMessage("");
  };


  const applyStatusEffectsEndOfTurn = (pokemon, isPlayer) => {
    if (!pokemon?.status) return false;
    

  const damage =
    pokemon.status === "burned"
      ? Math.floor(pokemon.maxHP / 16)
      : pokemon.status === "poisoned"
      ? Math.floor(pokemon.maxHP / 8)
      : pokemon.status === "badly poisoned"
      ? Math.floor((pokemon.maxHP / 16) * (pokemon.toxicCounter || 1))
          : 0;

  if (damage === 0) return false;

  const updated = {
    ...pokemon,
    currentHP: Math.max(0, pokemon.currentHP - damage),
  };
    
    console.log(`${updated.name} is hurt by ${pokemon.status} damage is ${damage}!`);


  const fainted = updated.currentHP === 0;

  if (isPlayer) {
    setTeam((prev) => {
      const copy = [...prev];
      copy[0] = updated;
      return copy;
    });
  } else {
    setNpcTeam((prev) => {
      const copy = [...prev];
      copy[0] = updated;
      return copy;
    });
  }

  return fainted;
};

  


const processStatusEffects = (pokemon, isPlayer = true) => {
  if (!pokemon.status) return { skip: false, fainted: false };

  const updated = { ...pokemon };

  switch (updated.status) {
    case "paralyzed":
      if (Math.random() < 0.25) {
        setBattleMessage(`${updated.name} is paralyzed! It can’t move!`);
        return { skip: true, fainted: false };
      }
      break;
    case "asleep":
      if (updated.sleepTurns > 0) {
        updated.sleepTurns--;
        setBattleMessage(`${updated.name} is fast asleep...`);
        return { skip: true, fainted: false };
      } else {
        updated.status = null; // woke up
      }
      break;
    case "frozen":
      if (Math.random() < 0.2) {
        updated.status = null;
        setBattleMessage(`${updated.name} thawed out!`);
      } else {
        setBattleMessage(`${updated.name} is frozen solid!`);
        return { skip: true, fainted: false };
      }
      break;
    default:
      break;
  }

  const fainted = updated.currentHP <= 0;

  // Update the team state
  if (isPlayer) {
    setTeam((prev) => {
      const copy = [...prev];
      copy[0] = updated;
      return copy;
    });
  } else {
    setNpcTeam((prev) => {
      const copy = [...prev];
      copy[0] = updated;
      return copy;
    });
  }

  return { skip: false, fainted };
};



const handleSwapPokemon = async (idx) => {
  if (!allowSwap || !movesEnabled) return;

  setAllowSwap(false);
  setMovesEnabled(false);

  const prevPokemon = currentPokemon;
  let newPokemonName;

  setTeam((prevTeam) => {
    const newTeam = [...prevTeam];
    const swapIndex = idx + 1;

    // Swap Pokémon
    [newTeam[0], newTeam[swapIndex]] = [newTeam[swapIndex], newTeam[0]];
    newPokemonName = newTeam[0]?.name; // capture new Pokémon
    return newTeam;
  });

  // Wait for React to commit the new team state
  await new Promise((resolve) => setTimeout(resolve, 50));

  setBattleMessage(`Come back, ${prevPokemon.name}! Go, ${newPokemonName}!`);

  // Wait for message to appear before NPC attack
  await wait(MESSAGE_DELAY);

  // Restore state after everything resolves
  await wait(HIDE_MOVE_TIMER);
  setMovesEnabled(true);
  // setAllowSwap(true);
};



    // Animate background change
  // const changeBgColor = (type) => {
  //   const color = typeColors[type] || bgColor;
  //   setBgColor(color);

  //   // revert back after 2 seconds
  //   setTimeout(() => {
  //     setBgColor(bgColor);
  //   }, BG_COLOR_TIME);
  // };


const changeBgColor = (type) => {
  const original = bgColor; // save current gradient
  const newColor = typeColors[type] || original;

  setNextBg(newColor);
  setFade(true);

  // Fade in the new gradient
  setTimeout(() => {
    setBgColor(newColor); // set new gradient
    setNextBg(null);
    setFade(false);
  }, BG_COLOR_TIME); // duration of fade

  // Revert back to original after BG_COLOR_TIME
  setTimeout(() => {
    setNextBg(original);
    setFade(true);

    setTimeout(() => {
      setBgColor(original);
      setNextBg(null);
      setFade(false);
    }, BG_COLOR_TIME);
  }, BG_COLOR_TIME);
};

  const handleUserMegaEvolve = async () => {
  try {
    setShowMegaPrompt(false);

    const preMega = currentPokemon.sprite_front;
    const hpLost = currentPokemon.maxHP - currentPokemon.currentHP
    const hpLostPercentage = (hpLost / currentPokemon.maxHP) * 100;
    const reduceHp = (hpLostPercentage/100) * currentPokemon.maxHP
    setDefaultImage(preMega);

    const newData = await getMega(currentPokemon.name);
    setMegaImage(newData.sprite_front);

    setTeam((prevTeam) => {
      const copy = [...prevTeam];
      copy[0] = {
        ...copy[0],
        name: newData.mega_name,
        currentHP: Math.max(calculateHP(newData.stats[0].base,currentPokemon.level) - reduceHp, 0),
        maxHP: calculateHP(newData.stats[0].base, currentPokemon.level),
        sprite_back: newData.sprite_back,
        sprite_front: newData.sprite_front,
        stats: newData.stats,
        types: newData.types,
        canMega: false,
      };
      return copy;
    });

    handleMegaEvolution(true);
    await wait(4000);
    // playRoar(currentPokemon.cries?.latest)
    playRoar(true)
  } catch (err) {
    console.error("Error during Mega Evolution:", err);
  }
};


 

  return (
    <div
      className="flex flex-col h-screen relative items-center"
    style={{
      background: bgColor,
      backgroundSize: "cover",
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      transition: "opacity 0.5s ease-in-out",
      }}>
        {nextBg && (
          <div
            style={{
              background: nextBg,
              backgroundSize: "cover",
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              opacity: fade ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
            }}
          />
        )}
      

      {showMegaAnimation && (
        <Mega
          frontImage={defaultImage}
          megaFrontImage={megaImage}
          onFinish={() => {
            setShowMegaAnimation(false)
          }}
        />
      )}



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
          <p>Level {currentNpc?.level || 50}</p>  {currentNpc?.status && (<p className={`inline-block mt-1 text-xs font-bold uppercase text-white  ${
            currentNpc.status === "paralyzed" ? "text-yellow-400" :
            currentNpc.status === "burned" ? "text-red-500" :
            currentNpc.status === "frozen" ? "text-blue-300" :
            currentNpc.status === "poisoned" ? "text-purple-400" :
            "text-white"
          } drop-shadow`}>
              {currentNpc.status}
            </p>
        )}
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

        <div className="relative flex items-center justify-center">
          {/* Pokémon sprite */}
          <motion.img
            src={currentNpc?.sprite_front}
            alt={currentNpc?.name}
            className={`relative object-contain ${
              currentNpc?.name.toLowerCase().includes("mega") ||
              currentNpc?.name.toLowerCase().includes("ash")
                ? "w-48 h-48 sm:w-56 sm:h-56"
                : currentNpc?.name.toLowerCase().includes("gigantmax")
                ? "w-72 h-72 sm:w-64 sm:h-64"
                : "w-32 h-32 sm:w-40 sm:h-40"
            }`}
            style={{
              opacity: npcHit ? 0.25 : 1,
              transition: "opacity 0.1s ease-in-out",
              zIndex: 2 
            }}
            animate={
              npcAttacking
                ? getAttackAnimation(npcCurrentMove, false)
                : { x: 0, y: 0 }
            }
            transition={{
              opacity: { delay: 4, duration: 0.5 },
              x: { duration: 0.5 },
              y: { duration: 0.5 },
            }}
          />
            <img
              src={groundImage}
              alt="ground"
              className="absolute bottom-0 w-[250px]"
              style={{ zIndex: 1 }}
            />
          {playerMoveFx && (
            <motion.img
              key="player-moveFx"
              src={playerMoveFx}
              alt=" "
              className="absolute w-32 h-32 sm:w-40 sm:h-40 object-contain pointer-events-none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 1, 0.6, 1, 0.7, 1, 0.5, 1, 0.8, 0], // more extended flicker
                scale: [0.5, 1.3, 1, 1.4, 1.1, 1.3, 1, 1.2, 1, 1] // more dynamic impact
              }}
              style={{ zIndex: 3 }}
              transition={{
                duration: 2.4,       // double the previous extended duration
                delay: 0.2,
                times: [0, 0.1, 0.2, 0.35, 0.5, 0.6, 0.7, 0.85, 0.95, 1] // spread keyframes evenly
              }}
            />
          )}
        </div>
      </div>

      {/* Bottom Half: Player */}
      <div className="flex flex-col justify-end items-center mt-8">
        <div className="flex flex-row items-center gap-16">
          {npcMoveFx && (
            <motion.img
              key="npc-moveFx"
              src={npcMoveFx}
              alt=" "
              className="absolute w-32 h-32 sm:w-40 sm:h-40 object-contain pointer-events-none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 1, 0.6, 1, 0.7, 1, 0.5, 1, 0.8, 0], // more extended flicker
                scale: [0.5, 1.3, 1, 1.4, 1.1, 1.3, 1, 1.2, 1, 1] // more dynamic impact
              }}
              style={{ zIndex: 3 }}
              transition={{
                duration: 2.4,       // double the previous extended duration
                delay: 0.2,
                times: [0, 0.1, 0.2, 0.35, 0.5, 0.6, 0.7, 0.85, 0.95, 1] // spread keyframes evenly
              }}
            />
          )}
                  <div className="relative flex items-center justify-center">
          <motion.img
            src={currentPokemon?.sprite_back}
            alt={currentPokemon?.name}
            className={`object-contain ${
              currentPokemon?.name.toLowerCase().includes("mega") ?
                "w-56 h-56 sm:w-48 sm:h-48" :
              currentPokemon?.name.toLowerCase().includes("ash") ?
                "w-40 h-40 sm:w-32 sm:h-32" : "w-32 h-32 sm:w-40 sm:h-40"
              }`}
            style={{
              opacity: isTeamHit ? 0.25 : 1,
              transition: "opacity 0.1s ease-in-out",
              zIndex: playerAttacking ? 4 : 2,
            }}
            animate={
              playerAttacking
                ? getAttackAnimation(playerCurrentMove, true)
                : { x: 0, y: 0 }
            }
            transition={{ opacity: { delay: 2, duration: 1 }, x: { duration: 0.5 }, y: { duration: 0.5 } }}
          />
          <img src={groundImage} alt="ground" className="absolute bottom-0 w-[250px]" style={{ zIndex: 1 }} />
        </div>
          {/* <motion.img
            src={currentPokemon?.sprite_back}
            alt={currentPokemon?.name}
              className={`object-contain ${
              currentPokemon?.name.toLowerCase().includes("mega") ||
              currentPokemon?.name.toLowerCase().includes("ash")
                ? "w-56 h-56 sm:w-48 sm:h-48"
                : "w-32 h-32 sm:w-40 sm:h-40"
            }`}
            style={{
              opacity: isTeamHit ? 0.25 : 1,
              transition: "opacity 0.1s ease-in-out",
              zIndex: 2
            }}
            animate={playerAttacking ? { x: 50, y: -50 } : { x: 0, y: 0 }}
            transition={{
              opacity: { delay: 2, duration: 1 }, // 👈 delay the appearance by 1s
              x: { duration: 0.5 },
              y: { duration: 0.5 },
            }}
          />
            <img
              src={groundImage}
              alt="ground"
              className="absolute bottom-0 w-[250px]"
              style={{ zIndex: 1 }}
            /> */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mt-2">{currentPokemon?.name}</h3>
            <p>Level {currentPokemon?.level || 50}</p>
          {currentPokemon?.status && (
            <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold uppercase ${
            currentPokemon.status === "paralyzed" ? "text-yellow-400" :
            currentPokemon.status === "burned" ? "text-red-500" :
            currentPokemon.status === "frozen" ? "text-blue-300" :
            currentPokemon.status === "poisoned" ? "text-purple-400" :
            "text-white"
          } drop-shadow`}>
              {currentPokemon.status}
            </span>
          )}
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
        <div className={`grid grid-cols-2 gap-4 w-full max-w-md mt-2 mb-4 ${movesEnabled && !showMegaPrompt ? "" : "hidden"}`}>
          {currentPokemon?.moves?.map((move, idx) => {
            const bgColor = typeColors[move.type] || "#E5E5E5"; // fallback gray

            return(
              <button
                key={idx}
                onClick={() => movesEnabled && handlePlayerAttack(move)}
                style={{
                  backgroundColor: bgColor,
                  color: "#fff",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              className="p-3 rounded-lg text-center transition-transform transform hover:scale-105"
              >
                {move.name}
                </button>
            )
          })}
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

        {showMegaPrompt && movesEnabled && (
          <div className="bg-white text-black p-6 rounded-2xl text-center shadow-lg">
            <p className="mb-4 text-lg font-bold">Do you want to Mega Evolve?</p>
            <div className="flex justify-center gap-6">
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                onClick={ handleUserMegaEvolve }
              >
                Yes
              </button>
              <button
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={() => {
                  setShowMegaPrompt(false);
                }}
              >
                No
              </button>
            </div>
          </div>
        )}


        {!movesEnabled &&
          <div className="flex-grow border-2 border-black bg-white text-black p-2 text-center text-sm font-mono whitespace-pre-line rounded-md">
            {battleMessage}
          </div>
        }
      </div>
    </div>
  );
};

export default Battle;
