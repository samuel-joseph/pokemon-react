import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Pokedex from "./pages/Pokedex";
import Region from "./pages/Region";
import ShowRegionPokemon from "./pages/ShowRegionPokemon";
import Stadium from "./pages/Stadium/Stadium";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Router>
      <nav className="bg-red-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
          <h1 className="text-xl font-bold">Pokémon App</h1>
          
          {/* Desktop Links */}
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="hover:text-yellow-300 font-semibold transition-colors">Home</Link>
            <Link to="/pokedex" className="hover:text-yellow-300 font-semibold transition-colors">Pokédex</Link>
            <Link to="/region" className="hover:text-yellow-300 font-semibold transition-colors">Stadium</Link>
          </div>

          {/* Mobile Hamburger */}
          <button 
            className="md:hidden flex items-center focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2 bg-red-600">
            <Link to="/" className="block hover:text-yellow-300 font-semibold transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/pokedex" className="block hover:text-yellow-300 font-semibold transition-colors" onClick={() => setIsOpen(false)}>Pokédex</Link>
            <Link to="/region" className="block hover:text-yellow-300 font-semibold transition-colors" onClick={() => setIsOpen(false)}>Stadium</Link>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="p-6 max-w-6xl mx-auto">
        <Routes>
          <Route 
            path="/" 
            element={
              <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">
                  Welcome to the Pokémon App
                </h1>
                <p className="text-gray-700 text-lg max-w-xl">
                  Explore all your favorite Pokémon and check out the Pokédex!
                </p>
                <Link 
                  to="/pokedex" 
                  className="mt-6 inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                >
                  Go to Pokédex
                </Link>
                <Link 
                  to="/region" 
                  className="mt-6 inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                >
                  Go to Stadium
                </Link>
              </div>
            } 
          />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/region" element={<Region />} />
          <Route path="/region/:regionName" element={<ShowRegionPokemon />} />
          <Route path="/stadium/*" element={<Stadium />} />  
        </Routes>
      </main>
    </Router>
  );
}

export default App;
