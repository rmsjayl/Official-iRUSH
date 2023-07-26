//@desc:	IMPORT MODELS
const Client = require("../models/clients");
const RequestToken = require("../models/requestToken");
const ReopenTicket = require("../models/reopenedTickets");
const Ticket = require("../models/tickets");
const Category = require("../models/category");
//@desc:	IMPORT CRYPTOJS FOR RANDOM STRING GENERATOR
const crypto = require("crypto");
//@desc:	IMPORT NODEMAILER FOR EMAIL SENDING
const sendEmail = require("../utils/sendMail");

//@desc:	Only registered cients may request to reopen their ticket
//			in case some errors have occured or they want some modifications,
//			on their tickets.
exports.requestreopenticket = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email address field is required.",
      });
    }

    const client = await Client.findOne({ email: req.body.email });

    if (!client)
      return res.status(400).send({
        success: false,
        message: "Invalid email! Please enter a valid UST email to proceed.",
      });

    if (!client.verified)
      return res.status(400).send({
        success: false,
        message: "Invalid email! Please enter a valid UST Email to proceed.",
      });

    const requestToken = await new RequestToken({
      clientId: client._id,
      token: crypto.randomBytes(16).toString("hex"),
    }).save();

    //@desc:   HTML TEMPLATE FOR SENDING EMAILS TO REQUESTER
    const mail = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com">
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
				<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
				<meta charset="UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<style>
                    
					.create-new-service a {
						color: #000;
						text-transform: uppercase;		
					}
					.create-new-service__button {
						color: #000;
						font-size: 18px;
						background-color: transparent;
						cursor: pointer;
						border: 1px solid black;
						border-radius: 10px;
						padding: 8px 18px 8px 18px;
						font-weight: 800;
						text-decoration: none;
					}
					.create-new-service__button:hover {
						background-color: #000;
						color: #fff;
					}
					.footer-text {
						line-height: 0px;
					}
				</style>
			</head>
		
			<body style="font-family: 'Poppins', sans serif; margin: 0; padding: 0; text-decoration: none;">
				<div
					style="
						width: 100%;
						height: 100%;
                        background-color: rgb(254, 192, 15, 0.71);
						display: flex;
						justify-content: center;
						align-items: center;
					"
					class="container"
				>
					<div
						style="
							display: flex;
							justify-content: center;
							align-items: center;
							width: 100%;
							height: 100%;
						"
						class="container-wrapper"
					>
						<div
							style="
								width: 100%;
								height: 100%;
                                border: 1px solid rgba(0, 0, 0, 0.255);
							"
							class="container-wrapper__createservicereq"
						>
							<h1
								style="
									font-size: 35px;
									font-weight: bold;
									color: #000;
									text-align: center;
									text-transform: uppercase;
									padding-top: 55px;
								"
								class="greetings"
							>
								Greetings
							</h1>
							<p
								style="
									color: rgb(0, 0, 0, 0.5);
									font-size: 18px;
									font-weight: 700;
									text-align: center;
									padding: 0 55px 0 55px;
									padding-top: 25px;
									margin-bottom: 40px;
								"
								class="welcome-text"
							>
							Thank you for waiting! I am pleased to announce that you may now REQUEST TO REOPEN A TICKET to University of Santo Tomas - Office of the Registrar: Service Helpdesk by clicking the provided button below.
							</p>
		
							<div
								style="text-align: center; "
								class="create-new-service"
							>
								<a class="create-new-service__button" href=${process.env.SERVICEREQUEST_LINK}/client/${client._id}/${requestToken.token}/requestedtickets>
									Request Reopen Ticket
								</a>
							</div>
		
							<div
								style="
									color: rgb(0, 0, 0, 0.5);
									font-size: 18px;
									font-weight: 700;
									margin-top: 45px;
									text-align: center;
								"
								class="thankyou-text"
							>
								<p>Thank you for your interest in our services.</p>
							</div>
		
							<hr
								style="
									background-color: rgba(0, 0, 0, 0.255);
									height: 1px;
									border: none;
								"
								class="divider"
							/>
		
							<footer
								style="
									color: rgb(0, 0, 0, 0.5);
									font-size: 12px;
									text-align: center;
									padding: 2px;
								"
								class="footer"
							>
								<h6 class="footer-text">
									Please disregard this email if you did not send this request
								</h6>
								<h6 class="footer-text">
									iRUSH: Service Helpdesk of University of Santo Tomas - Office of
									the Registrar
								</h6>
								<h6 class="footer-text">
									2nd floor Main Bldg, University of Santo Tomas España, Manila
									C-105
								</h6>
								<h6 class="footer-text">
									(632) 8880-1611 Loc. 4498 and 8279 (General Information and
									Verification)
								</h6>
								<h6 class="footer-text">
									Operation Hours: 9:00 am to 3:00 pm Monday to Friday
								</h6>
							</footer>
						</div>
					</div>
				</div>
			</body>
		</html>`;

    await sendEmail(client.email, "Request to reopen a ticket", mail);

    res.status(200).send({
      success: true,
      message:
        "An Email will be sent to your account to proceed in requesting to reopen a ticket.",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	get the user requested tickets.
exports.getrequestedtickets = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id });
    const requestedTickets = await Ticket.find({ requesterId: req.params.id });

    const requestToken = await RequestToken.findOne({
      clientId: client._id,
      token: req.params.token,
    });

    if (!requestToken) {
      return res.status(404).send({
        success: false,
        message: "Link is invalid.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Client requested Tickets. Link is valid.",
      requestedTickets,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	Get the specific ticket to reopen
exports.getreopenticket = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id });
    const requestedTicket = await Ticket.findOne({ _id: req.params.ticketId });

    if (!client) {
      return res.status(404).send({
        success: false,
        message: "Client not found.",
      });
    }

    if (!requestedTicket) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found.",
      });
    }

    const requestToken = await RequestToken.findOne({
      clientId: client._id,
      token: req.params.token,
    });

    if (!requestToken) {
      return res.status(404).send({
        success: false,
        message: "Link is invalid.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Ticket found.",
      requestedTicket,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

exports.reopenticket = async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id });
  const ticket = await Ticket.findOne({ _id: req.params.ticketId });

  const { issue } = req.body;

  try {
    const requestToken = await RequestToken.findOne({
      clientId: client._id,
      token: req.params.token,
    });

    if (!requestToken) {
      return res.status(404).send({
        success: false,
        message: "Link is invalid.",
      });
    }

    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found.",
      });
    }

    if (ticket.status === "Open" || ticket.status === "Overdue") {
      return res.status(400).send({
        success: false,
        message: "Ticket is still not yet assigned.",
      });
    }

    if (ticket.status === "Rejected") {
      return res.status(400).send({
        success: false,
        message: "Ticket is rejected, it cannot be reopened.",
      });
    }

    if (ticket.status === "Voided") {
      return res.status(400).send({
        success: false,
        message: "Ticket is voided, it cannot be reopened.",
      });
    }

    if (ticket.status === "Reopened") {
      return res.status(400).send({
        success: false,
        message: "Ticket is already reopened. It cannot be reopened again.",
      });
    }

    if (ticket.isReopened === true) {
      return res.status(400).send({
        success: false,
        message:
          "Ticket already reopened. Please wait for the ticket to be assigned.",
      });
    }

    if (!issue) {
      return res.status(400).send({
        success: false,
        message: "Please provide atleast an issue.",
      });
    }

    //creates a request number which finds the last request number and adds 1 to it.
    const lastRequestNumber = await ReopenTicket.findOne({}).sort({
      _id: -1,
    });
    let requestNumber = lastRequestNumber
      ? parseInt(lastRequestNumber.requestNo) + 1
      : 1;

    const reopenTicket = new ReopenTicket({
      requestNumber,
      clientId: client._id,
      ticketId: ticket._id,
      requestNo: requestNumber,
      requester: ticket.requesterName,
      requesterEmail: ticket.requester,
      clientUnit: ticket.clientUnit,
      contactNum: ticket.clientContactNum,
      ticketNo: ticket.ticketNo,
      ticketCategory: ticket.ticketCategory,
      ticketSubject: ticket.ticketSubject,
      ticketDescription: ticket.ticketDescription,
      referenceNo: ticket.referenceNo,
      solutionMade: ticket.solution,
      remarks: ticket.remarks,
      resolvedAt: ticket.resolvedAt,
      reopenedAt: new Date(Date.now()),
      isAssigned: false,
      issue,
    });

    const findCategory = await Category.find();
    const categoryIndex = findCategory.findIndex(
      (category) => category.categoryName === ticket.ticketCategory
    );

    //generate a reference number upon submitting the request.
    //get todays date
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    //get today's date to be used in the reference number.
    const referenceDate =
      year + "" + "" + month + "" + day + "" + hour + "" + minute;

    function subjectIndex() {
      if (ticket.ticketSubject === "Credentials") {
        return `${1}`;
      } else if (ticket.ticketSubject === "Authentication") {
        return `${2}`;
      } else if (ticket.ticketSubject === "Verification") {
        return `${3}`;
      } else if (ticket.ticketSubject === "Other related concerns") {
        return `${4}`;
      }
    }

    const clientReferenceNumber = `00${
      categoryIndex + 1
    }${subjectIndex()}${referenceDate}RE${requestNumber}`;

    //save reference number to the database
    reopenTicket.referenceNo = clientReferenceNumber;
    await reopenTicket.save();

    client.referenceNumber = clientReferenceNumber;
    await client.save();

    await Ticket.updateOne({ _id: ticket._id }, { isReopened: true });

    res.status(200).send({
      success: true,
      message: "Ticket is reopened.",
      reopenTicket,
    });

    //delete the request token after the request is submitted.
    await RequestToken.deleteOne({ _id: requestToken._id });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};
