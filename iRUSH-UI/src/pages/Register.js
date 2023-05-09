import React from "react";
import REGISTERSTYLE from "../styles/pages/register.module.css";
import { Buttons } from "../components/common/Buttons";
import Textfield from "@mui/material/TextField";
import Header from "../components/common/Header";

const Register = () => {
  return (
    <>
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
                  />
                </div>
                <div className={REGISTERSTYLE["container-user__lastName"]}>
                  <Textfield
                    fullWidth
                    className={REGISTERSTYLE["userinput__lastname"]}
                    label="LAST NAME"
                    type="text"
                    name="lastname"
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
                />
              </div>
            </div>
            <div className={REGISTERSTYLE["container-user__password"]}>
              <div className={REGISTERSTYLE["user-input__password"]}>
                <Textfield
                  fullWidth
                  className={REGISTERSTYLE["userinput__password"]}
                  label="PASSWORD"
                  type="password"
                  name="password"
                />
              </div>
            </div>
            <div className={REGISTERSTYLE["passwordreset-paragraphs"]}>
              <h5> PASSWORD MUST INCLUDE ATLEAST: </h5>
              <div className={REGISTERSTYLE["passwordreset-passwordreminder"]}>
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
                <Textfield
                  fullWidth
                  className={REGISTERSTYLE["userinput__confirmpassword"]}
                  label="CONFIRM PASSWORD"
                  type="password"
                  name="confirmPassword"
                />
              </div>
            </div>
            <div className={REGISTERSTYLE["register-container__button"]}>
              <div className={REGISTERSTYLE["button-user__register"]}>
                <Buttons
                  buttonSize="btn--medium"
                  buttonStyle="btn--longhead__solid"
                >
                  REGISTER
                </Buttons>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
