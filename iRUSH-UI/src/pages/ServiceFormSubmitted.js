import React, { useState, useEffect } from "react";
import EMAILSUCCESSSTYLE from "styles/components/common/emailsuccess.module.css";
import USTTIGER from "assets/images/img/Tiger_clipart.png";
import { Buttons } from "components/common/Buttons";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate, useParams } from "react-router-dom";

import { instanceNoAuth } from "api/axios";
import Header from "components/common/Header";
import { toast } from "react-toastify";

const ServiceFormSubmitted = () => {
  const param = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    referenceNumber: "",
  });

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        await instanceNoAuth
          .get(`/clients/clientrequest/${param.id}`)
          .then((response) => {
            console.log(response.data);
            let clientData = response.data.client;
            setData(clientData);
          });
      } catch (error) {
        if (
          error.response.status === 404 ||
          error.response.status === 400 ||
          error.response.status === 500
        ) {
          toast.error("Invalid Request");
          navigate("/");
        }
      }
    };

    fetchServiceData();
  }, [param]);

  return (
    <>
      <div className={EMAILSUCCESSSTYLE["container-emailverify"]}>
        <Header primary={true} />
        <div className={EMAILSUCCESSSTYLE["emailverify--container__content"]}>
          <div className={EMAILSUCCESSSTYLE["emailverifycontent__tiger"]}>
            <LazyLoadImage
              id={EMAILSUCCESSSTYLE["emailverify-tiger"]}
              src={USTTIGER}
              alt=""
              effect="blur"
            />
          </div>

          <div className={EMAILSUCCESSSTYLE["emailverifycontent__texts"]}>
            <div
              className={
                EMAILSUCCESSSTYLE["serviceformsuccesscontent-text__header"]
              }
            >
              <h1> Successfully requested a service </h1>
              <h1>
                <span> Reference No.: </span>
                {data.referenceNumber}
              </h1>
            </div>

            <div
              className={
                EMAILSUCCESSSTYLE["emailverifycontent-text__paragraph"]
              }
            >
              <p> Thank you for your patience. </p>
              <p>
                Please do check your mail inbox for the updates regarding your
                ticket.
              </p>
            </div>

            <div
              className={EMAILSUCCESSSTYLE["emailverifycontent-text__buttons"]}
            >
              <div className={EMAILSUCCESSSTYLE["emailverify-button"]}>
                <Buttons
                  buttonSize="btn--medium__average"
                  buttonStyle="btn--longhead__success"
                  onClick={() => {
                    window.location.href = "/";
                  }}
                >
                  REDIRECT ME TO HOMEPAGE
                </Buttons>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceFormSubmitted;
