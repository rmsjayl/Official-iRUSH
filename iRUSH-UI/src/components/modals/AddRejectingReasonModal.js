import React, { useState, useRef } from "react";
import ADDMODALSTYLE from "styles/components/modals/addmodal.module.css";
import Spinner from "components/spinner/Spinner";
import { Buttons } from "components/common/Buttons";
import { instance } from "api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Textfield from "@mui/material/TextField";

const AddRejectingReasonModal = ({ modalOpen }) => {
  const [addRejectReason, setAddRejectReasonData] = useState({
    rejectReasonName: "",
    description: "",
  });

  const handleChange = ({ currentTarget: input }) => {
    setAddRejectReasonData({ ...addRejectReason, [input.name]: input.value });
  };

  const [loading, setLoading] = useState(false);
  const modalRef = useRef();

  const closeModal = (e) => {
    if (modalRef.current === e.target) {
      modalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await instance
      .post(`/settings/createrejectreason`, addRejectReason)
      .then((response) => {
        toast.success(response.data.message);
        setLoading(true);
        modalOpen(false);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.href = "/login";
        }

        toast.error(error.response.data.message);
        setLoading(false);
      });
    setLoading(false);
  };

  return (
    <div
      onClick={closeModal}
      ref={modalRef}
      className={ADDMODALSTYLE["addmodal-container"]}
    >
      {!loading ? (
        <div className={ADDMODALSTYLE["addmodal-modal"]}>
          <div className={ADDMODALSTYLE["addmodal-modal__wrapper"]}>
            <div className={ADDMODALSTYLE["addcontainer-modal__paragraph"]}>
              <p className={ADDMODALSTYLE["addmodal-text"]}>
                add rejecting reason modal
              </p>
            </div>
          </div>

          <div className={ADDMODALSTYLE["addmodal-input"]}>
            <div className={ADDMODALSTYLE["container-add__setting"]}>
              <div className={ADDMODALSTYLE["name__setting"]}>
                <div className={ADDMODALSTYLE["name-setting__input"]}>
                  <Textfield
                    fullWidth
                    style={{
                      boxShadow: "8px 8px 16px 3px rgba(0, 0, 0, 0.1)",
                    }}
                    label="Reject Reason name"
                    name="rejectReasonName"
                    value={addRejectReason.rejectReasonName}
                    onChange={handleChange}
                    inputProps={{ maxLength: 50 }}
                  />
                </div>

                <div className={ADDMODALSTYLE["name-setting__input"]}>
                  <Textfield
                    multiline
                    fullWidth
                    style={{
                      boxShadow: "8px 8px 16px 3px rgba(0, 0, 0, 0.1)",
                    }}
                    label="Reject Reason Description"
                    name="description"
                    value={addRejectReason.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={ADDMODALSTYLE["container-settings__buttons"]}>
            <Buttons
              buttonSize="btn--medium"
              buttonStyle="btn--secondary__solid"
              onClick={() => modalOpen(false)}
            >
              CLOSE
            </Buttons>

            <Buttons
              buttonSize="btn--medium"
              buttonStyle="btn--primary__solid"
              onClick={handleSubmit}
            >
              SUBMIT
            </Buttons>
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default AddRejectingReasonModal;
