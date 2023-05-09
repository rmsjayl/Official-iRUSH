import React, { useState } from "react";
import LOADINGSTYLE from "../../../styles/global/loading.module.css";
import TABLESTYLE from "../../../styles/global/table.module.css";
import SORTICON from "../../../assets/images/svg/sort.svg";
import moment from "moment";

const TicketLists = ({
  header,
  ticketLoading,
  dataTickets,
  setDataTickets,
}) => {
  const [order, setOrder] = useState("ASC");

  const sorting = (col) => {
    if (order === "ASC") {
      const sorted = [...dataTickets].sort((a, b) =>
        col === "ticketNo"
          ? parseInt(a[col]) - parseInt(b[col])
          : a[col] > b[col]
          ? 1
          : -1
      );
      setDataTickets(sorted);
      setOrder("DSC");
    }
    if (order === "DSC") {
      const sorted = [...dataTickets].sort((a, b) =>
        a[col].toLowerCase() < b[col].toLowerCase() ? 1 : -1
      );
      setDataTickets(sorted);
      setOrder("ASC");
    }
  };

  const sortingTicketNo = (col) => {
    if (order === "ASC") {
      const sorted = [...dataTickets].sort((a, b) =>
        col === "ticketNo"
          ? parseInt(a[col]) - parseInt(b[col])
          : a[col] > b[col]
          ? 1
          : -1
      );
      setDataTickets(sorted);
      setOrder("DSC");
    }
    if (order === "DSC") {
      const sorted = [...dataTickets].sort((a, b) =>
        col === "ticketNo"
          ? parseInt(b[col]) - parseInt(a[col])
          : a[col] > b[col]
          ? 1
          : -1
      );
      setDataTickets(sorted);
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
      <div className={TABLESTYLE["ticketcontainer-tickets__header"]}>
        <h4>{`${header}`}</h4>
      </div>
      <div className={TABLESTYLE["ticketcontainer-tickets__ticketlists"]}>
        <>
          {ticketLoading ? (
            <div className={LOADINGSTYLE["loading-container"]}>
              <h5> Tickets are loading. Please wait .... </h5>
            </div>
          ) : (
            <>
              {dataTickets.length === 0 ? (
                <div className={LOADINGSTYLE["noavailability__container"]}>
                  <h3> No tickets available </h3>
                </div>
              ) : (
                <>
                  <table className={TABLESTYLE["table-container__tickets"]}>
                    <thead className={TABLESTYLE["tableticket-header"]}>
                      <tr>
                        <th className={TABLESTYLE["tableheader-title"]}>
                          Ticket No.
                          <span>
                            <img
                              id={TABLESTYLE["sortIcon"]}
                              src={SORTICON}
                              alt=""
                              onClick={() => sortingTicketNo("ticketNo")}
                              style={{
                                cursor: "pointer",
                              }}
                            />
                          </span>
                        </th>
                        <th className={TABLESTYLE["tableheader-title"]}>
                          Subject
                          <span>
                            <img
                              id={TABLESTYLE["sortIcon"]}
                              src={SORTICON}
                              alt=""
                              onClick={() => sorting("ticketSubject")}
                              style={{
                                cursor: "pointer",
                              }}
                            />
                          </span>
                        </th>
                        <th className={TABLESTYLE["tableheader-title"]}>
                          Requester
                          <span>
                            <img
                              id={TABLESTYLE["sortIcon"]}
                              src={SORTICON}
                              alt=""
                              onClick={() => sorting("requester")}
                              style={{
                                cursor: "pointer",
                              }}
                            />
                          </span>
                        </th>
                        <th className={TABLESTYLE["tableheader-title"]}>
                          Unit
                          <span>
                            <img
                              id={TABLESTYLE["sortIcon"]}
                              src={SORTICON}
                              alt=""
                              onClick={() => sorting("clientUnit")}
                              style={{
                                cursor: "pointer",
                              }}
                            />
                          </span>
                        </th>
                        <th className={TABLESTYLE["tableheader-title"]}>
                          Date Created
                          <span>
                            <img
                              id="sortIcon"
                              src={SORTICON}
                              alt=""
                              onClick={() => sorting("createdAt")}
                              style={{
                                cursor: "pointer",
                              }}
                            />
                          </span>
                        </th>
                        <th className={TABLESTYLE["tableheader-title"]}>
                          Priority
                          <span>
                            <img
                              id={TABLESTYLE["sortIcon"]}
                              src={SORTICON}
                              alt=""
                              onClick={() => sorting("priority")}
                              style={{
                                cursor: "pointer",
                              }}
                            />
                          </span>
                        </th>
                        <th className={TABLESTYLE["tableheader-title"]}>
                          Status
                          <span>
                            <img
                              id={TABLESTYLE["sortIcon"]}
                              src={SORTICON}
                              alt=""
                              onClick={() => sorting("status")}
                              style={{
                                cursor: "pointer",
                              }}
                            />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataTickets.map((ticket, index) => {
                        const { _id: id } = ticket;
                        return (
                          <tr
                            key={index}
                            className={TABLESTYLE["tickettable-row"]}
                          >
                            <td
                              className={TABLESTYLE["tickettable-cell"]}
                              style={{
                                cursor: "pointer",
                                color: "#000",
                              }}
                              onClick={() =>
                                (window.location.pathname = `/tickets/${id}`)
                              }
                            >
                              {ticket.status === "Rejected" ? (
                                <strong>
                                  <span
                                    style={{
                                      color: "#d61c20",
                                    }}
                                  >
                                    {ticket.ticketNo} -{" "}
                                    {getFirstChar(
                                      ticket.ticketCategory
                                    ).toUpperCase()}
                                  </span>
                                </strong>
                              ) : (
                                <strong>
                                  {ticket.ticketNo} -{" "}
                                  {getFirstChar(
                                    ticket.ticketCategory
                                  ).toUpperCase()}
                                </strong>
                              )}
                            </td>
                            <td className={TABLESTYLE["tickettable-cell"]}>
                              {ticket.status === "Rejected" ? (
                                <strong>
                                  <span
                                    style={{
                                      color: "#d61c20",
                                    }}
                                  >
                                    {ticket.ticketSubject}
                                  </span>
                                </strong>
                              ) : (
                                ticket.ticketSubject
                              )}
                            </td>
                            <td className={TABLESTYLE["tickettable-cell"]}>
                              {ticket.status === "Rejected" ? (
                                <strong>
                                  <span
                                    style={{
                                      color: "#d61c20",
                                    }}
                                  >
                                    {ticket.requester}
                                  </span>
                                </strong>
                              ) : (
                                ticket.requester
                              )}
                            </td>
                            <td className={TABLESTYLE["tickettable-cell"]}>
                              {ticket.status === "Rejected" ? (
                                <strong>
                                  <span
                                    style={{
                                      color: "#d61c20",
                                    }}
                                  >
                                    {ticket.clientUnit}
                                  </span>
                                </strong>
                              ) : (
                                ticket.clientUnit
                              )}
                            </td>
                            <td className={TABLESTYLE["tickettable-cell"]}>
                              {ticket.status === "Rejected" ? (
                                <strong>
                                  <span
                                    style={{
                                      color: "#d61c20",
                                    }}
                                  >
                                    {moment(ticket.createdAt).format(
                                      "MMMM D YYYY, h:mm:ss a"
                                    )}
                                  </span>
                                </strong>
                              ) : (
                                moment(ticket.createdAt).format(
                                  "MMMM D YYYY, h:mm:ss a"
                                )
                              )}
                            </td>
                            <td className={TABLESTYLE["tickettable-cell"]}>
                              {ticket.status === "Rejected" ? (
                                <strong>
                                  <span
                                    style={{
                                      color: "#d61c20",
                                    }}
                                  >
                                    {ticket.priority.toUpperCase()}
                                  </span>
                                </strong>
                              ) : (
                                <span> {ticket.priority.toUpperCase()}</span>
                              )}
                            </td>
                            <td className={TABLESTYLE["tickettable-cell"]}>
                              <strong>
                                {ticket.status === "Rejected" ? (
                                  <span
                                    style={{
                                      color: "#d61c20",
                                    }}
                                  >
                                    {ticket.status.toUpperCase()}
                                  </span>
                                ) : (
                                  <span> {ticket.status.toUpperCase()}</span>
                                )}
                              </strong>
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

export default TicketLists;
