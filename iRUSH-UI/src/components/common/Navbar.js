import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import NAVBARSTYLE from "../../styles/components/common/navbar.module.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ViewHeadlineOutlinedIcon from "@mui/icons-material/ViewHeadlineOutlined";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import USTLOGO from "../../assets/images/img/UST_logoblack.png";

const Navbar = ({ userRole }) => {
  const adminNavbarData = [
    {
      id: 1,
      title: "Dashboard",
      icon: <DashboardIcon />,
      link: "/admin/dashboard",
      description: "DASHBOARD",
    },
    {
      id: 2,
      title: "Tickets",
      icon: <ConfirmationNumberIcon />,
      link: "/admin/tickets",
      description: "TICKETS",
    },
    {
      id: 3,
      title: "Requests",
      icon: <AssignmentIcon />,
      link: "/admin/servicerequests",
      description: "REQUESTS",
    },
    {
      id: 4,
      title: "Settings",
      icon: <BuildRoundedIcon />,
      link: "/admin/settings",
      description: "SETTINGS",
    },
  ];

  const helpdeskNavbarData = [
    {
      id: 1,
      title: "Dashboard",
      icon: <DashboardIcon />,
      link: "/helpdesksupport/dashboard",
      description: "DASHBOARD",
    },
    {
      id: 2,
      title: "Tickets",
      icon: <ConfirmationNumberIcon />,
      link: "/helpdesksupport/tickets",
      description: "TICKETS",
    },
    {
      id: 3,
      title: "Requests",
      icon: <AssignmentIcon />,
      link: "/helpdesksupport/servicerequests",
      description: "REQUESTS",
    },
  ];

  const ItSupportNavbarData = [
    {
      id: 1,
      title: "Dashboard",
      icon: <DashboardIcon />,
      link: "/itsupport/dashboard",
      description: "DASHBOARD",
    },
    {
      id: 2,
      title: "Tickets",
      icon: <ConfirmationNumberIcon />,
      link: "/itsupport/tickets",
      description: "TICKETS",
    },
  ];

  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const showSidebar = () => {
    setSidebar(!sidebar);
  };

  return (
    <>
      <div className={NAVBARSTYLE["navbar-container"]}>
        <div className={NAVBARSTYLE["navbar-container__wrapper"]}>
          <div className={NAVBARSTYLE["adminnavbar-icons__widgets"]}>
            <div
              className={NAVBARSTYLE["adminnavbar-icons__menu"]}
              onClick={showSidebar}
            >
              <ViewHeadlineOutlinedIcon />
            </div>
            {userRole === "USER_ADMIN" || userRole === "USER_SUPERADMIN"
              ? adminNavbarData.map((data, index) => {
                  return (
                    <NavLink
                      className={({ isActive }) =>
                        isActive
                          ? `${NAVBARSTYLE["nav-link__active"]}`
                          : `${NAVBARSTYLE["nav-link"]}`
                      }
                      to={data.link}
                      key={index}
                    >
                      <div
                        className={
                          sidebar
                            ? `${NAVBARSTYLE["navbar-widgets__active"]}`
                            : `${NAVBARSTYLE["navbar-widgets__passive"]}`
                        }
                        id={NAVBARSTYLE["navbar-widgets__container"]}
                      >
                        <li>{data.icon}</li>
                        <h6
                          className={
                            sidebar
                              ? `${NAVBARSTYLE["active"]}`
                              : `${NAVBARSTYLE["hidden"]}`
                          }
                        >
                          {data.description}
                        </h6>
                      </div>
                    </NavLink>
                  );
                })
              : userRole === "CLERK_ITSUPPORT"
              ? ItSupportNavbarData.map((data, index) => {
                  return (
                    <NavLink
                      className={({ isActive }) =>
                        isActive
                          ? `${NAVBARSTYLE["nav-link__active"]}`
                          : `${NAVBARSTYLE["nav-link"]}`
                      }
                      to={data.link}
                      key={index}
                    >
                      <div
                        className={
                          sidebar
                            ? `${NAVBARSTYLE["navbar-widgets__active"]}`
                            : `${NAVBARSTYLE["navbar-widgets__passive"]}`
                        }
                        id={NAVBARSTYLE["navbar-widgets__container"]}
                      >
                        <li>{data.icon}</li>
                        <h6
                          className={
                            sidebar
                              ? `${NAVBARSTYLE["active"]}`
                              : `${NAVBARSTYLE["hidden"]}`
                          }
                        >
                          {data.description}
                        </h6>
                      </div>
                    </NavLink>
                  );
                })
              : userRole === "CLERK_HELPDESKSUPPORT"
              ? helpdeskNavbarData.map((data, index) => {
                  return (
                    <NavLink
                      className={({ isActive }) =>
                        isActive
                          ? `${NAVBARSTYLE["nav-link__active"]}`
                          : `${NAVBARSTYLE["nav-link"]}`
                      }
                      to={data.link}
                      key={index}
                    >
                      <div
                        className={
                          sidebar
                            ? `${NAVBARSTYLE["navbar-widgets__active"]}`
                            : `${NAVBARSTYLE["navbar-widgets__passive"]}`
                        }
                        id={NAVBARSTYLE["navbar-widgets__container"]}
                      >
                        <li>{data.icon}</li>
                        <h6
                          className={
                            sidebar
                              ? `${NAVBARSTYLE["active"]}`
                              : `${NAVBARSTYLE["hidden"]}`
                          }
                        >
                          {data.description}
                        </h6>
                      </div>
                    </NavLink>
                  );
                })
              : null}

            <div className={NAVBARSTYLE["navbar-icons__ustlogo"]}>
              <div className={NAVBARSTYLE["icon-ustlogo__container"]}>
                <img
                  style={{ width: sidebar ? "55px" : "50px" }}
                  id={NAVBARSTYLE["navbar-ustlogo"]}
                  src={USTLOGO}
                  alt="ust-logo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
