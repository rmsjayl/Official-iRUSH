import React from "react";
import USERSSTYLE from "styles/components/admin/user-admin/users.module.css";
import LOADINGSTYLE from "styles/global/loading.module.css";

const UsersReport = ({ users, loading }) => {
  return (
    <>
      {!loading ? (
        <>
          {users.length === 0 && (
            <div className={USERSSTYLE["userloading-container"]}>
              <h5> NO USERS YET TO DISPLAY... </h5>
            </div>
          )}
          <>
            <div className={USERSSTYLE["servicereport-userscontainer"]}>
              {users.map((users, index) => {
                return (
                  <div
                    key={index}
                    className={USERSSTYLE["servicereport-users"]}
                  >
                    <div className={USERSSTYLE["servicereport-users__details"]}>
                      <div className={USERSSTYLE["servicereport-users__name"]}>
                        {users.firstName} {users.lastName}
                      </div>
                      <div className={USERSSTYLE["servicereport-users__email"]}>
                        {users.email}
                      </div>
                      <div className={USERSSTYLE["servicereport-users__role"]}>
                        {users.role === "CLERK_HELPDESKSUPPORT"
                          ? "HELPDESK SUPPORT"
                          : users.role === "CLERK_ITSUPPORT"
                          ? "IT SUPPORT"
                          : null}
                      </div>
                    </div>

                    <div
                      className={USERSSTYLE["servicerport-users__otherdetails"]}
                    >
                      <div
                        className={
                          USERSSTYLE["servicereport-otherdetails__sla"]
                        }
                      >
                        <label className={USERSSTYLE["servicereport_label"]}>
                          Average Resolution Time:
                        </label>
                        {users.averageResolutionTime}
                      </div>
                      <div
                        className={
                          USERSSTYLE["servicereport-otherdetails__sla"]
                        }
                      >
                        <label className={USERSSTYLE["servicereport_label"]}>
                          SLA Compliance Rate:
                        </label>
                        {users.rateSLA}%
                      </div>
                    </div>
                    <div
                      className={USERSSTYLE["servicereport-otherdetails__sla"]}
                    >
                      <label className={USERSSTYLE["servicereport_label"]}>
                        Resolved Ticket:
                      </label>
                      {users.resolvedTickets}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        </>
      ) : (
        <div className={LOADINGSTYLE["loading-container"]}>
          <h5> IRUSH USERS LOADING... </h5>
        </div>
      )}
    </>
  );
};

export default UsersReport;
