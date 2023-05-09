import React, { useState, useEffect } from "react";
import TICKETSTATUSSTYLE from "../../../styles/components/admin/user-admin/ticketstatus.module.css";
import { instance } from "../../../api/axios";

function TicketStatus() {
  useEffect(() => {
    const fetchTicket = async () => {
      instance.get("/tickets/tickets").then((response) => {
        setTickets(response.data.ticket);
        setOpenTickets(response.data.openTickets);
        setRejectedTickets(response.data.rejectedTickets);
        setResolvedTickets(response.data.resolvedTickets);
        setVoidedTickets(response.data.voidedTickets);
        setReopenedTickets(response.data.reopenedTickets);
        setOverdueTickets(response.data.overdueTickets);
        setReopenedTicketsCreated(response.data.createdReopenedTicket);
      });
    };

    fetchTicket();
  }, []);

  const [tickets, setTickets] = useState([]);
  const [openTickets, setOpenTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [voidedTickets, setVoidedTickets] = useState([]);
  const [rejectedTickets, setRejectedTickets] = useState([]);
  const [reopenedTickets, setReopenedTickets] = useState([]);
  const [overdueTickets, setOverdueTickets] = useState([]);
  const [reopenedTicketsCreated, setReopenedTicketsCreated] = useState([]);

  //TICKET LENGTHS
  const ticketLength = tickets.length;
  const openTicketLength = openTickets.length;
  const resolvedTicketsLength = resolvedTickets.length;
  const voidedTicketsLength = voidedTickets.length;
  const rejectedTicketsLength = rejectedTickets.length;
  const reopenedTicketsLength = reopenedTickets.length;
  const overdueTicketsLength = overdueTickets.length;
  const reopenedTicketsCreatedLength = reopenedTicketsCreated.length;

  return (
    <div className={TICKETSTATUSSTYLE["alltickets-status__container"]}>
      <div
        className={TICKETSTATUSSTYLE["alltickets-status__container__wrapper"]}
      >
        <div className={TICKETSTATUSSTYLE["status-ticket__ticketcreated"]}>
          <span className={TICKETSTATUSSTYLE["allticketlength"]}>
            {`${ticketLength}`}
          </span>
          <h6>Ticket Accepted</h6>
        </div>
        <div className={TICKETSTATUSSTYLE["status-ticket__ticketresolved"]}>
          <span className={TICKETSTATUSSTYLE["resolvedticketlength"]}>
            {`${resolvedTicketsLength}`}
          </span>
          <h6>Tickets Resolved</h6>
        </div>
        <div className={TICKETSTATUSSTYLE["status-ticket__ticketvoided"]}>
          <span className={TICKETSTATUSSTYLE["voidedticketlength"]}>
            {`${voidedTicketsLength}`}
          </span>
          <h6>Tickets Voided</h6>
        </div>
        <div className={TICKETSTATUSSTYLE["status-ticket__ticketopen"]}>
          <span className={TICKETSTATUSSTYLE["openticketlength"]}>
            {`${openTicketLength}`}
          </span>
          <h6>Open Tickets</h6>
        </div>
        <div className={TICKETSTATUSSTYLE["status-ticket__ticketreopened"]}>
          <span className={TICKETSTATUSSTYLE["reopenticketlength"]}>
            {`${reopenedTicketsLength}`}
          </span>
          <h6>Reopened Tickets</h6>
        </div>
        <div className={TICKETSTATUSSTYLE["status-ticket__ticketoverdue"]}>
          <span className={TICKETSTATUSSTYLE["overdueticketlength"]}>
            {`${overdueTicketsLength}`}
          </span>
          <h6>Overdue Tickets</h6>
        </div>
        <div className={TICKETSTATUSSTYLE["status-ticket__ticketrejected"]}>
          <span className={TICKETSTATUSSTYLE["rejectedticketlength"]}>
            {`${rejectedTicketsLength}`}
          </span>
          <h6>Rejected Tickets</h6>
        </div>
      </div>

      <div
        className={TICKETSTATUSSTYLE["alltickets-ticketreopened__container"]}
      >
        <div
          className={TICKETSTATUSSTYLE["status-ticket__createdreopenedticket"]}
        >
          <span className={TICKETSTATUSSTYLE["createdreopenedticklength"]}>
            {`${reopenedTicketsCreatedLength}`}
          </span>
          <h6>Ticket Reopened</h6>
        </div>
      </div>
    </div>
  );
}

export default TicketStatus;
