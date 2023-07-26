import React, { useState } from "react";
import NAVOPTIONSTYLE from "../../styles/components/common/navoption.module.css";
import { NavLink } from "react-router-dom";

const NavOption = ({
  header,
  ticketstats,
  servicerequests,
  settings,
  userRole,
  onSelect,
}) => {
  const ticketStatsNav = [
    {
      id: 1,
      name: "Open Tickets",
      path: "tickets/opentickets",
    },
    {
      id: 2,
      name: "Resolved Tickets",
      path: "tickets/resolvedtickets",
    },
    {
      id: 3,
      name: "Voided Tickets",
      path: "tickets/voidedtickets",
    },
    {
      id: 4,
      name: "Rejected Tickets",
      path: "tickets/rejectedtickets",
    },
    {
      id: 5,
      name: "Overdue Tickets",
      path: "tickets/overduetickets",
    },
    {
      id: 6,
      name: "Reopened Tickets",
      path: "tickets/reopenedtickets",
    },
  ];

  const serviceRequestsNavOption = [
    {
      id: 1,
      name: "New Service Requests",
      path: "servicerequests/newservicerequests",
    },
    {
      id: 2,
      name: "Reopen Ticket Requests",
      path: "servicerequests/reopenticketrequests",
    },
    {
      id: 3,
      name: "Rejected Service Requests",
      path: "servicerequests/rejectedservicerequests",
    },
  ];

  const settingsNavOption = [
    {
      id: 1,
      name: "Clerks",
      path: "settings/manage/users",
    },
    {
      id: 2,
      name: "Categories ",
      path: "settings/manage/categories",
    },
    {
      id: 3,
      name: "Rejecting Reasons",
      path: "settings/manage/rejectingreasons",
    },
    {
      id: 4,
      name: "Voiding Reasons",
      path: "settings/manage/voidingreasons",
      isAdmin: true,
    },
    {
      id: 5,
      name: "Resolving Solutions",
      path: "settings/manage/resolvingsolutions",
      isAdmin: true,
    },
  ];

  const [isClicked, setIsClicked] = useState(0);
  const [ticketNavId, setTicketNavId] = useState(1);

  const onClick = (id) => {
    setIsClicked(!isClicked);
    setTicketNavId(id);
    onSelect(id);
  };

  if (userRole === "USER_SUPERADMIN" || userRole === "USER_ADMIN") {
    ticketStatsNav.forEach((option) => {
      option.path = `/admin/${option.path}`;
    });

    serviceRequestsNavOption.forEach((option) => {
      option.path = `/admin/${option.path}`;
    });

    settingsNavOption.forEach((option) => {
      option.path = `/admin/${option.path}`;
    });
  } else if (userRole === "CLERK_HELPDESKSUPPORT") {
    ticketStatsNav.forEach((option) => {
      option.path = `/helpdesksupport/${option.path}`;
    });
    ticketStatsNav.splice(2, 1);

    serviceRequestsNavOption.forEach((option) => {
      option.path = `/helpdesksupport/${option.path}`;
    });
  } else if (userRole === "CLERK_ITSUPPORT") {
    ticketStatsNav.forEach((option) => {
      option.path = `/itsupport/${option.path}`;
    });
    ticketStatsNav.splice(3, 1);
  }

  return (
    <>
      <div className={NAVOPTIONSTYLE["navigation-container"]}>
        <h4>{`${header}`}</h4>
        <div className={NAVOPTIONSTYLE["navigation-options"]}>
          <>
            <div
              className={NAVOPTIONSTYLE["navigation-options"]}
              style={{ cursor: "pointer" }}
            >
              <ul className={NAVOPTIONSTYLE["component-links"]}>
                {userRole === "USER_SUPERADMIN" || userRole === "USER_ADMIN" ? (
                  <>
                    {ticketstats && (
                      <>
                        {ticketStatsNav.map((option) => (
                          <React.Fragment key={option.id}>
                            <NavLink
                              onClick={onClick.bind(this, option.id)}
                              to={option.path}
                              key={option.id}
                              className={({ isActive }) =>
                                isActive
                                  ? `${NAVOPTIONSTYLE["active"]}`
                                  : `${NAVOPTIONSTYLE["passive"]}`
                              }
                            >
                              <span
                                className={
                                  NAVOPTIONSTYLE["component-links__menu"]
                                }
                              >
                                {option.name}
                              </span>
                            </NavLink>
                          </React.Fragment>
                        ))}
                      </>
                    )}
                    {servicerequests && (
                      <>
                        {serviceRequestsNavOption.map((option) => (
                          <React.Fragment key={option.id}>
                            <NavLink
                              onClick={onClick.bind(this, option.id)}
                              to={option.path}
                              key={option.id}
                              className={({ isActive }) =>
                                isActive
                                  ? `${NAVOPTIONSTYLE["active"]}`
                                  : `${NAVOPTIONSTYLE["passive"]}`
                              }
                            >
                              <span
                                className={
                                  NAVOPTIONSTYLE["component-links__menu"]
                                }
                              >
                                {option.name}
                              </span>
                            </NavLink>
                          </React.Fragment>
                        ))}
                      </>
                    )}
                    {settings && (
                      <>
                        {settingsNavOption.map((option) => (
                          <React.Fragment key={option.id}>
                            <NavLink
                              onClick={onClick.bind(this, option.id)}
                              to={option.path}
                              key={option.id}
                              className={({ isActive }) =>
                                isActive
                                  ? `${NAVOPTIONSTYLE["active"]}`
                                  : `${NAVOPTIONSTYLE["passive"]}`
                              }
                            >
                              <span
                                className={
                                  NAVOPTIONSTYLE["component-links__menu"]
                                }
                              >
                                {option.name}
                              </span>
                            </NavLink>
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </>
                ) : userRole === "CLERK_HELPDESKSUPPORT" ? (
                  <>
                    {ticketstats && (
                      <>
                        {ticketStatsNav.map((option) => (
                          <React.Fragment key={option.id}>
                            <NavLink
                              onClick={onClick.bind(this, option.id)}
                              to={option.path}
                              key={option.id}
                              className={({ isActive }) =>
                                isActive
                                  ? `${NAVOPTIONSTYLE["active"]}`
                                  : `${NAVOPTIONSTYLE["passive"]}`
                              }
                            >
                              <span
                                className={
                                  NAVOPTIONSTYLE["component-links__menu"]
                                }
                              >
                                {option.name}
                              </span>
                            </NavLink>
                          </React.Fragment>
                        ))}
                      </>
                    )}
                    {servicerequests && (
                      <>
                        {serviceRequestsNavOption.map((option) => (
                          <React.Fragment key={option.id}>
                            <NavLink
                              onClick={onClick.bind(this, option.id)}
                              to={option.path}
                              key={option.id}
                              className={({ isActive }) =>
                                isActive
                                  ? `${NAVOPTIONSTYLE["active"]}`
                                  : `${NAVOPTIONSTYLE["passive"]}`
                              }
                            >
                              <span
                                className={
                                  NAVOPTIONSTYLE["component-links__menu"]
                                }
                              >
                                {option.name}
                              </span>
                            </NavLink>
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </>
                ) : userRole === "CLERK_ITSUPPORT" ? (
                  <>
                    {ticketStatsNav.map((option) => (
                      <React.Fragment key={option.id}>
                        <NavLink
                          onClick={onClick.bind(this, option.id)}
                          to={option.path}
                          key={option.id}
                          className={({ isActive }) =>
                            isActive
                              ? `${NAVOPTIONSTYLE["active"]}`
                              : `${NAVOPTIONSTYLE["passive"]}`
                          }
                        >
                          <span
                            className={NAVOPTIONSTYLE["component-links__menu"]}
                          >
                            {option.name}
                          </span>
                        </NavLink>
                      </React.Fragment>
                    ))}
                  </>
                ) : null}
              </ul>
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default NavOption;
