import React, { useState, useEffect } from "react";
import SERVICEREQUESTSTYLE from "styles/pages/admin/user-admin/servicerequestdata.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { instance } from "api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "components/spinner/Spinner";
import moment from "moment";
import { Buttons } from "components/common/Buttons";
import RejectRequestMondal from "components/modals/RejectRequestModal";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const ServiceRequestsData = ({
  newServiceRequest,
  reopenTicketRequest,
  rejectedServiceRequest,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rejectServiceModalOpen, setRejectServiceModalOpen] = useState(false);
  const [serviceRequestData, setServiceRequestData] = useState([]);
  const [rejectedServiceRequestData, setRejectedServiceRequestData] = useState(
    []
  );
  const [reopenTicketRequestData, setReopenTicketRequestData] = useState([]);
  const [clerkData, setClerkData] = useState([]);
  const [confirmTicket, setConfirmTicket] = useState({
    assignTo: "",
    priority: "",
  });

  const handleChange = (event, name) => {
    setConfirmTicket({
      ...confirmTicket,
      [name]: event.target.value,
    });
  };

  const priorityOption = [
    {
      id: 1,
      value: "High",
    },
    {
      id: 2,
      value: "Mid",
    },
    {
      id: 3,
      value: "Low",
    },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      await instance
        .get(`/settings/fetchusers`)
        .then((res) => {
          setClerkData(res.data);
        })
        .catch((err) => {
          console.log(err);
          if (err.response.status === 401) {
            window.location.href = "/login";
          }
        });
    };

    const fetchServiceRequestData = async () => {
      setLoading(true);
      await instance

        .get(`/tickets/servicerequests/${id}`)
        .then((res) => {
          setServiceRequestData(res.data.service);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            window.location.href = "/login";
          }

          if (err.response.status === 404) {
            navigate("/admin/servicerequests");
            toast.error("Service Request Not Found");
          }

          if (err.response.status === 500) {
            navigate("/admin/servicerequests");
            toast.error("Service Request Not Found.");
          }
        });

      setLoading(false);
    };

    const fetchRejectedServiceRequestData = async () => {
      setLoading(true);
      await instance
        .get(`/tickets/rejectedservicerequests/${id}`)
        .then((res) => {
          setRejectedServiceRequestData(res.data.rejectedservicerequest);
          console.log;
        })
        .catch((err) => {
          if (err.response.status === 401) {
            window.location.href = "/login";
          }

          if (err.response.status === 404) {
            navigate("/admin/servicerequests");
            toast.error("Service Request Not Found");
          }

          if (err.response.status === 500) {
            navigate("/admin/servicerequests");
            toast.error("Service Request Not Found.");
          }
        });
      setLoading(false);
    };

    const fetchReopenTicketRequestData = async () => {
      setLoading(true);
      await instance
        .get(`/tickets/requestedreopenedtickets/${id}`)
        .then((res) => {
          setReopenTicketRequestData(res.data.reopenedTicketRequest);
          console.log(res.data.reopenedTicketRequest);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            window.location.href = "/login";
          }

          if (err.response.status === 404) {
            navigate("/admin/servicerequests");
            toast.error("Service Request Not Found");
          }

          if (err.response.status === 500) {
            navigate("/admin/servicerequests");
            toast.error("Service Request Not Found.");
          }
        });

      setLoading(false);
    };

    fetchUsers();
    if (id && newServiceRequest) {
      fetchServiceRequestData();
    }

    if (id && reopenTicketRequest) {
      fetchReopenTicketRequestData();
    }

    if (id && rejectedServiceRequest) {
      fetchRejectedServiceRequestData();
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const url = `/tickets/servicerequests/${id}`;
      await instance.post(url, confirmTicket).then((response) => {
        toast.success(response.data.message);
        navigate("/admin/servicerequests/newservicerequests");
      });
    } catch (error) {
      if (error.response.status === 400) {
        toast.error(error.response.data.message);
      }

      if (error.response.status === 401) {
        window.location.href = "/login";
      }

      if (error.response.status === 404) {
        toast.error("Error occured while rejecting the request.");
        navigate("/admin/servicerequests/newservicerequests");
      }

      if (error.response.status === 500) {
        toast.error("Error occured while rejecting the request.");
        navigate("/admin/servicerequests/newservicerequests");
      }
    }
    setLoading(false);
  };

  const reopenServiceHandleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const url = `/tickets/requestedreopenedtickets/${id}`;
      await instance.post(url, confirmTicket).then((response) => {
        toast.success(response.data.message);
        navigate("/admin/servicerequests/reopenticketrequests");
      });
    } catch (error) {
      if (error.response.status === 400) {
        toast.error("Bad request. Please fill all the fields.");
      }

      if (error.response.status === 401) {
        window.location.href = "/login";
      }

      if (error.response.status === 404) {
        toast.error("Error occured while submitting the ticket.");
        navigate("/admin/servicerequests/reopenticketrequests");
      }

      if (error.response.status === 500) {
        toast.error(
          "Error occured while submitting the ticket. Please try again later"
        );
        navigate("/admin/servicerequests/reopenticketrequests");
      }

      setLoading(false);
    }
  };

  return (
    <>
      {rejectServiceModalOpen && (
        <RejectRequestMondal modalOpen={setRejectServiceModalOpen} />
      )}

      {newServiceRequest && (
        <div
          className={SERVICEREQUESTSTYLE["requestedservice-container__content"]}
        >
          <div className={SERVICEREQUESTSTYLE["header_viewingservicerequest"]}>
            <h3>
              Viewing New Service Request No. {serviceRequestData.requestNo} —{" "}
              {serviceRequestData.category}
            </h3>
          </div>

          {loading ? (
            <Spinner PageLoading={true} />
          ) : (
            <div
              className={
                SERVICEREQUESTSTYLE["content-requestedservicerequest-details"]
              }
            >
              <div
                className={
                  SERVICEREQUESTSTYLE[
                    "requestedservicerequest-details__requester"
                  ]
                }
              >
                <div
                  className={SERVICEREQUESTSTYLE["requester-details__email"]}
                >
                  <label> Email </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {serviceRequestData.requesterEmail}
                  </p>
                </div>
                <div className={SERVICEREQUESTSTYLE["requester-details__name"]}>
                  <label> Name </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {serviceRequestData.requester}
                  </p>
                </div>
                <div className={SERVICEREQUESTSTYLE["requester-details__unit"]}>
                  <label> Unit </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {serviceRequestData.clientUnit}
                  </p>
                </div>
                <div
                  className={
                    SERVICEREQUESTSTYLE["requester-details__contactnumber"]
                  }
                >
                  <label> Contact Number </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {serviceRequestData.clientContact}
                  </p>
                </div>
              </div>

              <div
                className={
                  SERVICEREQUESTSTYLE[
                    "requestedservicerequest-servicerequestcontent"
                  ]
                }
              >
                <div
                  className={
                    SERVICEREQUESTSTYLE[
                      "requestedservicerequest-servicerequestcontent__wrapper"
                    ]
                  }
                >
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__category"]
                    }
                  >
                    <label> Category </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                    >
                      {serviceRequestData.category}
                    </p>
                  </div>
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__subject"]
                    }
                  >
                    <label> Subject </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                    >
                      {serviceRequestData.subject}
                    </p>
                  </div>
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__referenceno"]
                    }
                  >
                    <label> Reference No </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                    >
                      {serviceRequestData.referenceNo}
                    </p>
                  </div>
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__description"]
                    }
                  >
                    <label> Service Request Description </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                      id={SERVICEREQUESTSTYLE["category-container"]}
                    >
                      {serviceRequestData.description}
                    </p>
                  </div>
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__createdlast"]
                    }
                  >
                    <label id={SERVICEREQUESTSTYLE["label-createdlast"]}>
                      {" "}
                      Date Requested:{" "}
                    </label>
                    <label>
                      {moment(serviceRequestData.createdAt).format(
                        "MMMM D YYYY, h:mm:ss a"
                      )}
                    </label>
                  </div>

                  <div
                    className={
                      SERVICEREQUESTSTYLE["confirmticket-container__assign"]
                    }
                  >
                    <div>
                      <Box>
                        <FormControl fullWidth>
                          <InputLabel id="demo-simple-select-label">
                            ASSIGN TICKET
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Assign Ticket"
                            value={confirmTicket.assignTo}
                            onChange={(e) => handleChange(e, "assignTo")}
                          >
                            {clerkData.map((clerks) => {
                              return (
                                <MenuItem key={clerks._id} value={clerks.email}>
                                  {clerks.email}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Box>
                    </div>

                    <div>
                      <Box
                        sx={{
                          padding: "10px 0",
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel id="demo-simple-select-label">
                            SET PRIORITY
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="SET PRIORITY"
                            value={confirmTicket.priority}
                            onChange={(e) => handleChange(e, "priority")}
                          >
                            {priorityOption.map((priority) => {
                              return (
                                <MenuItem
                                  key={priority.id}
                                  value={priority.value}
                                >
                                  {priority.value}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Box>
                    </div>
                  </div>
                </div>

                <div
                  className={SERVICEREQUESTSTYLE["submitform-container__btn"]}
                >
                  <div className={SERVICEREQUESTSTYLE["modal-btns__wrapper"]}>
                    <div>
                      <Buttons
                        buttonSize="btn--medium"
                        buttonStyle="btn--secondary__solid"
                        onClick={() => setRejectServiceModalOpen(true)}
                      >
                        REJECT REQUEST
                      </Buttons>
                    </div>

                    <div>
                      <Buttons
                        buttonSize="btn--medium"
                        buttonStyle="btn--primary__solid"
                        onClick={handleSubmit}
                      >
                        SUBMIT AS TICKET
                      </Buttons>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {reopenTicketRequest && (
        <div
          className={SERVICEREQUESTSTYLE["requestedservice-container__content"]}
        >
          <div className={SERVICEREQUESTSTYLE["header_viewingservicerequest"]}>
            <h3>
              Viewing New Service Request No.{" "}
              {reopenTicketRequestData.requestNo} —{" "}
              {reopenTicketRequestData.ticketCategory}
            </h3>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div
              className={
                SERVICEREQUESTSTYLE["content-requestedservicerequest-details"]
              }
            >
              <div
                className={
                  SERVICEREQUESTSTYLE[
                    "requestedservicerequest-details__requester"
                  ]
                }
              >
                <div
                  className={SERVICEREQUESTSTYLE["requester-details__email"]}
                >
                  <label> Email </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {reopenTicketRequestData.requesterEmail}
                  </p>
                </div>
                <div className={SERVICEREQUESTSTYLE["requester-details__name"]}>
                  <label> Name </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {reopenTicketRequestData.requester}
                  </p>
                </div>
                <div className={SERVICEREQUESTSTYLE["requester-details__unit"]}>
                  <label> Unit </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {reopenTicketRequestData.clientUnit}
                  </p>
                </div>
                <div
                  className={
                    SERVICEREQUESTSTYLE["requester-details__contactnumber"]
                  }
                >
                  <label> Contact Number </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {reopenTicketRequestData.contactNum}
                  </p>
                </div>
              </div>

              <div
                className={
                  SERVICEREQUESTSTYLE[
                    "requestedservicerequest-servicerequestcontent"
                  ]
                }
              >
                <div
                  className={
                    SERVICEREQUESTSTYLE[
                      "requestedservicerequest-servicerequestcontent__wrapper"
                    ]
                  }
                >
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__category"]
                    }
                  >
                    <label> Category </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                    >
                      {reopenTicketRequestData.ticketCategory}
                    </p>
                  </div>
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__subject"]
                    }
                  >
                    <label> Subject </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                    >
                      {reopenTicketRequestData.ticketSubject}
                    </p>
                  </div>
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__referenceno"]
                    }
                  >
                    <label> Reference No </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                    >
                      {reopenTicketRequestData.referenceNo}
                    </p>
                  </div>
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__description"]
                    }
                  >
                    <label> Service Request Description </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                      id={SERVICEREQUESTSTYLE["category-container"]}
                    >
                      {reopenTicketRequestData.ticketDescription}
                    </p>
                  </div>
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__createdlast"]
                    }
                  >
                    <label id={SERVICEREQUESTSTYLE["label-createdlast"]}>
                      {" "}
                      Date Reopened:{" "}
                    </label>
                    <label>
                      {moment(reopenTicketRequestData.reopenedAt).format(
                        "MMMM D YYYY, h:mm:ss a"
                      )}
                    </label>
                  </div>
                </div>

                <div
                  className={
                    SERVICEREQUESTSTYLE["confirmticket-container__assign"]
                  }
                >
                  <div>
                    <Box>
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">
                          ASSIGN TICKET
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          label="Assign Ticket"
                          value={confirmTicket.assignTo}
                          onChange={(e) => handleChange(e, "assignTo")}
                        >
                          {clerkData.map((clerks) => {
                            return (
                              <MenuItem key={clerks._id} value={clerks.email}>
                                {clerks.email}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Box>
                  </div>

                  <div>
                    <Box
                      sx={{
                        padding: "10px 0",
                      }}
                    >
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">
                          SET PRIORITY
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          label="SET PRIORITY"
                          value={confirmTicket.priority}
                          onChange={(e) => handleChange(e, "priority")}
                        >
                          {priorityOption.map((priority) => {
                            return (
                              <MenuItem
                                key={priority.id}
                                value={priority.value}
                              >
                                {priority.value}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Box>
                  </div>
                </div>

                <div
                  className={SERVICEREQUESTSTYLE["submitform-container__btn"]}
                >
                  <div className={SERVICEREQUESTSTYLE["modal-btns__wrapper"]}>
                    <div>
                      <Buttons
                        buttonSize="btn--medium"
                        buttonStyle="btn--primary__solid"
                        onClick={reopenServiceHandleSubmit}
                      >
                        SUBMIT AS TICKET
                      </Buttons>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {rejectedServiceRequest && (
        <div
          className={SERVICEREQUESTSTYLE["requestedservice-container__content"]}
        >
          <div className={SERVICEREQUESTSTYLE["header_viewingservicerequest"]}>
            <h3>
              Viewing Rejected Request No.{" "}
              {rejectedServiceRequestData.requestNo} —{" "}
              {rejectedServiceRequestData.category}
            </h3>
          </div>

          {loading ? (
            <Spinner PageLoading={true} />
          ) : (
            <div
              className={
                SERVICEREQUESTSTYLE["content-requestedservicerequest-details"]
              }
            >
              <div
                className={
                  SERVICEREQUESTSTYLE[
                    "requestedservicerequest-details__requester"
                  ]
                }
              >
                <div
                  className={SERVICEREQUESTSTYLE["requester-details__email"]}
                >
                  <label> Email </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {rejectedServiceRequestData.requesterEmail}
                  </p>
                </div>
                <div className={SERVICEREQUESTSTYLE["requester-details__name"]}>
                  <label> Name </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {rejectedServiceRequestData.requester}
                  </p>
                </div>
                <div className={SERVICEREQUESTSTYLE["requester-details__unit"]}>
                  <label> Unit </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {rejectedServiceRequestData.clientUnit}
                  </p>
                </div>
                <div
                  className={
                    SERVICEREQUESTSTYLE["requester-details__contactnumber"]
                  }
                >
                  <label> Contact Number </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {rejectedServiceRequestData.clientContact}
                  </p>
                </div>
                <div
                  className={
                    SERVICEREQUESTSTYLE["requester-details__rejectedby"]
                  }
                >
                  <label> Rejected By </label>
                  <p
                    className={
                      SERVICEREQUESTSTYLE["requester-details__container"]
                    }
                  >
                    {rejectedServiceRequestData.rejectedBy}
                  </p>
                </div>
              </div>

              <div
                className={
                  SERVICEREQUESTSTYLE[
                    "requestedservicerequest-servicerequestcontent"
                  ]
                }
              >
                <div
                  className={
                    SERVICEREQUESTSTYLE[
                      "requestedservicerequest-servicerequestcontent__wrapper"
                    ]
                  }
                >
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__category"]
                    }
                  >
                    <label> Category </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                    >
                      {rejectedServiceRequestData.category}
                    </p>
                  </div>
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__subject"]
                    }
                  >
                    <label> Subject </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                    >
                      {rejectedServiceRequestData.subject}
                    </p>
                  </div>
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__referenceno"]
                    }
                  >
                    <label> Reference No </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                    >
                      {rejectedServiceRequestData.referenceNo}
                    </p>
                  </div>
                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__description"]
                    }
                  >
                    <label> Service Request Description </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                      id={SERVICEREQUESTSTYLE["category-container"]}
                    >
                      {rejectedServiceRequestData.description}
                    </p>
                  </div>

                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__createdlast"]
                    }
                  >
                    <label id={SERVICEREQUESTSTYLE["label-createdlast"]}>
                      {" "}
                      Date Requested:{" "}
                    </label>
                    <label>
                      {moment(rejectedServiceRequestData.createdAt).format(
                        "MMMM D YYYY, h:mm:ss a"
                      )}
                    </label>
                  </div>

                  <div
                    className={SERVICEREQUESTSTYLE["requester-details__reason"]}
                  >
                    <label> Reason for Rejecting </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                    >
                      {rejectedServiceRequestData.rejectedtedReason}
                    </p>
                  </div>

                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__description"]
                    }
                  >
                    <label> Reject Reason Remarks </label>
                    <p
                      className={
                        SERVICEREQUESTSTYLE["requester-details__container"]
                      }
                      id={SERVICEREQUESTSTYLE["category-container"]}
                    >
                      {rejectedServiceRequestData.remarks}
                    </p>
                  </div>

                  <div
                    className={
                      SERVICEREQUESTSTYLE["requester-details__rejectedat"]
                    }
                    id={SERVICEREQUESTSTYLE["servicerequestRejected-details"]}
                  >
                    <label id={SERVICEREQUESTSTYLE["label-rejectedat"]}>
                      {" "}
                      Date Rejected:{" "}
                    </label>
                    <label>
                      {moment(rejectedServiceRequestData.rejectedAt).format(
                        "MMMM D YYYY, h:mm:ss a"
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ServiceRequestsData;
