import React, { useEffect, useState } from "react";
import NavOption from "components/common/NavOption";
import TICKETREPORTSTYLE from "styles/pages/admin/user-admin/ticketsreport.module.css";
import { Outlet, useLocation } from "react-router-dom";
import NoSelectedOption from "components/common/NoSelectedOption";

const Tickets = () => {
  const [getUserRole, setGetUserRole] = useState(null);
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelect = (id) => {
    setSelectedOption(id);
    localStorage.setItem("selectedOption", Number(id));
  };

  useEffect(() => {
    const storedUserRole = localStorage.getItem("clerkRole");
    setGetUserRole(storedUserRole);
    const storedOption = localStorage.getItem("selectedOption");

    if (storedOption !== null) {
      setSelectedOption(Number(storedOption));
    }

    if (location.pathname === "/itsupport/tickets") {
      setSelectedOption(null);
      localStorage.removeItem("selectedOption");
    }
  }, [location]);

  return (
    <>
      <div className={TICKETREPORTSTYLE["tikcetreport-container"]}>
        <div className={TICKETREPORTSTYLE["ticketreport-container__wrapper"]}>
          <div className={TICKETREPORTSTYLE["ticketreport-navigation"]}>
            <NavOption
              header={"TICKET STATISTICS"}
              ticketstats
              onSelect={handleSelect}
              userRole={getUserRole}
            />
          </div>
          <div className={TICKETREPORTSTYLE["ticketreport-content"]}>
            {selectedOption === null ? (
              <>
                <div
                  className={TICKETREPORTSTYLE["noselected-option__container"]}
                >
                  <NoSelectedOption option={"Ticket Option"} />
                </div>
              </>
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tickets;
