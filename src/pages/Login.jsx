import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useTeam } from "../components/TeamContext";
import { getRecord } from "../services/recordService";
import { getBuddyPokemon } from "../services/buddyService";
import ChooseStarter from "../components/ChooseStarter";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setName, name, trophies, setTrophies, setNumberOfBuddies } = useTeam();
  const [showStarter, setShowStarter] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await login(username, password);
    if (res.token) {
      setMessage("Login successful!");
      const data = await getRecord(username);
      const buddy = await getBuddyPokemon(username);
      setNumberOfBuddies(buddy.length);
      setName(username);
      setTrophies(data.record.length);
      if (!buddy || buddy.length === 0) setShowStarter(true);
      else navigate("/"); 
    } else {
      setMessage(res.message || "Invalid credentials");
    }
  };

  if (showStarter) {
    return <ChooseStarter />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-md w-80"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
        >
          Login
        </button>
        <p className="text-center text-sm text-gray-600 mt-3">{message}</p>
                <p className="text-center text-sm text-gray-700 mt-4">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-blue-600 hover:underline"
          >
            Sign up here
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
