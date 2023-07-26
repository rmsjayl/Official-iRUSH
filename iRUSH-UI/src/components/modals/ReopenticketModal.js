import React, { useRef, useState } from "react";
import MODALSTYLE from "styles/components/modals/modals.module.css";
import ERRORSTYLE from "styles/global/error.module.css";
import { Buttons } from "components/common/Buttons";
import Textfield from "@mui/material/TextField";
import Spinner from "components/spinner/Spinner";
import { instanceNoAuth } from "api/axios";
import EmailSuccess from "components/common/EmailSuccess";

function ReopenticketModal({ ReopenticketOpenModal }) {
  const [data, setData] = useState({
    email: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: res } = await instanceNoAuth.post(
        `/clients/requestreopenticket`,
        data
      );
      setIsSubmitted(true);
      toast.success(res.message);
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }

      setTimeout(() => {
        setError("");
      }, 3000);
    }

    setIsLoading(false);
  };

  const modalRef = useRef();

  const closeModal = (e) => {
    if (modalRef.current === e.target) {
      ReopenticketOpenModal(false);
    }
  };
  return (
    <>
      {isSubmitted ? (
        <EmailSuccess />
      ) : (
        <>
          {!isLoading ? (
            <div
              onClick={closeModal}
              ref={modalRef}
              className={MODALSTYLE["modal-section"]}
            >
              <div className={MODALSTYLE["container-modal"]}>
                <div className={MODALSTYLE["container-modal__wrapper"]}>
                  <div className={MODALSTYLE["container-modal__paragraph"]}>
                    <p className={MODALSTYLE["modal-text"]}>
                      Enter your{" "}
                      <span className={MODALSTYLE["text-emailadd"]}>
                        email address{" "}
                      </span>
                      so we can verify and send you the requests you have made
                      to the University of Santo Tomas - Office of the
                      Registrar.
                    </p>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <>
                      <div className={MODALSTYLE["container-modal_input"]}>
                        <div className={MODALSTYLE["modal-email__input"]}>
                          <Textfield
                            className={MODALSTYLE["user-email__input"]}
                            type="email"
                            label="EMAIL ADDRESS"
                            name="email"
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {error && (
                        <div className={ERRORSTYLE["error_message"]}>
                          {error}
                        </div>
                      )}

                      <div className={MODALSTYLE["container-modal__buttons"]}>
                        <div className={MODALSTYLE["modal-btns__wrapper"]}>
                          <div className={MODALSTYLE["modal-btn__close"]}>
                            <Buttons
                              buttonSize="btn--medium"
                              buttonStyle="btn--danger__solid"
                              onClick={() => ReopenticketOpenModal(false)}
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
          ) : (
            <Spinner />
          )}
        </>
      )}
    </>
  );
}

export default ReopenticketModal;
