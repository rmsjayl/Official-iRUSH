import React, { useState, useEffect, useRef } from "react";
import CONFIRMMODALSTYLE from "styles/components/modals/confirmmodal.module.css";
import Spinner from "components/spinner/Spinner";
import { Buttons } from "components/common/Buttons";
import { instance } from "api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useNavigate, useParams } from "react-router-dom";
import { TextField } from "@mui/material";

const VoidTicketModal = ({ modalOpen }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voidReasonData, setVoidReasonData] = useState({
    voidReason: "",
    remarks: "",
  });
  const [voidreason, setVoidReason] = useState([]);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef();
  const closeModal = (e) => {
    if (modalRef.current === e.target) {
      modalOpen(false);
    }
  };

  useEffect(() => {
    const fetchVoidReason = async () => {
      await instance
        .get(`/settings/fetchvoidreason`)
        .then((response) => {
          setVoidReason(response.data.voidReason);
        })
        .catch((error) => {
          if (error.response.status === 401) {
            window.location.href = "/login";
            sessionStorage.clear();
          }
        });
    };

    fetchVoidReason();
  }, []);

  const handleChange = (event, name) => {
    setVoidReasonData({
      ...voidReasonData,
      [name]: event.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await instance
        .post(
          `tickets/itsupport/assignedtickets/voidticket/${id}`,
          voidReasonData
        )
        .then((response) => {
          toast.success(response.data.message);
          navigate("/itsupport/tickets");
        });
    } catch (error) {
      if (error.response.status === 400) {
        toast.error(error.response.data.message);
      }

      if (error.response.status === 401) {
        window.location.href = "/login";
      }

      if (error.response.status === 404) {
        toast.error("Error occured while voiding the ticket.");
        navigate("/itsupport/tickets");
      }

      if (error.response.status === 500) {
        toast.error("Error occured while voiding the ticket.");
        navigate("/itsupport/tickets");
      }
    }

    setLoading(false);
  };

  return (
    <div
      onClick={closeModal}
      ref={modalRef}
      className={CONFIRMMODALSTYLE["confirmmodal-container"]}
    >
      {!loading ? (
        <div className={CONFIRMMODALSTYLE["confirmmodal-modal"]}>
          <div className={CONFIRMMODALSTYLE["confirmmodal-modal__wrapper"]}>
            <div
              className={CONFIRMMODALSTYLE["confirmcontainer-modal__paragraph"]}
            >
              <p className={CONFIRMMODALSTYLE["confirmmodal-text"]}>
                Before voiding the request, Please state the reason why.
              </p>
            </div>
          </div>

          <div className={CONFIRMMODALSTYLE["confirmmodal-input"]}>
            <div className={CONFIRMMODALSTYLE["container-confirm__setting"]}>
              <div className={CONFIRMMODALSTYLE["name__setting"]}>
                <div className={CONFIRMMODALSTYLE["name-setting__input"]}>
                  <Box>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">
                        REASON FOR VOIDING
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={voidReasonData.voidReason}
                        onChange={(e) => handleChange(e, "voidReason")}
                        label="reasonForRejecting"
                      >
                        {voidreason.map((reason) => {
                          return (
                            <MenuItem
                              key={reason._id}
                              value={reason.voidReasonName}
                            >
                              {reason.voidReasonName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Box>
                </div>

                <div className={CONFIRMMODALSTYLE["name-setting__input"]}>
                  <Box component="form">
                    <TextField
                      fullWidth
                      multiline
                      id="outlined-multiline-flexible"
                      label="REMARKS"
                      variant="outlined"
                      inputProps={{ maxLength: 250 }}
                      value={voidReasonData.remarks}
                      onChange={(e) => handleChange(e, "remarks")}
                    />
                  </Box>
                </div>
              </div>
            </div>
          </div>

          <div className={CONFIRMMODALSTYLE["submitform-container__btn"]}>
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

export default VoidTicketModal;
