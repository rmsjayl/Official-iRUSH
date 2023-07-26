import React, { useState } from "react";
import Textfield from "@mui/material/TextField";
import { Buttons } from "components/common/Buttons";
import FORGOTPASSWORDSTYLE from "styles/pages/forgotpassword.module.css";
import Header from "components/common/Header";
import { instanceNoAuth } from "api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "components/spinner/Spinner";
import EmailSuccess from "components/common/EmailSuccess";

const Forgotpassword = () => {
  const navigate = useNavigate();
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (event, name) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [name]: event.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await instanceNoAuth
      .post(`/auth/forgotpassword`, forgotPasswordData)
      .then((response) => {
        setIsSubmitted(true);
        toast.success(response.data.message);
      })
      .catch((error) => {
        if (error.response.status === 400) {
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
          {isSubmitted ? (
            <EmailSuccess />
          ) : (
            <div className={FORGOTPASSWORDSTYLE["forgotpassword-container"]}>
              <Header primary={true} />
              <div
                className={
                  FORGOTPASSWORDSTYLE["forgotpassword-container__wrapper"]
                }
              >
                <div
                  className={
                    FORGOTPASSWORDSTYLE["forgotpassword-container__user"]
                  }
                >
                  <div
                    className={FORGOTPASSWORDSTYLE["forgotpass-user__wrapper"]}
                  >
                    <div
                      className={
                        FORGOTPASSWORDSTYLE["forgotpass-user__emailaddress"]
                      }
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
                          onChange={(e) => handleChange(e, "email")}
                          value={forgotPasswordData.email}
                        />
                      </div>
                    </div>

                    <div
                      className={
                        FORGOTPASSWORDSTYLE["forgot-container__button"]
                      }
                    >
                      <div
                        className={FORGOTPASSWORDSTYLE["button-user__sendlink"]}
                      >
                        <Buttons
                          buttonSize="medium"
                          buttonStyle="btn--longhead__solid"
                          onClick={handleSubmit}
                        >
                          SEND RESET LINK
                        </Buttons>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Forgotpassword;
