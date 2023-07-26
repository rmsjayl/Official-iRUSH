import React, { useEffect, useState } from "react";
import REGISTERSTYLE from "styles/pages/register.module.css";
import { Buttons } from "components/common/Buttons";
import Textfield from "@mui/material/TextField";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import Header from "components/common/Header";
import { instanceNoAuth } from "api/axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "components/spinner/Spinner";
import Pagebroken from "components/common/Pagebroken";

const ResetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const [resetPasswordData, setResetPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [validUrl, setValidUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  useEffect(() => {
    setLoading(true);
    const verifyUrl = async () => {
      await instanceNoAuth
        .get(`/auth/resetpassword/${id}/verify/${token}`)
        .then((response) => {
          setValidUrl(true);
        })
        .catch((error) => {
          setValidUrl(false);
          toast.error(error.response.data.message);
          navigate("/login");
        });
      setLoading(false);
    };
    verifyUrl();
  }, [id, token]);

  const handleChange = (event, name) => {
    setResetPasswordData({
      ...resetPasswordData,
      [name]: event.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await instanceNoAuth
      .post(`/auth/resetpassword/${id}/verify/${token}`, resetPasswordData)
      .then((response) => {
        setIsSubmitted(true);
        toast.success(response.data.message);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          toast.error(error.response.data.message);
        }

        if (error.response.status === 404) {
          toast.error(error.response.data.message);
        }

        if (error.response.status === 500) {
          toast.error(error.response.data.message);
        }
      });

    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <>
          {validUrl ? (
            <div className={REGISTERSTYLE["register-container"]}>
              <Header primary={true} />
              <div className={REGISTERSTYLE["register-container__wrapper"]}>
                <form className={REGISTERSTYLE["register-container__form"]}>
                  <div className={REGISTERSTYLE["container-user__password"]}>
                    <div className={REGISTERSTYLE["user-input__password"]}>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        value={resetPasswordData.password}
                        onChange={(e) => handleChange(e, "password")}
                        name="password"
                        className={REGISTERSTYLE["userinput__password"]}
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
                                {!showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          }
                          label="new password"
                        />
                      </FormControl>
                    </div>
                  </div>
                  <div className={REGISTERSTYLE["passwordreset-paragraphs"]}>
                    <h5> PASSWORD MUST INCLUDE ATLEAST: </h5>
                    <div
                      className={
                        REGISTERSTYLE["passwordreset-passwordreminder"]
                      }
                    >
                      <ul className={REGISTERSTYLE["passreminders"]}>
                        <li>8 CHARACTERS LONG</li>
                        <li>1 UPPERCASE LETTER</li>
                        <li>1 LOWERCASE LETTER</li>
                        <li>1 NUMBER</li>
                        <li>AND A SYMBOL</li>
                      </ul>
                    </div>
                  </div>
                  <div
                    className={REGISTERSTYLE["container-user__confirmpassword"]}
                  >
                    <div
                      className={REGISTERSTYLE["user-input__confirmpassword"]}
                    >
                      <FormControl
                        fullWidth
                        variant="outlined"
                        onChange={(e) => handleChange(e, "confirmPassword")}
                        value={resetPasswordData.confirmPassword}
                        name="confirmPassword"
                        className={REGISTERSTYLE["userinput__password"]}
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
                          label="confirm password"
                        />
                      </FormControl>
                    </div>
                  </div>
                  <div className={REGISTERSTYLE["register-container__button"]}>
                    <div className={REGISTERSTYLE["button-user__register"]}>
                      <Buttons
                        buttonSize="btn--medium"
                        buttonStyle="btn--longhead__solid"
                        onClick={handleSubmit}
                      >
                        RESET PASSWORD
                      </Buttons>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <Pagebroken />
          )}
        </>
      )}
    </>
  );
};

export default ResetPassword;
