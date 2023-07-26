import React, { useState } from "react";
import { useAuthContext } from "context/AuthContext";

export const UseLogout = () => {
  const { dispatch } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
    dispatch({ type: "LOGOUT" });
    setLoading(true);
  };

  return { logout, loading };
};
