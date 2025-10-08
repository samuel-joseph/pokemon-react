import { createContext, useContext, useState } from "react";

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [team, setTeam] = useState([]);
  const [npc, setNpc] = useState([]);
  const [npcTeam, setNpcTeam] = useState([]);
  const [region, setRegion] = useState('');
  const [trophies, setTrophies] = useState(0);
  const [name, setName] = useState("")

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
    setTeam(team.filter(p => p.id !== pokemon.id));
    addInventory(pokemon)
  }

  const removeInventory = (pokemon) => {
    console.log(pokemon.id)
    setInventory(inventory.filter(p => p.id !== pokemon.id));
  };

  const addNpcTeam = (pokemon) => {
    if (npcTeam < 3) {

      // Add to npcTeam
      setNpcTeam((prev) => [...prev, pokemon]);

      // Remove from npc.gymLeaders[0].pokemon
      setNpc((prevNpc) => {
        if (!prevNpc || !prevNpc.gymLeaders) return prevNpc;

        // Make a deep copy
        const updatedNpc = { ...prevNpc };
        updatedNpc.gymLeaders = updatedNpc.gymLeaders.map((leader, index) => {
          if (index === 0) { // assuming first leader is the one we're taking from
            return {
              ...leader,
              pokemon: leader.pokemon.filter((p) => p.id !== pokemon.id),
            };
          }
          return leader;
        });

        return updatedNpc;
      });
    }
  };

const removeNpcTeam = (pokemon) => {
  setNpcTeam(prev => prev.filter(p => p.id !== pokemon.id));
  // if you want to put it back to the original leader pool:
  setNpc(prev => {
    const copy = { ...prev };
    copy.gymLeaders[0].pokemon.push(pokemon);
    return copy;
  });
};
  
  const addTrophy = async () => {
    setTrophies(prev => prev + 1);
    // const response = await 
  }

  return (
    <TeamContext.Provider value={{
      region,
      setRegion,
      inventory,
      setInventory,
      setTeam,
      team,
      addTeam,
      addInventory,
      removeInventory,
      npc,
      setNpc,
      npcTeam,
      setNpcTeam,
      addNpcTeam,
      removeTeam,
      removeNpcTeam,
      addTrophy,
      trophies,
      name,
      setName
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => useContext(TeamContext);
