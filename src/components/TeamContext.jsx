import { createContext, useContext, useEffect, useState } from "react";
import { getRecord } from "../services/recordService"; // returns the JSON structure
import { getToken } from "../services/authService";

export const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const [name, setName] = useState("");
  const [trophies, setTrophies] = useState(0);
  const [region, setRegion] = useState("");
  const [inventory, setInventory] = useState([]);
  const [team, setTeam] = useState([]);
  const [npc, setNpc] = useState([]);
  const [npcTeam, setNpcTeam] = useState([]);

  useEffect(() => {
    const fetchRecord = async () => {
      const token = getToken();
      if (!token) {
        // not logged in
        setName("");
        setTrophies(0);
        setRegion("");
        return;
      }

      try {
        const res = await getRecord();
        if (res && res.name && res.record?.length > 0) {
          setName(res.name);

          // calculate trophies (sum of wins)
          const totalWins = res.record.reduce((sum, r) => sum + (r.win || 0), 0);
          setTrophies(totalWins);

          // use the most recent region (or default first one)
          setRegion(res.record[res.record.length - 1].region || "");
        } else {
          setName("");
          setTrophies(0);
          setRegion("");
        }
        console.log(`trophy ${trophies} name is ${name} region is ${region}`)
      } catch (err) {
        console.error("Failed to fetch record:", err);
        setName("");
        setTrophies(0);
        setRegion("");
      }
    };

    fetchRecord();
  }, []);

  // ---- Your existing unchanged logic ----
  const addInventory = (pokemon) => {
    if (inventory.length < 6 && !inventory.some((p) => p.id === pokemon.id)) {
      setInventory([...inventory, pokemon]);
    }
  };

  const addTeam = (pokemon) => {
    if (team.length < 3) {
      setTeam((prev) => [...prev, pokemon]);
      removeInventory(pokemon);
    }
  };

  const removeTeam = (pokemon) => {
    setTeam(team.filter((p) => p.id !== pokemon.id));
    addInventory(pokemon);
  };

  const removeInventory = (pokemon) => {
    setInventory(inventory.filter((p) => p.id !== pokemon.id));
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
    setNpcTeam((prev) => prev.filter((p) => p.id !== pokemon.id));
    setNpc((prev) => {
      const copy = { ...prev };
      copy.gymLeaders[0].pokemon.push(pokemon);
      return copy;
    });
  };

  const addTrophy = () => setTrophies((prev) => prev + 1);

  return (
    <TeamContext.Provider
      value={{
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
        setName,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => useContext(TeamContext);
