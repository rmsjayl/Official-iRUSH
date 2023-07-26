import axios from "axios";

// Need authorization and authentication
export const instance = axios.create({
  baseURL: `${process.env.REACT_APP_API_ENDPOINT}`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

// No authentication required
export const instanceNoAuth = axios.create({
  baseURL: `${process.env.REACT_APP_API_ENDPOINT}`,
  headers: {
    "Content-Type": "application/json",
  },
});
