import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HOMEPAGESTYLE from "../styles/pages/homepage.module.css";
import "react-lazy-load-image-component/src/effects/blur.css";
import USTBLDG from "../assets/images/img/UST_mainbldg.jpg";
import USTLOGO from "../assets/images/img/UST_logo.png";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Buttons } from "../components/common/Buttons";
//FOR THE MODALS
import RequestserviceModal from "../components/modals/RequestserviceModal";
import ReopenticketModal from "../components/modals/ReopenticketModal";
//SPINNER
import Spinner from "../components/spinner/Spinner";

function Homepage() {
  const [openModalCreateService, setOpenModalCreateService] = useState(false);
  const [openModalReopenTicket, setOpenModalReopenTicket] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const tabLinks = [
    {
      name: "FAQ",
      link: "/faq",
    },
    {
      name: "TICKET LOGS",
      link: null,
      onClick: () => setOpenModalReopenTicket(true),
    },
    {
      name: "REGISTER",
      link: "/register",
    },
    {
      name: "LOGIN",
      link: "/login",
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setPageLoading(false);
    }, 800);
  }, []);

  return (
    <>
      {openModalCreateService && (
        <RequestserviceModal
          RequestserviceOpenModal={setOpenModalCreateService}
        />
      )}

      {openModalReopenTicket && (
        <ReopenticketModal ReopenticketOpenModal={setOpenModalReopenTicket} />
      )}

      <header>
        <div className={HOMEPAGESTYLE["top-navigation"]}>
          <div className={HOMEPAGESTYLE["header-row"]}>
            <div className={HOMEPAGESTYLE["header-ust"]}>
              <div className={HOMEPAGESTYLE["header-ust__logo"]}>
                <LazyLoadImage
                  width={80}
                  height={80}
                  alt="UST Main building"
                  effect="blur"
                  src={USTLOGO}
                />
              </div>
              <div className={HOMEPAGESTYLE["header-ust__name"]}>
                <span
                  className={`${HOMEPAGESTYLE["header"]} ${HOMEPAGESTYLE["pontifical"]}`}
                >
                  Pontifical and Royal
                </span>
                <span
                  className={`${HOMEPAGESTYLE["header"]} ${HOMEPAGESTYLE["university"]}`}
                >
                  University of Santo Tomas
                </span>
                <span
                  className={`${HOMEPAGESTYLE["header"]} ${HOMEPAGESTYLE["catholicuniversity"]}`}
                >
                  The Catholic University of the Philippines
                </span>
              </div>
            </div>
            <div className={HOMEPAGESTYLE["button-functionalities"]}>
              {tabLinks.map((tabLink, key) => {
                return (
                  <Link to={tabLink.link} key={key}>
                    <div className={HOMEPAGESTYLE["header-button__navigation"]}>
                      <Buttons
                        className="btn btn-outline-primary"
                        name={tabLink.name}
                        onClick={tabLink.onClick}
                      >
                        {tabLink.name}
                      </Buttons>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <div className={HOMEPAGESTYLE["homepage-container"]}>
        <div className={HOMEPAGESTYLE["homepage-container__wrapper"]}>
          <div className={HOMEPAGESTYLE["landing-page__image"]}>
            <LazyLoadImage
              id={HOMEPAGESTYLE["ustmainbldg"]}
              alt="UST Main building"
              effect="blur"
              src={USTBLDG}
            />
          </div>
          <div className={HOMEPAGESTYLE["landing-page__content"]}>
            <div className={HOMEPAGESTYLE["landing-page--content__headers"]}>
              <span className={HOMEPAGESTYLE["content-header"]}>iRUSH</span>
              <div className={HOMEPAGESTYLE["content-paragraphs"]}>
                <p>
                  This is the official service help desk of the University of
                  Santo Tomas - Office of the Registrar, the custodian of
                  academic records of students.
                </p>
              </div>
              <div className={HOMEPAGESTYLE["content-buttons"]}>
                <Buttons onClick={() => setOpenModalCreateService(true)}>
                  CREATE NEW SERVICE REQUEST
                </Buttons>
                <Buttons onClick={() => setOpenModalReopenTicket(true)}>
                  REQUEST REOPEN TICKET
                </Buttons>
              </div>
            </div>
          </div>
        </div>

        <footer>
          <div className={HOMEPAGESTYLE["footer-container"]}>
            <span className={HOMEPAGESTYLE["footer-container__copyright"]}>
              &copy; copyright {new Date().getFullYear()}, University of Santo
              Tomas. All rights Reserved.
            </span>

            <span className={HOMEPAGESTYLE["footer-container__poweredby"]}>
              powered by: iRUSH Capstone Team
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Homepage;
