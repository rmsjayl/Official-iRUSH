import React from "react";
import { Link } from "react-router-dom";
import USTLOGOBLACK from "../../assets/images/img/UST_logoblack.png";
import USTLOGOWHITE from "../../assets/images/img/UST_logo.png";
import COMMONHEADERSTYLE from "../../styles/components/common/header.module.css";
import { LazyLoadImage } from "react-lazy-load-image-component";

function Header({ primary }) {
  return (
    <>
      <div className={COMMONHEADERSTYLE["common-container__header"]}>
        <Link to="/" style={{ color: "#000" }}>
          <div className={COMMONHEADERSTYLE["common-header"]}>
            <div className={COMMONHEADERSTYLE["common-header__logo"]}>
              {primary ? (
                <LazyLoadImage
                  id={COMMONHEADERSTYLE["common-ustlogoblck"]}
                  src={USTLOGOBLACK}
                  alt=" "
                  effect="blur"
                />
              ) : (
                <LazyLoadImage
                  id={COMMONHEADERSTYLE["common-ustlogoblck"]}
                  src={USTLOGOWHITE}
                  alt=" "
                  effect="blur"
                />
              )}
            </div>
            <div className={COMMONHEADERSTYLE["common-header--text"]}>
              <h6 id={COMMONHEADERSTYLE["commonheader__ust"]}>
                {" "}
                Pontifical and Royal{" "}
              </h6>
              <h1 id={COMMONHEADERSTYLE["commonheader__ust-sch"]}>
                University of Santo Tomas
              </h1>
              <h6 id={COMMONHEADERSTYLE["commonheader__ust"]}>
                The Catholic University of the Philippines
              </h6>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

export default Header;
