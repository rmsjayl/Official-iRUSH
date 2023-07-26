import React, { useState, useEffect } from "react";
import SETTINGDATASTYLE from "styles/pages/admin/user-admin/settingsdata.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import { instance } from "api/axios";
import { Buttons } from "components/common/Buttons";
import moment from "moment";
import Spinner from "components/spinner/Spinner";
import Textfield from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

const SettingsData = ({
  users,
  categories,
  rejectReasons,
  voidReasons,
  resolution,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  //ROLE OPTION VALUE
  const clerkOptionValue = [
    {
      id: 1,
      name: "USER_SUPERADMIN",
      value: "USER_SUPERADMIN",
    },
    {
      id: 2,
      name: "USER_ADMIN",
      value: "USER_ADMIN",
    },
    {
      id: 3,
      name: "CLERK_HELPDESKSUPPORT",
      value: "CLERK_HELPDESKSUPPORT",
    },
    {
      id: 4,
      name: "CLERK_ITSUPPORT",
      value: "CLERK_ITSUPPORT",
    },
  ];

  //STATE
  const [userClerkData, setUserClerkData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    contactNum: "",
  });
  const [categoryData, setCategoryData] = useState({
    categoryName: "",
    description: "",
  });
  const [rejectReasonData, setRejecReasonData] = useState({
    rejectReasonName: "",
    description: "",
  });
  const [voidReasonData, setVoidReasonData] = useState({
    voidReasonName: "",
    description: "",
  });
  const [solutionData, setSolutionData] = useState({
    solutionName: "",
    description: "",
  });

  //HANDLE CHANGE
  const clerkHandleChange = ({ currentTarget: input }) => {
    setUserClerkData({ ...userClerkData, [input.name]: input.value });
  };
  const handleChangeForRole = (event) => {
    setUserClerkData({ ...userClerkData, role: event.target.value });
  };
  const categoryHandleChange = ({ currentTarget: input }) => {
    setCategoryData({ ...categoryData, [input.name]: input.value });
  };
  const rejectHandleChange = ({ currentTarget: input }) => {
    setRejecReasonData({ ...rejectReasonData, [input.name]: input.value });
  };
  const voidHandleChange = ({ currentTarget: input }) => {
    setVoidReasonData({ ...voidReasonData, [input.name]: input.value });
  };
  const solutionHandleChange = ({ currentTarget: input }) => {
    setSolutionData({ ...solutionData, [input.name]: input.value });
  };

  //UPDATE CLERK DATA
  const updateClerkData = async () => {
    setLoading(true);
    await instance
      .put(`/settings/user/${id}`, {
        firstName: userClerkData.firstName,
        lastName: userClerkData.lastName,
        email: userClerkData.email,
        role: userClerkData.role,
        contactNum: userClerkData.contactNum,
      })
      .then((response) => {
        setLoading(false);
        toast.success(response.data.message);
        navigate("/admin/settings/manage/users");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        if (error.response.status === 401) {
          window.location.href = "/login";
        }

        if (error.response.status === 500) {
          toast.error("Error occured while updating the data.");
          navigate("/admin/settings/manage/users");
        }

        if (error.response.status === 404) {
          toast.error(error.response.data.message);
          navigate("/admin/settings/manage/users");
        }
      });
    setLoading(false);
  };
  //UPDATE CATEGORY DATA
  const updateCategoryData = async () => {
    setLoading(true);
    await instance
      .put(`/settings/category/${id}`, {
        categoryName: categoryData.categoryName,
        description: categoryData.description,
      })
      .then((response) => {
        setLoading(true);
        toast.success(response.data.message);
        navigate("/admin/settings/manage/categories");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        if (error.response.status === 401) {
          window.location.href = "/login";
        }

        if (error.response.status === 500) {
          toast.error("Error occured while updating the data.");
          navigate("/admin/settings/manage/categories");
        }

        if (error.response.status === 404) {
          toast.error(error.response.data.message);
          navigate("/admin/settings/manage/categories");
        }
      });
    setLoading(false);
  };
  //UPDATE REJECT REASON DATA
  const updateRejectData = async () => {
    setLoading(true);
    await instance
      .put(`/settings/rejectreason/${id}`, {
        rejectReasonName: rejectReasonData.rejectReasonName,
        description: rejectReasonData.description,
      })
      .then((response) => {
        setLoading(true);
        toast.success(response.data.message);
        navigate("/admin/settings/manage/rejectingreasons");
      })
      .catch((error) => {
        toast.error(error.response.data.message);

        if (error.response.status === 401) {
          window.location.href = "/login";
        }

        if (error.response.status === 500) {
          toast.error("Error occured while updating the data.");
          navigate("/admin/settings/manage/rejectingreasons");
        }

        if (error.response.status === 404) {
          toast.error(error.response.data.message);
          navigate("/admin/settings/manage/rejectingreasons");
        }
      });
    setLoading(false);
  };
  //UPDATE VOID REASON DATA
  const updateVoidData = async () => {
    setLoading(true);
    await instance
      .put(`/settings/voidreason/${id}`, {
        voidReasonName: voidReasonData.voidReasonName,
        description: voidReasonData.description,
      })
      .then((response) => {
        setLoading(false);
        toast.success(response.data.message);
        navigate("/admin/settings/manage/voidingreasons");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        if (error.response.status === 401) {
          window.location.href = "/login";
          sessionStorage.clear();
        }

        if (error.response.status === 500) {
          toast.error("Error occured while updating the data.");
          navigate("/admin/settings/manage/voidingreasons");
        }

        if (error.response.status === 404) {
          toast.error(error.response.data.message);
          navigate("/admin/settings/manage/voidingreasons");
        }
      });
    setLoading(false);
  };
  //UPDATE SOLUTION DATA
  const updateSolutionData = async () => {
    setLoading(true);
    await instance
      .put(`/settings/solution/${id}`, {
        solutionName: solutionData.solutionName,
        description: solutionData.description,
      })
      .then((response) => {
        toast.success(response.data.message);
        navigate("/admin/settings/manage/resolvingsolutions");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        if (error.response.status === 401) {
          window.location.href = "/login";
          sessionStorage.clear();
        }

        if (error.response.status === 500) {
          toast.error("Error occured while updating the data.");
          navigate("/admin/settings/manage/resolvingsolutions");
        }

        if (error.response.status === 404) {
          toast.error(error.response.data.message);
          navigate("/admin/settings/manage/resolvingsolutions");
        }
      });
    setLoading(false);
  };

  //DELETE CLERK DATA
  const deleteClerkData = async () => {
    setLoading(true);
    await instance
      .delete(`/settings/user/${id}`)
      .then((response) => {
        toast.success(response.data.message);
        navigate("/admin/settings/manage/users");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        if (error.response.status === 401) {
          window.location.href = "/login";
        }

        if (error.response.status === 500) {
          toast.error("Error occured while updating the data.");
          navigate("/admin/settings/manage/users");
        }

        if (error.response.status === 404) {
          toast.error(error.response.data.message);
          navigate("/admin/settings/manage/users");
        }
      });
    setLoading(false);
  };
  //DELETE CATEGORY DATA
  const deleteCategorydata = async () => {
    setLoading(true);
    await instance
      .delete(`/settings/category/${id}`)
      .then((response) => {
        toast.success(response.data.message);
        navigate("/admin/settings/manage/resolvingsolutions");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        if (error.response.status === 401) {
          window.location.href = "/login";
        }

        if (error.response.status === 500) {
          toast.error("Error occured while updating the data.");
          navigate("/admin/settings/manage/resolvingsolutions");
        }

        if (error.response.status === 404) {
          toast.error(error.response.data.message);
          navigate("/admin/settings/manage/resolvingsolutions");
        }
      });
    setLoading(false);
  };
  //DELETE REJECT REASON DATA
  const deleteRejectData = async () => {
    setLoading(true);
    await instance
      .delete(`/settings/rejectreason/${id}`)
      .then((response) => {
        toast.success(response.data.message);
        navigate("/admin/settings/manage/rejectingreasons");
      })
      .catch((error) => {
        if (error) {
          toast.error(error.response.data.message);
        }

        if (error.response.status === 401) {
          window.location.href = "/login";
        }

        if (error.response.status === 500) {
          toast.error("Error occured while updating the data.");
          navigate("/admin/settings/manage/rejectingreasons");
        }

        if (error.response.status === 404) {
          toast.error(error.response.data.message);
          navigate("/admin/settings/manage/rejectingreasons");
        }
      });
    setLoading(false);
  };
  //DELETE VOID REASON DATA
  const deleteVoidData = async () => {
    setLoading(true);
    await instance
      .delete(`/settings/voidreason/${param.id}`)
      .then((response) => {
        toast.success(response.data.message);
        navigate("/admin/settings/manage/voidingreasons");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        if (error.response.status === 401) {
          window.location.href = "/login";
        }

        if (error.response.status === 500) {
          toast.error("Error occured while updating the data.");
          navigate("/admin/settings/manage/voidingreasons");
        }

        if (error.response.status === 404) {
          toast.error(error.response.data.message);
          navigate("/admin/settings/manage/voidingreasons");
        }
      });
    setLoading(false);
  };
  //DELETE SOLUTIION DATA
  const deleteSolutionData = async () => {
    setLoading(true);
    await instance
      .delete(`/settings/solution/${id}`)
      .then((response) => {
        toast.success(response.data.message);
        navigate("/admin/settings/manage/resolvingsolutions");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        if (error.response.status === 401) {
          window.location.href = "/login";
        }

        if (error.response.status === 500) {
          toast.error("Error occured while deleting the data.");
          navigate("/admin/settings/manage/resolvingsolutions");
        }

        if (error.response.status === 404) {
          toast.error(error.response.data.message);
          navigate("/admin/settings/manage/resolvingsolutions");
        }
      });
    setLoading(false);
  };

  // FOR THE USER DATA
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      await instance
        .get(`/settings/getuser/${id}`)
        .then((res) => {
          setUserClerkData(res.data.user);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            window.location.href = "/login";
          }

          if (err.response.status === 404) {
            navigate("/admin/settings/manage/users");
            toast.error("User not found.");
          }

          if (err.response.status === 500) {
            navigate("/admin/settings/manage/users");
            toast.error("User not found.");
          }
        });
      setLoading(false);
    };

    // FOR THE CATEGORY DATA
    const fetchCategoryData = async () => {
      setLoading(true);
      await instance
        .get(`/settings/fetchcategorydata/${id}`)
        .then((res) => {
          setCategoryData(res.data.category);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            window.location.href = "/login";
          }

          if (err.response.status === 404) {
            navigate("/admin/settings/manage/categories");
            toast.error("Category not found.");
          }

          if (err.response.status === 500) {
            navigate("/admin/settings/manage/categories");
            toast.error("Category not found.");
          }
        });
      setLoading(false);
    };

    // FOR THE REJECT REASON DATA
    const fetchRejectReasonData = async () => {
      setLoading(true);
      await instance
        .get(`/settings/fetchrejectreasondata/${id}`)
        .then((res) => {
          setRejecReasonData(res.data.rejectreason);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            window.location.href = "/login";
            navigate("/admin/settings/manage/rejectingreasons");
          }

          if (err.response.status === 404) {
            navigate("/admin/settings/manage/rejectingreasons");
            toast.error("Reject reason not found.");
          }

          if (err.response.status === 500) {
            navigate("/admin/settings/manage/rejectingreasons");
            toast.error("Reject reason not found.");
          }
        });
      setLoading(false);
    };

    // FOR THE VOID REASON DATA
    const fetchVoidReasonData = async () => {
      setLoading(true);
      await instance
        .get(`/settings/fetchvoidreasondata/${id}`)
        .then((res) => {
          setVoidReasonData(res.data.voidreason);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            window.location.href = "/login";
          }

          if (err.response.status === 404) {
            navigate("/admin/settings/manage/voidingreasons");
            toast.error("Void reason not found.");
          }

          if (err.response.status === 500) {
            navigate("/admin/settings/manage/voidingreasons");
            toast.error("Void reason not found.");
          }
        });
      setLoading(false);
    };

    // FOR THE RESOLUTION DATA
    const fetchResolutionData = async () => {
      setLoading(true);
      await instance
        .get(`/settings/fetchsolutiondata/${id}`)
        .then((res) => {
          setSolutionData(res.data.solution);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            window.location.href = "/login";
          }

          if (err.response.status === 404) {
            navigate("/admin/settings/manage/resolvingsolutions");
            toast.error("Resolution not found.");
          }

          if (err.response.status === 500) {
            navigate("/admin/settings/manage/resolvingsolutions");
            toast.error("Resolution not found.");
          }
        });
      setLoading(false);
    };

    if (id && users) {
      fetchUserData();
    } else if (id && categories) {
      fetchCategoryData();
    } else if (id && rejectReasons) {
      fetchRejectReasonData();
    } else if (id && voidReasons) {
      fetchVoidReasonData();
    } else if (id && resolution) {
      fetchResolutionData();
    }
  }, [id]);

  return (
    <>
      <div className={SETTINGDATASTYLE["settings-container__content"]}>
        {users && (
          <>
            <div className={SETTINGDATASTYLE["header_viewingsettings"]}>
              <h3>
                Viewing {userClerkData.firstName} {userClerkData.lastName} —
                details
              </h3>
            </div>

            {loading ? (
              <Spinner PageLoading={true} />
            ) : (
              <>
                <div className={SETTINGDATASTYLE["content-settings-details"]}>
                  <div className={SETTINGDATASTYLE["settings-details__data"]}>
                    <div
                      className={SETTINGDATASTYLE["settings-details__created"]}
                    >
                      <label> Date Joined </label>
                      <nobr>
                        <p
                          className={
                            SETTINGDATASTYLE["setting-details__container"]
                          }
                        >
                          {moment(userClerkData.createdAt).format(
                            "MMMM D YYYY, h:mm:ss a"
                          )}
                        </p>
                      </nobr>
                    </div>

                    <div
                      className={SETTINGDATASTYLE["settings-details__updated"]}
                    >
                      <label> Date Updated </label>
                      <nobr>
                        <p
                          className={
                            SETTINGDATASTYLE["setting-details__container"]
                          }
                        >
                          {moment(userClerkData.updatedAt).format(
                            "MMMM D YYYY, h:mm:ss a"
                          )}
                        </p>
                      </nobr>
                    </div>
                  </div>

                  <div
                    className={
                      SETTINGDATASTYLE["settings-settingdetailscontent"]
                    }
                  >
                    <div
                      className={
                        SETTINGDATASTYLE[
                          "requestedticket-ticketcontent__wrapper"
                        ]
                      }
                    >
                      <div
                        className={SETTINGDATASTYLE["settings-details__name"]}
                      >
                        <label> First Name </label>
                        <input
                          className={
                            SETTINGDATASTYLE["settings-details__namecontainer"]
                          }
                          value={userClerkData.firstName}
                          onChange={clerkHandleChange}
                          name="firstName"
                          type="text"
                          maxLength="80"
                        />
                      </div>

                      <div
                        className={
                          SETTINGDATASTYLE["settings-details__lastname"]
                        }
                      >
                        <label> Last Name </label>

                        <input
                          className={
                            SETTINGDATASTYLE["settings-details__namecontainer"]
                          }
                          value={userClerkData.lastName}
                          onChange={clerkHandleChange}
                          name="lastName"
                          type="text"
                          maxLength="80"
                        />
                      </div>

                      <div
                        className={
                          SETTINGDATASTYLE["settings-details__contactnumber"]
                        }
                      >
                        <label> Contact Number </label>
                        <div
                          className={
                            SETTINGDATASTYLE[
                              "settings-details__contactnumcontainer"
                            ]
                          }
                        >
                          <textarea
                            className={
                              SETTINGDATASTYLE[
                                "settings-details__contactnumcontainerinput"
                              ]
                            }
                            value={userClerkData.contactNum}
                            onChange={clerkHandleChange}
                            name="contactNum"
                            type="text"
                            maxLength="80"
                          />
                        </div>
                      </div>

                      <div
                        className={
                          SETTINGDATASTYLE["settings-details__clerkrole"]
                        }
                      >
                        <label> User Role </label>
                        <Textfield
                          style={{
                            borderRadius: "4px",
                            backgroundColor: "rgba(0, 0, 0, 0.1)",
                          }}
                          select
                          className={
                            SETTINGDATASTYLE["settings-details__clerkcontainer"]
                          }
                          onChange={handleChangeForRole}
                          name="role"
                          value={userClerkData.role}
                          type="text"
                          maxLength="50"
                        >
                          {clerkOptionValue.map((option, index) => (
                            <MenuItem id={index} value={option.value}>
                              {option.name}
                            </MenuItem>
                          ))}
                        </Textfield>
                      </div>

                      <div
                        className={
                          SETTINGDATASTYLE["settings-details__buttons"]
                        }
                      >
                        <div
                          className={
                            SETTINGDATASTYLE["settings-buttons__delete"]
                          }
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--danger__solid"
                            onClick={deleteClerkData}
                          >
                            Delete
                          </Buttons>
                        </div>

                        <div
                          className={
                            SETTINGDATASTYLE["settings-buttons__update"]
                          }
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--secondary__solid"
                            onClick={updateClerkData}
                          >
                            Update
                          </Buttons>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        {categories && (
          <>
            <div className={SETTINGDATASTYLE["header_viewingsettings"]}>
              <h3> Viewing {categoryData.categoryName} — details </h3>
            </div>

            {loading ? (
              <Spinner PageLoading={true} />
            ) : (
              <>
                <div className={SETTINGDATASTYLE["content-settings-details"]}>
                  <div className={SETTINGDATASTYLE["settings-details__data"]}>
                    <div
                      className={SETTINGDATASTYLE["settings-details__created"]}
                    >
                      <label> Date Created </label>
                      <nobr>
                        <p
                          className={
                            SETTINGDATASTYLE["setting-details__container"]
                          }
                        >
                          {moment(categoryData.createdAt).format(
                            "MMMM D YYYY, h:mm:ss a"
                          )}
                        </p>
                      </nobr>
                    </div>

                    <div
                      className={SETTINGDATASTYLE["settings-details__updated"]}
                    >
                      <label> Date Updated </label>
                      <nobr>
                        <p
                          className={
                            SETTINGDATASTYLE["setting-details__container"]
                          }
                        >
                          {moment(categoryData.updatedAt).format(
                            "MMMM D YYYY, h:mm:ss a"
                          )}
                        </p>
                      </nobr>
                    </div>
                  </div>

                  <div
                    className={
                      SETTINGDATASTYLE["settings-settingdetailscontent"]
                    }
                  >
                    <div
                      className={
                        SETTINGDATASTYLE[
                          "requestedticket-ticketcontent__wrapper"
                        ]
                      }
                    >
                      <div
                        className={SETTINGDATASTYLE["settings-details__name"]}
                      >
                        <label> Category Name </label>
                        <input
                          className={
                            SETTINGDATASTYLE["settings-details__namecontainer"]
                          }
                          value={categoryData.categoryName}
                          onChange={categoryHandleChange}
                          name="categoryName"
                          type="text"
                          maxLength="80"
                        />
                      </div>

                      <div
                        className={
                          SETTINGDATASTYLE["settings-details__description"]
                        }
                      >
                        <label> Category Description </label>
                        <div
                          className={
                            SETTINGDATASTYLE[
                              "settings-details__descriptioncontainer"
                            ]
                          }
                        >
                          <textarea
                            className={
                              SETTINGDATASTYLE[
                                "settings-details__descriptioncontainerinput"
                              ]
                            }
                            value={categoryData.description}
                            onChange={categoryHandleChange}
                            name="description"
                            type="text"
                            maxLength="250"
                          />
                        </div>
                      </div>

                      <div
                        className={
                          SETTINGDATASTYLE["settings-details__buttons"]
                        }
                      >
                        <div
                          className={
                            SETTINGDATASTYLE["settings-buttons__delete"]
                          }
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--danger__solid"
                            onClick={deleteCategorydata}
                          >
                            Delete
                          </Buttons>
                        </div>

                        <div
                          className={
                            SETTINGDATASTYLE["settings-buttons__update"]
                          }
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--secondary__solid"
                            onClick={updateCategoryData}
                          >
                            Update
                          </Buttons>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        {rejectReasons && (
          <>
            <div className={SETTINGDATASTYLE["header_viewingsettings"]}>
              <h3> Viewing {rejectReasonData.rejectReasonName} — details </h3>
            </div>

            {loading ? (
              <Spinner PageLoading={true} />
            ) : (
              <>
                <div className={SETTINGDATASTYLE["content-settings-details"]}>
                  <div className={SETTINGDATASTYLE["settings-details__data"]}>
                    <div
                      className={SETTINGDATASTYLE["settings-details__created"]}
                    >
                      <label> Date Created </label>
                      <nobr>
                        <p
                          className={
                            SETTINGDATASTYLE["setting-details__container"]
                          }
                        >
                          {moment(rejectReasonData.createdAt).format(
                            "MMMM D YYYY, h:mm:ss a"
                          )}
                        </p>
                      </nobr>
                    </div>

                    <div
                      className={SETTINGDATASTYLE["settings-details__updated"]}
                    >
                      <label> Date Updated </label>
                      <nobr>
                        <p
                          className={
                            SETTINGDATASTYLE["setting-details__container"]
                          }
                        >
                          {moment(rejectReasonData.updatedAt).format(
                            "MMMM D YYYY, h:mm:ss a"
                          )}
                        </p>
                      </nobr>
                    </div>
                  </div>

                  <div
                    className={
                      SETTINGDATASTYLE["settings-settingdetailscontent"]
                    }
                  >
                    <div
                      className={
                        SETTINGDATASTYLE[
                          "requestedticket-ticketcontent__wrapper"
                        ]
                      }
                    >
                      <div
                        className={SETTINGDATASTYLE["settings-details__name"]}
                      >
                        <label> Rejecting Reason Name </label>
                        <input
                          className={
                            SETTINGDATASTYLE["settings-details__namecontainer"]
                          }
                          value={rejectReasonData.rejectReasonName}
                          onChange={rejectHandleChange}
                          name="rejectReasonName"
                          type="text"
                          maxLength="80"
                        />
                      </div>

                      <div
                        className={
                          SETTINGDATASTYLE["settings-details__description"]
                        }
                      >
                        <label> Rejecting Reason Description </label>
                        <div
                          className={
                            SETTINGDATASTYLE[
                              "settings-details__descriptioncontainer"
                            ]
                          }
                        >
                          <textarea
                            className={
                              SETTINGDATASTYLE[
                                "settings-details__descriptioncontainerinput"
                              ]
                            }
                            value={rejectReasonData.description}
                            onChange={rejectHandleChange}
                            name="description"
                            type="text"
                            maxLength="250"
                          />
                        </div>
                      </div>

                      <div
                        className={
                          SETTINGDATASTYLE["settings-details__buttons"]
                        }
                      >
                        <div
                          className={
                            SETTINGDATASTYLE["settings-buttons__delete"]
                          }
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--danger__solid"
                            onClick={deleteRejectData}
                          >
                            Delete
                          </Buttons>
                        </div>

                        <div
                          className={
                            SETTINGDATASTYLE["settings-buttons__update"]
                          }
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--secondary__solid"
                            onClick={updateRejectData}
                          >
                            Update
                          </Buttons>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        {voidReasons && (
          <>
            <div className={SETTINGDATASTYLE["header_viewingsettings"]}>
              <h3> Viewing {voidReasonData.voidReasonName} — details </h3>
            </div>

            {loading ? (
              <Spinner PageLoading={true} />
            ) : (
              <>
                <div className={SETTINGDATASTYLE["content-settings-details"]}>
                  <div className={SETTINGDATASTYLE["settings-details__data"]}>
                    <div
                      className={SETTINGDATASTYLE["settings-details__created"]}
                    >
                      <label> Date Created </label>
                      <nobr>
                        <p
                          className={
                            SETTINGDATASTYLE["setting-details__container"]
                          }
                        >
                          {moment(voidReasonData.createdAt).format(
                            "MMMM D YYYY, h:mm:ss a"
                          )}
                        </p>
                      </nobr>
                    </div>

                    <div
                      className={SETTINGDATASTYLE["settings-details__updated"]}
                    >
                      <label> Date Updated </label>
                      <nobr>
                        <p
                          className={
                            SETTINGDATASTYLE["setting-details__container"]
                          }
                        >
                          {moment(voidReasonData.updatedAt).format(
                            "MMMM D YYYY, h:mm:ss a"
                          )}
                        </p>
                      </nobr>
                    </div>
                  </div>

                  <div
                    className={
                      SETTINGDATASTYLE["settings-settingdetailscontent"]
                    }
                  >
                    <div
                      className={
                        SETTINGDATASTYLE[
                          "requestedticket-ticketcontent__wrapper"
                        ]
                      }
                    >
                      <div
                        className={SETTINGDATASTYLE["settings-details__name"]}
                      >
                        <label> Void Reason Name </label>
                        <input
                          className={
                            SETTINGDATASTYLE["settings-details__namecontainer"]
                          }
                          value={voidReasonData.voidReasonName}
                          onChange={voidHandleChange}
                          name="voidReasonName"
                          type="text"
                          maxLength="80"
                        />
                      </div>

                      <div
                        className={
                          SETTINGDATASTYLE["settings-details__description"]
                        }
                      >
                        <label> Void Reason Description </label>
                        <div
                          className={
                            SETTINGDATASTYLE[
                              "settings-details__descriptioncontainer"
                            ]
                          }
                        >
                          <textarea
                            className={
                              SETTINGDATASTYLE[
                                "settings-details__descriptioncontainerinput"
                              ]
                            }
                            value={voidReasonData.description}
                            onChange={voidHandleChange}
                            name="description"
                            type="text"
                            maxLength="250"
                          />
                        </div>
                      </div>

                      <div
                        className={
                          SETTINGDATASTYLE["settings-details__buttons"]
                        }
                      >
                        <div
                          className={
                            SETTINGDATASTYLE["settings-buttons__delete"]
                          }
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--danger__solid"
                            onClick={deleteVoidData}
                          >
                            Delete
                          </Buttons>
                        </div>

                        <div
                          className={
                            SETTINGDATASTYLE["settings-buttons__update"]
                          }
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--secondary__solid"
                            onClick={updateVoidData}
                          >
                            Update
                          </Buttons>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        {resolution && (
          <>
            <div className={SETTINGDATASTYLE["header_viewingsettings"]}>
              <h3> Viewing {solutionData.solutionName} — details </h3>
            </div>

            {loading ? (
              <Spinner PageLoading={true} />
            ) : (
              <>
                <div className={SETTINGDATASTYLE["content-settings-details"]}>
                  <div className={SETTINGDATASTYLE["settings-details__data"]}>
                    <div
                      className={SETTINGDATASTYLE["settings-details__created"]}
                    >
                      <label> Date Created </label>
                      <nobr>
                        <p
                          className={
                            SETTINGDATASTYLE["setting-details__container"]
                          }
                        >
                          {moment(solutionData.createdAt).format(
                            "MMMM D YYYY, h:mm:ss a"
                          )}
                        </p>
                      </nobr>
                    </div>

                    <div
                      className={SETTINGDATASTYLE["settings-details__updated"]}
                    >
                      <label> Date Updated </label>
                      <nobr>
                        <p
                          className={
                            SETTINGDATASTYLE["setting-details__container"]
                          }
                        >
                          {moment(solutionData.updatedAt).format(
                            "MMMM D YYYY, h:mm:ss a"
                          )}
                        </p>
                      </nobr>
                    </div>
                  </div>

                  <div
                    className={
                      SETTINGDATASTYLE["settings-settingdetailscontent"]
                    }
                  >
                    <div
                      className={
                        SETTINGDATASTYLE[
                          "requestedticket-ticketcontent__wrapper"
                        ]
                      }
                    >
                      <div
                        className={SETTINGDATASTYLE["settings-details__name"]}
                      >
                        <label> Resolving Solution Name </label>
                        <input
                          className={
                            SETTINGDATASTYLE["settings-details__namecontainer"]
                          }
                          value={solutionData.solutionName}
                          onChange={solutionHandleChange}
                          name="solutionName"
                          type="text"
                          maxLength="80"
                        />
                      </div>

                      <div
                        className={
                          SETTINGDATASTYLE["settings-details__description"]
                        }
                      >
                        <label> Resolving Solution Description </label>
                        <div
                          className={
                            SETTINGDATASTYLE[
                              "settings-details__descriptioncontainer"
                            ]
                          }
                        >
                          <textarea
                            className={
                              SETTINGDATASTYLE[
                                "settings-details__descriptioncontainerinput"
                              ]
                            }
                            value={solutionData.description}
                            onChange={solutionHandleChange}
                            name="description"
                            type="text"
                            maxLength="250"
                          />
                        </div>
                      </div>

                      <div
                        className={
                          SETTINGDATASTYLE["settings-details__buttons"]
                        }
                      >
                        <div
                          className={
                            SETTINGDATASTYLE["settings-buttons__delete"]
                          }
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--danger__solid"
                            onClick={deleteSolutionData}
                          >
                            Delete
                          </Buttons>
                        </div>

                        <div
                          className={
                            SETTINGDATASTYLE["settings-buttons__update"]
                          }
                        >
                          <Buttons
                            buttonSize="btn--medium"
                            buttonStyle="btn--secondary__solid"
                            onClick={updateSolutionData}
                          >
                            Update
                          </Buttons>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SettingsData;
