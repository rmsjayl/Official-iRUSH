import React from "react";
import SPINNERSTYLE from "styles/components/spinner/spinner.module.css";

const Spinner = () => {
  return (
    <div className={SPINNERSTYLE["loading-spinner__API"]}>
      <div className={SPINNERSTYLE["spinner-loader__API"]}>iRUSH</div>
    </div>
  );
};

export default Spinner;
