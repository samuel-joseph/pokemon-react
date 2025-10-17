import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService"

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate("/login");
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-semibold mb-4">Logging out...</h1>
      <p className="text-gray-600">You are being redirected to the login page.</p>
    </div>
  );
};

export default Logout;