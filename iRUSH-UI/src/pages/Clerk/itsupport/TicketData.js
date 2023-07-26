import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TICKETDATASTYLE from "styles/pages/admin/user-admin/ticketdata.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { instance } from "api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "components/spinner/Spinner";
import moment from "moment";
import { Buttons } from "components/common/Buttons";
import SubmitTicketModal from "components/modals/SubmitTicketModal";
import VoidTicketModal from "components/modals/VoidTicketModal";

const TicketData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitTicketModal, setSubmitTicketModal] = useState(false);
  const [voidTicketModal, setVoidTicketModal] = useState(false);
  const userRole = localStorage.getItem("clerkRole");

  useEffect(() => {
    const fetchTicketData = async () => {
      setLoading(true);
      await instance
        .get(`/tickets/itsupport/assignedtickets/${id}`)
        .then((response) => {
          setTicketData(response.data.ticket);
        })
        .catch((error) => {
          if (error.response.status === 404) {
            toast.error(error.response.data.message);
            navigate("/itsupport/tickets");
          }
          if (error.response.status === 401) {
            window.location.href = "/login";
          }

          if (error.response.status === 500) {
            toast.error("Error occured while fetching the data.");
            navigate("/itsupport/tickets");
          }
        });
      setLoading(false);
    };

    fetchTicketData();
  }, [id]);

  return (
    <>
      {submitTicketModal && (
        <SubmitTicketModal
          checkRole={userRole}
          modalOpen={setSubmitTicketModal}
        />
      )}
      {voidTicketModal && <VoidTicketModal modalOpen={setVoidTicketModal} />}

      <div className={TICKETDATASTYLE["requestedticket-container__content"]}>
        <div className={TICKETDATASTYLE["header_viewingticket"]}>
          <h3>
            Viewing {ticketData.status} Ticket No. {ticketData.ticketNo} —{" "}
            {ticketData.ticketCategory}
          </h3>
        </div>

        {loading ? (
          <Spinner PageLoading={true} />
        ) : (
          <div className={TICKETDATASTYLE["content-requestedticket-details"]}>
            <div
              className={TICKETDATASTYLE["requestedticket-details__requester"]}
            >
              <div className={TICKETDATASTYLE["requester-details__email"]}>
                <label> Email </label>
                <p className={TICKETDATASTYLE["requester-details__container"]}>
                  {ticketData.requester}
                </p>
              </div>
              <div className={TICKETDATASTYLE["requester-details__name"]}>
                <label> Name </label>
                <p className={TICKETDATASTYLE["requester-details__container"]}>
                  {ticketData.requesterName}
                </p>
              </div>
              <div className={TICKETDATASTYLE["requester-details__unit"]}>
                <label> Unit </label>
                <p className={TICKETDATASTYLE["requester-details__container"]}>
                  {ticketData.clientUnit}
                </p>
              </div>
              <div
                className={TICKETDATASTYLE["requester-details__contactnumber"]}
              >
                <label> Contact Number </label>
                <p className={TICKETDATASTYLE["requester-details__container"]}>
                  {ticketData.clientContactNum}
                </p>
              </div>

              <div className={TICKETDATASTYLE["requester-details__assingto"]}>
                <label> Assign To: </label>
                <p className={TICKETDATASTYLE["requester-details__container"]}>
                  {ticketData.assignTo}
                </p>
              </div>

              <div className={TICKETDATASTYLE["requester-details__assingto"]}>
                <label> Assignee: </label>
                <p className={TICKETDATASTYLE["requester-details__container"]}>
                  {ticketData.assignBy}
                </p>
              </div>
            </div>

            <div className={TICKETDATASTYLE["requestedticket-ticketcontent"]}>
              <div
                className={
                  TICKETDATASTYLE["requestedticket-ticketcontent__wrapper"]
                }
              >
                <div className={TICKETDATASTYLE["requester-details__category"]}>
                  <label> Category </label>
                  <p
                    className={TICKETDATASTYLE["requester-details__container"]}
                  >
                    {ticketData.ticketCategory}
                  </p>
                </div>
                <div className={TICKETDATASTYLE["requester-details__subject"]}>
                  <label> Subject </label>
                  <p
                    className={TICKETDATASTYLE["requester-details__container"]}
                  >
                    {ticketData.ticketSubject}
                  </p>
                </div>
                <div
                  className={TICKETDATASTYLE["requester-details__description"]}
                >
                  <label> Ticket Description </label>
                  <p
                    className={TICKETDATASTYLE["requester-details__container"]}
                    id={TICKETDATASTYLE["category-container"]}
                  >
                    {ticketData.ticketDescription}
                  </p>
                </div>
                <div
                  className={TICKETDATASTYLE["requester-details__createdlast"]}
                >
                  <label id={TICKETDATASTYLE["label-createdlast"]}>
                    {" "}
                    Date Requested:{" "}
                  </label>
                  <label>
                    {moment(ticketData.requestedAt).format(
                      "MMMM D YYYY, h:mm:ss a"
                    )}
                  </label>
                </div>
                <div
                  className={TICKETDATASTYLE["requester-details__createdlast"]}
                >
                  <label id={TICKETDATASTYLE["label-createdlast"]}>
                    {" "}
                    Date Accepted:{" "}
                  </label>
                  <label>
                    {moment(ticketData.createdAt).format(
                      "MMMM D YYYY, h:mm:ss a"
                    )}
                  </label>
                </div>
                {(ticketData.status === "Open" ||
                  ticketData.status === "Overdue") && (
                  <>
                    <div
                      className={TICKETDATASTYLE["submitform-container__btn"]}
                    >
                      <div className={TICKETDATASTYLE["modal-btns__wrapper"]}>
                        <div
                          className={
                            TICKETDATASTYLE["modal-btn__reassignticket"]
                          }
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--danger__solid"
                            onClick={() => setVoidTicketModal(true)}
                          >
                            VOID TICKET
                          </Buttons>
                        </div>

                        <div
                          className={TICKETDATASTYLE["modal-btn__submitticket"]}
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--primary__solid"
                            onClick={() => setSubmitTicketModal(true)}
                          >
                            SUBMIT TICKET
                          </Buttons>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {ticketData.status === "Reopened" && (
                  <>
                    <div
                      className={TICKETDATASTYLE["requester-details__category"]}
                    >
                      <label> Resolution Name </label>
                      <p
                        className={
                          TICKETDATASTYLE["requester-details__container"]
                        }
                      >
                        {ticketData.solution}
                      </p>
                    </div>

                    <div
                      className={
                        TICKETDATASTYLE["requester-details__description"]
                      }
                    >
                      <label> Ticket Remarks </label>
                      <p
                        className={
                          TICKETDATASTYLE["requester-details__container"]
                        }
                        id={TICKETDATASTYLE["category-container"]}
                      >
                        {ticketData.remarks}
                      </p>
                    </div>

                    <div
                      className={
                        TICKETDATASTYLE["requester-details__createdlast"]
                      }
                      id={TICKETDATASTYLE["ticketRejected-details"]}
                    >
                      <label id={TICKETDATASTYLE["label-createdlast"]}>
                        {" "}
                        Date Resolved:{" "}
                      </label>
                      <label>
                        {moment(ticketData.resolvedAt).format(
                          "MMMM D YYYY, h:mm:ss a"
                        )}
                      </label>
                    </div>

                    <div
                      className={TICKETDATASTYLE["requester-details__category"]}
                    >
                      <label> Issue Encountered </label>
                      <p
                        className={
                          TICKETDATASTYLE["requester-details__container"]
                        }
                      >
                        {ticketData.issue}
                      </p>
                    </div>
                    <div
                      className={
                        TICKETDATASTYLE["requester-details__createdlast"]
                      }
                      id={TICKETDATASTYLE["ticketRejected-details"]}
                    >
                      <label id={TICKETDATASTYLE["label-createdlast"]}>
                        {" "}
                        Date Reopened:{" "}
                      </label>
                      <label>
                        {moment(ticketData.reopenedAt).format(
                          "MMMM D YYYY, h:mm:ss a"
                        )}
                      </label>
                    </div>

                    <div
                      className={TICKETDATASTYLE["submitform-container__btn"]}
                    >
                      <div className={TICKETDATASTYLE["modal-btns__wrapper"]}>
                        <div
                          className={
                            TICKETDATASTYLE["modal-btn__reassignticket"]
                          }
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--danger__solid"
                            onClick={() => setVoidTicketModal(true)}
                          >
                            VOID TICKET
                          </Buttons>
                        </div>

                        <div
                          className={TICKETDATASTYLE["modal-btn__submitticket"]}
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--primary__solid"
                            onClick={() => setSubmitTicketModal(true)}
                          >
                            SUBMIT TICKET
                          </Buttons>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {ticketData.status === "Resolved" && (
                  <>
                    <div
                      className={TICKETDATASTYLE["requester-details__category"]}
                    >
                      <label> Resolution Name </label>
                      <p
                        className={
                          TICKETDATASTYLE["requester-details__container"]
                        }
                      >
                        {ticketData.solution}
                      </p>
                    </div>

                    <div
                      className={
                        TICKETDATASTYLE["requester-details__description"]
                      }
                    >
                      <label> Ticket Remarks </label>
                      <p
                        className={
                          TICKETDATASTYLE["requester-details__container"]
                        }
                        id={TICKETDATASTYLE["category-container"]}
                      >
                        {ticketData.remarks}
                      </p>
                    </div>

                    <div
                      className={
                        TICKETDATASTYLE["requester-details__createdlast"]
                      }
                      id={TICKETDATASTYLE["ticketRejected-details"]}
                    >
                      <label id={TICKETDATASTYLE["label-createdlast"]}>
                        {" "}
                        Date Resolved:{" "}
                      </label>
                      <label>
                        {moment(ticketData.resolvedAt).format(
                          "MMMM D YYYY, h:mm:ss a"
                        )}
                      </label>
                    </div>
                  </>
                )}
                {ticketData.status === "Rejected" && (
                  <>
                    <div
                      className={TICKETDATASTYLE["requester-details__category"]}
                    >
                      <label> Reject Reason </label>
                      <p
                        className={
                          TICKETDATASTYLE["requester-details__container"]
                        }
                      >
                        {ticketData.rejectReason}
                      </p>
                    </div>

                    <div
                      className={
                        TICKETDATASTYLE["requester-details__description"]
                      }
                    >
                      <label> Ticket Remarks </label>
                      <p
                        className={
                          TICKETDATASTYLE["requester-details__container"]
                        }
                        id={TICKETDATASTYLE["category-container"]}
                      >
                        {ticketData.remarks}
                      </p>
                    </div>

                    <div
                      className={
                        TICKETDATASTYLE["requester-details__createdlast"]
                      }
                      id={TICKETDATASTYLE["ticketRejected-details"]}
                    >
                      <label id={TICKETDATASTYLE["label-createdlast"]}>
                        {" "}
                        Date Rejected:{" "}
                      </label>
                      <label>
                        {moment(ticketData.rejectedAt).format(
                          "MMMM D YYYY, h:mm:ss a"
                        )}
                      </label>
                    </div>
                  </>
                )}
                {ticketData.status === "Voided" && (
                  <>
                    <div
                      className={TICKETDATASTYLE["requester-details__category"]}
                    >
                      <label> Void Reason </label>
                      <p
                        className={
                          TICKETDATASTYLE["requester-details__container"]
                        }
                      >
                        {ticketData.voidReason}
                      </p>
                    </div>

                    <div
                      className={
                        TICKETDATASTYLE["requester-details__description"]
                      }
                    >
                      <label> Ticket Remarks </label>
                      <p
                        className={
                          TICKETDATASTYLE["requester-details__container"]
                        }
                        id={TICKETDATASTYLE["category-container"]}
                      >
                        {ticketData.remarks}
                      </p>
                    </div>

                    <div
                      className={
                        TICKETDATASTYLE["requester-details__createdlast"]
                      }
                      id={TICKETDATASTYLE["ticketRejected-details"]}
                    >
                      <label id={TICKETDATASTYLE["label-createdlast"]}>
                        {" "}
                        Date Voided:{" "}
                      </label>
                      <label>
                        {moment(ticketData.voidedAt).format(
                          "MMMM D YYYY, h:mm:ss a"
                        )}
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TicketData;
