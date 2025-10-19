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
import LoadingScreen from "./components/LoadingScreen"

const API_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { name } = useTeam()
  const [rank1, setRank1] = useState("");

  const [serverReady, setServerReady] = useState(false);

  
  useEffect(() => {
  
    const checkServer = async () => {
    try {
      const res = await fetch(`${API_URL}/healthz`);
      if (res.ok) setServerReady(true);
    } catch (err) {
      console.error("Server not ready yet...");
    }
  };

  const checkToken = () => {
    const token = getToken();
    if (token && name) setIsLoggedIn(true)
    else logout();
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
    checkServer();
  // Re-run on token changes in other tabs
  window.addEventListener("storage", checkToken);

  // Re-run periodically to catch manual localStorage changes
  const interval = setInterval(checkToken, checkServer, 1000); // 1s is enough

  return () => {
    window.removeEventListener("storage", checkToken);
    clearInterval(interval);
  };
}, [name]); // Add `name` as dependency so it sees latest name


  if (!serverReady) {
    return <LoadingScreen />;
  }


  return (
    <Router>
      <nav className="bg-red-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex justify-between h-16">
          <h1 className="text-xl font-bold">{isLoggedIn ? name : 'Pokémon App' }</h1>
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
            <Link to="/region" className="block hover:text-yellow-300 font-semibold transition-colors" onClick={() => setIsOpen(false)}>Stadium</Link>
            <Link to="/leaderboard" className="block hover:text-yellow-300 font-semibold transition-colors" onClick={() => setIsOpen(false)}>Leader Board</Link>
            <Link to="/pokedex" className="block hover:text-yellow-300 font-semibold transition-colors" onClick={() => setIsOpen(false)}>Pokédex</Link>
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
              <div className="flex flex-col items-center justify-center min-h-screen text-center bg-no-repeat bg-centerlex flex-col items-center justify-center min-h-screen text-center bg-no-repeat bg-center md:bg-cover bg-contain
              bg-[position:center_top_20%] sm:bg-center
              "
              >
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-red-500 mb-4 text-center">Pokémon App
                </h1>
                {rank1 && (
                  <div className="bg-yellow-400 text-black font-bold py-2 px-4 shadow-md animate-pulse text-center">
                    🔥 Rank #1: {rank1} 🔥
                  </div>
                )}

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
