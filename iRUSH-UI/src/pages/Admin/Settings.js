import React, { useEffect, useState } from "react";
import NavOption from "components/common/NavOption";
import SETTINGSTYLE from "styles/pages/admin/user-admin/settings.module.css";
import { Outlet, useLocation } from "react-router-dom";
import NoSelectedOption from "components/common/NoSelectedOption";

const Settings = () => {
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

    if (location.pathname === "/admin/settings") {
      setSelectedOption(null);
      localStorage.removeItem("selectedOption");
    }
  }, [location]);

  return (
    <>
      <div className={SETTINGSTYLE["settingsreport-container"]}>
        <div className={SETTINGSTYLE["settingsreport-container__wrapper"]}>
          <div className={SETTINGSTYLE["settingsreport-navigation"]}>
            <NavOption
              header={"MANAGE SETTINGS"}
              settings
              onSelect={handleSelect}
              userRole={getUserRole}
            />
          </div>
          <div className={SETTINGSTYLE["settingsreport-content"]}>
            {selectedOption === null ? (
              <>
                <div className={SETTINGSTYLE["noselected-option__container"]}>
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

export default Settings;
