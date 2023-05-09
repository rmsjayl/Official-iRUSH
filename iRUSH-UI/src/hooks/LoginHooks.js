import React, { useState } from "react";
import { useAuthContext } from "../context/AuthContext";

export const UseLogin = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    // setLoading(true);
    setError("");

    const response = await fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const json = await response.json();

    if (response.ok) {
      sessionStorage.setItem("user", JSON.stringify(json.user));
      sessionStorage.setItem("authToken", json.token);

      // set user to context

      dispatch({ type: "LOGIN", payload: json });
      const clerkUser = json.user;
      clerkUser.map((user) => {
        return {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      });

      sessionStorage.setItem("clerkRole", clerkUser[0].role);

      if (
        clerkUser[0].role === "USER_ADMIN" ||
        clerkUser[0].role === "USER_SUPERADMIN"
      ) {
        window.location = "/admin/dashboard";
      }

      if (clerkUser[0].role === "CLERK_HELPDESKSUPPORT") {
        window.location = "/helpdesksupport/dashboard";
      }

      if (clerkUser[0].role === "CLERK_ITSUPPORT") {
        window.location = "/itsupport/dashboard";
      }
    } else {
      // setLoading(false);
      setError(json.message);
    }
  };

  return {
    login,
    // loading,
    error,
  };
};
