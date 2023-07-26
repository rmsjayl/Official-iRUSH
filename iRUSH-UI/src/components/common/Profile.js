import React, { useState, useEffect } from "react";
import PROFILESTYLE from "styles/components/common/profile.module.css";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { instance } from "api/axios";
import { Buttons } from "./Buttons";
import { toast } from "react-toastify";
import Spinner from "components/spinner/Spinner";
import UpdatePasswordModal from "components/modals/UpdatePasswordModal";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openUpdatePasswordModal, setOpenUpdatePasswordModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      await instance
        .get(`/settings/loggeduser/${id}`)
        .then((response) => {
          setUser(response.data.user);
        })
        .catch((error) => {
          if (error.response.status === 401) {
            window.location.href = "/login";
          }

          if (error.response.status === 404) {
            toast.error("User not found.");
            if (user.role === "USER_SUPERADMIN" || user.role === "USER_ADMIN") {
              navigate("/admin/dashboard");
            } else if (user.role === "CLERK_HELPDESKSUPPORT") {
              navigate("/helpdesksupport/dashboard");
            } else if (user.role === "CLERK_ITSUPPORT") {
              navigate("/itsupport/dashboard");
            }
          }

          if (error.response.status === 500) {
            if (user.role === "USER_SUPERADMIN" || user.role === "USER_ADMIN") {
              navigate("/admin/dashboard");
            } else if (user.role === "CLERK_HELPDESKSUPPORT") {
              navigate("/helpdesksupport/dashboard");
            } else if (user.role === "CLERK_ITSUPPORT") {
              navigate("/itsupport/dashboard");
            }
          }
        });
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (user.role === "USER_SUPERADMIN" || user.role === "USER_ADMIN") {
    user.role = "ADMIN";
  } else if (user.role === "CLERK_HELPDESKSUPPORT") {
    user.role = "HELPDESK SUPPORT";
  } else if (user.role === "CLERK_ITSUPPORT") {
    user.role = "IT SUPPORT";
  }

  const handleChange = (event, name) => {
    setUser({ ...user, [name]: event.target.value });
  };

  const updateUser = async () => {
    setLoading(true);
    await instance
      .put(`/settings/loggeduser/${id}`, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNum: user.contactNum,
      })
      .then((response) => {
        toast.success(
          `${response.data.message} To verify the changes, please log in again.`
        );
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.href = "/login";
        }

        if (error.response.status === 400) {
          toast.error(error.response.data.message);
        }

        if (error.response.status === 404) {
          toast.error("User not found.");
          if (user.role === "USER_SUPERADMIN" || user.role === "USER_ADMIN") {
            navigate("/admin/dashboard");
          } else if (user.role === "CLERK_HELPDESKSUPPORT") {
            navigate("/helpdesksupport/dashboard");
          } else if (user.role === "CLERK_ITSUPPORT") {
            navigate("/itsupport/dashboard");
          }
        }

        if (error.response.status === 500) {
          toast.error("User not found.");
          if (user.role === "USER_SUPERADMIN" || user.role === "USER_ADMIN") {
            navigate("/admin/dashboard");
          } else if (user.role === "CLERK_HELPDESKSUPPORT") {
            navigate("/helpdesksupport/dashboard");
          } else if (user.role === "CLERK_ITSUPPORT") {
            navigate("/itsupport/dashboard");
          }
        }
      });

    setLoading(false);
  };

  return (
    <>
      {openUpdatePasswordModal && (
        <UpdatePasswordModal modalOpen={setOpenUpdatePasswordModal} />
      )}
      <div className={PROFILESTYLE["userprofile-container__content"]}>
        <div className={PROFILESTYLE["header_userprofile"]}>
          <h3>
            Viewing {user.firstName} {user.lastName} PROFILE — {user.role}
          </h3>
        </div>

        {loading ? (
          <Spinner PageLoading={true} />
        ) : (
          <div className={PROFILESTYLE["content-userprofile-details"]}>
            <div className={PROFILESTYLE["userprofile-details__profile"]}>
              <div className={PROFILESTYLE["profile-details__date"]}>
                <label> Date Joined </label>
                <p className={PROFILESTYLE["profile-details__container"]}>
                  {moment(user.createdAt).format("MMMM DD, YYYY h:mm:ss a")}
                </p>
              </div>
              <div className={PROFILESTYLE["profile-details__date"]}>
                <label> Updated last </label>
                <p className={PROFILESTYLE["profile-details__container"]}>
                  <nobr>
                    {moment(user.updatedAt).format("MMMM DD, YYYY h:mm:ss a")}
                  </nobr>
                </p>
              </div>
            </div>

            <div className={PROFILESTYLE["userprofile-ticketcontent"]}>
              <div
                className={PROFILESTYLE["userprofile-ticketcontent__wrapper"]}
              >
                <div className={PROFILESTYLE["profile-details__details"]}>
                  <label> First Name </label>
                  <input
                    className={PROFILESTYLE["profile-details__container"]}
                    value={user.firstName}
                    onChange={(e) => handleChange(e, "firstName")}
                    maxLength={50}
                  />
                </div>
                <div className={PROFILESTYLE["profile-details__details"]}>
                  <label> Last Name </label>
                  <input
                    className={PROFILESTYLE["profile-details__container"]}
                    value={user.lastName}
                    onChange={(e) => handleChange(e, "lastName")}
                    maxLength={50}
                  />
                </div>
                <div className={PROFILESTYLE["profile-details__details"]}>
                  <label> contact number </label>
                  <div className={PROFILESTYLE["profile-details__contactnum"]}>
                    <input
                      className={
                        PROFILESTYLE["profile-details__contactnum-contact"]
                      }
                      value={user.contactNum}
                      onChange={(e) => handleChange(e, "contactNum")}
                      maxLength={11}
                    />
                  </div>
                </div>
                <div className={PROFILESTYLE["profile-details__details"]}>
                  <label> User Role </label>
                  <p className={PROFILESTYLE["profile-details__container"]}>
                    {user.role}
                  </p>
                </div>

                <div className={PROFILESTYLE["submitform-container__btn"]}>
                  <div className={PROFILESTYLE["submitform-modal__buttons"]}>
                    <div className={PROFILESTYLE["modal-btns__wrapper"]}>
                      <div>
                        <Buttons
                          buttonSize="btn--medium"
                          buttonStyle="btn--secondary__solid"
                          onClick={updateUser}
                        >
                          UPDATE
                        </Buttons>
                      </div>
                      <div>
                        <Buttons
                          buttonSize="btn--medium"
                          buttonStyle="btn--primary__solid"
                          onClick={() => setOpenUpdatePasswordModal(true)}
                        >
                          CHANGE PASSWORD
                        </Buttons>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
