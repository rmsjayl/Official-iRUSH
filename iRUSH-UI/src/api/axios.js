import axios from "axios";

export const instance = axios.create({
  baseURL: `${process.env.REACT_APP_API_ENDPOINT}`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
  },
});

export const instanceNoAuth = axios.create({
  baseURL: `${process.env.REACT_APP_API_ENDPOINT}`,
  headers: {
    "Content-Type": "application/json",
  },
});
