import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import Spinner from "components/spinner/Spinner";

const Register = () => {
  const navigate = useNavigate();
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNum: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const handleChange = (event, name) => {
    setRegisterData({
      ...registerData,
      [name]: event.target.value,
    });
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    await instanceNoAuth
      .post(`/auth/register`, registerData)
      .then((response) => {
        toast.success(response.data.message);
        navigate("/login");
      })
      .catch((error) => {
        if (error.response.status === 400) {
          toast.error(error.response.data.message);
        }

        if (registerData.confirmPassword !== registerData.password) {
          toast.error("Password does not match.");
        }
      });
    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className={REGISTERSTYLE["register-container"]}>
          <Header primary={true} />
          <div className={REGISTERSTYLE["register-container__wrapper"]}>
            <form className={REGISTERSTYLE["register-container__form"]}>
              <div className={REGISTERSTYLE["container-user__name"]}>
                <div className={REGISTERSTYLE["user-input__name"]}>
                  <div className={REGISTERSTYLE["container-user__firstName"]}>
                    <Textfield
                      fullWidth
                      className={REGISTERSTYLE["userinput__firstname"]}
                      label="FIRST NAME"
                      type="text"
                      name="firstName"
                      value={registerData.firstName}
                      onChange={(e) => handleChange(e, "firstName")}
                    />
                  </div>
                  <div className={REGISTERSTYLE["container-user__lastName"]}>
                    <Textfield
                      fullWidth
                      className={REGISTERSTYLE["userinput__lastname"]}
                      label="LAST NAME"
                      type="text"
                      name="lastname"
                      value={registerData.lastName}
                      onChange={(e) => handleChange(e, "lastName")}
                    />
                  </div>
                </div>
              </div>

              <div className={REGISTERSTYLE["container-user__emailaddress"]}>
                <div className={REGISTERSTYLE["user-input__emailaddress"]}>
                  <Textfield
                    fullWidth
                    className={REGISTERSTYLE["userinput__emailaddress"]}
                    label="EMAIL ADDRESS"
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={(e) => handleChange(e, "email")}
                  />
                </div>
              </div>
              <div className={REGISTERSTYLE["container-user__contactnum"]}>
                <div className={REGISTERSTYLE["user-input__contactnum"]}>
                  <Textfield
                    fullWidth
                    className={REGISTERSTYLE["userinput__contactnum"]}
                    label="CONTACT NUMBER"
                    type="text"
                    name="contactNum"
                    value={registerData.contactNum}
                    inputProps={{ maxLength: 11 }}
                    onChange={(e) => handleChange(e, "contactNum")}
                  />
                </div>
              </div>
              <div className={REGISTERSTYLE["container-user__password"]}>
                <div className={REGISTERSTYLE["user-input__password"]}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    value={registerData.password}
                    onChange={(e) => handleChange(e, "password")}
                    className={REGISTERSTYLE["userinput__password"]}
                  >
                    <InputLabel htmlFor="outlined-adornment-password">
                      PASSWORD
                    </InputLabel>
                    <OutlinedInput
                      name="password"
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
                      label="password"
                    />
                  </FormControl>
                </div>
              </div>
              <div className={REGISTERSTYLE["passwordreset-paragraphs"]}>
                <h5> PASSWORD MUST INCLUDE ATLEAST: </h5>
                <div
                  className={REGISTERSTYLE["passwordreset-passwordreminder"]}
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
              <div className={REGISTERSTYLE["container-user__confirmpassword"]}>
                <div className={REGISTERSTYLE["user-input__confirmpassword"]}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    value={registerData.confirmPassword}
                    onChange={(e) => handleChange(e, "confirmPassword")}
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
                      label="password"
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
                    REGISTER
                  </Buttons>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
