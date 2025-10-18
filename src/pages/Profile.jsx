// src/components/Profile.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../services/authService";

const Profile = () => {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600">
        Work in progress 🚧
      </h1>
    </div>
  );
};

export default Profile;
