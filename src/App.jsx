import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Pokedex from "./pages/Pokedex";
import Region from "./pages/Region";
import ShowRegionPokemon from "./pages/ShowRegionPokemon";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout"
import Stadium from "./pages/Stadium";
import Profile from "./pages/Profile"
import { Navigate } from "react-router-dom";
import Leaderboard from "./pages/LeaderBoard";
import { getToken, logout } from "./services/authService";
import { useTeam } from "./components/TeamContext";
import { getAllRecord } from "./services/recordService";
import pokeballImg from "./assets/pokeball.png"

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { name } = useTeam()
  const [rank1, setRank1] = useState("");
  
useEffect(() => {
  const checkToken = () => {
    const token = getToken();
    if (token && name) setIsLoggedIn(true)
  };

  const getRankOne = async () => {
    try {
      const data = await getAllRecord();
      if (data?.length > 0) setRank1(data[0].name);
    } catch (err) {
      console.error(err);
    }
  };

  // Run immediately
  checkToken();
  getRankOne();

  // Re-run on token changes in other tabs
  window.addEventListener("storage", checkToken);

  // Re-run periodically to catch manual localStorage changes
  const interval = setInterval(checkToken, 1000); // 1s is enough

  return () => {
    window.removeEventListener("storage", checkToken);
    clearInterval(interval);
  };
}, [name]); // Add `name` as dependency so it sees latest name




  return (
    <Router>
      <nav className="bg-red-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
          <h1 className="text-xl font-bold">Pokémon App</h1>
          {/* Desktop Links */}
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="hover:text-yellow-300 font-semibold transition-colors">Home | </Link>
            {isLoggedIn && <Link to="/" className="hover:text-yellow-300 font-semibold transition-colors">{name} </Link>}
            {!isLoggedIn ? 
              <Link to="/login" className="block hover:text-yellow-300 font-semibold transition-colors" onClick={() => setIsOpen(false)}>Log in</Link>
              :
              <Link to="/logout" className="block hover:text-yellow-300 font-semibold transition-colors" onClick={() => setIsOpen(false)}>Log out</Link>
            }
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
            <Link to="/leaderboard" className="block hover:text-yellow-300 font-semibold transition-colors" onClick={() => setIsOpen(false)}>Leader Board</Link>
            {!isLoggedIn ? 
              <Link to="/login" className="block hover:text-yellow-300 font-semibold transition-colors" onClick={() => setIsOpen(false)}>Log in</Link>
              :
              <Link to="/logout" className="block hover:text-yellow-300 font-semibold transition-colors" onClick={() => setIsOpen(false)}>Log out</Link>
           }
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto">
        <Routes>
          <Route 
            path="/" 
            element={
              <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-red-500 mb-4 text-center">
                <img 
                src={pokeballImg} 
                alt="Pokéball" 
                className="inline-block h-1em w-1em align-text-bottom ml-2 animate-bounce"
                style={{ height: "1em", width: "1em" }} 
                  />{" "}Pokémon App{" "}
                  <img 
                    src={pokeballImg} 
                    alt="Pokéball" 
                    className="inline-block h-1em w-1em align-text-bottom ml-2 animate-bounce"
                    style={{ height: "1em", width: "1em", animationDelay: ".5s"  }} 
                  />
                </h1>

                {rank1 !== "" && <p className="text-3xl md:text-4xl font-extrabold text-yellow-400 text-center">
                  🔥 Rank #1:{" "}
                  <span className="rank1-animated px-2 py-1 rounded-lg shadow-lg">
                    {rank1}
                  </span>{" "}
                  🔥
                </p>
                }
                {/* Add this at the bottom of your component */}
                <style>{`
                  @keyframes gradientGlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }

                  .rank1-animated {
                    font-weight: 800;
                    background: linear-gradient(270deg, #ff4d4d, #ffd700, #ff69b4, #ff4d4d);
                    background-size: 600% 600%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: gradientGlow 4s ease infinite;
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 25px rgba(255, 69, 0, 0.6);
                  }
                `}</style>

                {isLoggedIn && <Link
                  to="/profile"
                  className="mt-6 inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                >
                  Go to Profile
                </Link>}
                <Link 
                  to="/region" 
                  className="mt-6 inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                >
                  Go to Stadium
                </Link>
                <Link 
                  to="/leaderboard" 
                  className="mt-6 inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                >
                  Leader Board
                </Link>
                <Link 
                  to="/pokedex" 
                  className="mt-6 inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                >
                  Go to Pokédex
                </Link>
              </div>
            } 
          />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/region" element={<Region />} />
          <Route path="/region/:regionName" element={<ShowRegionPokemon />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* If Stadium has no nested routes, just use: */}
          <Route path="/stadium" element={<Stadium />} />
          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
