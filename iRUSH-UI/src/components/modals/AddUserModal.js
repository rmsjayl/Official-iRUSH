import React, { useState, useRef } from "react";
import ADDMODALSTYLE from "styles/components/modals/addmodal.module.css";
import Textfield from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { instance } from "api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "components/spinner/Spinner";
import { Buttons } from "components/common/Buttons";

const AddUserModal = ({ modalOpen }) => {
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

  const [addUserModal, setAddUserModal] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    contactNum: "",
  });

  const handleChange = ({ currentTarget: input }) => {
    setAddUserModal({
      ...addUserModal,
      [input.name]: input.value,
    });
  };

  const handleChangeForRole = (event) => {
    setAddUserModal({
      ...addUserModal,
      role: event.target.value,
    });
  };

  const [loading, setLoading] = useState(false);
  const modalRef = useRef();

  const closeModal = (e) => {
    if (modalRef.current === e.target) {
      modalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await instance
      .post(`/settings/createuser`, addUserModal)
      .then((response) => {
        toast.success(response.data.message);
        setLoading(true);
        modalOpen(false);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.href = "/login";
        }

        toast.error(error.response.data.message);
        setLoading(false);
      });
    setLoading(false);
  };

  return (
    <>
      <div
        onClick={closeModal}
        ref={modalRef}
        className={ADDMODALSTYLE["addmodal-container"]}
      >
        {!loading ? (
          <div className={ADDMODALSTYLE["addmodal-modal"]}>
            <div className={ADDMODALSTYLE["addmodal-modal__wrapper"]}>
              <div className={ADDMODALSTYLE["addcontainer-modal__paragraph"]}>
                <p className={ADDMODALSTYLE["addmodal-text"]}>add user modal</p>
              </div>
            </div>

            <div className={ADDMODALSTYLE["addmodal-input"]}>
              <div className={ADDMODALSTYLE["container-add__setting"]}>
                <div className={ADDMODALSTYLE["name__setting"]}>
                  <div className={ADDMODALSTYLE["name-setting__input"]}>
                    <Textfield
                      fullWidth
                      style={{
                        boxShadow: "8px 8px 16px 3px rgba(0, 0, 0, 0.1)",
                      }}
                      label="First Name"
                      name="firstName"
                      value={addUserModal.firstName}
                      onChange={handleChange}
                      inputProps={{ maxLength: 50 }}
                    />
                  </div>

                  <div className={ADDMODALSTYLE["name-setting__input"]}>
                    <Textfield
                      fullWidth
                      style={{
                        boxShadow: "8px 8px 16px 3px rgba(0, 0, 0, 0.1)",
                      }}
                      label="Last Name"
                      name="lastName"
                      value={addUserModal.lastName}
                      onChange={handleChange}
                      inputProps={{ maxLength: 50 }}
                    />
                  </div>

                  <div className={ADDMODALSTYLE["name-setting__input"]}>
                    <Textfield
                      multiline
                      fullWidth
                      style={{
                        boxShadow: "8px 8px 16px 3px rgba(0, 0, 0, 0.1)",
                      }}
                      label="Email"
                      name="email"
                      value={addUserModal.email}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>

                  <div className={ADDMODALSTYLE["name-setting__input"]}>
                    <Textfield
                      fullWidth
                      style={{
                        boxShadow: "8px 8px 16px 3px rgba(0, 0, 0, 0.1)",
                      }}
                      select
                      className="userinput-name"
                      label="role"
                      name="role"
                      value={addUserModal.role}
                      onChange={handleChangeForRole}
                    >
                      {clerkOptionValue.map((option) => (
                        <MenuItem key={option.id} value={option.value}>
                          {option.value}
                        </MenuItem>
                      ))}
                    </Textfield>
                  </div>

                  <div className={ADDMODALSTYLE["name-setting__input"]}>
                    <Textfield
                      fullWidth
                      style={{
                        boxShadow: "8px 8px 16px 3px rgba(0, 0, 0, 0.1)",
                      }}
                      label="contact number"
                      name="contactNum"
                      value={addUserModal.contactNum}
                      onChange={handleChange}
                      inputProps={{ maxLength: 11 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={ADDMODALSTYLE["container-settings__buttons"]}>
              <Buttons
                buttonSize="btn--medium"
                buttonStyle="btn--secondary__solid"
                onClick={() => modalOpen(false)}
              >
                CLOSE
              </Buttons>

              <Buttons
                buttonSize="btn--medium"
                buttonStyle="btn--primary__solid"
                onClick={handleSubmit}
              >
                SUBMIT
              </Buttons>
            </div>
          </div>
        ) : (
          <Spinner />
        )}
      </div>
    </>
  );
};

export default AddUserModal;
