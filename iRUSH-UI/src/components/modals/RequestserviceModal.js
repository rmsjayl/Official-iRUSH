import React, { useRef, useState } from "react";
import MODALSTYLE from "../../styles/components/modals/modals.module.css";
import { Buttons } from "../../components/common/Buttons";
import Textfield from "@mui/material/TextField";
import Spinner from "../spinner/Spinner";

function RequestserviceModal({ RequestserviceOpenModal }) {
  const modalRef = useRef();

  const closeModal = (e) => {
    if (modalRef.current === e.target) {
      RequestserviceOpenModal(false);
    }
  };
  return (
    <>
      <div
        onClick={closeModal}
        ref={modalRef}
        className={MODALSTYLE["modal-section"]}
      >
        <div className={MODALSTYLE["container-modal"]}>
          <div className={MODALSTYLE["container-modal__wrapper"]}>
            <div className={MODALSTYLE["container-modal__paragraph"]}>
              <p className={MODALSTYLE["modal-text"]}>
                Enter your <span className="text-emailadd">email address </span>
                so we can verify and send you the link of the request form.
              </p>
            </div>
            <form>
              <>
                <div className={MODALSTYLE["container-modal_input"]}>
                  <div className={MODALSTYLE["modal-email__input"]}>
                    <Textfield
                      className={MODALSTYLE["user-email__input"]}
                      type="email"
                      label="EMAIL ADDRESS"
                      name="email"
                    />
                  </div>
                </div>

                {/* {error && (
                                            <div className="error_message">
                                                {error}
                                            </div>
                                        )}
                                        {message && (
                                            <div className="message_message">
                                                {message}
                                            </div>
                                        )} */}

                <div className={MODALSTYLE["container-modal__buttons"]}>
                  <div className={MODALSTYLE["modal-btns__wrapper"]}>
                    <div className={MODALSTYLE["modal-btn__close"]}>
                      <Buttons
                        buttonSize="btn--medium"
                        buttonStyle="btn--danger__solid"
                        onClick={() => RequestserviceOpenModal(false)}
                      >
                        CLOSE
                      </Buttons>
                    </div>

                    <div className={MODALSTYLE["modal-btn__confirm"]}>
                      <Buttons
                        buttonSize="btn--medium"
                        buttonStyle="btn--secondary__solid"
                      >
                        CONFIRM
                      </Buttons>
                    </div>
                  </div>
                </div>
              </>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default RequestserviceModal;
