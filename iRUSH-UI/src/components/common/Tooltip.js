import React from "react";
import TOOLTIPSTYLE from "styles/components/common/tooltip.module.css";

const Tooltip = ({ title, tooltipText, children }) => {
  return (
    <>
      <div className={TOOLTIPSTYLE.tooltip}>
        {children}
        {title}
        <span className={TOOLTIPSTYLE.tooltiptext}>{tooltipText}</span>
      </div>
    </>
  );
};

export default Tooltip;
