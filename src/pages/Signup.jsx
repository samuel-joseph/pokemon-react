import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/authService";
import { useTeam } from "../components/TeamContext";
import { setToken } from "../services/authService";
import { getRecord } from "../services/recordService";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { team, inventory, setTrophies, setName } = useTeam();

  const navigate = useNavigate();

  useEffect(() => {
    // small delay to make the intro feel smoother
    const timer = setTimeout(() => setShowForm(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const combined = [...inventory, ...team];
      console.log("What is pokemon pre signup: ",combined)

    // Remove duplicates by 'pokemon'
    const pokemon = combined.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.name === item.name)
      );
      const res = await signup(username, password, pokemon);
      setMessage(res.message || "Signup successful!");
      setToken(res.token);
      const data = await getRecord(username);

      setName(data.name);
      setTrophies(data.record.length);
      setTimeout(() => navigate("/"),2000)
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-indigo-200 text-gray-800 px-4">
      <div className="max-w-md bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl text-center">
        <h1 className="text-2xl font-bold text-indigo-700 mb-2">
          Welcome, Trainer!
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Thank you for joining the battle, Trainer! ⚡
          Your journey through the Pokémon world has just begun.
          Sign up now to save your progress, unlock every region,
          train the strongest team, face legendary champions,
          and climb your way to the top of the global leaderboard! 🥇
        </p>

        {showForm ? (
          <form onSubmit={handleSignup} className="mt-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white w-full py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Begin Your Journey
            </button>
            <p className="text-center text-sm text-gray-600 mt-3">{message}</p>
            <p className="text-center text-sm text-gray-700 mt-4">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:underline"
              >
                Login here
              </button>
            </p>
          </form>
        ) : (
          <p className="text-indigo-600 font-semibold animate-pulse mt-4">
            Preparing your adventure...
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;
