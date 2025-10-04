import { createContext, useContext, useState } from "react";

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const [team, setTeam] = useState([]);
  const [npc, setNpc] = useState([]);
  const [region, setRegion] = useState('');

  const addPokemon = (pokemon) => {
    if (team.length < 6 && !team.some(p => p.id === pokemon.id)) {
      setTeam([...team, pokemon]);
    }
  };

  const removePokemon = (id) => {
    setTeam(team.filter(p => p.id !== id));
  };

  return (
    <TeamContext.Provider value={{
      region,
      setRegion,
      team,
      addPokemon,
      removePokemon,
      npc,
      setNpc
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => useContext(TeamContext);
