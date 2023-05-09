import React, { useState } from "react";
import Header from "../components/common/Header";
import FAQSTYLE from "../styles/pages/faq.module.css";

const Faqs = () => {
  const faqData = [
    {
      question:
        "How do I request for an authentication of academic records (e.g: transcripts of records, diploma)?",
      answer:
        "Present a clear and readable photocopy of the document/s you want to be authenticated to the Information Window of the Office of the Registrar. Ask for the corresponding application form; secure clearance from the Accounting Office and pay at the Treasury Department. Submit your documents along with the official receipt to Window M of the Office of the Registrar.",
    },
    {
      question:
        "How do I apply for a duplicate copy of my transcript of records?",
      answer:
        "Prepare a letter that is addressed to the Registrar and submit it to the Information Window of the Office of the Registrar. Fill-out the forms to be issued from the Information Window and follow additional instructions for diploma application. Secure clearance from the Accounting Office and pay the corresponding fees at the Treasury Department.  Submit the accomplished forms along with the official receipt to Window L (for diploma application) and to Window N (for transcript of records application).",
    },
    {
      question:
        " I wish to transfer to another university and I was instructed to submit a copy of my transcript of records, how do I go about it?",
      answer:
        "Initially, you need to apply for a transfer credential/honorable dismissal certificate.  Once the certificate is released, you have to submit that to the school where you wish your credentials to be transferred. The accepting school will then officially request for your transcript of records. Once official request is received, UST Office of the Registrar will then send the official transcript of records (with the remarks “copy for xxx (accepting school) directly to the school.  In some instances, the accepting school may authorize you to get your documents personally.",
    },
    {
      question: "How long does it take to process a CHED-DFA authentication?",
      answer:
        "The total process most likely will take three (3) to four (4) weeks or 30 calendar days.",
    },
    {
      question:
        "Is there a way to expedite the process of requesting documents for travel purposes?",
      answer:
        "Yes, there is. Present us a proof (plane tickets, job contract, job order etc.) or anything that will certify that you need to speed up the process. We will then provide an endorsement letter to CHED. The requesting applicant will be the one to do all the transactions in CHED and in DFA.",
    },
    {
      question:
        "I want to have my name and other personal details be corrected in all my academic records, what do I need to submit and how long is the process?",
      answer:
        "The process will take five (5) working days.  The requesting party (if currently enrolled) shall bring the original copy of the PSA-verified Birth Certificate (for verification only) together with its clear photocopy (for submission). He/she has to fill-out the application form at the Information Window of the Office of the Registrar. If the applicant is not enrolled, or has already graduated from UST, he/she is required to submit a personal and joint affidavit of Two Disinterested (not related) Persons along with the Original PSA-verified Birth certificate. For those who are changing their surname from single (maiden) to married, a copy (original or photocopy) of the Marriage Contract is a required.",
    },
    {
      question:
        "Can an alumna/alumnus apply for a transcript of records through a representative?",
      answer:
        "Yes, the representative must have an authorization letter duly signed by the owner of the records with accompanying ID or scanned copy of the ID bearing the face photo and specimen signature that matches the specimen signature on the authorization letter. The authorized representative must present a valid ID.",
    },
    {
      question:
        "Which documents of Graduate Students are not to be applied for at the Office of the Registrar?",
      answer: "Certificate of deficiency.",
    },
    {
      question:
        "Which documents of Medical Students are not to be applied for at the Office of the Registrar?",
      answer: "Certification for General Weighted Average.",
    },
    {
      question:
        "Is there a batch ranking for students who graduated earlier than 2005?",
      answer:
        "None, computerization of academic records was in effect after 2005.",
    },
    {
      question:
        "Is there a special feature of the Official Transcript of Records?",
      answer:
        "The student’s official transcript of records is printed on a security paper. The last page of the official transcript bears a hologram sticker that contains a serial number. This number can be used by employers or verification agencies for checking the authenticity of the records submitted to them. The verifier simply logs into the Office of the Registrar website, clicks on the the verification of student records tab, and then encodes the Hologram serial number and the date of birth of the owner of the record. If the document is authentic, the website produces the full name of the owner of the document during his/her stay in the university, the program he/she attended in the University, and latin honor if applicable.",
    },
  ];

  const [toggle, setToggle] = useState("false");

  const toggleOpen = (index) => {
    if (toggle === index) {
      return setToggle(null);
    }

    setToggle(index);
  };

  return (
    <>
      <div className={FAQSTYLE["faq-container"]}>
        <Header primary={true} />
        <div className={FAQSTYLE["faq-container__wrapper"]}>
          <div className={FAQSTYLE["accordion-container"]}>
            <div
              data-aos="fade-left"
              className={FAQSTYLE["accordion__wrapper"]}
            >
              {faqData.map((item, index) => (
                <div key={index}>
                  <div className={FAQSTYLE["container--visible"]}>
                    <div
                      onClick={() => toggleOpen(index)}
                      className={
                        toggle === index
                          ? `${FAQSTYLE["faq--container__questions--active"]}`
                          : `${FAQSTYLE["faq--container__questions--inactive"]}`
                      }
                    >
                      <span className={FAQSTYLE["faq__question"]}>
                        {item.question}
                      </span>
                    </div>

                    <div
                      className={
                        toggle === index
                          ? `${FAQSTYLE["container__answer--show"]}`
                          : `${FAQSTYLE["container_answer--hide"]}`
                      }
                    >
                      <span className={FAQSTYLE["faq__answer"]}>
                        {item.answer}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Faqs;
