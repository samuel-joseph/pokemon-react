import EvolutionAnimation from "./EvolutionAnimation";
import { useState } from "react";

const EvolutionScreen = ({ pokemon, onDone, stages = 3 }) => {
  const [showAnimation, setShowAnimation] = useState(true);

  // Dynamically generate frames based on sprite_front URL
  const generateFrames = (finalUrl, stages) => {
    const match = finalUrl.match(/\/(\d+)\.gif$/);
    if (!match) return [finalUrl];

    const finalId = parseInt(match[1], 10);
    const frames = [];

    for (let i = stages - 1; i >= 0; i--) {
      const id = finalId - i;
      frames.push(
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`
      );
    }

    return frames;
  };

  const frames = generateFrames(pokemon.sprite_front, stages);

  return (
    <>
      {showAnimation && (
        <EvolutionAnimation
          frames={frames}
          duration={10000}
          onFinish={() => {
            setShowAnimation(false);
            onDone && onDone();
          }}
        />
      )}
      {!showAnimation && <p className="text-center text-xl font-bold">{pokemon.name} has evolved!</p>}
    </>
  );
};

export default EvolutionScreen;
