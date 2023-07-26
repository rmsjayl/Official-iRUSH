import Header from "components/common/Header";
import Pagebroken from "components/common/Pagebroken";
import Spinner from "components/spinner/Spinner";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { instanceNoAuth } from "api/axios";
import REOPENTICKETSTYLE from "styles/pages/clientreopenticket.module.css";
import ResolvedTicketsClientList from "components/common/ResolvedTicketsClientList";

const ClientReopenTicket = () => {
  const param = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requestedResolvedTickets, setRequestedResolvedTickets] = useState([]);
  const [validUrl, setValidUrl] = useState(false);

  useEffect(() => {
    const verifyUrl = async () => {
      setValidUrl(true);
      try {
        setLoading(true);
        await instanceNoAuth
          .get(`/clients/client/${param.id}/${param.token}/requestedtickets`)
          .then((response) => {
            let requestedTicketsData = response.data.requestedTickets;
            setRequestedResolvedTickets(requestedTicketsData);
          });
      } catch (error) {
        setValidUrl(false);
        if (
          error.response.status === 400 ||
          error.response.status === 404 ||
          error.response.status === 500
        ) {
          toast.error(error.response.data.message);
          //   navigate("/");
        }
      }

      setLoading(false);
    };

    verifyUrl();
  }, [param]);

  return (
    <>
      {validUrl ? (
        <>
          <div className={REOPENTICKETSTYLE["reopenticket-container"]}>
            <div
              className={REOPENTICKETSTYLE["reopenticket-container__wrapper"]}
            >
              <div
                className={REOPENTICKETSTYLE["reopenticket-container__header"]}
              >
                <Header primary={true} />
              </div>

              <div
                className={
                  REOPENTICKETSTYLE["reopenticketrequest-container__form"]
                }
              >
                <>
                  {!loading ? (
                    <>
                      <div
                        className={
                          REOPENTICKETSTYLE["requestedticket-datatablelist"]
                        }
                      >
                        <ResolvedTicketsClientList
                          header={"REQUESTED TICKETS"}
                          loading={loading}
                          requestedResolvedTickets={requestedResolvedTickets}
                          setRequestedResolvedTickets={
                            setRequestedResolvedTickets
                          }
                          clientId={param.id}
                          token={param.token}
                        />
                      </div>
                    </>
                  ) : (
                    <Spinner />
                  )}
                </>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Pagebroken />
      )}
    </>
  );
};

export default ClientReopenTicket;
