import React, { useState, useEffect } from "react";
import EMAILSUCCESSSTYLE from "styles/components/common/emailsuccess.module.css";
import USTTIGER from "assets/images/img/Tiger_clipart.png";
import { Buttons } from "components/common/Buttons";
import Header from "./Header";
import { LazyLoadImage } from "react-lazy-load-image-component";

const EmailSuccess = () => {
  useEffect(() => {
    const pushURL = () => {
      window.history.pushState({}, "", "/emailsuccess");
    };

    pushURL();
  }, []);

  const [isClosed, setIsClosed] = useState(false);

  const closeComponent = () => {
    setIsClosed(true);
    window.history.pushState({}, "", "/");
    window.location.reload();
  };

  if (isClosed) {
    return null;
  }

  return (
    <>
      <div className={EMAILSUCCESSSTYLE["container-emailverify"]}>
        <Header primary={true} />
        <div className={EMAILSUCCESSSTYLE["emailverify--container__content"]}>
          <div className={EMAILSUCCESSSTYLE["emailverifycontent__tiger"]}>
            <LazyLoadImage
              id={EMAILSUCCESSSTYLE["emailverify-tiger"]}
              src={USTTIGER}
              alt=""
              effect="blur"
            />
          </div>

          <div className={EMAILSUCCESSSTYLE["emailverifycontent__texts"]}>
            <div
              className={EMAILSUCCESSSTYLE["emailverifycontent-text__header"]}
            >
              <h1> Email Successfully Sent</h1>
            </div>

            <div
              className={
                EMAILSUCCESSSTYLE["emailverifycontent-text__paragraph"]
              }
            >
              <p> Thank you for your patience. </p>
              <p>Please check your inbox for the link.</p>
            </div>

            <div
              className={EMAILSUCCESSSTYLE["emailverifycontent-text__buttons"]}
            >
              <div className={EMAILSUCCESSSTYLE["emailverify-button"]}>
                <Buttons
                  buttonSize="btn--medium__average"
                  buttonStyle="btn--longhead__success"
                  onClick={closeComponent}
                >
                  REDIRECT ME TO HOMEPAGE
                </Buttons>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailSuccess;
