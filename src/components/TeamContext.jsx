import { createContext, useContext, useState } from "react";

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [team, setTeam] = useState([]);
  const [npc, setNpc] = useState([]);
  const [npcTeam, setNpcTeam] = useState([]);
  const [region, setRegion] = useState('');

  const addInventory = (pokemon) => {
    if (inventory.length < 6 && !inventory.some(p => p.id === pokemon.id)) {
      setInventory([...inventory, pokemon]);
    }
  };

  const addTeam = (pokemon) => {
    if (team.length < 3) {
      setTeam((prev) => [...prev, pokemon]);
      removeInventory(pokemon);
    }
  }

  const removeTeam = (pokemon) => {
    console.log(pokemon)
    setTeam(team.filter(p => p.id !== pokemon.id));
    addInventory(pokemon)
  }

  const removeInventory = (pokemon) => {
    setInventory(inventory.filter(p => p.id !== pokemon.id));
  };

  const addNpcTeam = (pokemon) => {
    setNpcTeam([...npcTeam],pokemon)
  }

  const removeNpcTeam = (pokemon) => {
    setNpcTeam(team.filter(p => p.id !== pokemon.id));
    addNpcTeam(pokemon);
  }

  return (
    <TeamContext.Provider value={{
      region,
      setRegion,
      inventory,
      team,
      addTeam,
      addInventory,
      removeInventory,
      npc,
      setNpc,
      npcTeam,
      setNpcTeam,
      removeTeam,
      removeNpcTeam
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => useContext(TeamContext);
