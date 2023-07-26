import React, { useState } from "react";
import LOADINGSTYLE from "styles/global/loading.module.css";
import TABLESTYLE from "styles/global/table.module.css";
import sortIcon from "assets/images/svg/sort.svg";
import moment from "moment";

const ResolvedTicketsClientList = ({
  header,
  loading,
  requestedResolvedTickets,
  setRequestedResolvedTickets,
  clientId,
  token,
}) => {
  const [order, setOrder] = useState("ASC");

  const sorting = (col) => {
    if (order === "ASC") {
      const sorted = [...requestedResolvedTickets].sort((a, b) =>
        col === "ticketNo"
          ? parseInt(a[col]) - parseInt(b[col])
          : a[col] > b[col]
          ? 1
          : -1
      );
      setRequestedResolvedTickets(sorted);
      setOrder("DSC");
    }
    if (order === "DSC") {
      const sorted = [...requestedResolvedTickets].sort((a, b) =>
        a[col].toLowerCase() < b[col].toLowerCase() ? 1 : -1
      );
      setRequestedResolvedTickets(sorted);
      setOrder("ASC");
    }
  };

  const sortingTicketNo = (col) => {
    if (order === "ASC") {
      const sorted = [...requestedResolvedTickets].sort((a, b) =>
        col === "ticketNo"
          ? parseInt(a[col]) - parseInt(b[col])
          : a[col] > b[col]
          ? 1
          : -1
      );
      setRequestedResolvedTickets(sorted);
      setOrder("DSC");
    }
    if (order === "DSC") {
      const sorted = [...requestedResolvedTickets].sort((a, b) =>
        col === "ticketNo"
          ? parseInt(b[col]) - parseInt(a[col])
          : a[col] > b[col]
          ? 1
          : -1
      );
      setRequestedResolvedTickets(sorted);
      setOrder("ASC");
    }
  };

  //get the first characters of each word in ticket category
  const getFirstChar = (ticketCategory) => {
    const splitStr = ticketCategory.split(" ");
    let firstChar = "";
    for (let i = 0; i < splitStr.length; i++) {
      firstChar += splitStr[i].charAt(0);
    }
    return firstChar;
  };

  return (
    <>
      <div className={TABLESTYLE["reopenticketcontainer-reopenticket__header"]}>
        <h4>{`${header}`}</h4>

        <>
          {loading ? (
            <div className={LOADINGSTYLE["loading-container"]}>
              <h5> Ticket requests are loading. Please wait .... </h5>
            </div>
          ) : (
            <>
              {requestedResolvedTickets.length === 0 ? (
                <div className={LOADINGSTYLE["noavailability__container"]}>
                  <h3> No Ticket requests available </h3>
                </div>
              ) : (
                <>
                  <table
                    className={
                      TABLESTYLE["reopentickettable-container__tickets"]
                    }
                  >
                    <thead className={TABLESTYLE["reopentableticket-header"]}>
                      <tr className={TABLESTYLE["reopenticket-tablerow"]}>
                        <th className={TABLESTYLE["reopentableheader-title"]}>
                          Ticket No.
                          <span>
                            <img
                              id="sortIcon"
                              src={sortIcon}
                              alt=" "
                              onClick={() => sortingTicketNo("ticketNo")}
                              style={{ cursor: "pointer" }}
                            />
                          </span>
                        </th>

                        <th className={TABLESTYLE["reopentableheader-title"]}>
                          Subject
                          <span>
                            <img
                              id="sortIcon"
                              src={sortIcon}
                              alt=" "
                              onClick={() => sorting("ticketSubject")}
                              style={{ cursor: "pointer" }}
                            />
                          </span>
                        </th>
                        <th className={TABLESTYLE["reopentableheader-title"]}>
                          Date Created
                          <span>
                            <img
                              id="sortIcon"
                              src={sortIcon}
                              alt=" "
                              onClick={() => sorting("createdAt")}
                              style={{ cursor: "pointer" }}
                            />
                          </span>
                        </th>

                        <th className={TABLESTYLE["reopentableheader-title"]}>
                          Status
                          <span>
                            <img
                              id="sortIcon"
                              src={sortIcon}
                              alt=" "
                              onClick={() => sorting("status")}
                              style={{ cursor: "pointer" }}
                            />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={
                        TABLESTYLE["requestedtickets-container__tablebody"]
                      }
                    >
                      {requestedResolvedTickets.map((ticket, index) => {
                        const { _id: id } = ticket;
                        return (
                          <tr
                            key={index}
                            className={TABLESTYLE["reopenticket-tablerow"]}
                          >
                            <td
                              className={TABLESTYLE["reopentickettable-cell"]}
                              onClick={() =>
                                (window.location.pathname = `/client/${clientId}/${token}/requestedtickets/${id}`)
                              }
                              style={{
                                cursor: "pointer",
                                color: "#000",
                              }}
                            >
                              <strong>
                                {" "}
                                {ticket.ticketNo} -{" "}
                                {getFirstChar(
                                  ticket.ticketCategory
                                ).toUpperCase()}
                              </strong>
                            </td>

                            <td
                              className={TABLESTYLE["reopentickettable-cell"]}
                            >
                              {ticket.ticketSubject}
                            </td>
                            <td
                              className={TABLESTYLE["reopentickettable-cell"]}
                            >
                              {moment(ticket.createdAt).format(
                                "MMMM D YYYY, h:mm:ss a"
                              )}
                            </td>

                            <td
                              className={TABLESTYLE["reopentickettable-cell"]}
                            >
                              <strong>{ticket.status.toUpperCase()}</strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </>
      </div>
    </>
  );
};

export default ResolvedTicketsClientList;
