import { useState } from "react";
import { signup } from "../services/authService";
import { useTeam } from "../components/TeamContext";
import { updateRecord } from "../services/recordService";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { inventory, region, trophy, name } = useTeam();

const handleSignup = async (e) => {
  e.preventDefault();
  try {
    const pokemon = inventory
    const res = await signup(username, password, pokemon);

    setMessage(res.message || "Signup successful!");

    // Only update record if signup succeeded
    // if (res && res.user) {
    //   await updateRecord({
    //     name: res.user.username,
    //     record: [{ region, win: trophy, pokemon: inventory }],
    //   });
    // }

  } catch (error) {
    setMessage(error.message);
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-6 rounded-xl shadow-md w-80"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Sign Up</h2>
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
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
        <p className="text-center text-sm text-gray-600 mt-3">{message}</p>
      </form>
    </div>
  );
};

export default Signup;
