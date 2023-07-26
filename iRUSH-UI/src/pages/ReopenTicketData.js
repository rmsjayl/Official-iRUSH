import Pagebroken from "components/common/Pagebroken";
import REOPENTICKETSTYLE from "styles/pages/clientservicerequest.module.css";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ServiceFormSubmitted from "./ServiceFormSubmitted";
import Spinner from "components/spinner/Spinner";
import Header from "components/common/Header";
import moment from "moment";
import { instanceNoAuth } from "api/axios";

const ReopenTicketData = () => {
  const param = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validUrl, setValidUrl] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestedResolvedTickets, setRequestedResolvedTickets] = useState({
    requesterName: "",
    requesterEmail: "",
    clietnContactNum: "",
    assignBy: "",
    assignTo: "",
    status: "",
    ticketCategory: "",
    ticketSubject: "",
    ticketDescription: "",
    voidReason: "",
    solution: "",
    rejectReason: "",
    voidedAt: "",
    resolvedAt: "",
    rejectedAt: "",
    createdAt: "",
    updatedAt: "",
    isReopened: "",
  });

  useEffect(() => {
    const verifyUrl = async () => {
      setLoading(true);
      setValidUrl(true);
      try {
        setLoading(true);
        await instanceNoAuth
          .get(
            `/clients/client/${param.id}/${param.token}/requestedtickets/${param.ticketId}`
          )
          .then((response) => {
            toast.success(response.data.message);
            let requestedTicketsData = response.data.requestedTicket;
            setRequestedResolvedTickets(requestedTicketsData);
          });
      } catch (error) {
        setValidUrl(false);
        toast.error(error.response.data.message);
      }

      setLoading(false);
    };

    verifyUrl();
  }, [param]);

  const [reopenIssueData, setReopenIssueData] = useState({
    issue: "",
  });

  const handleChange = ({ currentTarget: input }) => {
    setReopenIssueData({ ...reopenIssueData, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await instanceNoAuth
        .post(
          `/clients/client/${param.id}/${param.token}/requestedtickets/${param.ticketId}`,
          reopenIssueData
        )
        .then((response) => {
          toast.success(response.data.message);
          setReopenIssueData({ issue: "" });
          setSubmitted(true);
        });
    } catch (error) {
      toast.error(error.response.data.message);

      if (
        error.response.status === 400 ||
        error.response.status === 404 ||
        error.response.status === 500
      ) {
        toast.error(error.response.data.message);
        navigate("/");
      }
    }
    setLoading(false);
  };

  return (
    <>
      {validUrl ? (
        <div className={REOPENTICKETSTYLE["servicerequest-container"]}>
          {!submitted ? (
            <div
              className={REOPENTICKETSTYLE["servicerequest-container__wrapper"]}
            >
              {!loading ? (
                <>
                  <div
                    className={
                      REOPENTICKETSTYLE["servicerequest-container__header"]
                    }
                  >
                    <Header primary={true} />
                  </div>

                  <div
                    className={
                      REOPENTICKETSTYLE["servicerequest-container__form"]
                    }
                  >
                    <div className={REOPENTICKETSTYLE["servicerequest-form"]}>
                      <h4> Requested Tickets</h4>
                    </div>

                    <div
                      className={
                        REOPENTICKETSTYLE["servicerequest-form__clientdetails"]
                      }
                    >
                      <div
                        className={
                          REOPENTICKETSTYLE["clientdetails-firstlayer"]
                        }
                      >
                        <div
                          className={
                            REOPENTICKETSTYLE["container-clientdetails__name"]
                          }
                        >
                          <div
                            className={REOPENTICKETSTYLE["clientdetails__name"]}
                          >
                            <label> Name </label>
                          </div>
                          <div
                            className={
                              REOPENTICKETSTYLE["cotainer-name__clientinput"]
                            }
                          >
                            <div
                              className={REOPENTICKETSTYLE["clientname-input"]}
                            >
                              <p
                                className={
                                  REOPENTICKETSTYLE["form-client__input"]
                                }
                              >
                                {requestedResolvedTickets.requesterName}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div
                          className={
                            REOPENTICKETSTYLE[
                              "container-clientdetails__contactnum"
                            ]
                          }
                        >
                          <div
                            className={
                              REOPENTICKETSTYLE["clientdetails__contactnumber"]
                            }
                          >
                            <label> Contact Number </label>
                          </div>

                          <div
                            className={
                              REOPENTICKETSTYLE[
                                "cotainer-contactnumber__clientinput"
                              ]
                            }
                          >
                            <div
                              className={
                                REOPENTICKETSTYLE["clientcontactnumber-input"]
                              }
                            >
                              <p
                                className={
                                  REOPENTICKETSTYLE["form-client__input"]
                                }
                              >
                                {requestedResolvedTickets.clientContactNum}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={
                          REOPENTICKETSTYLE["clientdetails-secondlayer"]
                        }
                      >
                        <div
                          className={
                            REOPENTICKETSTYLE["container-clientdetails__unit"]
                          }
                        >
                          <div
                            className={REOPENTICKETSTYLE["clientdetails__unit"]}
                          >
                            <label> Unit </label>
                          </div>
                          <div
                            className={
                              REOPENTICKETSTYLE["cotainer-unit__clientinput"]
                            }
                          >
                            <div
                              className={REOPENTICKETSTYLE["clientunit-input"]}
                            >
                              <p
                                className={
                                  REOPENTICKETSTYLE["form-client__input"]
                                }
                              >
                                {requestedResolvedTickets.clientUnit}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={
                            REOPENTICKETSTYLE["container-clientdetails__course"]
                          }
                        >
                          <div
                            className={
                              REOPENTICKETSTYLE["clientdetails__course"]
                            }
                          >
                            <label> Requested At </label>
                          </div>
                          <div
                            className={
                              REOPENTICKETSTYLE["cotainer-course__clientinput"]
                            }
                          >
                            <div
                              className={
                                REOPENTICKETSTYLE["clientcourse-input"]
                              }
                            >
                              <p
                                className={
                                  REOPENTICKETSTYLE["form-client__input"]
                                }
                              >
                                {moment(
                                  requestedResolvedTickets.requestedAt
                                ).format("MMMM D YYYY, h:mm:ss a")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={
                          REOPENTICKETSTYLE["clientdetails-thirdlayer"]
                        }
                      >
                        <div
                          className={
                            REOPENTICKETSTYLE[
                              "container-clientdetails__category"
                            ]
                          }
                        >
                          <div
                            className={
                              REOPENTICKETSTYLE["clientdetails__category"]
                            }
                          >
                            <label>Category</label>
                          </div>
                          <div
                            className={
                              REOPENTICKETSTYLE["cotainer-course__clientinput"]
                            }
                          >
                            <div
                              className={
                                REOPENTICKETSTYLE["clientcategory-input"]
                              }
                            >
                              <p
                                className={
                                  REOPENTICKETSTYLE["form-client__input"]
                                }
                              >
                                {requestedResolvedTickets.ticketCategory}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={
                          REOPENTICKETSTYLE["clientdetails-fifthlayer"]
                        }
                      >
                        <div
                          className={
                            REOPENTICKETSTYLE[
                              "container-clientdetails__ticketdescription"
                            ]
                          }
                        >
                          <div
                            className={
                              REOPENTICKETSTYLE[
                                "clientdetails__ticketdescription"
                              ]
                            }
                          >
                            <label style={{ fontSize: "15px" }}>
                              Ticket Description
                            </label>
                            <p
                              className={
                                REOPENTICKETSTYLE[
                                  "cotainer-ticketdiscription__clientinput"
                                ]
                              }
                              id={REOPENTICKETSTYLE["category-container"]}
                            >
                              {requestedResolvedTickets.ticketDescription}
                            </p>
                          </div>
                        </div>
                      </div>
                      {requestedResolvedTickets.status === "Resolved" && (
                        <>
                          <div
                            className={
                              REOPENTICKETSTYLE[
                                "reopenticket-status__container"
                              ]
                            }
                          >
                            Resolved At:
                            <label>
                              {moment(
                                requestedResolvedTickets.resolvedAt
                              ).format("MMMM D YYYY, h:mm:ss a")}
                            </label>
                          </div>
                          <div
                            className={
                              REOPENTICKETSTYLE["clientdetails-thirdlayer"]
                            }
                          >
                            <div
                              className={
                                REOPENTICKETSTYLE[
                                  "container-clientdetails__category"
                                ]
                              }
                            >
                              <div
                                className={
                                  REOPENTICKETSTYLE["clientdetails__category"]
                                }
                              >
                                <label> Solution Name </label>
                              </div>
                              <div
                                className={
                                  REOPENTICKETSTYLE[
                                    "cotainer-course__clientinput"
                                  ]
                                }
                              >
                                <div
                                  className={
                                    REOPENTICKETSTYLE["clientcategory-input"]
                                  }
                                >
                                  <p
                                    className={
                                      REOPENTICKETSTYLE["form-client__input"]
                                    }
                                  >
                                    {requestedResolvedTickets.solution}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={
                              REOPENTICKETSTYLE["clientdetails-fifthlayer"]
                            }
                          >
                            <div
                              className={
                                REOPENTICKETSTYLE[
                                  "container-clientdetails__description"
                                ]
                              }
                            >
                              <div
                                className={
                                  REOPENTICKETSTYLE[
                                    "requester-details__description"
                                  ]
                                }
                              >
                                <label style={{ fontSize: "15px" }}>
                                  Remarks
                                </label>
                                <p
                                  className={
                                    REOPENTICKETSTYLE[
                                      "requester-details__container"
                                    ]
                                  }
                                  id={REOPENTICKETSTYLE["category-container"]}
                                >
                                  {requestedResolvedTickets.remarks}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div
                            className={
                              REOPENTICKETSTYLE["clientdetails-fifthlayer"]
                            }
                          >
                            <div
                              className={
                                REOPENTICKETSTYLE[
                                  "container-clientdetails__description"
                                ]
                              }
                            >
                              <div
                                className={
                                  REOPENTICKETSTYLE[
                                    "clientdetails__description"
                                  ]
                                }
                              >
                                <label>
                                  Issue{" "}
                                  <span id={REOPENTICKETSTYLE["asterisk"]}>
                                    {" "}
                                    &lowast;
                                  </span>
                                </label>
                              </div>
                              <div
                                className={
                                  REOPENTICKETSTYLE[
                                    "cotainer-description__clientinput"
                                  ]
                                }
                              >
                                <div
                                  className={
                                    REOPENTICKETSTYLE["clientdescription-input"]
                                  }
                                >
                                  <input
                                    className={
                                      REOPENTICKETSTYLE[
                                        "form-client__input--description"
                                      ]
                                    }
                                    placeholder="Briefly discuss your issue"
                                    name="issue"
                                    onChange={handleChange}
                                    value={reopenIssueData.issue}
                                    type="text"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            className={
                              REOPENTICKETSTYLE[
                                "container-clientdetails__formbutton"
                              ]
                            }
                          >
                            <div
                              className={
                                REOPENTICKETSTYLE["clientdetails__formbutton"]
                              }
                            >
                              <Buttons
                                buttonSize="btn--medium"
                                buttonStyle="btn--primary__solid"
                                onClick={handleSubmit}
                              >
                                Submit
                              </Buttons>
                            </div>
                          </div>
                        </>
                      )}
                      {requestedResolvedTickets.status === "Voided" && (
                        <>
                          <div
                            className={
                              REOPENTICKETSTYLE[
                                "reopenticket-status__container"
                              ]
                            }
                          >
                            Voided At:
                            <label>
                              {moment(requestedResolvedTickets.voidedAt).format(
                                "MMMM D YYYY, h:mm:ss a"
                              )}
                            </label>
                          </div>
                          <div
                            className={
                              REOPENTICKETSTYLE["clientdetails-thirdlayer"]
                            }
                          >
                            <div
                              className={
                                REOPENTICKETSTYLE[
                                  "container-clientdetails__category"
                                ]
                              }
                            >
                              <div
                                className={
                                  REOPENTICKETSTYLE["clientdetails__category"]
                                }
                              >
                                <label> Void Reason </label>
                              </div>
                              <div
                                className={
                                  REOPENTICKETSTYLE[
                                    "cotainer-course__clientinput"
                                  ]
                                }
                              >
                                <div
                                  className={
                                    REOPENTICKETSTYLE["clientcategory-input"]
                                  }
                                >
                                  <p
                                    className={
                                      REOPENTICKETSTYLE["form-client__input"]
                                    }
                                  >
                                    {requestedResolvedTickets.voidReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={
                              REOPENTICKETSTYLE["clientdetails-fifthlayer"]
                            }
                          >
                            <div
                              className={
                                REOPENTICKETSTYLE[
                                  "container-clientdetails__description"
                                ]
                              }
                            >
                              <div
                                className={
                                  REOPENTICKETSTYLE[
                                    "requester-details__description"
                                  ]
                                }
                              >
                                <label style={{ fontSize: "15px" }}>
                                  Remarks
                                </label>
                                <p
                                  className={
                                    REOPENTICKETSTYLE[
                                      "requester-details__container"
                                    ]
                                  }
                                  id={REOPENTICKETSTYLE["category-container"]}
                                >
                                  {requestedResolvedTickets.remarks}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {requestedResolvedTickets.status === "Reopened" && (
                        <>
                          <div
                            className={
                              REOPENTICKETSTYLE[
                                "reopenticket-status__container"
                              ]
                            }
                          >
                            Reopened At:
                            <label>
                              {moment(
                                requestedResolvedTickets.reopenedAt
                              ).format("MMMM D YYYY, h:mm:ss a")}
                            </label>
                          </div>
                          <div
                            className={
                              REOPENTICKETSTYLE["clientdetails-thirdlayer"]
                            }
                          >
                            <div
                              className={
                                REOPENTICKETSTYLE[
                                  "container-clientdetails__category"
                                ]
                              }
                            >
                              <div
                                className={
                                  REOPENTICKETSTYLE["clientdetails__category"]
                                }
                              >
                                <label> Issue </label>
                              </div>
                              <div
                                className={
                                  REOPENTICKETSTYLE[
                                    "cotainer-course__clientinput"
                                  ]
                                }
                              >
                                <div
                                  className={
                                    REOPENTICKETSTYLE["clientcategory-input"]
                                  }
                                >
                                  <p
                                    className={
                                      REOPENTICKETSTYLE["form-client__input"]
                                    }
                                  >
                                    {requestedResolvedTickets.issue}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {requestedResolvedTickets.status === "Rejected" && (
                        <>
                          <div
                            className={
                              REOPENTICKETSTYLE[
                                "reopenticket-status__container"
                              ]
                            }
                          >
                            Rejected At:
                            <label>
                              {moment(
                                requestedResolvedTickets.rejectedAt
                              ).format("MMMM D YYYY, h:mm:ss a")}
                            </label>
                          </div>
                          <div
                            className={
                              REOPENTICKETSTYLE["clientdetails-thirdlayer"]
                            }
                          >
                            <div
                              className={
                                REOPENTICKETSTYLE[
                                  "container-clientdetails__category"
                                ]
                              }
                            >
                              <div
                                className={
                                  REOPENTICKETSTYLE["clientdetails__category"]
                                }
                              >
                                <label> Reject Reason </label>
                              </div>
                              <div
                                className={
                                  REOPENTICKETSTYLE[
                                    "cotainer-course__clientinput"
                                  ]
                                }
                              >
                                <div
                                  className={
                                    REOPENTICKETSTYLE["clientcategory-input"]
                                  }
                                >
                                  <p
                                    className={
                                      REOPENTICKETSTYLE["form-client__input"]
                                    }
                                  >
                                    {requestedResolvedTickets.rejectReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={
                              REOPENTICKETSTYLE["clientdetails-fifthlayer"]
                            }
                          >
                            <div
                              className={
                                REOPENTICKETSTYLE[
                                  "container-clientdetails__description"
                                ]
                              }
                            >
                              <div
                                className={
                                  REOPENTICKETSTYLE[
                                    "requester-details__description"
                                  ]
                                }
                              >
                                <label style={{ fontSize: "15px" }}>
                                  Remarks
                                </label>
                                <p
                                  className={
                                    REOPENTICKETSTYLE[
                                      "requester-details__container"
                                    ]
                                  }
                                  id={REOPENTICKETSTYLE["category-container"]}
                                >
                                  {requestedResolvedTickets.remarks}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {(requestedResolvedTickets.status === "Overdue" ||
                        requestedResolvedTickets.status === "Open") && (
                        <>
                          <div
                            className={
                              REOPENTICKETSTYLE[
                                "reopenticket-status__container"
                              ]
                            }
                          >
                            Date Accepted:
                            <label>
                              {moment(
                                requestedResolvedTickets.createdAt
                              ).format("MMMM D YYYY, h:mm:ss a")}
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <Spinner />
              )}
            </div>
          ) : (
            <ServiceFormSubmitted />
          )}
        </div>
      ) : (
        <Pagebroken />
      )}
    </>
  );
};

export default ReopenTicketData;
