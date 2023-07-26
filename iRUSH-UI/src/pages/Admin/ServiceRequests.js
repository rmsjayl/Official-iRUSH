import React, { useEffect, useState } from "react";
import NavOption from "components/common/NavOption";
import SERVICEREQUESTSSTYLE from "styles/pages/admin/user-admin/servicerequestreport.module.css";
import { Outlet, useLocation } from "react-router-dom";
import NoSelectedOption from "components/common/NoSelectedOption";

const ServiceRequests = () => {
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

    if (location.pathname === "/admin/servicerequests") {
      setSelectedOption(null);
      localStorage.removeItem("selectedOption");
    }
  }, [location]);

  return (
    <>
      <div className={SERVICEREQUESTSSTYLE["servicerequestreport-container"]}>
        <div
          className={
            SERVICEREQUESTSSTYLE["servicerequestreport-container__wrapper"]
          }
        >
          <div
            className={SERVICEREQUESTSSTYLE["servicerequestreport-navigation"]}
          >
            <NavOption
              header={"SERVICE REQUESTS"}
              servicerequests
              onSelect={handleSelect}
              userRole={getUserRole}
            />
          </div>
          <div className={SERVICEREQUESTSSTYLE["servicerequestreport-content"]}>
            {selectedOption === null ? (
              <>
                <div
                  className={
                    SERVICEREQUESTSSTYLE["noselected-option__container"]
                  }
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

export default ServiceRequests;
