import React, { useState } from "react";
import LOGINSTYLE from "../styles/pages/login.module.css";
import ERRORMSGSTYLE from "../styles/global/error.module.css";
import { Link } from "react-router-dom";
import { Buttons } from "../components/common/Buttons";
import Textfield from "@mui/material/TextField";
import Header from "../components/common/Header";
import { UseLogin } from "../hooks/LoginHooks";
import Spinner from "../components/spinner/Spinner";

function Login() {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const {
    login,
    // loading,
    error,
  } = UseLogin();

  const handleChange = ({ currentTarget: input }) => {
    setUserData({ ...userData, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(userData.email, userData.password);
  };

  return (
    <>
      <div className={LOGINSTYLE["login-container"]}>
        <Header primary={true} />
        <div className={LOGINSTYLE["login-container__wrapper"]}>
          <form
            onSubmit={handleSubmit}
            className={LOGINSTYLE["login-container__form"]}
          >
            <div className={LOGINSTYLE["container-user__emailaddress"]}>
              <div className={LOGINSTYLE["user-input__emailaddress"]}>
                <Textfield
                  fullWidth
                  className={LOGINSTYLE["userinput__emailaddress"]}
                  label="EMAIL ADDRESS"
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={LOGINSTYLE["container-user__password"]}>
              <div className={LOGINSTYLE["user-input__password"]}>
                <Textfield
                  fullWidth
                  className={LOGINSTYLE["userinput__password"]}
                  label="PASSWORD"
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            {error && (
              <div className={ERRORMSGSTYLE["error_message"]}>{error}</div>
            )}
            <div className={LOGINSTYLE["login-container__button"]}>
              <div className={LOGINSTYLE["button-user__login"]}>
                <Buttons
                  buttonSize="btn--medium"
                  buttonStyle="btn--longhead__solid"
                >
                  LOGIN
                </Buttons>
              </div>
            </div>
            <div className={LOGINSTYLE["login-container__forgotpass"]}>
              <Link to="/forgotpassword">
                <div className={LOGINSTYLE["forgotpass-text"]}>
                  Forgot Password?
                </div>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
