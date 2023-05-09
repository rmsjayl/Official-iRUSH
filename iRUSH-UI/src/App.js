import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/global/index.css";
//COMPONENTS
import Spinner from "./components/spinner/Spinner";
import Homepage from "./pages/Homepage";
import Faq from "./pages/Faq";
import Login from "./pages/Login";
import Forgotpassword from "./pages/Forgotpassword";
import Register from "./pages/Register";
//FOR ADMINS
import AdminRoutes from "./routes/AdminRoutes";
import AdminDashboard from "./pages/Admin/AdminDashboard";
//FOR HELPDESK SUPPORT
import ClerkHelpdeskRoutes from "./routes/ClerkHelpdeskRoutes";
import HelpdeskDashboard from "./pages/Clerk/helpdesksupport/dashboard";
//FOR IT SUPPORT
import ClerkItSupportRoutes from "./routes/ClerkItSupportRoutes";
import ItsupportDashboard from "./pages/Clerk/itsupport/dashboard";
import Tickets from "./pages/Admin/Tickets";
import ServiceRequests from "./pages/Admin/ServiceRequests";
import Settings from "./pages/Admin/Settings";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* INITIAL PAGES AND LANDING PAGES FOR USERS AND CLIENTS */}
          <Route path="/" element={<Homepage />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />

          {/* ADMIN ROUTES */}
          <Route element={<AdminRoutes />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tickets" element={<Tickets />} />
            <Route
              path="/admin/servicerequests"
              element={<ServiceRequests />}
            />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          {/* HELPDESK SUPPORT ROUTES */}

          <Route element={<ClerkHelpdeskRoutes />}>
            <Route
              path="/helpdesksupport/dashboard"
              element={<HelpdeskDashboard />}
            />
          </Route>

          {/* IT SUPPORT ROUTES */}
          <Route element={<ClerkItSupportRoutes />}>
            <Route
              path="/itsupport/dashboard"
              element={<ItsupportDashboard />}
            />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
