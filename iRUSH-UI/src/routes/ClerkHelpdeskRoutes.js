import { Outlet, Navigate } from "react-router-dom";
import Pagebroken from "components/common/Pagebroken";
import UserHeader from "components/common/UserHeader";
import Navbar from "components/common/Navbar";
import COMPONENTSTYLE from "styles/global/component.module.css";

function ClerkHelpdeskRoutes() {
  const token = localStorage.getItem("authToken");
  const tokenRole = localStorage.getItem("clerkRole");

  if (!token && !tokenRole) {
    return <Pagebroken />;
  } else if (token && tokenRole === "CLERK_HELPDESKSUPPORT") {
    return (
      <div className={COMPONENTSTYLE["component-container"]}>
        <div className={COMPONENTSTYLE["component-container__wrapper"]}>
          <div className={COMPONENTSTYLE["component-navbar"]}>
            <Navbar userRole={tokenRole} />
          </div>
          <div className={COMPONENTSTYLE["component-header"]}>
            <UserHeader />
            <Outlet />
          </div>
        </div>
      </div>
    );
  } else if ((token && !tokenRole) || (!token && tokenRole)) {
    return <Navigate to="/login" />;
  } else if (token && !tokenRole !== "CLERK_HELPDESKSUPPORT") {
    return <Pagebroken />;
  }
}

export default ClerkHelpdeskRoutes;
