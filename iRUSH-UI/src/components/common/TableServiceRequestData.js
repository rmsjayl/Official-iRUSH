import React, { useState } from "react";
import LOADINGSTYLE from "styles/global/loading.module.css";
import TABLESTYLE from "styles/global/table.module.css";
import SORTICON from "assets/images/svg/sort.svg";
import moment from "moment";

const TableServiceRequestData = ({
  header,
  serviceRequestsLoading,
  dataServiceRequests,
  setDataServiceRequests,
  isReopenedTicket,
  role,
  newServiceRequest,
  reopenTicketRequest,
  rejectedServiceRequest,
}) => {
  const [order, setOrder] = useState("ASC");

  const sorting = (col) => {
    if (order === "ASC") {
      const sorted = [...dataServiceRequests].sort((a, b) =>
        col === "requestNo"
          ? parseInt(a[col]) - parseInt(b[col])
          : a[col] > b[col]
          ? 1
          : -1
      );
      setDataServiceRequests(sorted);
      setOrder("DSC");
    }
    if (order === "DSC") {
      const sorted = [...dataServiceRequests].sort((a, b) =>
        a[col].toLowerCase() < b[col].toLowerCase() ? 1 : -1
      );
      setDataServiceRequests(sorted);
      setOrder("ASC");
    }
  };

  const sortingTicketNo = (col) => {
    if (order === "ASC") {
      const sorted = [...dataServiceRequests].sort((a, b) =>
        col === "requestNo"
          ? parseInt(a[col]) - parseInt(b[col])
          : a[col] > b[col]
          ? 1
          : -1
      );
      setDataServiceRequests(sorted);
      setOrder("DSC");
    }
    if (order === "DSC") {
      const sorted = [...dataServiceRequests].sort((a, b) =>
        col === "requestNo"
          ? parseInt(b[col]) - parseInt(a[col])
          : a[col] > b[col]
          ? 1
          : -1
      );
      setDataServiceRequests(sorted);
      setOrder("ASC");
    }
  };

  // get the first characters of each word in ticket category
  const getFirstChar = (data) => {
    const splitStr = data.split(" ");
    const valuesToReplace = ["OF", "AND", "THE", "of", "and", "the"];
    const pattern = new RegExp(valuesToReplace.join("|"), "gi");
    let firstChar = "";
    for (let i = 0; i < splitStr.length; i++) {
      firstChar += splitStr[i].replace(pattern, "").charAt(0);
    }
    return firstChar;
  };

  return (
    <>
      <div
        className={
          TABLESTYLE["servicerequestcontainer-servicerequests__header"]
        }
      >
        <h4>{`${header}`}</h4>
      </div>
      <div
        className={
          TABLESTYLE[
            "servicerequestcontainer-servicerequests__servicerequestlists"
          ]
        }
      >
        <>
          {serviceRequestsLoading ? (
            <div className={LOADINGSTYLE["loading-container"]}>
              <h5> Service requests are loading. Please wait .... </h5>
            </div>
          ) : (
            <>
              {dataServiceRequests.length === 0 ? (
                <div className={LOADINGSTYLE["noavailability__container"]}>
                  <h3> No service requests available </h3>
                </div>
              ) : (
                <>
                  {newServiceRequest && (
                    <table
                      className={TABLESTYLE["table-container__servicerequests"]}
                    >
                      <thead
                        className={TABLESTYLE["tableservicerequest-header"]}
                      >
                        <tr>
                          <th className={TABLESTYLE["tableheader-title"]}>
                            Service Request No.
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sortingTicketNo("requestNo")}
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
                                onClick={() => sorting("subject")}
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
                            Reference No.
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("referenceNo")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className={TABLESTYLE["servicerequesttable-tablebody"]}
                      >
                        {dataServiceRequests.map((request, index) => {
                          const { _id: id } = request;
                          return (
                            <tr
                              key={index}
                              className={TABLESTYLE["servicerequesttable-row"]}
                            >
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "#000",
                                }}
                                onClick={() =>
                                  role === "USER_SUPERADMIN" ||
                                  role === "USER_ADMIN"
                                    ? (window.location.href = `/admin/servicerequests/newservicerequest/${id}`)
                                    : role === "CLERK_HELPDESKSUPPORT"
                                    ? (window.location.href = `/helpdesksupport/servicerequests/newservicerequest/${id}`)
                                    : null
                                }
                              >
                                {isReopenedTicket ? (
                                  <span>
                                    {request.requestNo} -{" "}
                                    {getFirstChar(
                                      request.ticketCategory
                                    ).toUpperCase()}
                                  </span>
                                ) : (
                                  <span>
                                    {request.requestNo} -{" "}
                                    {getFirstChar(
                                      request.category
                                    ).toUpperCase()}
                                  </span>
                                )}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                {isReopenedTicket
                                  ? request.ticketSubject
                                  : request.subject}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                {request.requesterEmail}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                {getFirstChar(request.clientUnit)}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                {moment(request.createdAt).format(
                                  "L, h:mm:ss a"
                                )}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                <span>{request.referenceNo}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                  {reopenTicketRequest && (
                    <table
                      className={TABLESTYLE["table-container__servicerequests"]}
                    >
                      <thead
                        className={TABLESTYLE["tableservicerequest-header"]}
                      >
                        <tr>
                          <th className={TABLESTYLE["tableheader-title"]}>
                            Service Request No.
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sortingTicketNo("requestNo")}
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
                                onClick={() => sorting("subject")}
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
                            Reference No.
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("referenceNo")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className={TABLESTYLE["servicerequesttable-tablebody"]}
                      >
                        {dataServiceRequests.map((request, index) => {
                          const { _id: id } = request;
                          return (
                            <tr
                              key={index}
                              className={TABLESTYLE["servicerequesttable-row"]}
                            >
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "#000",
                                }}
                                onClick={() =>
                                  role === "USER_SUPERADMIN" ||
                                  role === "USER_ADMIN"
                                    ? (window.location.href = `/admin/servicerequests/reopenticketrequest/${id}`)
                                    : role === "CLERK_HELPDESKSUPPORT"
                                    ? (window.location.href = `/helpdesksupport/servicerequests/reopenticketrequest/${id}`)
                                    : null
                                }
                              >
                                {isReopenedTicket ? (
                                  <span>
                                    {request.requestNo} -{" "}
                                    {getFirstChar(
                                      request.ticketCategory
                                    ).toUpperCase()}
                                  </span>
                                ) : (
                                  <span>
                                    {request.requestNo} -{" "}
                                    {getFirstChar(
                                      request.category
                                    ).toUpperCase()}
                                  </span>
                                )}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                {isReopenedTicket
                                  ? request.ticketSubject
                                  : request.subject}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                {request.requesterEmail}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                {getFirstChar(request.clientUnit)}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                {moment(request.createdAt).format(
                                  "L, h:mm:ss a"
                                )}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                <span>{request.referenceNo}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                  {rejectedServiceRequest && (
                    <table
                      className={TABLESTYLE["table-container__servicerequests"]}
                    >
                      <thead
                        className={TABLESTYLE["tableservicerequest-header"]}
                      >
                        <tr>
                          <th className={TABLESTYLE["tableheader-title"]}>
                            Service Request No.
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sortingTicketNo("requestNo")}
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
                                onClick={() => sorting("subject")}
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
                            Reference No.
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("referenceNo")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className={TABLESTYLE["servicerequesttable-tablebody"]}
                      >
                        {dataServiceRequests.map((request, index) => {
                          const { _id: id } = request;
                          return (
                            <tr
                              key={index}
                              className={TABLESTYLE["servicerequesttable-row"]}
                            >
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "#000",
                                }}
                                onClick={() =>
                                  role === "USER_SUPERADMIN" ||
                                  role === "USER_ADMIN"
                                    ? (window.location.href = `/admin/servicerequests/rejectedservicerequest/${id}`)
                                    : role === "CLERK_HELPDESKSUPPORT"
                                    ? (window.location.href = `/helpdesksupport/servicerequests/rejectedservicerequest/${id}`)
                                    : null
                                }
                              >
                                {isReopenedTicket ? (
                                  <span>
                                    {request.requestNo} -{" "}
                                    {getFirstChar(
                                      request.ticketCategory
                                    ).toUpperCase()}
                                  </span>
                                ) : (
                                  <span>
                                    {request.requestNo} -{" "}
                                    {getFirstChar(
                                      request.category
                                    ).toUpperCase()}
                                  </span>
                                )}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                {isReopenedTicket
                                  ? request.ticketSubject
                                  : request.subject}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                {request.requesterEmail}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                {getFirstChar(request.clientUnit)}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                {moment(request.createdAt).format(
                                  "L, h:mm:ss a"
                                )}
                              </td>
                              <td
                                className={
                                  TABLESTYLE["servicerequesttable-cell"]
                                }
                              >
                                <span>{request.referenceNo}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </>
          )}
        </>
      </div>
    </>
  );
};

export default TableServiceRequestData;
