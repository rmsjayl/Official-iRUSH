import React, { useState, useRef } from "react";
import ADDMODALSTYLE from "styles/components/modals/addmodal.module.css";
import Spinner from "components/spinner/Spinner";
import { Buttons } from "components/common/Buttons";
import { instance } from "api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import { useNavigate, useParams } from "react-router-dom";

const UpdatePasswordModal = ({ modalOpen }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);
  const handleClickShowCurrentPassword = () =>
    setShowCurrentPassword((show) => !show);
  const [updatePasswordData, setUpdatePasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (event, name) => {
    setUpdatePasswordData({
      ...updatePasswordData,
      [name]: event.target.value,
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
    setLoading(true);
    await instance
      .post(`settings/updatePassword/${id}`, updatePasswordData)
      .then((response) => {
        setMessage(response.data.message);
        toast.success(response.data.message);
        setLoading(true);
        modalOpen(false);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          toast.error(error.response.data.message);
        }

        if (error.response.status === 401) {
          window.location.href = "/login";
        }

        if (error.response.status === 404) {
          toast.error("An error occured while updating the password.");
          if (user.role === "USER_SUPERADMIN" || user.role === "USER_ADMIN") {
            navigate("/admin/dashboard");
          } else if (user.role === "CLERK_HELPDESKSUPPORT") {
            navigate("/helpdesksupport/dashboard");
          } else if (user.role === "CLERK_ITSUPPORT") {
            navigate("/itsupport/dashboard");
          }
        }

        if (error.response.status === 500) {
          toast.error("An error occured while updating the password.");
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
    <div
      onClick={closeModal}
      ref={modalRef}
      className={ADDMODALSTYLE["addmodal-container"]}
    >
      {!loading ? (
        <div className={ADDMODALSTYLE["addmodal-modal"]}>
          <div className={ADDMODALSTYLE["addmodal-modal__wrapper"]}>
            <div className={ADDMODALSTYLE["addcontainer-modal__paragraph"]}>
              <p className={ADDMODALSTYLE["addmodal-text"]}>
                Update user password
              </p>
            </div>
          </div>

          <div className={ADDMODALSTYLE["addmodal-input"]}>
            <div className={ADDMODALSTYLE["container-add__setting"]}>
              <div className={ADDMODALSTYLE["name__setting"]}>
                <div className={ADDMODALSTYLE["name-setting__input"]}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    value={updatePasswordData.oldPassword}
                    onChange={(e) => handleChange(e, "password")}
                  >
                    <InputLabel htmlFor="outlined-adornment-password">
                      CURRENT PASSWORD
                    </InputLabel>
                    <OutlinedInput
                      name="password"
                      id="outlined-adornment-password"
                      type={showCurrentPassword ? "text" : "password"}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowCurrentPassword}
                            edge="end"
                          >
                            {!showCurrentPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="current password"
                    />
                  </FormControl>
                </div>

                <div className={ADDMODALSTYLE["name-setting__input"]}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    value={updatePasswordData.newPassword}
                    onChange={(e) => handleChange(e, "newPassword")}
                  >
                    <InputLabel htmlFor="outlined-adornment-password">
                      NEW PASSWORD
                    </InputLabel>
                    <OutlinedInput
                      name="newPassword"
                      id="outlined-adornment-password"
                      type={showPassword ? "text" : "password"}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {!showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="new password"
                    />
                  </FormControl>
                </div>

                <div className={ADDMODALSTYLE["name-setting__input"]}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    value={updatePasswordData.confirmPassword}
                    onChange={(e) => handleChange(e, "confirmPassword")}
                  >
                    <InputLabel htmlFor="outlined-adornment-password">
                      CONFIRM PASSWORD
                    </InputLabel>
                    <OutlinedInput
                      name="password"
                      id="outlined-adornment-password"
                      type={showConfirmPassword ? "text" : "password"}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowConfirmPassword}
                            edge="end"
                          >
                            {!showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="confirm Password"
                    />
                  </FormControl>
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
  );
};

export default UpdatePasswordModal;
