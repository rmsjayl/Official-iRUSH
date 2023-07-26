import React, { useEffect } from "react";
import PAGEBROKENSTYLE from "../../styles/components/common/pagebroken.module.css";
import { Buttons } from "../../components/common/Buttons";
import { Link } from "react-router-dom";

const Pagebroken = () => {
  // useEffect(() => {
  //   localStorage.clear();
  // }, []);

  return (
    <>
      <div className={PAGEBROKENSTYLE["pagebroken-container"]}>
        <div className={PAGEBROKENSTYLE["pagebroken-container__wrapper"]}>
          <span>404 | PAGE NOT FOUND</span>

          <Link to="/">
            <div className={PAGEBROKENSTYLE["pagebroken-button"]}>
              <Buttons
                buttonSize="btn--small"
                buttonStyle="btn--longhead__success"
              >
                HOME
              </Buttons>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Pagebroken;
