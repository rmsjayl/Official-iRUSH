import React from "react";
import ReactDOM from "react-dom/client";
import { AuthContextProvider } from "context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
const AppComponent = React.lazy(() => import("./App"));

root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <AppComponent />
    </AuthContextProvider>
  </React.StrictMode>
);
