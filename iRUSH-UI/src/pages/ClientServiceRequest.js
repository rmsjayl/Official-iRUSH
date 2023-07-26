import React, { useState, useEffect } from "react";
import SERVICEREQUESTSTYLE from "styles/pages/clientservicerequest.module.css";
import { useNavigate, useParams } from "react-router-dom";
import Header from "components/common/Header";
import { instanceNoAuth } from "api/axios";
import { Buttons } from "components/common/Buttons";
import Spinner from "components/spinner/Spinner";
import { toast } from "react-toastify";
import Pagebroken from "components/common/Pagebroken";

const ClientServiceRequest = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();

  const subject = [
    { _id: 1, title: "Submission of missing documents" },
    { _id: 2, title: "Shifting/Transfer" },
    { _id: 3, title: "Transcripts of Records" },
    { _id: 4, title: "Updating Information" },
  ];

  const [validUrl, setValidUrl] = useState(false);
  const [clientData, setClientData] = useState({
    firstName: "",
    lastName: "",
    contactNum: "",
    unit: "",
    course: " ",
  });

  const [category, setCategory] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formCategory, setFormCategory] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [attachments, setAttachments] = useState("");

  const param = useParams();

  useEffect(() => {
    instanceNoAuth.get(`/settings/fetchcategory`).then((response) => {
      setCategory(response.data);
    });
  }, []);

  useEffect(() => {
    const verifyEmailUrl = async () => {
      setValidUrl(true);
      try {
        setIsLoading(true);
        await instanceNoAuth
          .get(`/clients/clientrequest/${id}/request/${token}`)
          .then((response) => {
            let client = response.data.client;
            setClientData(client);
          });
      } catch (error) {
        setValidUrl(false);

        if (error.response.status === 400) {
          toast.error(error.response.data.message);
          navigate("/");
        }

        if (error.response.status === 404) {
          toast.error(error.response.data.message);
          navigate("/");
        }

        if (error.response.status === 500) {
          toast.error("Something went wrong");
          navigate("/");
        }
      }

      setIsLoading(false);
    };

    verifyEmailUrl();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("category", formCategory);
    formData.append("description", formDescription);
    formData.append("subject", formSubject);
    formData.append("attachments", attachments);
    setFormCategory("");
    setFormDescription("");
    setFormSubject("");
    setAttachments("");
    setIsLoading(true);

    try {
      await instanceNoAuth.post(
        `/clients/clientrequest/${id}/request/${token}`,
        formData
      );
      setIsSubmitted(true);
      navigate(`/clientrequest/${id}`);
    } catch (error) {
      if (
        error.response.status === 400 ||
        error.response.status === 404 ||
        error.response.status === 500
      ) {
        toast.error(error.response.data.message);
        navigate("/");
      }
    }

    setIsLoading(false);
  };

  return (
    <>
      {!validUrl ? (
        <Pagebroken />
      ) : (
        <div className={SERVICEREQUESTSTYLE["servicerequest-container"]}>
          <Header primary={true} />

          <div
            className={SERVICEREQUESTSTYLE["servicerequest-container__wrapper"]}
          >
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                {!isLoading ? (
                  <>
                    <div
                      className={
                        SERVICEREQUESTSTYLE["servicerequest-container__form"]
                      }
                    >
                      <div
                        className={SERVICEREQUESTSTYLE["servicerequest-form"]}
                      >
                        <h2> Service Request </h2>
                      </div>

                      <div
                        className={
                          SERVICEREQUESTSTYLE["servicerequest-form__note"]
                        }
                      >
                        <div
                          className={
                            SERVICEREQUESTSTYLE["servicerequest-note__reminder"]
                          }
                        >
                          <h6>
                            <span id={SERVICEREQUESTSTYLE["asterisk"]}>
                              {" "}
                              &lowast;{" "}
                            </span>{" "}
                            Implies required field
                          </h6>
                        </div>
                      </div>

                      <div
                        className={
                          SERVICEREQUESTSTYLE[
                            "servicerequest-form__clientdetails"
                          ]
                        }
                      >
                        <div
                          className={
                            SERVICEREQUESTSTYLE["clientdetails-firstlayer"]
                          }
                        >
                          <div
                            className={
                              SERVICEREQUESTSTYLE[
                                "container-clientdetails__name"
                              ]
                            }
                          >
                            <div
                              className={
                                SERVICEREQUESTSTYLE["clientdetails__name"]
                              }
                            >
                              <label> Name </label>
                            </div>
                            <div
                              className={
                                SERVICEREQUESTSTYLE[
                                  "cotainer-name__clientinput"
                                ]
                              }
                            >
                              <div
                                className={
                                  SERVICEREQUESTSTYLE["clientname-input"]
                                }
                              >
                                <p
                                  className={
                                    SERVICEREQUESTSTYLE["form-client__input"]
                                  }
                                >
                                  {clientData.lastName}, {clientData.firstName}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div
                            className={
                              SERVICEREQUESTSTYLE[
                                "container-clientdetails__contactnum"
                              ]
                            }
                          >
                            <div
                              className={
                                SERVICEREQUESTSTYLE[
                                  "clientdetails__contactnumber"
                                ]
                              }
                            >
                              <label> Contact Number </label>
                            </div>

                            <div
                              className={
                                SERVICEREQUESTSTYLE[
                                  "cotainer-contactnumber__clientinput"
                                ]
                              }
                            >
                              <div
                                className={
                                  SERVICEREQUESTSTYLE[
                                    "clientcontactnumber-input"
                                  ]
                                }
                              >
                                <p
                                  className={
                                    SERVICEREQUESTSTYLE["form-client__input"]
                                  }
                                >
                                  {clientData.contactNum}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={
                            SERVICEREQUESTSTYLE["clientdetails-secondlayer"]
                          }
                        >
                          <div
                            className={
                              SERVICEREQUESTSTYLE[
                                "container-clientdetails__unit"
                              ]
                            }
                          >
                            <div
                              className={
                                SERVICEREQUESTSTYLE["clientdetails__unit"]
                              }
                            >
                              <label> Unit </label>
                            </div>
                            <div
                              className={
                                SERVICEREQUESTSTYLE[
                                  "cotainer-unit__clientinput"
                                ]
                              }
                            >
                              <div
                                className={
                                  SERVICEREQUESTSTYLE["clientunit-input"]
                                }
                              >
                                <p
                                  className={
                                    SERVICEREQUESTSTYLE["form-client__input"]
                                  }
                                >
                                  {clientData.unit}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div
                            className={
                              SERVICEREQUESTSTYLE[
                                "container-clientdetails__course"
                              ]
                            }
                          >
                            <div
                              className={
                                SERVICEREQUESTSTYLE["clientdetails__course"]
                              }
                            >
                              <label> Program </label>
                            </div>
                            <div
                              className={
                                SERVICEREQUESTSTYLE[
                                  "cotainer-course__clientinput"
                                ]
                              }
                            >
                              <div
                                className={
                                  SERVICEREQUESTSTYLE["clientcourse-input"]
                                }
                              >
                                <p
                                  className={
                                    SERVICEREQUESTSTYLE["form-client__input"]
                                  }
                                >
                                  {clientData.course}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={
                            SERVICEREQUESTSTYLE["clientdetails-thirdlayer"]
                          }
                        >
                          <div
                            className={
                              SERVICEREQUESTSTYLE[
                                "container-clientdetails__category"
                              ]
                            }
                          >
                            <div
                              className={
                                SERVICEREQUESTSTYLE["clientdetails__category"]
                              }
                            >
                              <label>
                                Category{" "}
                                <span id={SERVICEREQUESTSTYLE["asterisk"]}>
                                  {" "}
                                  &lowast;
                                </span>
                              </label>
                            </div>
                            <div
                              className={
                                SERVICEREQUESTSTYLE[
                                  "cotainer-category__clientinput"
                                ]
                              }
                            >
                              <div
                                className={
                                  SERVICEREQUESTSTYLE["clientcategory-input"]
                                }
                              >
                                <select
                                  className={
                                    SERVICEREQUESTSTYLE[
                                      "form-client__input--category"
                                    ]
                                  }
                                  name="category"
                                  value={formCategory}
                                  onChange={(e) =>
                                    setFormCategory(e.target.value)
                                  }
                                >
                                  <option disabled label="Choose one"></option>
                                  {category.map((category) => (
                                    <option
                                      key={category._id}
                                      name="category"
                                      value={category.value}
                                    >
                                      {category.categoryName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={
                            SERVICEREQUESTSTYLE["clientdetails-fourthlayer"]
                          }
                        >
                          <div
                            className={
                              SERVICEREQUESTSTYLE[
                                "container-clientdetails__subject"
                              ]
                            }
                          >
                            <div
                              className={
                                SERVICEREQUESTSTYLE["clientdetails__subject"]
                              }
                            >
                              <label>
                                Subject{" "}
                                <span id={SERVICEREQUESTSTYLE["asterisk"]}>
                                  {" "}
                                  &lowast;
                                </span>
                              </label>
                            </div>
                            <div
                              className={
                                SERVICEREQUESTSTYLE[
                                  "cotainer-subject__clientinput"
                                ]
                              }
                            >
                              <div
                                className={
                                  SERVICEREQUESTSTYLE["clientsubject-input"]
                                }
                              >
                                <select
                                  className={
                                    SERVICEREQUESTSTYLE[
                                      "form-client__input--subject"
                                    ]
                                  }
                                  name="subject"
                                  value={formSubject}
                                  onChange={(e) =>
                                    setFormSubject(e.target.value)
                                  }
                                >
                                  <option disabled label="Choose one"></option>
                                  {subject.map((subject) => (
                                    <option
                                      key={subject._id}
                                      name="subject"
                                      value={subject.value}
                                    >
                                      {subject.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={
                            SERVICEREQUESTSTYLE["clientdetails-fifthlayer"]
                          }
                        >
                          <div
                            className={
                              SERVICEREQUESTSTYLE[
                                "container-clientdetails__description"
                              ]
                            }
                          >
                            <div
                              className={
                                SERVICEREQUESTSTYLE[
                                  "clientdetails__description"
                                ]
                              }
                            >
                              <label>
                                Description{" "}
                                <span id={SERVICEREQUESTSTYLE["asterisk"]}>
                                  {" "}
                                  &lowast;
                                </span>
                              </label>
                            </div>
                            <div
                              className={
                                SERVICEREQUESTSTYLE[
                                  "cotainer-description__clientinput"
                                ]
                              }
                            >
                              <div
                                className={
                                  SERVICEREQUESTSTYLE["clientdescription-input"]
                                }
                              >
                                <input
                                  className={
                                    SERVICEREQUESTSTYLE[
                                      "form-client__input--description"
                                    ]
                                  }
                                  placeholder="Briefly discuss your concern"
                                  type="text"
                                  name="description"
                                  value={formDescription}
                                  onChange={(e) =>
                                    setFormDescription(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={
                            SERVICEREQUESTSTYLE[
                              "container-clientdetails__formbutton"
                            ]
                          }
                        >
                          <div
                            className={
                              SERVICEREQUESTSTYLE["clientdetails__formbutton"]
                            }
                          >
                            <Buttons
                              buttonSize="btn--medium"
                              buttonStyle="btn--primary__solid"
                            >
                              Submit
                            </Buttons>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <Spinner />
                )}
              </form>
            ) : (
              // TO DOOOOO
              <h1> Hello World </h1>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ClientServiceRequest;
