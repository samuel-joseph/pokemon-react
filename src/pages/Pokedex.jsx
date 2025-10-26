import { useEffect, useState } from "react";
import { fetchPokemons } from "../services/pokemonService";
import { useNavigate } from "react-router-dom";
import PokemonDetails from "./PokemonDetails";

const Pokedex = () => { 
  const [pokemon, setPokemon] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const pokemons = await fetchPokemons();
        setPokemon(pokemons);
      } catch (error) {
        console.error("Error fetching Pokémons: ", error);
      }
    }
    fetchData();
  }, [])


  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate("/")}
        className="top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold text-center text-red-600 mb-6">Pokédex</h1>
      
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {pokemon && pokemon.map((poke, index) => (
          <li 
            key={index} 
            className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center hover:scale-105 transition-transform"
          >
            <img 
              src={poke.image} 
              alt={poke.name} 
              className="w-20 h-20 object-contain mb-2"
            />
            <span className="text-gray-700 font-semibold text-center">
              #{poke.id} {poke.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Pokedex;