import React, { useState, useEffect } from "react";
import NOTIFICATIONSTYLE from "styles/components/common/notification.module.css";
import moment from "moment";

const AssignedTickets = ({ assignedTicketData }) => {
  return (
    <>
      {assignedTicketData.length === 0 ? (
        <div className={NOTIFICATIONSTYLE["notificationloading-container"]}>
          <h5> No notifications </h5>
        </div>
      ) : (
        <>
          <div className={NOTIFICATIONSTYLE["notification-userscontainer"]}>
            {assignedTicketData.map((ticket, index) => {
              return (
                <div
                  key={index}
                  className={NOTIFICATIONSTYLE["notification-users"]}
                >
                  <div
                    className={
                      NOTIFICATIONSTYLE["notification-ticket__details"]
                    }
                  >
                    <div
                      className={
                        NOTIFICATIONSTYLE["notification-ticket__ticketdetails"]
                      }
                    >
                      {ticket.status === "Open"
                        ? `You have been assigned to Ticket #${ticket.ticketNo}: ${ticket.ticketCategory}`
                        : ticket.status === "Resolved"
                        ? `You have resolved ticket #${ticket.ticketNo}: ${ticket.ticketCategory}`
                        : ticket.status === "Overdue"
                        ? `Ticket #${ticket.ticketNo}: ${ticket.ticketCategory} is overdue`
                        : ticket.status === "Rejected"
                        ? `You have rejected ticket #${ticket.ticketNo}: ${ticket.ticketCategory}`
                        : ticket.status === "Reopened"
                        ? `Ticket #${ticket.ticketNo}: ${ticket.ticketCategory} has been reopened`
                        : null}
                    </div>

                    <div
                      className={
                        NOTIFICATIONSTYLE[
                          "notification-ticket__tickettimestamp"
                        ]
                      }
                    >
                      {moment(ticket.updatedAt).format(
                        "MMMM D YYYY, h:mm:ss a"
                      )}
                    </div>

                    <div
                      className={
                        NOTIFICATIONSTYLE["notification-ticket__ticketdesc"]
                      }
                    >
                      {ticket.ticketDescription}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

export default AssignedTickets;
