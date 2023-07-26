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

const SubmitTicketModal = ({ checkRole, modalOpen }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [resolvedTicketData, setResolvedTicketData] = useState({
    solution: "",
    remarks: "",
  });
  const [resolution, setResolution] = useState([]);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef();

  const closeModal = (e) => {
    if (modalRef.current === e.target) {
      modalOpen(false);
    }
  };

  useEffect(() => {
    const fetchSolutionData = async () => {
      await instance
        .get(`/settings/fetchsolution`)
        .then((response) => {
          let solutionData = response.data.solution;
          setResolution(solutionData);
        })
        .catch((error) => {
          if (error.response.status === 401) {
            window.location.href = "/login";
          }
        });
    };

    fetchSolutionData();
  }, []);

  const handleChange = (event, name) => {
    setResolvedTicketData({
      ...resolvedTicketData,
      [name]: event.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (checkRole === "CLERK_HELPDESKSUPPORT") {
        await instance
          .post(
            `/tickets/helpdesk/assignedtickets/resolveticket/${id}`,
            resolvedTicketData
          )
          .then((response) => {
            toast.success(response.data.message);
            navigate("/helpdesksupport/tickets");
          });
      } else if (checkRole === "CLERK_ITSUPPORT") {
        await instance
          .post(
            `/tickets/itsupport/assignedtickets/resolveticket/${id}`,
            resolvedTicketData
          )
          .then((response) => {
            toast.success(response.data.message);
            navigate("/itsupport/tickets");
          });
      }
    } catch (error) {
      if (error.response.status === 401) {
        window.location.href = "/login";
      }

      if (error.response.status === 400) {
        toast.error(error.response.data.message);
      }

      if (error.response.status === 404) {
        toast.error(
          "An Error Occured while resolving the ticket. Please try again later"
        );
        navigate("/itsupport/tickets");
      }

      if (error.response.status === 500) {
        toast.error(
          "An Error Occured while resolving the ticket. Please try again later"
        );
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
                Before resolving the request, Please state the reason why.
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
                        REASON FOR RESOLVING
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={resolvedTicketData.solution}
                        onChange={(e) => handleChange(e, "solution")}
                        label="reasonForResolving"
                      >
                        {resolution.map((reason) => {
                          return (
                            <MenuItem
                              key={reason._id}
                              value={reason.solutionName}
                            >
                              {reason.solutionName}
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
                      value={resolvedTicketData.remarks}
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

export default SubmitTicketModal;
