import { createContext, useContext, useState, useEffect } from "react";

const TeamContext = createContext();

// TTL for 3 months in milliseconds (approx. 90 days)
const TTL = 90 * 24 * 60 * 60 * 1000;

// Helper to save with TTL
const saveWithTTL = (key, value) => {
  const record = {
    value,
    expiry: Date.now() + TTL, // 3 months from now
  };
  sessionStorage.setItem(key, JSON.stringify(record));
};

// Helper to load and check expiry
const loadWithTTL = (key) => {
  const recordStr = sessionStorage.getItem(key);
  if (!recordStr) return null;

  try {
    const record = JSON.parse(recordStr);
    if (Date.now() > record.expiry) {
      sessionStorage.removeItem(key);
      return null;
    }
    return record.value;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
};

export const TeamProvider = ({ children }) => {
  // Load from sessionStorage with TTL
  const [name, setName] = useState(() => loadWithTTL("name") || "");
  const [trophies, setTrophies] = useState(() => loadWithTTL("trophies") || 0);

  const [inventory, setInventory] = useState([]);
  const [team, setTeam] = useState([]);
  const [npc, setNpc] = useState([]);
  const [npcTeam, setNpcTeam] = useState([]);
  const [region, setRegion] = useState('');

  // Persist name and trophies with refreshed TTL
  useEffect(() => {
    if (name) saveWithTTL("name", name);
  }, [name]);

  useEffect(() => {
    saveWithTTL("trophies", trophies);
  }, [trophies]);

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
    setInventory(inventory.filter(p => p.id !== pokemon.id));
  };

  const addNpcTeam = (pokemon) => {
    if (npcTeam.length < 3) {
      setNpcTeam((prev) => [...prev, pokemon]);
      setNpc((prevNpc) => {
        if (!prevNpc || !prevNpc.gymLeaders) return prevNpc;
        const updatedNpc = { ...prevNpc };
        updatedNpc.gymLeaders = updatedNpc.gymLeaders.map((leader, index) => {
          if (index === 0) {
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
    setNpc(prev => {
      const copy = { ...prev };
      copy.gymLeaders[0].pokemon.push(pokemon);
      return copy;
    });
  };
  
  const addTrophy = () => {
    setTrophies(prev => prev + 1);
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
