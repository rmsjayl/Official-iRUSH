import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { UseLogout } from "../../hooks/LogoutHooks";
import USERHEADERSTYLE from "../../styles/components/common/userheader.module.css";
import profileIcon from "../../assets/images/svg/profileicon.svg";
import Spinner from "components/spinner/Spinner";

const UserHeader = () => {
  // GET THE USER FROM THE CONTEXT
  const { user } = useAuthContext();
  const { logout, loading } = UseLogout();

  const [profileClicked, setProfileClicked] = useState(false);
  const showProfileNav = () => {
    setProfileClicked(!profileClicked);
  };

  const handleClick = () => {
    loading, logout();
  };

  return (
    <>
      {!loading ? (
        <div className={USERHEADERSTYLE["header-container"]}>
          <div className={USERHEADERSTYLE["header-container__wrapper"]}>
            <div
              className={USERHEADERSTYLE["header-container__profileicon"]}
              onClick={showProfileNav}
            >
              <img src={profileIcon} id={USERHEADERSTYLE["profileicon"]} />
            </div>

            {user ? (
              <div className={USERHEADERSTYLE["header-container__details"]}>
                {user.map((user, index) => {
                  const { id } = user;
                  return (
                    <div
                      key={index}
                      className={USERHEADERSTYLE["header-container__details"]}
                    >
                      <div
                        className={
                          USERHEADERSTYLE["header-clerkName__container"]
                        }
                      >
                        {user.name}
                      </div>
                      <div
                        className={
                          USERHEADERSTYLE["header-clerkEmail__container"]
                        }
                      >
                        {user.email}
                      </div>
                      <div
                        className={
                          USERHEADERSTYLE["header-clerkRole__container"]
                        }
                      >
                        {user.role === "USER_SUPERADMIN"
                          ? "SUPER ADMIN"
                          : user.role === "USER_ADMIN"
                          ? "ADMIN"
                          : user.role === "CLERK_HELPDESKSUPPORT"
                          ? "HELPDESK SUPPORT"
                          : user.role === "CLERK_ITSUPPORT"
                          ? "IT SUPPORT"
                          : null}
                      </div>

                      {profileClicked && (
                        <div
                          key={index}
                          className={
                            USERHEADERSTYLE["header-container__profileNav"]
                          }
                        >
                          <button
                            className={
                              USERHEADERSTYLE[
                                "header-container__profileNav__item__link"
                              ]
                            }
                            onClick={
                              user.role === "USER_SUPERADMIN" ||
                              user.role === "USER_ADMIN"
                                ? () => {
                                    window.location.href = `/admin/profile/${id}`;
                                  }
                                : user.role === "CLERK_HELPDESKSUPPORT"
                                ? () => {
                                    window.location.href = `/helpdesksupport/profile/${id}`;
                                  }
                                : user.role === "CLERK_ITSUPPORT"
                                ? () => {
                                    window.location.href = `/itsupport/profile/${id}`;
                                  }
                                : null
                            }
                          >
                            Profile
                          </button>
                          <button
                            className={
                              USERHEADERSTYLE[
                                "header-container__profileNav__item__link"
                              ]
                            }
                            onClick={handleClick}
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default UserHeader;
