import React, { useState } from "react";
import Textfield from "@mui/material/TextField";
import { Buttons } from "../components/common/Buttons";
import FORGOTPASSWORDSTYLE from "../styles/pages/forgotpassword.module.css";
import Header from "../components/common/Header";

const Forgotpassword = () => {
  return (
    <>
      <div className={FORGOTPASSWORDSTYLE["forgotpassword-container"]}>
        <Header primary={true} />
        <div
          className={FORGOTPASSWORDSTYLE["forgotpassword-container__wrapper"]}
        >
          <div
            className={FORGOTPASSWORDSTYLE["forgotpassword-container__user"]}
          >
            <div className={FORGOTPASSWORDSTYLE["forgotpass-user__wrapper"]}>
              <div
                className={FORGOTPASSWORDSTYLE["forgotpass-user__emailaddress"]}
              >
                <div
                  className={
                    FORGOTPASSWORDSTYLE[
                      "forgotpass-user--container__emailaddress"
                    ]
                  }
                >
                  <Textfield
                    fullWidth
                    label="EMAIL ADDRESS"
                    type="email"
                    name="email"
                  />
                </div>
              </div>

              <div className={FORGOTPASSWORDSTYLE["forgot-container__button"]}>
                <div className={FORGOTPASSWORDSTYLE["button-user__sendlink"]}>
                  <Buttons
                    buttonSize="medium"
                    buttonStyle="btn--longhead__solid"
                  >
                    SEND RESET LINK
                  </Buttons>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Forgotpassword;
