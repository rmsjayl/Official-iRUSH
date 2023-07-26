import React from "react";
import NOSELECTEDOPTIONSTYLE from "../../styles/components/common/noselectedoption.module.css";
import USTTIGER from "../../assets/images/img/Tiger_clipart.png";
import { LazyLoadImage } from "react-lazy-load-image-component";

const NoSelectedOption = ({ option }) => {
  return (
    <>
      <div className={NOSELECTEDOPTIONSTYLE.container}>
        <LazyLoadImage
          id={NOSELECTEDOPTIONSTYLE["usttiger"]}
          alt="UST Tiger"
          effect="blur"
          src={USTTIGER}
        />
        <h4 style={{ textTransform: "Uppercase" }}>No {option} is selected </h4>
      </div>
    </>
  );
};

export default NoSelectedOption;
