import React from "react";
import "styles/components/common/buttons.css";

const STYLE = [
  "btn--primary__solid",
  // exclusive for (SUBMIT BUTTON), (ADD BUTTON), (CONFIRM TICKET BUTTON)
  "btn--secondary__solid",
  // exclusive for (REDIRECTHOMEPAGE BUTTON), (UPDATE BUTTON), (BACK BUTTON)
  "btn--danger__solid",
  // exclusive for (CLOSE BUTTON), (REJECTREQUEST TICKET), (DELETE BUTTON)
  "btn--longhead__solid",
  // exclusive for (LOGIN BUTTON)
  "btn--longhead__success",
  // exclusive for (SENDPASSWORD BTN)
  "btn--solid__servicerequest",
  // exclusive for (CREATE SERVICEREQ BUTTON)
  "btn--solid__reopenticket",
  // exclusive for (REQUEST REOPENTICKET BUTTON)
  "btn--solid__filterbydate",
  // exclusive for (FILTERBYDATE BUTTON)
];

const SIZES = [
  "btn--medium",
  "btn--large",
  "btn--servicereqs",
  "btn--medium__average",
  "btn--medium__filter",
];

export const Buttons = ({
  children,
  type,
  buttonStyle,
  buttonSize,
  onClick,
}) => {
  const checkButtonStyle = STYLE.includes(buttonStyle) ? buttonStyle : STYLE[0];
  const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];

  return (
    <button
      className={`btn ${checkButtonStyle} ${checkButtonSize}`}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
