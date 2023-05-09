const Client = require("../models/clients");
const Service = require("../models/services");
const RejectedService = require("../models/rejectedservice");
const Ticket = require("../models/tickets");
const Category = require("../models/category");
const ReopenTicket = require("../models/reopenedTickets");
const RespondToken = require("../models/respondToken");
const { User } = require("../models/users");
const Likert = require("../models/likert");
const sendEmail = require("../utils/sendMail");
const crypto = require("crypto");
const moment = require("moment");
const fs = require("fs");
const PDFDocument = require("pdfkit-table");
const path = require("path");

//@desc:	Get all the tickets created by all the clients
//@access: 	SUPERADMIN and ADMIN ONLY
exports.getrequestservices = async (req, res) => {
  try {
    const service = await Service.find();
    const categoryName = await Category.find();
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let serviceCategory = req.query.category || "All";

    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });

    serviceCategory === " " || serviceCategory === "All"
      ? (serviceCategory = categorynameOptions)
      : (serviceCategory = req.query.category.split(","));

    const filteredServiceRequests = await Service.find({
      referenceNo: { $regex: search, $options: "i" },
      category: { $in: serviceCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Service.countDocuments({
      category: { $in: [...serviceCategory] },
      referenceNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    if (service.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No service requests found.",
      });
    }

    return res.status(200).send({
      success: true,
      message:
        "Successfully fetched all the services requested by the clients.",
      service,
      page: page + 1,
      limit,
      filteredServiceRequests,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Get all the tickets created by a user
//@desc:	SUPERADMIN and ADMIN ONLY
exports.getclientrequest = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).send({
        success: false,
        message: "No service request found.",
      });
    }

    res.status(200).send({
      success: true,
      message:
        "Successfully retrieved the request of service made by a client.",
      service,
    });
  } catch (error) {
    //handle the cast error

    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	After getting the request made by a user,
//			can now assign a ticket to a clerk member.
exports.createticket = async (req, res) => {
  try {
    const { assignTo, priority } = req.body;
    const service = await Service.findById(req.params.id);
    const client = await Client.findOne({ _id: service.clientId });
    const assignee = await User.findOne({ email: req.user.email });

    if (!service) {
      return res.status(404).send({
        success: false,
        message: "No service request found with that ID.",
      });
    }

    if (!assignTo || !priority) {
      return res.status(400).send({
        success: false,
        message: "Bad request! please fill all fields.",
      });
    }

    const clerkAssigned = await User.findOne({ email: assignTo });

    if (assignee.email === clerkAssigned.email) {
      return res.status(404).send({
        success: false,
        message:
          "Please assign the ticket. You cannot assign a ticket to yourself.",
      });
    }

    if (
      clerkAssigned.role === "USER_ADMIN" ||
      clerkAssigned.role === "USER_SUPERADMIN"
    ) {
      return res.status(404).send({
        success: false,
        message:
          "Please assign the ticket. You cannot assign a ticket to the admins.",
      });
    }
    //creates a request number which finds the last request number and adds 1 to it.
    const lastRequestNumber = await Ticket.findOne({}).sort({
      _id: -1,
    });
    let requestNumber = lastRequestNumber
      ? parseInt(lastRequestNumber.ticketNo) + 1
      : 1;

    //generate a ticket number
    const ticket = await Ticket.create({
      requesterId: client._id,
      serviceId: service._id,
      requestedAt: service.createdAt,
      ticketNo: requestNumber,
      assignTo,
      assignBy: assignee.email,
      requester: client.email,
      requesterName: `${client.lastName}, ${client.firstName}`,
      clientContactNum: client.contactNum,
      clientUnit: client.unit,
      ticketSubject: service.subject,
      ticketCategory: service.category,
      ticketDescription: service.description,
      priority,
    });

    const mail = `<!DOCTYPE html>
		<html lang="en">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
					rel="stylesheet"
				/>
				<meta charset="UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<style>
					.container {
						background-color: #fff;
						padding: 0 100px 0 100px;
						display: flex;
						justify-content: center;
						align-items: center;
					}
					.container-wrapper {
						width: 100%;
						display: flex;
						justify-content: center;
						align-items: center;
						background-color: rgb(254, 192, 15, 0.71);
						border: 1px solid rgba(0, 0, 0, 0.255);
					}
					.container-wrapper__approvedservicereq {
						width: 100%;
					}
					.greetings {
						font-size: 23px;
						font-weight: bold;
						color: #000;
						text-transform: uppercase;
						text-align: center;
						padding-top: 10px;
					}
					.welcome-text {
						color: rgba(0, 0, 0, 0.67);
						font-size: 15px;
						font-weight: 600;
						text-align: center;
						padding: 0 150px;
						margin-bottom: 15px;
					}
					.update-paragraph {
						color: rgba(0, 0, 0, 0.67);
						font-size: 15px;
						font-weight: 600;
						text-align: center;
						padding: 0 150px;
						margin-top: 15px;
						margin-bottom: 15px;
					}
					.container-approvedservicereq__personalinformation {
						text-align: center;
						width: 100%;
					}
					.approvedservicereq--personalinformation__wrapper {
						text-align: left;
						padding: 0 220px;
					}
					.personal-information__container {
						width: 100%;
					}
					.personalinformation-header {
						width: 100%;
					}
					.personaldetails--container__name {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.personaldetails--container__unit {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.personaldetails--container__course {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.personaldetails--container__contact {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.personalinformation-details__name {
						width: 100%;
					}
					.personalinformation-details__clientname {
						width: 100%;
					}
					.personalinformation-details__unit {
						width: 100%;
					}
					.personalinformation-details__clientunit {
						width: 100%;
					}
					.personalinformation-details__contact {
						width: 100%;
					}
					.personalinformation-details__clientcontact {
						width: 100%;
					}
					.personalinformation-details__course {
						width: 100%;
					}
					.personalinformation-details__clientcourse {
						width: 100%;
					}
					.ticket-information__container {
						width: 100%;
						margin-top: 20px;
					}
					.ticketinformation-header {
						width: 100%;
					}
					.ticketdetails--container__ticketid {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.ticketinformation-details__ticketid {
						width: 100%;
					}
					.ticketinformation-details__clientticketid {
						width: 100%;
					}
					.ticketdetails--container__priority {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.ticketinformation-details__priority {
						width: 100%;
					}
					.ticketinformation-details__ticketpriority {
						width: 100%;
					}
					.ticketdetails--container__category {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.ticketinformation-details__category {
						width: 100%;
					}
					.ticketinformation-details__ticketcategory {
						width: 100%;
					}
					.ticketdetails--container__subject {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.ticketinformation-details__subject {
						width: 100%;
					}
					.ticketinformation-details__ticketsubject {
						width: 100%;
					}
					.ticketdetails--container__desc {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.ticketinformation-details__desc {
						width: 100%;
					}
					.ticketinformation-details__ticketdesc {
						width: 100%;
					}
					.clerk-information__container {
						width: 100%;
						margin-top: 20px;
					}
					.clerkdetails--container__email {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.clerkinformation-details__email {
						width: 100%;
					}
					.clerkinformation-details__clerkemailadd {
						width: 100%;
					}
					.clerkdetails--container__contactnum {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.clerkinformation-details__contactnum {
						width: 100%;
					}
					.clerkinformation-details__clerkcontactnum {
						width: 100%;
					}
					.divider {
						background-color: rgba(0, 0, 0, 0.255);
						height: 1px;
						width: 100%;
						border: none;
					}
					.footer {
						color: rgb(0, 0, 0, 0.5);
						font-size: 12px;
						text-align: center;
						width: 100%;
					}
					.footer-text {
						line-height: 0px;
					}
					#span-emp {
						color: rgb(0, 0, 0, 0.5);
						font-size: 13px;
						font-weight: 600;
					}
					#span-emp__req {
						color: #000;
						font-size: 13px;
						font-weight: 600;
					}
		
					@media screen and (min-width: 354px) and (max-width: 768px) {
						#span-emp {
							font-size: 10px;
						}
						#span-emp__req {
							font-size: 10px;
						}
						.greetings {
							padding: 0, 25px 0 25px;
							font-size: 18px;
						}
						.welcome-text {
							font-size: 13px;
						}
						.update-paragraph {
							font-size: 13px;
						}
						.container {
							width: 100%;
							margin: 0;
							padding: 0;
						}
						.container-wrapper {
							width: 100%;
							margin: 0;
						}
						.container-wrapper__approvedservicereq {
							width: 100%;
							margin: 0;
							padding: 0;
						}
						.approvedservicereq--personalinformation__wrapper {
							text-align: left;
							padding: 0 50px 0 50px;
						}
						.welcome-text {
							padding: 0 20px 0 20px;
						}
						.update-paragraph {
							padding: 0 20px 0 20px;
						}
					}
				</style>
			</head>
		
			<body
				style="
					font-family: 'Poppins', sans serif;
					margin: 0;
					padding: 0;
					text-decoration: none;
					color: #000;
				"
			>
				<div class="container">
					<div class="container-wrapper">
						<div class="container-wrapper__approvedservicereq">
							<h2 class="greetings">
								Greetings, ${client.firstName} ${client.lastName}!
							</h2>
							<p class="welcome-text">
								The request you sent to The Official Service Helpdesk of the
								University of Santo Tomas - Office of the registrar has been
								<span style="color: #000; font-weight: 700">ACCEPTED</span> with the
								following details:
							</p>
		
							<div class="container-approvedservicereq__personalinformation">
								<div class="approvedservicereq--personalinformation__wrapper">
									<div class="personal-information__container">
										<div class="personalinformation-header">
											<span style="font-weight: 700; font-size: 13px">
												Your personal information:
											</span>
										</div>
										<div class="personaldetails--container__name">
											<div class="personalinformation-details__name">
												<span id="span-emp">Client Name:</span>
											</div>
											<div class="personalinformation-details__clientname">
												<span id="span-emp__req">
													${client.firstName} ${client.lastName}
												</span>
											</div>
										</div>
										<div class="personaldetails--container__unit">
											<div class="personalinformation-details__unit">
												<span id="span-emp">Client Unit:</span>
											</div>
											<div class="personalinformation-details__clientunit">
												<span id="span-emp__req"> ${client.unit} </span>
											</div>
										</div>
										<div class="personaldetails--container__course">
											<div class="personalinformation-details__course">
												<span id="span-emp">Client Course:</span>
											</div>
											<div class="personalinformation-details__clientcourse">
												<span id="span-emp__req"> ${client.course} </span>
											</div>
										</div>
		
										<div class="personaldetails--container__contact">
											<div class="personalinformation-details__contact">
												<span id="span-emp">Contact Number:</span>
											</div>
											<div class="personalinformation-details__clientcontact">
												<span id="span-emp__req"> ${client.contactNum} </span>
											</div>
										</div>
									</div>
		
									<div class="ticket-information__container">
										<div class="ticketinformation-header">
											<span style="font-weight: 700; font-size: 13px">
												Your ticket information:
											</span>
										</div>
										<div class="ticketdetails--container__ticketid">
											<div class="ticketinformation-details__ticketid">
												<span id="span-emp">Ticket No.:</span>
											</div>
											<div class="ticketinformation-details__clientticketid">
												<span id="span-emp__req"> ${ticket.ticketNo} </span>
											</div>
										</div>
										<div class="ticketdetails--container__priority">
											<div class="ticketinformation-details__priority">
												<span id="span-emp">Priority:</span>
											</div>
											<div class="ticketinformation-details__ticketpriority">
												<span id="span-emp__req"> ${ticket.priorityStatus()} </span>
											</div>
										</div>
										<div class="ticketdetails--container__category">
											<div class="ticketinformation-details__category">
												<span id="span-emp">Category:</span>
											</div>
											<div class="ticketinformation-details__ticketcategory">
												<span id="span-emp__req"> ${service.category} </span>
											</div>
										</div>
										<div class="ticketdetails--container__subject">
											<div class="ticketinformation-details__subject">
												<span id="span-emp">Subject:</span>
											</div>
											<div class="ticketinformation-details__ticketsubject">
												<span id="span-emp__req"> ${service.subject} </span>
											</div>
										</div>
										<div class="ticketdetails--container__desc">
											<div class="ticketinformation-details__desc">
												<span id="span-emp">Description:</span>
											</div>
											<div class="ticketinformation-details__ticketdesc">
												<span id="span-emp__req"> ${service.description} </span>
											</div>
										</div>
									</div>
		
									<div class="clerk-information__container">
										<div class="clerkinformation-header">
											<span style="font-weight: 700; font-size: 13px">
												You may contact ${clerkAssigned.firstName}
												${clerkAssigned.lastName} who is assigned to your ticket,
												through the following:
											</span>
										</div>
										<div class="clerkdetails--container__email">
											<div class="clerkinformation-details__email">
												<span id="span-emp">Email Address.:</span>
											</div>
											<div class="clerkinformation-details__clerkemailadd">
												<span id="span-emp" style="font-weight: 700">
													${assignTo}
												</span>
											</div>
										</div>
										<div class="clerkdetails--container__contactnum">
											<div class="clerkinformation-details__contactnum">
												<span id="span-emp">Contact Number:</span>
											</div>
											<div class="clerkinformation-details__clerkcontactnum">
												<span id="span-emp__req">
													${clerkAssigned.contactNum}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
		
							<div>
								<p class="update-paragraph">
									Whenever there is an update regarding your ticket, you will be
									notified through your email address. <br />Thank you!
								</p>
							</div>
		
							<hr class="divider" />
		
							<footer class="footer">
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
		</html>									
		`;
    await sendEmail(client.email, "Ticket Created", mail);
    await Service.deleteOne({ _id: service._id });

    return res.status(200).send({
      success: true,
      message:
        "Email sent to the requester. The ticket was successfully assigned to a clerk.",
      ticket,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Reject the request made by the user.
//@access:	SUPER ADMIN and ADMIN, HELPDESKSUPPORT
exports.rejectclientrequest = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    const client = await Client.findOne({ _id: service.clientId });
    const assignee = await User.findOne({ email: req.user.email });
    const { remarks, rejectReason } = req.body;
    if (!remarks || !rejectReason) {
      return res.status(400).send({
        success: false,
        message: "Bad request! please fill all fields.",
      });
    }

    //find the client who requested the service
    if (!client) {
      return res.status(404).send({
        success: false,
        message: "Client not found.",
      });
    }

    const rejectservicereq = await RejectedService.create({
      serviceId: service._id,
      clientId: client.id,
      clientUnit: client.unit,
      requestNo: service.requestNo,
      requester: service.requester,
      clientContact: service.clientContact,
      requesterEmail: service.requesterEmail,
      referenceNo: service.referenceNo,
      category: service.category,
      subject: service.category,
      description: service.description,
      rejectedtedReason: rejectReason,
      remarks: remarks,
      requestedAt: service.createdAt,
      rejectedAt: new Date(Date.now()),
      rejectedBy: assignee.email,
    });

    const mail = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link
			href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
			rel="stylesheet"
		/>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<style>
			.container {
				background-color: #fff;
				padding: 0 100px 0 100px;
				display: flex;
				justify-content: center;
				align-items: center;
			}
			.container-wrapper {
				width: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: rgb(254, 192, 15, 0.71);
				border: 1px solid rgba(0, 0, 0, 0.255);
			}
			.container-wrapper__approvedservicereq {
				width: 100%;
			}
			.greetings {
				font-size: 23px;
				font-weight: bold;
				color: #000;
				text-transform: uppercase;
				text-align: center;
				padding-top: 10px;
			}
			.welcome-text {
				color: rgba(0, 0, 0, 0.67);
				font-size: 15px;
				font-weight: 600;
				text-align: center;
				padding: 0 150px;
				margin-bottom: 15px;
			}
			.update-paragraph {
				color: rgba(0, 0, 0, 0.67);
				font-size: 15px;
				font-weight: 600;
				text-align: center;
				padding: 0 150px;
				margin-top: 15px;
				margin-bottom: 15px;
			}
			.container-approvedservicereq__personalinformation {
				text-align: center;
				width: 100%;
			}
			.approvedservicereq--personalinformation__wrapper {
				text-align: left;
				padding: 0 220px;
			}
			.personal-information__container {
				width: 100%;
			}
			.personalinformation-header {
				width: 100%;
			}
			.personaldetails--container__name {
				display: flex;
				justify-content: space-between;
				width: 100%;
			}
			.personaldetails--container__unit {
				display: flex;
				justify-content: space-between;
				width: 100%;
			}
			.personaldetails--container__course {
				display: flex;
				justify-content: space-between;
				width: 100%;
			}
			.personaldetails--container__contact {
				display: flex;
				justify-content: space-between;
				width: 100%;
			}
			.personalinformation-details__name {
				width: 100%;
			}
			.personalinformation-details__clientname {
				width: 100%;
			}
			.personalinformation-details__unit {
				width: 100%;
			}
			.personalinformation-details__clientunit {
				width: 100%;
			}
			.personalinformation-details__contact {
				width: 100%;
			}
			.personalinformation-details__clientcontact {
				width: 100%;
			}
			.personalinformation-details__course {
				width: 100%;
			}
			.personalinformation-details__clientcourse {
				width: 100%;
			}
			.ticket-information__container {
				width: 100%;
				margin-top: 20px;
			}
			.ticketinformation-header {
				width: 100%;
			}
			.ticketdetails--container__ticketid {
				display: flex;
				justify-content: space-between;
				width: 100%;
			}
			.ticketinformation-details__ticketid {
				width: 100%;
			}
			.ticketinformation-details__clientticketid {
				width: 100%;
			}
			.ticketdetails--container__priority {
				display: flex;
				justify-content: space-between;
				width: 100%;
			}
			.ticketinformation-details__priority {
				width: 100%;
			}
			.ticketinformation-details__ticketpriority {
				width: 100%;
			}
			.ticketdetails--container__category {
				display: flex;
				justify-content: space-between;
				width: 100%;
			}
			.ticketinformation-details__category {
				width: 100%;
			}
			.ticketinformation-details__ticketcategory {
				width: 100%;
			}
			.ticketdetails--container__subject {
				display: flex;
				justify-content: space-between;
				width: 100%;
			}
			.ticketinformation-details__subject {
				width: 100%;
			}
			.ticketinformation-details__ticketsubject {
				width: 100%;
			}
			.ticketdetails--container__desc {
				display: flex;
				justify-content: space-between;
				width: 100%;
			}
			.ticketinformation-details__desc {
				width: 100%;
			}
			.ticketinformation-details__ticketdesc {
				width: 100%;
			}
			.clerk-information__container {
				width: 100%;
				margin-top: 20px;
			}
			.clerkdetails--container__email {
				display: flex;
				justify-content: space-between;
				width: 100%;
			}
			.clerkinformation-details__email {
				width: 100%;
			}
			.clerkinformation-details__clerkemailadd {
				width: 100%;
			}
			.clerkdetails--container__contactnum {
				display: flex;
				justify-content: space-between;
				width: 100%;
			}
			.clerkinformation-details__contactnum {
				width: 100%;
			}
			.clerkinformation-details__clerkcontactnum {
				width: 100%;
			}
			.ticket-rejectreason__container {
				width: 100%;
				margin-top: 20px;
			}
			.ticketrejectreason--container__rejectreason {
				display: flex;
				justify-content: space-between;
				width: 100%;
			}
			.ticketrejectreason-details__rejectreason {
				width: 100%;
			}
			.divider {
				background-color: rgba(0, 0, 0, 0.255);
				height: 1px;
				width: 100%;
				border: none;
			}
			.footer {
				color: rgb(0, 0, 0, 0.5);
				font-size: 12px;
				text-align: center;
				width: 100%;
			}
			.footer-text {
				line-height: 0px;
			}
			#span-emp-reason {
				color: rgb(0, 0, 0);
				font-size: 13px;
				font-weight: 700;
			}
			#span-emp {
				color: rgb(0, 0, 0, 0.5);
				font-size: 13px;
				font-weight: 600;
			}
			#span-emp__req {
				color: #000;
				font-size: 13px;
				font-weight: 600;
			}

			@media screen and (min-width: 354px) and (max-width: 768px) {
				#span-emp {
					font-size: 10px;
				}
				#span-emp__req {
					font-size: 10px;
				}
				.greetings {
					padding: 0, 25px 0 25px;
					font-size: 18px;
				}
				.welcome-text {
					font-size: 13px;
					padding: 0 20px 0 20px;
				}
				.update-paragraph {
					font-size: 13px;
					padding: 0;
					margin-top: 20px;
				}
				.container {
					width: 100%;
					margin: 0;
					padding: 0;
				}
				.container-wrapper {
					width: 100%;
					margin: 0;
				}
				.container-wrapper__approvedservicereq {
					width: 100%;
					margin: 0;
					padding: 0;
				}
				.approvedservicereq--personalinformation__wrapper {
					text-align: left;
					padding: 0 50px 0 50px;
				}
				
			}
		</style>
	</head>

	<body
		style="
			font-family: 'Poppins', sans serif;
			margin: 0;
			padding: 0;
			text-decoration: none;
			color: #000;
		"
	>
		<div class="container">
			<div class="container-wrapper">
				<div class="container-wrapper__approvedservicereq">
					<h2 class="greetings">
						Greetings, ${client.firstName} ${client.lastName}!
					</h2>
					<p class="welcome-text">
					Your <span style="color: #000; font-weight: 700">Service Request</span> in Service Helpdesk of the University of Santo
						Tomas - Office of the Registrar has been
						<span style="color: #000; font-weight: 700">REJECTED</span> with the
						following details:
					</p>

					<div class="container-approvedservicereq__personalinformation">
						<div class="approvedservicereq--personalinformation__wrapper">
							<div class="personal-information__container">
								<div class="personalinformation-header">
									<span style="font-weight: 700; font-size: 13px">
										Your personal information:
									</span>
								</div>
								<div class="personaldetails--container__name">
									<div class="personalinformation-details__name">
										<span id="span-emp">Client Name:</span>
									</div>
									<div class="personalinformation-details__clientname">
										<span id="span-emp__req">
											${client.firstName} ${client.lastName}
										</span>
									</div>
								</div>
								<div class="personaldetails--container__unit">
									<div class="personalinformation-details__unit">
										<span id="span-emp">Client Unit:</span>
									</div>
									<div class="personalinformation-details__clientunit">
										<span id="span-emp__req"> ${client.unit} </span>
									</div>
								</div>
								<div class="personaldetails--container__course">
									<div class="personalinformation-details__course">
										<span id="span-emp">Client Course:</span>
									</div>
									<div class="personalinformation-details__clientcourse">
										<span id="span-emp__req"> ${client.course} </span>
									</div>
								</div>

								<div class="personaldetails--container__contact">
									<div class="personalinformation-details__contact">
										<span id="span-emp">Contact Number:</span>
									</div>
									<div class="personalinformation-details__clientcontact">
										<span id="span-emp__req"> ${client.contactNum} </span>
									</div>
								</div>
							</div>

							<div class="ticket-information__container">
								<div class="ticketinformation-header">
									<span style="font-weight: 700; font-size: 13px">
										Your Service Request information:
									</span>
								</div>
								<div class="ticketdetails--container__category">
									<div class="ticketinformation-details__category">
										<span id="span-emp">Reference No:</span>
									</div>
									<div class="ticketinformation-details__ticketcategory">
										<span id="span-emp__req"> ${service.referenceNo} </span>
									</div>
								</div>
								<div class="ticketdetails--container__category">
									<div class="ticketinformation-details__category">
										<span id="span-emp">Category:</span>
									</div>
									<div class="ticketinformation-details__ticketcategory">
										<span id="span-emp__req"> ${service.category} </span>
									</div>
								</div>
								<div class="ticketdetails--container__subject">
									<div class="ticketinformation-details__subject">
										<span id="span-emp">Subject:</span>
									</div>
									<div class="ticketinformation-details__ticketsubject">
										<span id="span-emp__req"> ${service.subject} </span>
									</div>
								</div>
								<div class="ticketdetails--container__desc">
									<div class="ticketinformation-details__desc">
										<span id="span-emp">Description:</span>
									</div>
									<div class="ticketinformation-details__ticketdesc">
										<span id="span-emp__req"> ${service.description} </span>
									</div>
								</div>
							</div>

							<div class="ticket-rejectreason__container">
								<div class="ticketrejectreason--container__rejectreason">
									<div class="ticketrejectreason-details__rejectreason">
										<span id="span-emp-reason">For the reason of:</span>
									</div>
									<div class="ticketrejectreason-details__rejectreason">
										<span id="span-emp-reason">
											${rejectReason} - ${remarks}
										</span>
									</div>
								</div>
							</div>

							<div class="clerk-information__container">
								<div class="clerkinformation-header">
									<span style="font-weight: 700; font-size: 13px">
										Should you have any concern, please contact 
										${assignee.firstName} ${assignee.lastName}.
									</span>
								</div>
								<div class="clerkdetails--container__email">
									<div class="clerkinformation-details__email">
										<span id="span-emp">Email Address.:</span>
									</div>
									<div class="clerkinformation-details__clerkemailadd">
										<span id="span-emp" style="font-weight: 700">
											${assignee.email}
										</span>
									</div>
								</div>
								<div class="clerkdetails--container__contactnum">
									<div class="clerkinformation-details__contactnum">
										<span id="span-emp">Contact Number:</span>
									</div>
									<div class="clerkinformation-details__clerkcontactnum">
										<span id="span-emp__req">
											${assignee.contactNum}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div>
						<p class="update-paragraph">Thank you!</p>
					</div>

					<hr class="divider" />

					<footer class="footer">
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
		</html>
		`;

    await sendEmail(client.email, "Ticket Rejected", mail);
    await Service.deleteOne({ _id: service._id });

    //update the status to rejected
    await res.status(200).send({
      success: true,
      message: "Email sent to the requester. Ticket has been rejected.",
      rejectservicereq,
    });

    //find the ticket that is assigned to user
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	GET the rejected service request by id
//@access:	SUPER ADMIN and ADMIN, HELPDESKSUPPORT
exports.getrejectedservicerequest = async (req, res) => {
  try {
    const rejectedservicerequest = await RejectedService.findById(
      req.params.id
    );
    if (!rejectedservicerequest) {
      return res.status(404).send({
        success: false,
        message: "No rejected service request found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched the rejected service.",
      rejectedservicerequest,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	GET all the tickets.
//@access:	SUPER ADMIN and ADMIN
exports.gettickets = async (req, res) => {
  try {
    const ticket = await Ticket.find();
    const resolvedTickets = await Ticket.find()
      .where("status")
      .equals("Resolved");
    const rejectedTickets = await Ticket.find()
      .where("status")
      .equals("Rejected");
    const voidedTickets = await Ticket.find().where("status").equals("Voided");
    const openTickets = await Ticket.find().where("status").equals("Open");
    const reopenedTickets = await Ticket.find()
      .where("status")
      .equals("Reopened");
    const overdueTickets = await Ticket.find()
      .where("status")
      .equals("Overdue");
    const createdReopenedTicket = await ReopenTicket.find();
    const categoryName = await Category.find();
    ticket.map(async (ticket) => {
      ticketStatus = ticket.status;
      ticketPriority = ticket.priority;

      //@desc:	Check whether the ticket is open.
      if (ticketStatus === "Open") {
        //@desc:	Check whether the priority is High. If it is high
        //			and not solved within 1 day. Change the status to Overdue.
        if (ticketPriority === "High") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 24) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
          //@desc:	Check whether the priority is Mid. If it is mid
          //			and not solved within 3 days. Change the status to Overdue.
        } else if (ticketPriority === "Mid") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 72) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
          //@desc:	Check whether the priority is Mid. If it is low
          //			and not solved within 7 days. Change the status to Overdue.
        } else if (ticketPriority === "Low") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 168) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
        }
      }
    });

    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });

    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    //start of date query

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        $gt: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lt: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gt: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lt: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (ticket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      ticket,
      createdReopenedTicket,
      resolvedTickets,
      rejectedTickets,
      voidedTickets,
      reopenedTickets,
      openTickets,
      overdueTickets,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	GET all the reopened tickets
//@access:	SUPER ADMIN and ADMIN, HELPDESK SUPPORT
exports.getreopenedticketsrequests = async (req, res) => {
  try {
    const reopenedTicketRequests = await ReopenTicket.find();
    const categoryName = await Category.find();
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let ticketCategory = req.query.ticketCategory || "All";

    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    const filteredReopenedTicketRequests = await ReopenTicket.find({
      referenceNo: { $regex: search, $options: "i" },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await ReopenTicket.countDocuments({
      ticketCategory: { $in: [...ticketCategory] },
      referenceNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    if (reopenedTicketRequests.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No reopened ticket requests found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the reopened ticket requests.",
      reopenedTicketRequests,
      page: page + 1,
      limit,
      filteredReopenedTicketRequests,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	GET the reopened ticket request by id
//@access:	SUPER ADMIN and ADMIN, HELPDESK SUPPORT
exports.getreopenedticketrequestbyid = async (req, res) => {
  try {
    const reopenedTicketRequest = await ReopenTicket.findOne({
      _id: req.params.id,
    });
    if (!reopenedTicketRequest) {
      return res.status(404).send({
        success: false,
        message: "No reopened ticket request found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched the reopened ticket request.",
      reopenedTicketRequest,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	ASSIGN a reopenened ticket request.
//@access:	SUPER ADMIN and ADMIN, HELPDESK SUPPORT
exports.assignreopenedticketrequest = async (req, res) => {
  try {
    const { assignTo, priority } = req.body;
    const reopenedTicketRequest = await ReopenTicket.findById(req.params.id);
    const ticket = await Ticket.findById(reopenedTicketRequest.ticketId);
    if (!reopenedTicketRequest) {
      return res.status(404).send({
        success: false,
        message: "Reopened ticket request not found.",
      });
    }

    if (reopenedTicketRequest.status === "Rejected") {
      return res.status(400).send({
        success: false,
        message:
          "This ticket request has been rejected. It cannot be reopened.",
      });
    }

    if (reopenedTicketRequest.status === "Voided") {
      return res.status(400).send({
        success: false,
        message:
          "This ticket request has been resolved. It cannot be reopened.",
      });
    }

    if (
      reopenedTicketRequest.status === "Open" ||
      reopenedTicketRequest.status === "Overdue"
    ) {
      return res.status(400).send({
        success: false,
        message: "This ticket is open. It cannot be reopened.",
      });
    }

    if (!assignTo || !priority) {
      return res.status(400).send({
        success: false,
        message: "Please fill in all the fields.",
      });
    }

    await ReopenTicket.updateOne(
      {
        _id: reopenedTicketRequest._id,
      },
      {
        isAssigned: true,
      }
    );

    await Ticket.updateOne(
      { _id: reopenedTicketRequest.ticketId },
      {
        status: "Reopened",
        assignTo: assignTo,
        priority: priority,
        issue: reopenedTicketRequest.issue,
      }
    );

    res.status(200).send({
      success: true,
      message: "Successfully assigned the reopened ticket request.",
      ticket,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	GET all the tickets created by a client
//@access:	SUPERADMIN and ADMIN ONLY, HELPDESK SUPPORT
exports.getrejectedservices = async (req, res) => {
  try {
    const rejectedServiceRequest = await RejectedService.find();
    const categoryName = await Category.find();
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let serviceCategory = req.query.category || "All";

    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });

    serviceCategory === " " || serviceCategory === "All"
      ? (serviceCategory = categorynameOptions)
      : (serviceCategory = req.query.category.split(","));

    const filteredRejectedServiceRequests = await RejectedService.find({
      referenceNo: { $regex: search, $options: "i" },
      category: { $in: serviceCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await RejectedService.countDocuments({
      category: { $in: [...serviceCategory] },
      referenceNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a service requested in the database.
    if (rejectedServiceRequest.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      rejectedServiceRequest,
      page: page + 1,
      limit,
      filteredRejectedServiceRequests,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GET all the opentickets.
//@access:	SUPER ADMIN and ADMIN
exports.getopentickets = async (req, res) => {
  try {
    const openTickets = await Ticket.find({ status: "Open" });
    const categoryName = await Category.find();
    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      status: "Open",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      status: "Open",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (openTickets.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    openTickets.map(async (ticket) => {
      ticketStatus = ticket.status;
      ticketPriority = ticket.priority;

      //@desc:	Check whetther the ticket is open.
      if (ticketStatus === "Open") {
        //@desc:	Check whether the priority is High. If it is high
        //			and not solved within 1 day. Change the status to Overdue.
        if (ticketPriority === "High") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 24) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
          //@desc:	Check whether the priority is Mid. If it is mid
          //			and not solved within 3 days. Change the status to Overdue.
        } else if (ticketPriority === "Mid") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 72) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
          //@desc:	Check whether the priority is Low. If it is low
          //			and not solved within 7 days. Change the status to Overdue.
        } else if (ticketPriority === "Low") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 168) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
        }
      }
    });

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      openTickets,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GET all the overdue tickets.
//@access:	SUPER ADMIN and ADMIN
exports.getoverduetickets = async (req, res) => {
  try {
    const overdueTickets = await Ticket.find({ status: "Overdue" });
    const categoryName = await Category.find();
    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      status: "Overdue",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      status: "Overdue",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (overdueTickets.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      overdueTickets,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GET all the resolved tickets.
//@access:	SUPER ADMIN and ADMIN
exports.getresolvedticket = async (req, res) => {
  try {
    const resolvedTickets = await Ticket.find({ status: "Resolved" });
    const categoryName = await Category.find();
    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      status: "Resolved",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      status: "Resolved",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (resolvedTickets.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      resolvedTickets,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GET all the voided tickets.
//@access:	SUPER ADMIN and ADMIN
exports.getvoidedtickets = async (req, res) => {
  try {
    const voidedTickets = await Ticket.find({ status: "Voided" });
    const categoryName = await Category.find();
    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      status: "Voided",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      status: "Voided",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (voidedTickets.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      voidedTickets,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GET all the rejected tickets.
//@access:	SUPER ADMIN and ADMIN
exports.getrejectedtickets = async (req, res) => {
  try {
    const rejectedTickets = await Ticket.find({ status: "Rejected" });
    const categoryName = await Category.find();
    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      status: "Rejected",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      status: "Rejected",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (rejectedTickets.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      rejectedTickets,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GET all the reopened tickets.
//@access:	SUPER ADMIN and ADMIN
exports.getreopentickets = async (req, res) => {
  try {
    const reopenedTickets = await Ticket.find({ status: "Reopened" });
    const categoryName = await Category.find();
    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      status: "Reopened",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      status: "Reopened",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (reopenedTickets.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      reopenedTickets,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GET the specific tickets.
exports.getrequestedticket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    // check whether there is a ticket in the database.
    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched the ticket.",
      ticket,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	Reassign the ticket to another clerk.
//@access:	SUPER ADMIN and ADMIN
exports.reassignticket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    //request body for the user.
    const { assignTo } = req.body;
    const assignee = await User.findOne({ email: req.user.email });
    const client = await Client.findOne({ email: ticket.requester });

    const clerkAssigned = await User.findOne({ email: assignTo });

    if (!assignTo) {
      return res.status(400).send({
        success: false,
        message: "Field is required.",
      });
    }

    //check the ticket status
    if (ticket.status == "Rejected") {
      return res.status(400).send({
        success: false,
        message:
          "Invalid! Ticket has been rejected, it should not be reassigned.",
      });
    }

    if (ticket.status === "Voided") {
      return res.status(400).send({
        success: false,
        message:
          "Invalid! This ticket has been voided, it should not be reassigned.",
      });
    }

    if (ticket.status === "Resolved") {
      return res.status(400).send({
        success: false,
        message:
          "Invalid! This ticket has been resolved, it should not be reassigned.",
      });
    }

    if (
      clerkAssigned.role === "USER_SUPERADMIN" ||
      clerkAssigned.role === "USER_ADMIN"
    ) {
      return res.status(400).send({
        success: false,
        message: "Please assign the ticket to a clerk.",
      });
    }

    if (assignee.email === assignTo) {
      return res.status(400).send({
        success: false,
        message: "You cannot assign a ticket to yourself.",
      });
    }

    //if the same clerk is reasssigned to the ticket
    if (ticket.assignTo === assignTo) {
      return res.status(400).send({
        success: false,
        message: "This ticket has already been assigned to this clerk.",
      });
    }

    const mail = `<!DOCTYPE html>
			<html lang="en">
				<head>
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
					<link
						href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
						rel="stylesheet"
					/>
					<meta charset="UTF-8" />
					<meta http-equiv="X-UA-Compatible" content="IE=edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<style>
						.container {
							background-color: #fff;
							padding: 0 100px 0 100px;
							display: flex;
							justify-content: center;
							align-items: center;
						}
						.container-wrapper {
							width: 100%;
							display: flex;
							justify-content: center;
							align-items: center;
							background-color: rgb(254, 192, 15, 0.71);
							border: 1px solid rgba(0, 0, 0, 0.255);
						}
						.container-wrapper__approvedservicereq {
							width: 100%;
						}
						.greetings {
							font-size: 23px;
							font-weight: bold;
							color: #000;
							text-transform: uppercase;
							text-align: center;
							padding-top: 10px;
						}
						.welcome-text {
							color: rgba(0, 0, 0, 0.67);
							font-size: 15px;
							font-weight: 600;
							text-align: center;
							padding: 0 150px;
							margin-bottom: 15px;
						}
						.update-paragraph {
							color: rgba(0, 0, 0, 0.67);
							font-size: 15px;
							font-weight: 600;
							text-align: center;
							padding: 0 150px;
							margin-top: 15px;
							margin-bottom: 15px;
						}
						.container-approvedservicereq__personalinformation {
							text-align: center;
							width: 100%;
						}
						.approvedservicereq--personalinformation__wrapper {
							text-align: left;
							padding: 0 220px;
						}
						.personal-information__container {
							width: 100%;
						}
						.personalinformation-header {
							width: 100%;
						}
						.personaldetails--container__name {
							display: flex;
							justify-content: space-between;
							width: 100%;
						}
						.personaldetails--container__unit {
							display: flex;
							justify-content: space-between;
							width: 100%;
						}
						.personaldetails--container__course {
							display: flex;
							justify-content: space-between;
							width: 100%;
						}
						.personaldetails--container__contact {
							display: flex;
							justify-content: space-between;
							width: 100%;
						}
						.personalinformation-details__name {
							width: 100%;
						}
						.personalinformation-details__clientname {
							width: 100%;
						}
						.personalinformation-details__unit {
							width: 100%;
						}
						.personalinformation-details__clientunit {
							width: 100%;
						}
						.personalinformation-details__contact {
							width: 100%;
						}
						.personalinformation-details__clientcontact {
							width: 100%;
						}
						.personalinformation-details__course {
							width: 100%;
						}
						.personalinformation-details__clientcourse {
							width: 100%;
						}
						.ticket-information__container {
							width: 100%;
							margin-top: 20px;
						}
						.ticketinformation-header {
							width: 100%;
						}
						.ticketdetails--container__ticketid {
							display: flex;
							justify-content: space-between;
							width: 100%;
						}
						.ticketinformation-details__ticketid {
							width: 100%;
						}
						.ticketinformation-details__clientticketid {
							width: 100%;
						}
						.ticketdetails--container__priority {
							display: flex;
							justify-content: space-between;
							width: 100%;
						}
						.ticketinformation-details__priority {
							width: 100%;
						}
						.ticketinformation-details__ticketpriority {
							width: 100%;
						}
						.ticketdetails--container__category {
							display: flex;
							justify-content: space-between;
							width: 100%;
						}
						.ticketinformation-details__category {
							width: 100%;
						}
						.ticketinformation-details__ticketcategory {
							width: 100%;
						}
						.ticketdetails--container__subject {
							display: flex;
							justify-content: space-between;
							width: 100%;
						}
						.ticketinformation-details__subject {
							width: 100%;
						}
						.ticketinformation-details__ticketsubject {
							width: 100%;
						}
						.ticketdetails--container__desc {
							display: flex;
							justify-content: space-between;
							width: 100%;
						}
						.ticketinformation-details__desc {
							width: 100%;
						}
						.ticketinformation-details__ticketdesc {
							width: 100%;
						}
						.clerk-information__container {
							width: 100%;
							margin-top: 20px;
						}
						.clerkdetails--container__email {
							display: flex;
							justify-content: space-between;
							width: 100%;
						}
						.clerkinformation-details__email {
							width: 100%;
						}
						.clerkinformation-details__clerkemailadd {
							width: 100%;
						}
						.clerkdetails--container__contactnum {
							display: flex;
							justify-content: space-between;
							width: 100%;
						}
						.clerkinformation-details__contactnum {
							width: 100%;
						}
						.clerkinformation-details__clerkcontactnum {
							width: 100%;
						}
						.divider {
							background-color: rgba(0, 0, 0, 0.255);
							height: 1px;
							width: 100%;
							border: none;
						}
						.footer {
							color: rgb(0, 0, 0, 0.5);
							font-size: 12px;
							text-align: center;
							width: 100%;
						}
						.footer-text {
							line-height: 0px;
						}
						#span-emp {
							color: rgb(0, 0, 0, 0.5);
							font-size: 13px;
							font-weight: 600;
						}
						#span-emp__req {
							color: #000;
							font-size: 13px;
							font-weight: 600;
						}
			
						@media screen and (min-width: 354px) and (max-width: 768px) {
							#span-emp {
								font-size: 10px;
							}
							#span-emp__req {
								font-size: 10px;
							}
							.greetings {
								padding: 0, 25px 0 25px;
								font-size: 18px;
							}
							.welcome-text {
								font-size: 13px;
							}
							.update-paragraph {
								font-size: 13px;
							}
							.container {
								width: 100%;
								margin: 0;
								padding: 0;
							}
							.container-wrapper {
								width: 100%;
								margin: 0;
							}
							.container-wrapper__approvedservicereq {
								width: 100%;
								margin: 0;
								padding: 0;
							}
							.approvedservicereq--personalinformation__wrapper {
								text-align: left;
								padding: 0 50px 0 50px;
							}
							.welcome-text {
								padding: 0 20px 0 20px;
							}
							.update-paragraph {
								padding: 0 20px 0 20px;
							}
						}
					</style>
				</head>
			
				<body
					style="
						font-family: 'Poppins', sans serif;
						margin: 0;
						padding: 0;
						text-decoration: none;
						color: #000;
					"
				>
					<div class="container">
						<div class="container-wrapper">
							<div class="container-wrapper__approvedservicereq">
								<h2 class="greetings">
									Greetings, ${client.firstName} ${client.lastName}!
								</h2>
								<p class="welcome-text">
									Your <span style="color: #000; font-weight: 700">Ticket No.: ${
                    ticket.ticketNo
                  }</span> in the Service Helpdesk of the University of Santo Tomas - Office of the registrar has been
									<span style="color: #000; font-weight: 700">REASSIGNED</span> with the
									following details:
								</p>
			
								<div class="container-approvedservicereq__personalinformation">
									<div class="approvedservicereq--personalinformation__wrapper">
										<div class="personal-information__container">
											<div class="personalinformation-header">
												<span style="font-weight: 700; font-size: 13px">
													Your personal information:
												</span>
											</div>
											<div class="personaldetails--container__name">
												<div class="personalinformation-details__name">
													<span id="span-emp">Client Name:</span>
												</div>
												<div class="personalinformation-details__clientname">
													<span id="span-emp__req">
														${client.firstName} ${client.lastName}
													</span>
												</div>
											</div>
											<div class="personaldetails--container__unit">
												<div class="personalinformation-details__unit">
													<span id="span-emp">Client Unit:</span>
												</div>
												<div class="personalinformation-details__clientunit">
													<span id="span-emp__req"> ${client.unit} </span>
												</div>
											</div>
											<div class="personaldetails--container__course">
												<div class="personalinformation-details__course">
													<span id="span-emp">Client Course:</span>
												</div>
												<div class="personalinformation-details__clientcourse">
													<span id="span-emp__req"> ${client.course} </span>
												</div>
											</div>
			
											<div class="personaldetails--container__contact">
												<div class="personalinformation-details__contact">
													<span id="span-emp">Contact Number:</span>
												</div>
												<div class="personalinformation-details__clientcontact">
													<span id="span-emp__req"> ${client.contactNum} </span>
												</div>
											</div>
										</div>
			
										<div class="ticket-information__container">
											<div class="ticketinformation-header">
												<span style="font-weight: 700; font-size: 13px">
													Your ticket information:
												</span>
											</div>
											<div class="ticketdetails--container__ticketid">
												<div class="ticketinformation-details__ticketid">
													<span id="span-emp">Ticket No.:</span>
												</div>
												<div class="ticketinformation-details__clientticketid">
													<span id="span-emp__req"> ${ticket.ticketNo} </span>
												</div>
											</div>
											<div class="ticketdetails--container__priority">
												<div class="ticketinformation-details__priority">
													<span id="span-emp">Priority:</span>
												</div>
												<div class="ticketinformation-details__ticketpriority">
													<span id="span-emp__req"> ${ticket.priorityStatus()} </span>
												</div>
											</div>
											<div class="ticketdetails--container__category">
												<div class="ticketinformation-details__category">
													<span id="span-emp">Category:</span>
												</div>
												<div class="ticketinformation-details__ticketcategory">
													<span id="span-emp__req"> ${ticket.ticketCategory} </span>
												</div>
											</div>
											<div class="ticketdetails--container__subject">
												<div class="ticketinformation-details__subject">
													<span id="span-emp">Subject:</span>
												</div>
												<div class="ticketinformation-details__ticketsubject">
													<span id="span-emp__req"> ${ticket.ticketSubject} </span>
												</div>
											</div>
											<div class="ticketdetails--container__desc">
												<div class="ticketinformation-details__desc">
													<span id="span-emp">Description:</span>
												</div>
												<div class="ticketinformation-details__ticketdesc">
													<span id="span-emp__req"> ${ticket.ticketDescription} </span>
												</div>
											</div>
										</div>
			
										<div class="clerk-information__container">
											<div class="clerkinformation-header">
												<span style="font-weight: 700; font-size: 13px">
													You may contact ${clerkAssigned.firstName}
													${clerkAssigned.lastName} who is assigned to your ticket,
													through the following:
												</span>
											</div>
											<div class="clerkdetails--container__email">
												<div class="clerkinformation-details__email">
													<span id="span-emp">Email Address.:</span>
												</div>
												<div class="clerkinformation-details__clerkemailadd">
													<span id="span-emp" style="font-weight: 700">
														${assignTo}
													</span>
												</div>
											</div>
											<div class="clerkdetails--container__contactnum">
												<div class="clerkinformation-details__contactnum">
													<span id="span-emp">Contact Number:</span>
												</div>
												<div class="clerkinformation-details__clerkcontactnum">
													<span id="span-emp__req">
														${clerkAssigned.contactNum}
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
			
								<div>
									<p class="update-paragraph">
										Whenever there is an update regarding your ticket, you will be
										notified through your email address. <br />Thank you!
									</p>
								</div>
			
								<hr class="divider" />
			
								<footer class="footer">
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
			</html>
			`;

    await sendEmail(client.email, "Ticket Reassigned", mail);

    res.status(200).send({
      success: true,
      message: "Successfully reassigned the ticket to a CLERK.",
      ticket,
    });

    await Ticket.updateOne(
      { _id: ticket._id },
      { assignBy: req.user.email, assignTo: assignTo }
    );
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Get all the assigned tickets.
//@access:	Private (HELPDESKSUPPORT ONLY)
exports.hdsAssignedTicket = async (req, res) => {
  try {
    const assignedTicket = await Ticket.find({ assignTo: req.user.email });
    const assignedOpenTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Open",
    });
    const assignedOverdueTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Overdue",
    });
    const assignedResolvedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Resolved",
    });
    const assignedReopenedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Reopened",
    });
    const assignedRejectedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Rejected",
    });
    const categoryName = await Category.find();

    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    //start of date query

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      assignTo: req.user.email,
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      assignTo: req.user.email,
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    assignedTicket.map(async (ticket) => {
      ticketStatus = ticket.status;
      ticketPriority = ticket.priority;

      //@desc:	Check whether the ticket is open.
      if (ticketStatus === "Open") {
        //@desc:	Check whether the priority is High. If it is high
        //			and not solved within 1 day. Change the status to Overdue.
        if (ticketPriority === "High") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 24) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
          //@desc:	Check whether the priority is Mid. If it is mid
          //			and not solved within 3 days. Change the status to Overdue.
        } else if (ticketPriority === "Mid") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 72) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
          //@desc:	Check whether the priority is Mid. If it is low
          //			and not solved within 7 days. Change the status to Overdue.
        } else if (ticketPriority === "Low") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 168) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
        }
      }
    });

    //check whether the clerk has assigned ticket.
    if (assignedTicket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets assigned to you.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched the tickets assigned to you.",
      assignedTicket,
      assignedOpenTicket,
      assignedOverdueTicket,
      assignedRejectedTicket,
      assignedResolvedTicket,
      assignedReopenedTicket,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Get all assigned opened tickets.
//@access:	Private(HELPDESK SUPPORT ONLY)
exports.hdsAssignedOpenTicket = async (req, res) => {
  try {
    const assignedOpenTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Open",
    });
    const categoryName = await Category.find();
    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Open",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      assignTo: req.user.email,
      status: "Open",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (assignedOpenTicket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    assignedOpenTicket.map(async (ticket) => {
      ticketStatus = ticket.status;
      ticketPriority = ticket.priority;

      //@desc:	Check whetther the ticket is open.
      if (ticketStatus === "Open") {
        //@desc:	Check whether the priority is High. If it is high
        //			and not solved within 1 day. Change the status to Overdue.
        if (ticketPriority === "High") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 24) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
          //@desc:	Check whether the priority is Mid. If it is mid
          //			and not solved within 3 days. Change the status to Overdue.
        } else if (ticketPriority === "Mid") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 72) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
          //@desc:	Check whether the priority is Mid. If it is low
          //			and not solved within 7 days. Change the status to Overdue.
        } else if (ticketPriority === "Low") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 168) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
        }
      }
    });

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      assignedOpenTicket,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	Get all assigned overdue tickets.
//@access:	Private(HELPDESK SUPPORT ONLY)
exports.hdsAssignedOverdueTicket = async (req, res) => {
  try {
    const assignedOverdueTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Overdue",
    });
    const categoryName = await Category.find();
    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Overdue",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      assignTo: req.user.email,
      status: "Overdue",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (assignedOverdueTicket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      assignedOverdueTicket,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	Get all assigned resolved tickets.
//@access:	Private(HELPDESK SUPPORT ONLY)
exports.hdsAssignedResolvedTicket = async (req, res) => {
  try {
    const assignedResolvedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Resolved",
    });
    const categoryName = await Category.find();
    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Resolved",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      assignTo: req.user.email,
      status: "Resolved",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (assignedResolvedTicket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      assignedResolvedTicket,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Get all assigned rejected tickets.
//@access:	Private(HELPDESK SUPPORT ONLY)
exports.hdsAssignedRejectedTicket = async (req, res) => {
  try {
    const assignedRejectedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Rejected",
    });
    const categoryName = await Category.find();
    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Rejected",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      assignTo: req.user.email,
      status: "Rejected",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (assignedRejectedTicket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      assignedRejectedTicket,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Get all assigned reopened tickets.
//@access:	Private(HELPDESK SUPPORT ONLY)
exports.hdsAssignedReopenedTicket = async (req, res) => {
  try {
    const assignedReopenedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Reopened",
    });
    const categoryName = await Category.find();
    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Reopened",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      assignTo: req.user.email,
      status: "Reopened",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (assignedReopenedTicket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      assignedReopenedTicket,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Reject the assigned ticket.
//@access:	HELPDESKSUPPORT ONLY
exports.hdsrejectticket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    const clerkAssigned = await User.findOne({ email: ticket.assignTo });
    const assignee = await User.findOne({ email: req.user.email });
    const { remarks, rejectReason } = req.body;
    if (ticket.assignTo != assignee.email) {
      return res.status(400).send({
        success: false,
        message: "You are not authorized to view this ticket.",
      });
    }

    //check the ticket status
    if (ticket.status === "Rejected") {
      return res.status(400).send({
        success: false,
        message: "Invalid! This ticket is already been rejected.",
      });
    }

    if (ticket.status === "Voided") {
      return res.status(400).send({
        success: false,
        message: "Invalid! This ticket has been voided.",
      });
    }

    if (ticket.status === "Resolved") {
      return res.status(400).send({
        success: false,
        message: "Invalid! This ticket has been resolved.",
      });
    }

    if (!remarks || !rejectReason) {
      return res.status(400).send({
        success: false,
        message: "Please fill up all the fields.",
      });
    }

    const client = await Client.findOne({
      email: ticket.requester,
    });

    const mail = `<!DOCTYPE html>
			<html lang="en">
			<head>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
			<link
				href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
				rel="stylesheet"
			/>
			<meta charset="UTF-8" />
			<meta http-equiv="X-UA-Compatible" content="IE=edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<style>
				.container {
					background-color: #fff;
					padding: 0 100px 0 100px;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				.container-wrapper {
					width: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					background-color: rgb(254, 192, 15, 0.71);
					border: 1px solid rgba(0, 0, 0, 0.255);
				}
				.container-wrapper__approvedservicereq {
					width: 100%;
				}
				.greetings {
					font-size: 23px;
					font-weight: bold;
					color: #000;
					text-transform: uppercase;
					text-align: center;
					padding-top: 10px;
				}
				.welcome-text {
					color: rgba(0, 0, 0, 0.67);
					font-size: 15px;
					font-weight: 600;
					text-align: center;
					padding: 0 150px;
					margin-bottom: 15px;
				}
				.update-paragraph {
					color: rgba(0, 0, 0, 0.67);
					font-size: 15px;
					font-weight: 600;
					text-align: center;
					padding: 0 150px;
					margin-top: 15px;
					margin-bottom: 15px;
				}
				.container-approvedservicereq__personalinformation {
					text-align: center;
					width: 100%;
				}
				.approvedservicereq--personalinformation__wrapper {
					text-align: left;
					padding: 0 220px;
				}
				.personal-information__container {
					width: 100%;
				}
				.personalinformation-header {
					width: 100%;
				}
				.personaldetails--container__name {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personaldetails--container__unit {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personaldetails--container__course {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personaldetails--container__contact {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personalinformation-details__name {
					width: 100%;
				}
				.personalinformation-details__clientname {
					width: 100%;
				}
				.personalinformation-details__unit {
					width: 100%;
				}
				.personalinformation-details__clientunit {
					width: 100%;
				}
				.personalinformation-details__contact {
					width: 100%;
				}
				.personalinformation-details__clientcontact {
					width: 100%;
				}
				.personalinformation-details__course {
					width: 100%;
				}
				.personalinformation-details__clientcourse {
					width: 100%;
				}
				.ticket-information__container {
					width: 100%;
					margin-top: 20px;
				}
				.ticketinformation-header {
					width: 100%;
				}
				.ticketdetails--container__ticketid {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__ticketid {
					width: 100%;
				}
				.ticketinformation-details__clientticketid {
					width: 100%;
				}
				.ticketdetails--container__priority {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__priority {
					width: 100%;
				}
				.ticketinformation-details__ticketpriority {
					width: 100%;
				}
				.ticketdetails--container__category {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__category {
					width: 100%;
				}
				.ticketinformation-details__ticketcategory {
					width: 100%;
				}
				.ticketdetails--container__subject {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__subject {
					width: 100%;
				}
				.ticketinformation-details__ticketsubject {
					width: 100%;
				}
				.ticketdetails--container__desc {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__desc {
					width: 100%;
				}
				.ticketinformation-details__ticketdesc {
					width: 100%;
				}
				.clerk-information__container {
					width: 100%;
					margin-top: 20px;
				}
				.clerkdetails--container__email {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.clerkinformation-details__email {
					width: 100%;
				}
				.clerkinformation-details__clerkemailadd {
					width: 100%;
				}
				.clerkdetails--container__contactnum {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.clerkinformation-details__contactnum {
					width: 100%;
				}
				.clerkinformation-details__clerkcontactnum {
					width: 100%;
				}
				.ticket-rejectreason__container {
					width: 100%;
					margin-top: 20px;
				}
				.ticketrejectreason--container__rejectreason {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketrejectreason-details__rejectreason {
					width: 100%;
				}
				.divider {
					background-color: rgba(0, 0, 0, 0.255);
					height: 1px;
					width: 100%;
					border: none;
				}
				.footer {
					color: rgb(0, 0, 0, 0.5);
					font-size: 12px;
					text-align: center;
					width: 100%;
				}
				.footer-text {
					line-height: 0px;
				}
				#span-emp-reason {
					color: rgb(0, 0, 0);
					font-size: 13px;
					font-weight: 700;
				}
				#span-emp {
					color: rgb(0, 0, 0, 0.5);
					font-size: 13px;
					font-weight: 600;
				}
				#span-emp__req {
					color: #000;
					font-size: 13px;
					font-weight: 600;
				}

				@media screen and (min-width: 354px) and (max-width: 768px) {
					#span-emp {
						font-size: 10px;
					}
					#span-emp__req {
						font-size: 10px;
					}
					.greetings {
						padding: 0, 25px 0 25px;
						font-size: 18px;
					}
					.welcome-text {
						font-size: 13px;
						padding: 0 20px 0 20px;
					}
					.update-paragraph {
						font-size: 13px;
						padding: 0;
						margin-top: 20px;
					}
					.container {
						width: 100%;
						margin: 0;
						padding: 0;
					}
					.container-wrapper {
						width: 100%;
						margin: 0;
					}
					.container-wrapper__approvedservicereq {
						width: 100%;
						margin: 0;
						padding: 0;
					}
					.approvedservicereq--personalinformation__wrapper {
						text-align: left;
						padding: 0 50px 0 50px;
					}

				}
			</style>
		</head>

		<body
			style="
				font-family: 'Poppins', sans serif;
				margin: 0;
				padding: 0;
				text-decoration: none;
				color: #000;
			"
		>
			<div class="container">
				<div class="container-wrapper">
					<div class="container-wrapper__approvedservicereq">
						<h2 class="greetings">
							Greetings, ${client.firstName} ${client.lastName}!
						</h2>
						<p class="welcome-text">
						Your <span style="color: #000; font-weight: 700">Ticket No.: ${ticket.ticketNo}</span> in Service Helpdesk of the University of Santo
							Tomas - Office of the Registrar has been
							<span style="color: #000; font-weight: 700">REJECTED</span> with the
							following details:
						</p>

						<div class="container-approvedservicereq__personalinformation">
							<div class="approvedservicereq--personalinformation__wrapper">
								<div class="personal-information__container">
									<div class="personalinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Your personal information:
										</span>
									</div>
									<div class="personaldetails--container__name">
										<div class="personalinformation-details__name">
											<span id="span-emp">Client Name:</span>
										</div>
										<div class="personalinformation-details__clientname">
											<span id="span-emp__req">
												${client.firstName} ${client.lastName}
											</span>
										</div>
									</div>
									<div class="personaldetails--container__unit">
										<div class="personalinformation-details__unit">
											<span id="span-emp">Client Unit:</span>
										</div>
										<div class="personalinformation-details__clientunit">
											<span id="span-emp__req"> ${client.unit} </span>
										</div>
									</div>
									<div class="personaldetails--container__course">
										<div class="personalinformation-details__course">
											<span id="span-emp">Client Course:</span>
										</div>
										<div class="personalinformation-details__clientcourse">
											<span id="span-emp__req"> ${client.course} </span>
										</div>
									</div>

									<div class="personaldetails--container__contact">
										<div class="personalinformation-details__contact">
											<span id="span-emp">Contact Number:</span>
										</div>
										<div class="personalinformation-details__clientcontact">
											<span id="span-emp__req"> ${client.contactNum} </span>
										</div>
									</div>
								</div>

								<div class="ticket-information__container">
									<div class="ticketinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Your ticket information:
										</span>
									</div>
									<div class="ticketdetails--container__ticketid">
										<div class="ticketinformation-details__ticketid">
											<span id="span-emp">Ticket No.:</span>
										</div>
										<div class="ticketinformation-details__clientticketid">
											<span id="span-emp__req"> ${ticket.ticketNo} </span>
										</div>
									</div>
									<div class="ticketdetails--container__category">
										<div class="ticketinformation-details__category">
											<span id="span-emp">Category:</span>
										</div>
										<div class="ticketinformation-details__ticketcategory">
											<span id="span-emp__req"> ${ticket.ticketCategory} </span>
										</div>
									</div>
									<div class="ticketdetails--container__subject">
										<div class="ticketinformation-details__subject">
											<span id="span-emp">Subject:</span>
										</div>
										<div class="ticketinformation-details__ticketsubject">
											<span id="span-emp__req"> ${ticket.ticketSubject} </span>
										</div>
									</div>
									<div class="ticketdetails--container__desc">
										<div class="ticketinformation-details__desc">
											<span id="span-emp">Description:</span>
										</div>
										<div class="ticketinformation-details__ticketdesc">
											<span id="span-emp__req"> ${ticket.ticketDescription} </span>
										</div>
									</div>
								</div>

								<div class="ticket-rejectreason__container">
									<div class="ticketrejectreason--container__rejectreason">
										<div class="ticketrejectreason-details__rejectreason">
											<span id="span-emp-reason">For the reason of:</span>
										</div>
										<div class="ticketrejectreason-details__rejectreason">
											<span id="span-emp-reason">
												${rejectReason} - ${remarks}
											</span>
										</div>
									</div>
								</div>

								<div class="clerk-information__container">
									<div class="clerkinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Should you have any concern, please contact
											${clerkAssigned.firstName} ${clerkAssigned.lastName}.
										</span>
									</div>
									<div class="clerkdetails--container__email">
										<div class="clerkinformation-details__email">
											<span id="span-emp">Email Address.:</span>
										</div>
										<div class="clerkinformation-details__clerkemailadd">
											<span id="span-emp" style="font-weight: 700">
												${clerkAssigned.email}
											</span>
										</div>
									</div>
									<div class="clerkdetails--container__contactnum">
										<div class="clerkinformation-details__contactnum">
											<span id="span-emp">Contact Number:</span>
										</div>
										<div class="clerkinformation-details__clerkcontactnum">
											<span id="span-emp__req">
												${clerkAssigned.contactNum}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div>
							<p class="update-paragraph">Thank you!</p>
						</div>

						<hr class="divider" />

						<footer class="footer">
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

    await sendEmail(client.email, "Ticket Rejected", mail);

    res.status(200).send({
      success: true,
      message: "Ticket has been rejected.",
      ticket,
    });

    await Ticket.updateOne(
      { _id: ticket._id },
      {
        remarks,
        rejectReason,
        status: (ticket.status = "Rejected"),
        rejectedAt: new Date(Date.now()),
      }
    );
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Resolve the assigned ticket.
//@access:	Private (HELPDESKSUPPORT ONLY)
exports.hdsResolveTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    const clerkAssigned = await User.findOne({ email: ticket.assignTo });
    const assignee = await User.findOne({ email: req.user.email });
    const client = await Client.findOne({ email: ticket.requester });
    const { remarks, solution } = req.body;

    if (ticket.assignTo != assignee.email) {
      return res.status(400).send({
        success: false,
        message: "You are not authorized to resolve this ticket.",
      });
    }

    //check the ticket status
    if (ticket.status === "Rejected") {
      return res.status(400).send({
        success: false,
        message: "Invalid! This ticket is already been rejected.",
      });
    }

    if (ticket.status === "Voided") {
      return res.status(400).send({
        success: false,
        message: "Invalid! This ticket has been voided.",
      });
    }

    if (ticket.status === "Resolved") {
      return res.status(400).send({
        success: false,
        message: "Invalid! This ticket has been resolved.",
      });
    }

    if (!remarks || !solution) {
      return res.status(400).send({
        success: false,
        message: "Please fill all fields.",
      });
    }

    const mail = `<!DOCTYPE html>
			<html lang="en">
			<head>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
			<link
				href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
				rel="stylesheet"
			/>
			<meta charset="UTF-8" />
			<meta http-equiv="X-UA-Compatible" content="IE=edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<style>
				.container {
					background-color: #fff;
					padding: 0 100px 0 100px;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				.container-wrapper {
					width: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					background-color: rgb(254, 192, 15, 0.71);
					border: 1px solid rgba(0, 0, 0, 0.255);
				}
				.container-wrapper__approvedservicereq {
					width: 100%;
				}
				.greetings {
					font-size: 23px;
					font-weight: bold;
					color: #000;
					text-transform: uppercase;
					text-align: center;
					padding-top: 10px;
				}
				.welcome-text {
					color: rgba(0, 0, 0, 0.67);
					font-size: 15px;
					font-weight: 600;
					text-align: center;
					padding: 0 150px;
					margin-bottom: 15px;
				}
				.update-paragraph {
					color: rgba(0, 0, 0, 0.67);
					font-size: 15px;
					font-weight: 600;
					text-align: center;
					padding: 0 150px;
					margin-top: 15px;
					margin-bottom: 15px;
				}
				.container-approvedservicereq__personalinformation {
					text-align: center;
					width: 100%;
				}
				.approvedservicereq--personalinformation__wrapper {
					text-align: left;
					padding: 0 220px;
				}
				.personal-information__container {
					width: 100%;
				}
				.personalinformation-header {
					width: 100%;
				}
				.personaldetails--container__name {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personaldetails--container__unit {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personaldetails--container__course {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personaldetails--container__contact {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personalinformation-details__name {
					width: 100%;
				}
				.personalinformation-details__clientname {
					width: 100%;
				}
				.personalinformation-details__unit {
					width: 100%;
				}
				.personalinformation-details__clientunit {
					width: 100%;
				}
				.personalinformation-details__contact {
					width: 100%;
				}
				.personalinformation-details__clientcontact {
					width: 100%;
				}
				.personalinformation-details__course {
					width: 100%;
				}
				.personalinformation-details__clientcourse {
					width: 100%;
				}
				.ticket-information__container {
					width: 100%;
					margin-top: 20px;
				}
				.ticketinformation-header {
					width: 100%;
				}
				.ticketdetails--container__ticketid {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__ticketid {
					width: 100%;
				}
				.ticketinformation-details__clientticketid {
					width: 100%;
				}
				.ticketdetails--container__priority {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__priority {
					width: 100%;
				}
				.ticketinformation-details__ticketpriority {
					width: 100%;
				}
				.ticketdetails--container__category {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__category {
					width: 100%;
				}
				.ticketinformation-details__ticketcategory {
					width: 100%;
				}
				.ticketdetails--container__subject {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__subject {
					width: 100%;
				}
				.ticketinformation-details__ticketsubject {
					width: 100%;
				}
				.ticketdetails--container__desc {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__desc {
					width: 100%;
				}
				.ticketinformation-details__ticketdesc {
					width: 100%;
				}
				.clerk-information__container {
					width: 100%;
					margin-top: 20px;
				}
				.clerkdetails--container__email {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.clerkinformation-details__email {
					width: 100%;
				}
				.clerkinformation-details__clerkemailadd {
					width: 100%;
				}
				.clerkdetails--container__contactnum {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.clerkinformation-details__contactnum {
					width: 100%;
				}
				.clerkinformation-details__clerkcontactnum {
					width: 100%;
				}
				.ticket-rejectreason__container {
					width: 100%;
					margin-top: 20px;
				}
				.ticketrejectreason--container__rejectreason {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketrejectreason-details__rejectreason {
					width: 100%;
				}
				.divider {
					background-color: rgba(0, 0, 0, 0.255);
					height: 1px;
					width: 100%;
					border: none;
				}
				.footer {
					color: rgb(0, 0, 0, 0.5);
					font-size: 12px;
					text-align: center;
					width: 100%;
				}
				.footer-text {
					line-height: 0px;
				}
				#span-emp-reason {
					color: rgb(0, 0, 0);
					font-size: 13px;
					font-weight: 700;
				}
				#span-emp {
					color: rgb(0, 0, 0, 0.5);
					font-size: 13px;
					font-weight: 600;
				}
				#span-emp__req {
					color: #000;
					font-size: 13px;
					font-weight: 600;
				}

				@media screen and (min-width: 354px) and (max-width: 768px) {
					#span-emp {
						font-size: 10px;
					}
					#span-emp__req {
						font-size: 10px;
					}
					.greetings {
						padding: 0, 25px 0 25px;
						font-size: 18px;
					}
					.welcome-text {
						font-size: 13px;
						padding: 0 20px 0 20px;
					}
					.update-paragraph {
						font-size: 13px;
						padding: 0;
						margin-top: 20px;
					}
					.container {
						width: 100%;
						margin: 0;
						padding: 0;
					}
					.container-wrapper {
						width: 100%;
						margin: 0;
					}
					.container-wrapper__approvedservicereq {
						width: 100%;
						margin: 0;
						padding: 0;
					}
					.approvedservicereq--personalinformation__wrapper {
						text-align: left;
						padding: 0 50px 0 50px;
					}

				}
			</style>
		</head>

		<body
			style="
				font-family: 'Poppins', sans serif;
				margin: 0;
				padding: 0;
				text-decoration: none;
				color: #000;
			"
		>
			<div class="container">
				<div class="container-wrapper">
					<div class="container-wrapper__approvedservicereq">
						<h2 class="greetings">
							Greetings, ${client.firstName} ${client.lastName}!
						</h2>
						<p class="welcome-text">
						Your <span style="color: #000; font-weight: 700">Ticket No.: ${ticket.ticketNo}</span> in Service Helpdesk of the University of Santo
							Tomas - Office of the Registrar has been
							<span style="color: #000; font-weight: 700">RESOLVED</span> with the
							following details:
						</p>

						<div class="container-approvedservicereq__personalinformation">
							<div class="approvedservicereq--personalinformation__wrapper">
								<div class="personal-information__container">
									<div class="personalinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Your personal information:
										</span>
									</div>
									<div class="personaldetails--container__name">
										<div class="personalinformation-details__name">
											<span id="span-emp">Client Name:</span>
										</div>
										<div class="personalinformation-details__clientname">
											<span id="span-emp__req">
												${client.firstName} ${client.lastName}
											</span>
										</div>
									</div>
									<div class="personaldetails--container__unit">
										<div class="personalinformation-details__unit">
											<span id="span-emp">Client Unit:</span>
										</div>
										<div class="personalinformation-details__clientunit">
											<span id="span-emp__req"> ${client.unit} </span>
										</div>
									</div>
									<div class="personaldetails--container__course">
										<div class="personalinformation-details__course">
											<span id="span-emp">Client Course:</span>
										</div>
										<div class="personalinformation-details__clientcourse">
											<span id="span-emp__req"> ${client.course} </span>
										</div>
									</div>

									<div class="personaldetails--container__contact">
										<div class="personalinformation-details__contact">
											<span id="span-emp">Contact Number:</span>
										</div>
										<div class="personalinformation-details__clientcontact">
											<span id="span-emp__req"> ${client.contactNum} </span>
										</div>
									</div>
								</div>

								<div class="ticket-information__container">
									<div class="ticketinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Your ticket information:
										</span>
									</div>
									<div class="ticketdetails--container__ticketid">
										<div class="ticketinformation-details__ticketid">
											<span id="span-emp">Ticket No.:</span>
										</div>
										<div class="ticketinformation-details__clientticketid">
											<span id="span-emp__req"> ${ticket.ticketNo} </span>
										</div>
									</div>
									<div class="ticketdetails--container__category">
										<div class="ticketinformation-details__category">
											<span id="span-emp">Category:</span>
										</div>
										<div class="ticketinformation-details__ticketcategory">
											<span id="span-emp__req"> ${ticket.ticketCategory} </span>
										</div>
									</div>
									<div class="ticketdetails--container__subject">
										<div class="ticketinformation-details__subject">
											<span id="span-emp">Subject:</span>
										</div>
										<div class="ticketinformation-details__ticketsubject">
											<span id="span-emp__req"> ${ticket.ticketSubject} </span>
										</div>
									</div>
									<div class="ticketdetails--container__desc">
										<div class="ticketinformation-details__desc">
											<span id="span-emp">Description:</span>
										</div>
										<div class="ticketinformation-details__ticketdesc">
											<span id="span-emp__req"> ${ticket.ticketDescription} </span>
										</div>
									</div>
								</div>

								<div class="ticket-rejectreason__container">
									<div class="ticketrejectreason--container__rejectreason">
										<div class="ticketrejectreason-details__rejectreason">
											<span id="span-emp-reason">For the reason of:</span>
										</div>
										<div class="ticketrejectreason-details__rejectreason">
											<span id="span-emp-reason">
												${solution} - ${remarks}
											</span>
										</div>
									</div>
								</div>

								<div class="clerk-information__container">
									<div class="clerkinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Should you have any concern, please contact
											${clerkAssigned.firstName} ${clerkAssigned.lastName}.
										</span>
									</div>
									<div class="clerkdetails--container__email">
										<div class="clerkinformation-details__email">
											<span id="span-emp">Email Address.:</span>
										</div>
										<div class="clerkinformation-details__clerkemailadd">
											<span id="span-emp" style="font-weight: 700">
												${clerkAssigned.email}
											</span>
										</div>
									</div>
									<div class="clerkdetails--container__contactnum">
										<div class="clerkinformation-details__contactnum">
											<span id="span-emp">Contact Number:</span>
										</div>
										<div class="clerkinformation-details__clerkcontactnum">
											<span id="span-emp__req">
												${clerkAssigned.contactNum}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div>
							<p class="update-paragraph">Thank you!</p>
						</div>

						<hr class="divider" />

						<footer class="footer">
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

    const respondToken = await new RespondToken({
      clientId: client._id,
      token: crypto.randomBytes(16).toString("hex"),
    }).save();

    const likertMail = `<!DOCTYPE html>
			<html lang="en">
			
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com">
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
					rel="stylesheet">
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
				<div style="
									width: 100%;
									height: 100%;
									background-color: rgb(254, 192, 15, 0.71);
									display: flex;
									justify-content: center;
									align-items: center;
								" class="container">
					<div style="
										display: flex;
										justify-content: center;
										align-items: center;
										width: 100%;
										height: 100%;
									" class="container-wrapper">
						<div style="
											width: 100%;
											height: 100%;
											border: 1px solid rgba(0, 0, 0, 0.255);
										" class="container-wrapper__createservicereq">
							<h1 style="
												font-size: 25px;
												font-weight: bold;
												color: #000;
												text-align: center;
												text-transform: uppercase;
												padding-top: 55px;
											" class="greetings">
											Greetings, ${client.firstName} ${client.lastName}!
							</h1>
							<p style="
												color: rgb(0, 0, 0, 0.5);
												font-size: 18px;
												font-weight: 700;
												text-align: center;
												padding: 0 55px 0 55px;
												padding-top: 25px;
												margin-bottom: 40px;
											" class="welcome-text">
											Your feedback is important to us.
			
							</p>
			
							<div style="text-align: center; " class="create-new-service">
								<a class="create-new-service__button"
									href=${process.env.SERVICEREQUEST_LINK}/likertscale/${client._id}/${respondToken.token}>
									Answer Survey
								</a>
							</div>
			
							<div style="
												color: rgb(0, 0, 0, 0.5);
												font-size: 18px;
												font-weight: 700;
												margin-top: 45px;
												text-align: center;
											" class="thankyou-text">
								<p>Thank you for your interest in our services.</p>
							</div>
			
							<hr style="
												background-color: rgba(0, 0, 0, 0.255);
												height: 1px;
												border: none;
											" class="divider" />
			
							<footer style="
												color: rgb(0, 0, 0, 0.5);
												font-size: 12px;
												text-align: center;
												padding: 2px;
											" class="footer">
								<h6 class="footer-text">
									Please answer the survey to help us improve our services.
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

    await Ticket.updateOne(
      { _id: ticket._id },
      {
        remarks,
        solution,
        resolvedAt: new Date(Date.now()),
      }
    );

    ticket.status = "Resolved";
    await ticket.save();

    const clerkresolvedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Resolved",
    });

    const resolvedTicketLengthPerClerk = clerkresolvedTicket.length;

    await User.updateOne(
      { _id: clerkAssigned._id },
      { $inc: { resolvedTickets: 1 } }
    );

    const getTheTotalCreatedAt = clerkresolvedTicket.reduce((total, ticket) => {
      return total + ticket.createdAt.getTime();
    }, 0);
    const getTheTotalResolvedAt = clerkresolvedTicket.reduce(
      (total, ticket) => {
        return total + ticket.resolvedAt.getTime();
      },
      0
    );

    const totalResolutionTime = Math.floor(
      getTheTotalResolvedAt - getTheTotalCreatedAt
    );
    //calculate the average resolution time.
    const runningResolutionTime = Math.floor(
      totalResolutionTime / resolvedTicketLengthPerClerk / 1000
    );

    //convert running resolution time into days, hours, minutes, seconds.
    //running resolutiom time converted in days
    const runningResolutionTimeDays = Math.floor(runningResolutionTime / 86400);

    //convert running resolution time in hours
    const runningResolutionTimeHours =
      Math.floor(runningResolutionTime / 3600) % 24;

    //convert running resolution time in minutes
    const runningResolutionTimeMinutes =
      Math.floor(runningResolutionTime / 60) % 60;

    //convert running resolution time in seconds
    const runningResolutionTimeSeconds = Math.floor(runningResolutionTime % 60);

    const runningAverageResolutionTime =
      runningResolutionTimeDays +
      "d " +
      runningResolutionTimeHours +
      "h " +
      runningResolutionTimeMinutes +
      "m " +
      runningResolutionTimeSeconds +
      "s";

    clerkAssigned.averageResolutionTime = runningAverageResolutionTime;
    await clerkAssigned.save();

    const resolvedTicketWithinTimeFrame = await Ticket.find({
      $and: [
        { isOverdue: false },
        { status: "Resolved" },
        { assignTo: ticket.assignTo },
      ],
    });

    const computeSLA =
      (resolvedTicketWithinTimeFrame.length / clerkresolvedTicket.length) * 100;

    //round off to 2 decimal places
    const slaComplianceRate = computeSLA.toFixed(2);

    clerkAssigned.rateSLA = slaComplianceRate;
    await clerkAssigned.save();

    res.status(200).send({
      success: true,
      message: "Ticket has been resolve.",
      ticket,
    });

    await sendEmail(client.email, "Ticket Resolved", mail);
    await sendEmail(client.email, "How'd it go?", likertMail);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	get the specific ticket.
//@access:	Private (HELPDESKSUPPORT ONLY)
exports.hdsgetDelegateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    const assignee = await User.findOne({ email: req.user.email });
    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found.",
      });
    }

    if (ticket.assignTo != assignee.email) {
      return res.status(400).send({
        success: false,
        message: "You are not authorized to view this ticket.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched the ticket.",
      ticket,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	HELPDESK SUPPORT delegate the ticket to IT SUPPORT
//@access:	Private (HELPDESK ONLY)
exports.hdsAssigntoITsupport = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    //request body for the user.
    const { assignTo } = req.body;
    const assignee = await User.findOne({ email: req.user.email });
    const client = await Client.findOne({ email: ticket.requester });

    const clerkAssigned = await User.findOne({ email: assignTo });

    if (!assignTo) {
      return res.status(400).send({
        success: false,
        message: "Field is required.",
      });
    }

    if (ticket.assignTo != assignee.email) {
      return res.status(400).send({
        success: false,
        message: "You are not authorized to assign this ticket.",
      });
    }

    //check the ticket status
    if (ticket.status == "Rejected") {
      return res.status(400).send({
        success: false,
        message:
          "Invalid! Ticket has been rejected, it should not be reassigned.",
      });
    }

    if (ticket.status === "Voided") {
      return res.status(400).send({
        success: false,
        message:
          "Invalid! This ticket has been voided, it should not be reassigned.",
      });
    }

    if (ticket.status === "Resolved") {
      return res.status(400).send({
        success: false,
        message:
          "Invalid! This ticket has been resolved, it should not be reassigned.",
      });
    }

    if (ticket.status === "Overdue") {
      return res.status(400).send({
        success: false,
        message:
          "Invalid! This ticket has been overdue, it should not be reassigned.",
      });
    }

    if (
      clerkAssigned.role === "USER_SUPERADMIN" ||
      clerkAssigned.role === "USER_ADMIN" ||
      clerkAssigned.role === "CLERK_HELPDESKSUPPORT"
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Please assign the ticket to a clerk whose role is an IT SUPPORT.",
      });
    }

    if (assignee.email === assignTo) {
      return res.status(400).send({
        success: false,
        message: "You cannot assign a ticket to yourself.",
      });
    }

    if (ticket.assignTo === assignTo) {
      return res.status(400).send({
        success: false,
        message: "This ticket has already been assigned to this clerk.",
      });
    }

    const mail = `<!DOCTYPE html>
		<html lang="en">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
					rel="stylesheet"
				/>
				<meta charset="UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<style>
					.container {
						background-color: #fff;
						padding: 0 100px 0 100px;
						display: flex;
						justify-content: center;
						align-items: center;
					}
					.container-wrapper {
						width: 100%;
						display: flex;
						justify-content: center;
						align-items: center;
						background-color: rgb(254, 192, 15, 0.71);
						border: 1px solid rgba(0, 0, 0, 0.255);
					}
					.container-wrapper__approvedservicereq {
						width: 100%;
					}
					.greetings {
						font-size: 23px;
						font-weight: bold;
						color: #000;
						text-transform: uppercase;
						text-align: center;
						padding-top: 10px;
					}
					.welcome-text {
						color: rgba(0, 0, 0, 0.67);
						font-size: 15px;
						font-weight: 600;
						text-align: center;
						padding: 0 150px;
						margin-bottom: 15px;
					}
					.update-paragraph {
						color: rgba(0, 0, 0, 0.67);
						font-size: 15px;
						font-weight: 600;
						text-align: center;
						padding: 0 150px;
						margin-top: 15px;
						margin-bottom: 15px;
					}
					.container-approvedservicereq__personalinformation {
						text-align: center;
						width: 100%;
					}
					.approvedservicereq--personalinformation__wrapper {
						text-align: left;
						padding: 0 220px;
					}
					.personal-information__container {
						width: 100%;
					}
					.personalinformation-header {
						width: 100%;
					}
					.personaldetails--container__name {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.personaldetails--container__unit {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.personaldetails--container__course {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.personaldetails--container__contact {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.personalinformation-details__name {
						width: 100%;
					}
					.personalinformation-details__clientname {
						width: 100%;
					}
					.personalinformation-details__unit {
						width: 100%;
					}
					.personalinformation-details__clientunit {
						width: 100%;
					}
					.personalinformation-details__contact {
						width: 100%;
					}
					.personalinformation-details__clientcontact {
						width: 100%;
					}
					.personalinformation-details__course {
						width: 100%;
					}
					.personalinformation-details__clientcourse {
						width: 100%;
					}
					.ticket-information__container {
						width: 100%;
						margin-top: 20px;
					}
					.ticketinformation-header {
						width: 100%;
					}
					.ticketdetails--container__ticketid {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.ticketinformation-details__ticketid {
						width: 100%;
					}
					.ticketinformation-details__clientticketid {
						width: 100%;
					}
					.ticketdetails--container__priority {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.ticketinformation-details__priority {
						width: 100%;
					}
					.ticketinformation-details__ticketpriority {
						width: 100%;
					}
					.ticketdetails--container__category {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.ticketinformation-details__category {
						width: 100%;
					}
					.ticketinformation-details__ticketcategory {
						width: 100%;
					}
					.ticketdetails--container__subject {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.ticketinformation-details__subject {
						width: 100%;
					}
					.ticketinformation-details__ticketsubject {
						width: 100%;
					}
					.ticketdetails--container__desc {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.ticketinformation-details__desc {
						width: 100%;
					}
					.ticketinformation-details__ticketdesc {
						width: 100%;
					}
					.clerk-information__container {
						width: 100%;
						margin-top: 20px;
					}
					.clerkdetails--container__email {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.clerkinformation-details__email {
						width: 100%;
					}
					.clerkinformation-details__clerkemailadd {
						width: 100%;
					}
					.clerkdetails--container__contactnum {
						display: flex;
						justify-content: space-between;
						width: 100%;
					}
					.clerkinformation-details__contactnum {
						width: 100%;
					}
					.clerkinformation-details__clerkcontactnum {
						width: 100%;
					}
					.divider {
						background-color: rgba(0, 0, 0, 0.255);
						height: 1px;
						width: 100%;
						border: none;
					}
					.footer {
						color: rgb(0, 0, 0, 0.5);
						font-size: 12px;
						text-align: center;
						width: 100%;
					}
					.footer-text {
						line-height: 0px;
					}
					#span-emp {
						color: rgb(0, 0, 0, 0.5);
						font-size: 13px;
						font-weight: 600;
					}
					#span-emp__req {
						color: #000;
						font-size: 13px;
						font-weight: 600;
					}
		
					@media screen and (min-width: 354px) and (max-width: 768px) {
						#span-emp {
							font-size: 10px;
						}
						#span-emp__req {
							font-size: 10px;
						}
						.greetings {
							padding: 0, 25px 0 25px;
							font-size: 18px;
						}
						.welcome-text {
							font-size: 13px;
						}
						.update-paragraph {
							font-size: 13px;
						}
						.container {
							width: 100%;
							margin: 0;
							padding: 0;
						}
						.container-wrapper {
							width: 100%;
							margin: 0;
						}
						.container-wrapper__approvedservicereq {
							width: 100%;
							margin: 0;
							padding: 0;
						}
						.approvedservicereq--personalinformation__wrapper {
							text-align: left;
							padding: 0 50px 0 50px;
						}
						.welcome-text {
							padding: 0 20px 0 20px;
						}
						.update-paragraph {
							padding: 0 20px 0 20px;
						}
					}
				</style>
			</head>
		
			<body
				style="
					font-family: 'Poppins', sans serif;
					margin: 0;
					padding: 0;
					text-decoration: none;
					color: #000;
				"
			>
				<div class="container">
					<div class="container-wrapper">
						<div class="container-wrapper__approvedservicereq">
							<h2 class="greetings">
								Greetings, ${client.firstName} ${client.lastName}!
							</h2>
							<p class="welcome-text">
								Your <span style="color: #000; font-weight: 700">Ticket No.: ${
                  ticket.ticketNo
                }</span> in the Service Helpdesk of the University of Santo Tomas - Office of the registrar has been
								<span style="color: #000; font-weight: 700">REASSIGNED</span> with the
								following details:
							</p>
		
							<div class="container-approvedservicereq__personalinformation">
								<div class="approvedservicereq--personalinformation__wrapper">
									<div class="personal-information__container">
										<div class="personalinformation-header">
											<span style="font-weight: 700; font-size: 13px">
												Your personal information:
											</span>
										</div>
										<div class="personaldetails--container__name">
											<div class="personalinformation-details__name">
												<span id="span-emp">Client Name:</span>
											</div>
											<div class="personalinformation-details__clientname">
												<span id="span-emp__req">
													${client.firstName} ${client.lastName}
												</span>
											</div>
										</div>
										<div class="personaldetails--container__unit">
											<div class="personalinformation-details__unit">
												<span id="span-emp">Client Unit:</span>
											</div>
											<div class="personalinformation-details__clientunit">
												<span id="span-emp__req"> ${client.unit} </span>
											</div>
										</div>
										<div class="personaldetails--container__course">
											<div class="personalinformation-details__course">
												<span id="span-emp">Client Course:</span>
											</div>
											<div class="personalinformation-details__clientcourse">
												<span id="span-emp__req"> ${client.course} </span>
											</div>
										</div>
		
										<div class="personaldetails--container__contact">
											<div class="personalinformation-details__contact">
												<span id="span-emp">Contact Number:</span>
											</div>
											<div class="personalinformation-details__clientcontact">
												<span id="span-emp__req"> ${client.contactNum} </span>
											</div>
										</div>
									</div>
		
									<div class="ticket-information__container">
										<div class="ticketinformation-header">
											<span style="font-weight: 700; font-size: 13px">
												Your ticket information:
											</span>
										</div>
										<div class="ticketdetails--container__ticketid">
											<div class="ticketinformation-details__ticketid">
												<span id="span-emp">Ticket No.:</span>
											</div>
											<div class="ticketinformation-details__clientticketid">
												<span id="span-emp__req"> ${ticket.ticketNo} </span>
											</div>
										</div>
										<div class="ticketdetails--container__priority">
											<div class="ticketinformation-details__priority">
												<span id="span-emp">Priority:</span>
											</div>
											<div class="ticketinformation-details__ticketpriority">
												<span id="span-emp__req"> ${ticket.priorityStatus()} </span>
											</div>
										</div>
										<div class="ticketdetails--container__category">
											<div class="ticketinformation-details__category">
												<span id="span-emp">Category:</span>
											</div>
											<div class="ticketinformation-details__ticketcategory">
												<span id="span-emp__req"> ${ticket.ticketCategory} </span>
											</div>
										</div>
										<div class="ticketdetails--container__subject">
											<div class="ticketinformation-details__subject">
												<span id="span-emp">Subject:</span>
											</div>
											<div class="ticketinformation-details__ticketsubject">
												<span id="span-emp__req"> ${ticket.ticketSubject} </span>
											</div>
										</div>
										<div class="ticketdetails--container__desc">
											<div class="ticketinformation-details__desc">
												<span id="span-emp">Description:</span>
											</div>
											<div class="ticketinformation-details__ticketdesc">
												<span id="span-emp__req"> ${ticket.ticketDescription} </span>
											</div>
										</div>
									</div>
		
									<div class="clerk-information__container">
										<div class="clerkinformation-header">
											<span style="font-weight: 700; font-size: 13px">
												You may contact ${clerkAssigned.firstName}
												${clerkAssigned.lastName} who is assigned to your ticket,
												through the following:
											</span>
										</div>
										<div class="clerkdetails--container__email">
											<div class="clerkinformation-details__email">
												<span id="span-emp">Email Address.:</span>
											</div>
											<div class="clerkinformation-details__clerkemailadd">
												<span id="span-emp" style="font-weight: 700">
													${assignTo}
												</span>
											</div>
										</div>
										<div class="clerkdetails--container__contactnum">
											<div class="clerkinformation-details__contactnum">
												<span id="span-emp">Contact Number:</span>
											</div>
											<div class="clerkinformation-details__clerkcontactnum">
												<span id="span-emp__req">
													${clerkAssigned.contactNum}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
		
							<div>
								<p class="update-paragraph">
									Whenever there is an update regarding your ticket, you will be
									notified through your email address. <br />Thank you!
								</p>
							</div>
		
							<hr class="divider" />
		
							<footer class="footer">
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
		</html>
		`;

    await sendEmail(client.email, "Ticket Reassigned", mail);

    res.status(200).send({
      success: true,
      message: `Successfully reassigned to ${clerkAssigned.lastName.toUpperCase()} - ${
        clerkAssigned.role
      }`,
      ticket,
    });

    await Ticket.updateOne(
      { _id: ticket._id },
      { assignBy: req.user.email, assignTo: assignTo }
    );
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Get all the assigned tickets.
//@access:	Private (ITSUPPORT ONLY)
exports.itsAssignedTicket = async (req, res) => {
  try {
    const assignedTicket = await Ticket.find({ assignTo: req.user.email });
    const clerkresolvedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Resolved",
    });
    const clerkOpenTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Open",
    });
    const clerkOverdueTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Overdue",
    });
    const clerkVoidedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Voided",
    });
    const clerkReopenedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Reopened",
    });

    const categoryName = await Category.find();

    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });

    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    //start of date query

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      assignTo: req.user.email,
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      assignTo: req.user.email,
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    assignedTicket.map(async (ticket) => {
      ticketStatus = ticket.status;
      ticketPriority = ticket.priority;

      //@desc:	Check whether the ticket is open.
      if (ticketStatus === "Open") {
        //@desc:	Check whether the priority is High. If it is high
        //			and not solved within 1 day. Change the status to Overdue.
        if (ticketPriority === "High") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 24) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
          //@desc:	Check whether the priority is Mid. If it is mid
          //			and not solved within 3 days. Change the status to Overdue.
        } else if (ticketPriority === "Mid") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 72) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
          //@desc:	Check whether the priority is Mid. If it is low
          //			and not solved within 7 days. Change the status to Overdue.
        } else if (ticketPriority === "Low") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 168) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
        }
      }
    });
    //when clerk has no assigned ticket.
    if (assignedTicket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets assigned to you.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched the tickets assigned to you.",
      assignedTicket,
      clerkresolvedTicket,
      clerkOpenTicket,
      clerkOverdueTicket,
      clerkVoidedTicket,
      clerkReopenedTicket,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Get all open clerk assigned tikets
//@access:	Private (ITSUPPORT ONLY)
exports.itsAssignedOpenTicket = async (req, res) => {
  try {
    const assignedOpenTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Open",
    });
    const categoryName = await Category.find();

    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Open",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      assignTo: req.user.email,
      status: "Open",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (assignedOpenTicket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    assignedOpenTicket.map(async (ticket) => {
      ticketStatus = ticket.status;
      ticketPriority = ticket.priority;

      //@desc:	Check whetther the ticket is open.
      if (ticketStatus === "Open") {
        //@desc:	Check whether the priority is High. If it is high
        //			and not solved within 1 day. Change the status to Overdue.
        if (ticketPriority === "High") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 24) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
          //@desc:	Check whether the priority is Mid. If it is mid
          //			and not solved within 3 days. Change the status to Overdue.
        } else if (ticketPriority === "Mid") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 72) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
          //@desc:	Check whether the priority is Mid. If it is low
          //			and not solved within 7 days. Change the status to Overdue.
        } else if (ticketPriority === "Low") {
          const ticketCreated = ticket.createdAt;
          let overdue = moment().diff(moment(ticketCreated), "hours");
          if (overdue >= 168) {
            await Ticket.updateOne(
              { _id: ticket._id },
              { status: "Overdue", isOverdue: true, priority: "High" }
            );
            console.log("Ticket status is overdue!");
          }
        }
      }
    });

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      assignedOpenTicket,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Get all overdue clerk assigned tikets
//@access:	Private (ITSUPPORT ONLY)\
exports.itsAssignedOverdueTicket = async (req, res) => {
  try {
    const assignedOverdueTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Overdue",
    });
    const categoryName = await Category.find();

    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Overdue",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      assignTo: req.user.email,
      status: "Overdue",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (assignedOverdueTicket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      assignedOverdueTicket,
      page: page + 1,
      limit,
      filteredTickets,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Get all resolved clerk assigned tickets
//@access:	Private (ITSUPPORT ONLY)
exports.itsAssignedResolvedTicket = async (req, res) => {
  try {
    const assignedResolvedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Resolved",
    });
    const categoryName = await Category.find();

    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Resolved",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      assignTo: req.user.email,
      status: "Resolved",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (assignedResolvedTicket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      filteredTickets,
      assignedResolvedTicket,
      page: page + 1,
      limit,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Get all voided clerk assigned tickets
//@access:	Private (ITSUPPORT ONLY)
exports.itsAssignedVoidedTicket = async (req, res) => {
  try {
    const assignedVoidedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Voided",
    });
    const categoryName = await Category.find();
    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Voided",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      assignTo: req.user.email,
      status: "Voided",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    });

    // check whether there is a ticket in the database.
    if (assignedVoidedTicket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      filteredTickets,
      assignedVoidedTicket,
      page: page + 1,
      limit,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Get all reopened clerk assigned tickets
//@access:	Private (ITSUPPORT ONLY)
exports.itsAssignedReopenedTicket = async (req, res) => {
  try {
    const assignedReopenedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Reopened",
    });
    const categoryName = await Category.find();

    const categorynameOptions = categoryName.map((category) => {
      return category.categoryName;
    });
    //pagination, filtering, sorting
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let priority = req.query.priority || "All";
    let ticketCategory = req.query.ticketCategory || "All";
    const priorityOptions = ["High", "Mid", "Low"];

    priority === " " || priority === "All"
      ? (priority = [...priorityOptions])
      : (priority = req.query.priority.split(","));

    ticketCategory === " " || ticketCategory === "All"
      ? (ticketCategory = categorynameOptions)
      : (ticketCategory = req.query.ticketCategory.split(","));

    // for sorting, filtering, and pagination
    const filteredTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Reopened",
      ticketNo: { $regex: search, $options: "i" },
      priority: { $in: priority },
      ticketCategory: { $in: ticketCategory },
      createdAt: {
        // if no date is selected, it will return all the tickets created
        $gte: req.query.dateFrom ? req.query.dateFrom : new Date(0),
        $lte: req.query.dateTo ? req.query.dateTo : new Date(),
      },
    })

      .skip(page * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({
      assignTo: req.user.email,
      status: "Reopened",
      priority: { $in: [...priority] },
      ticketCategory: { $in: [...ticketCategory] },
      ticketNo: { $regex: search, $options: "i" },
    });

    // check whether there is a ticket in the database.
    if (assignedReopenedTicket.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tickets found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched all the tickets.",
      filteredTickets,
      assignedReopenedTicket,
      page: page + 1,
      limit,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	Get the specific ticket.
//@access:	Private (ITSUPPORT ONLY)
exports.itsgetDelegateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    const assignee = await User.findOne({ email: req.user.email });

    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found.",
      });
    }

    if (ticket.assignTo != assignee.email) {
      return res.status(400).send({
        success: false,
        message: "You are not authorized to view this ticket.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully fetched the ticket.",
      ticket,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	IT SUPPORT void ticket.
//@access:	Private (ITSUPPORT ONLY)
exports.itsVoidTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    const clerkAssigned = await User.findOne({ email: ticket.assignTo });
    const assignee = await User.findOne({ email: req.user.email });
    const client = await Client.findOne({ email: ticket.requester });

    const { remarks, voidReason } = req.body;

    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found.",
      });
    }

    if (ticket.assignTo != assignee.email) {
      return res.status(400).send({
        success: false,
        message: "You are not authorized to void this ticket.",
      });
    }

    //check the ticket status
    if (ticket.status === "Rejected") {
      return res.status(400).send({
        success: false,
        message: "Invalid! This ticket is already been rejected.",
      });
    }

    if (ticket.status === "Voided") {
      return res.status(400).send({
        success: false,
        message: "Invalid! This ticket has been voided.",
      });
    }

    if (ticket.status === "Resolved") {
      return res.status(400).send({
        success: false,
        message: "Invalid! This ticket has been resolved.",
      });
    }

    if (!remarks || !voidReason) {
      return res.status(400).send({
        success: false,
        message: "Please fill up all the fields.",
      });
    }

    const mail = `<!DOCTYPE html>
			<html lang="en">
			<head>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
			<link
				href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
				rel="stylesheet"
			/>
			<meta charset="UTF-8" />
			<meta http-equiv="X-UA-Compatible" content="IE=edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<style>
				.container {
					background-color: #fff;
					padding: 0 100px 0 100px;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				.container-wrapper {
					width: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					background-color: rgb(254, 192, 15, 0.71);
					border: 1px solid rgba(0, 0, 0, 0.255);
				}
				.container-wrapper__approvedservicereq {
					width: 100%;
				}
				.greetings {
					font-size: 23px;
					font-weight: bold;
					color: #000;
					text-transform: uppercase;
					text-align: center;
					padding-top: 10px;
				}
				.welcome-text {
					color: rgba(0, 0, 0, 0.67);
					font-size: 15px;
					font-weight: 600;
					text-align: center;
					padding: 0 150px;
					margin-bottom: 15px;
				}
				.update-paragraph {
					color: rgba(0, 0, 0, 0.67);
					font-size: 15px;
					font-weight: 600;
					text-align: center;
					padding: 0 150px;
					margin-top: 15px;
					margin-bottom: 15px;
				}
				.container-approvedservicereq__personalinformation {
					text-align: center;
					width: 100%;
				}
				.approvedservicereq--personalinformation__wrapper {
					text-align: left;
					padding: 0 220px;
				}
				.personal-information__container {
					width: 100%;
				}
				.personalinformation-header {
					width: 100%;
				}
				.personaldetails--container__name {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personaldetails--container__unit {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personaldetails--container__course {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personaldetails--container__contact {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personalinformation-details__name {
					width: 100%;
				}
				.personalinformation-details__clientname {
					width: 100%;
				}
				.personalinformation-details__unit {
					width: 100%;
				}
				.personalinformation-details__clientunit {
					width: 100%;
				}
				.personalinformation-details__contact {
					width: 100%;
				}
				.personalinformation-details__clientcontact {
					width: 100%;
				}
				.personalinformation-details__course {
					width: 100%;
				}
				.personalinformation-details__clientcourse {
					width: 100%;
				}
				.ticket-information__container {
					width: 100%;
					margin-top: 20px;
				}
				.ticketinformation-header {
					width: 100%;
				}
				.ticketdetails--container__ticketid {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__ticketid {
					width: 100%;
				}
				.ticketinformation-details__clientticketid {
					width: 100%;
				}
				.ticketdetails--container__priority {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__priority {
					width: 100%;
				}
				.ticketinformation-details__ticketpriority {
					width: 100%;
				}
				.ticketdetails--container__category {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__category {
					width: 100%;
				}
				.ticketinformation-details__ticketcategory {
					width: 100%;
				}
				.ticketdetails--container__subject {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__subject {
					width: 100%;
				}
				.ticketinformation-details__ticketsubject {
					width: 100%;
				}
				.ticketdetails--container__desc {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__desc {
					width: 100%;
				}
				.ticketinformation-details__ticketdesc {
					width: 100%;
				}
				.clerk-information__container {
					width: 100%;
					margin-top: 20px;
				}
				.clerkdetails--container__email {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.clerkinformation-details__email {
					width: 100%;
				}
				.clerkinformation-details__clerkemailadd {
					width: 100%;
				}
				.clerkdetails--container__contactnum {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.clerkinformation-details__contactnum {
					width: 100%;
				}
				.clerkinformation-details__clerkcontactnum {
					width: 100%;
				}
				.ticket-rejectreason__container {
					width: 100%;
					margin-top: 20px;
				}
				.ticketrejectreason--container__rejectreason {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketrejectreason-details__rejectreason {
					width: 100%;
				}
				.divider {
					background-color: rgba(0, 0, 0, 0.255);
					height: 1px;
					width: 100%;
					border: none;
				}
				.footer {
					color: rgb(0, 0, 0, 0.5);
					font-size: 12px;
					text-align: center;
					width: 100%;
				}
				.footer-text {
					line-height: 0px;
				}
				#span-emp-reason {
					color: rgb(0, 0, 0);
					font-size: 13px;
					font-weight: 700;
				}
				#span-emp {
					color: rgb(0, 0, 0, 0.5);
					font-size: 13px;
					font-weight: 600;
				}
				#span-emp__req {
					color: #000;
					font-size: 13px;
					font-weight: 600;
				}

				@media screen and (min-width: 354px) and (max-width: 768px) {
					#span-emp {
						font-size: 10px;
					}
					#span-emp__req {
						font-size: 10px;
					}
					.greetings {
						padding: 0, 25px 0 25px;
						font-size: 18px;
					}
					.welcome-text {
						font-size: 13px;
						padding: 0 20px 0 20px;
					}
					.update-paragraph {
						font-size: 13px;
						padding: 0;
						margin-top: 20px;
					}
					.container {
						width: 100%;
						margin: 0;
						padding: 0;
					}
					.container-wrapper {
						width: 100%;
						margin: 0;
					}
					.container-wrapper__approvedservicereq {
						width: 100%;
						margin: 0;
						padding: 0;
					}
					.approvedservicereq--personalinformation__wrapper {
						text-align: left;
						padding: 0 50px 0 50px;
					}

				}
			</style>
		</head>

		<body
			style="
				font-family: 'Poppins', sans serif;
				margin: 0;
				padding: 0;
				text-decoration: none;
				color: #000;
			"
		>
			<div class="container">
				<div class="container-wrapper">
					<div class="container-wrapper__approvedservicereq">
						<h2 class="greetings">
							Greetings, ${client.firstName} ${client.lastName}!
						</h2>
						<p class="welcome-text">
						Your <span style="color: #000; font-weight: 700">Ticket No.: ${ticket.ticketNo}</span> in Service Helpdesk of the University of Santo
							Tomas - Office of the Registrar has been
							<span style="color: #000; font-weight: 700">VOIDED</span> with the
							following details:
						</p>

						<div class="container-approvedservicereq__personalinformation">
							<div class="approvedservicereq--personalinformation__wrapper">
								<div class="personal-information__container">
									<div class="personalinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Your personal information:
										</span>
									</div>
									<div class="personaldetails--container__name">
										<div class="personalinformation-details__name">
											<span id="span-emp">Client Name:</span>
										</div>
										<div class="personalinformation-details__clientname">
											<span id="span-emp__req">
												${client.firstName} ${client.lastName}
											</span>
										</div>
									</div>
									<div class="personaldetails--container__unit">
										<div class="personalinformation-details__unit">
											<span id="span-emp">Client Unit:</span>
										</div>
										<div class="personalinformation-details__clientunit">
											<span id="span-emp__req"> ${client.unit} </span>
										</div>
									</div>
									<div class="personaldetails--container__course">
										<div class="personalinformation-details__course">
											<span id="span-emp">Client Course:</span>
										</div>
										<div class="personalinformation-details__clientcourse">
											<span id="span-emp__req"> ${client.course} </span>
										</div>
									</div>

									<div class="personaldetails--container__contact">
										<div class="personalinformation-details__contact">
											<span id="span-emp">Contact Number:</span>
										</div>
										<div class="personalinformation-details__clientcontact">
											<span id="span-emp__req"> ${client.contactNum} </span>
										</div>
									</div>
								</div>

								<div class="ticket-information__container">
									<div class="ticketinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Your ticket information:
										</span>
									</div>
									<div class="ticketdetails--container__ticketid">
										<div class="ticketinformation-details__ticketid">
											<span id="span-emp">Ticket No.:</span>
										</div>
										<div class="ticketinformation-details__clientticketid">
											<span id="span-emp__req"> ${ticket.ticketNo} </span>
										</div>
									</div>
									<div class="ticketdetails--container__category">
										<div class="ticketinformation-details__category">
											<span id="span-emp">Category:</span>
										</div>
										<div class="ticketinformation-details__ticketcategory">
											<span id="span-emp__req"> ${ticket.ticketCategory} </span>
										</div>
									</div>
									<div class="ticketdetails--container__subject">
										<div class="ticketinformation-details__subject">
											<span id="span-emp">Subject:</span>
										</div>
										<div class="ticketinformation-details__ticketsubject">
											<span id="span-emp__req"> ${ticket.ticketSubject} </span>
										</div>
									</div>
									<div class="ticketdetails--container__desc">
										<div class="ticketinformation-details__desc">
											<span id="span-emp">Description:</span>
										</div>
										<div class="ticketinformation-details__ticketdesc">
											<span id="span-emp__req"> ${ticket.ticketDescription} </span>
										</div>
									</div>
								</div>

								<div class="ticket-rejectreason__container">
									<div class="ticketrejectreason--container__rejectreason">
										<div class="ticketrejectreason-details__rejectreason">
											<span id="span-emp-reason">For the reason of:</span>
										</div>
										<div class="ticketrejectreason-details__rejectreason">
											<span id="span-emp-reason">
												${voidReason} - ${remarks}
											</span>
										</div>
									</div>
								</div>

								<div class="clerk-information__container">
									<div class="clerkinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Should you have any concern, please contact
											${clerkAssigned.firstName} ${clerkAssigned.lastName}.
										</span>
									</div>
									<div class="clerkdetails--container__email">
										<div class="clerkinformation-details__email">
											<span id="span-emp">Email Address.:</span>
										</div>
										<div class="clerkinformation-details__clerkemailadd">
											<span id="span-emp" style="font-weight: 700">
												${clerkAssigned.email}
											</span>
										</div>
									</div>
									<div class="clerkdetails--container__contactnum">
										<div class="clerkinformation-details__contactnum">
											<span id="span-emp">Contact Number:</span>
										</div>
										<div class="clerkinformation-details__clerkcontactnum">
											<span id="span-emp__req">
												${clerkAssigned.contactNum}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div>
							<p class="update-paragraph">Thank you!</p>
						</div>

						<hr class="divider" />

						<footer class="footer">
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

    await sendEmail(client.email, "Ticket Voided", mail);

    res.status(200).send({
      success: true,
      message: "Ticket has been voided.",
      ticket,
    });

    await Ticket.updateOne(
      { _id: ticket._id },
      { remarks, voidReason, status: "Voided", voidedAt: new Date(Date.now()) }
    );
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: IT SUPPORT confirm resolve ticket.
//@access: Private (IT SUPPORT ONLY)
exports.itsResolveTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    const assignee = await User.findOne({ email: req.user.email });
    const client = await Client.findOne({ email: ticket.requester });
    const clerkAssigned = await User.findOne({ email: ticket.assignTo });

    //check the length of the ticket resolved.
    const { remarks, solution } = req.body;

    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found.",
      });
    }

    if (ticket.assignTo != assignee.email) {
      return res.status(400).send({
        success: false,
        message: "You are not authorized to resolve this ticket.",
      });
    }

    //check the ticket status
    if (ticket.status === "Rejected") {
      return res.status(400).send({
        success: false,
        message: "Invalid! This ticket is already been rejected.",
      });
    }

    if (ticket.status === "Voided") {
      return res.status(400).send({
        success: false,
        message: "Invalid! This ticket has been voided.",
      });
    }

    if (ticket.status === "Resolved") {
      return res.status(400).send({
        success: false,
        message: "Invalid! This ticket has been resolved.",
      });
    }

    if (!remarks || !solution) {
      return res.status(400).send({
        success: false,
        message: "Please fill up all the fields.",
      });
    }

    const mail = `<!DOCTYPE html>
			<html lang="en">
			<head>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
			<link
				href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
				rel="stylesheet"
			/>
			<meta charset="UTF-8" />
			<meta http-equiv="X-UA-Compatible" content="IE=edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<style>
				.container {
					background-color: #fff;
					padding: 0 100px 0 100px;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				.container-wrapper {
					width: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					background-color: rgb(254, 192, 15, 0.71);
					border: 1px solid rgba(0, 0, 0, 0.255);
				}
				.container-wrapper__approvedservicereq {
					width: 100%;
				}
				.greetings {
					font-size: 23px;
					font-weight: bold;
					color: #000;
					text-transform: uppercase;
					text-align: center;
					padding-top: 10px;
				}
				.welcome-text {
					color: rgba(0, 0, 0, 0.67);
					font-size: 15px;
					font-weight: 600;
					text-align: center;
					padding: 0 150px;
					margin-bottom: 15px;
				}
				.update-paragraph {
					color: rgba(0, 0, 0, 0.67);
					font-size: 15px;
					font-weight: 600;
					text-align: center;
					padding: 0 150px;
					margin-top: 15px;
					margin-bottom: 15px;
				}
				.container-approvedservicereq__personalinformation {
					text-align: center;
					width: 100%;
				}
				.approvedservicereq--personalinformation__wrapper {
					text-align: left;
					padding: 0 220px;
				}
				.personal-information__container {
					width: 100%;
				}
				.personalinformation-header {
					width: 100%;
				}
				.personaldetails--container__name {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personaldetails--container__unit {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personaldetails--container__course {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personaldetails--container__contact {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.personalinformation-details__name {
					width: 100%;
				}
				.personalinformation-details__clientname {
					width: 100%;
				}
				.personalinformation-details__unit {
					width: 100%;
				}
				.personalinformation-details__clientunit {
					width: 100%;
				}
				.personalinformation-details__contact {
					width: 100%;
				}
				.personalinformation-details__clientcontact {
					width: 100%;
				}
				.personalinformation-details__course {
					width: 100%;
				}
				.personalinformation-details__clientcourse {
					width: 100%;
				}
				.ticket-information__container {
					width: 100%;
					margin-top: 20px;
				}
				.ticketinformation-header {
					width: 100%;
				}
				.ticketdetails--container__ticketid {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__ticketid {
					width: 100%;
				}
				.ticketinformation-details__clientticketid {
					width: 100%;
				}
				.ticketdetails--container__priority {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__priority {
					width: 100%;
				}
				.ticketinformation-details__ticketpriority {
					width: 100%;
				}
				.ticketdetails--container__category {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__category {
					width: 100%;
				}
				.ticketinformation-details__ticketcategory {
					width: 100%;
				}
				.ticketdetails--container__subject {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__subject {
					width: 100%;
				}
				.ticketinformation-details__ticketsubject {
					width: 100%;
				}
				.ticketdetails--container__desc {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketinformation-details__desc {
					width: 100%;
				}
				.ticketinformation-details__ticketdesc {
					width: 100%;
				}
				.clerk-information__container {
					width: 100%;
					margin-top: 20px;
				}
				.clerkdetails--container__email {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.clerkinformation-details__email {
					width: 100%;
				}
				.clerkinformation-details__clerkemailadd {
					width: 100%;
				}
				.clerkdetails--container__contactnum {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.clerkinformation-details__contactnum {
					width: 100%;
				}
				.clerkinformation-details__clerkcontactnum {
					width: 100%;
				}
				.ticket-rejectreason__container {
					width: 100%;
					margin-top: 20px;
				}
				.ticketrejectreason--container__rejectreason {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}
				.ticketrejectreason-details__rejectreason {
					width: 100%;
				}
				.divider {
					background-color: rgba(0, 0, 0, 0.255);
					height: 1px;
					width: 100%;
					border: none;
				}
				.footer {
					color: rgb(0, 0, 0, 0.5);
					font-size: 12px;
					text-align: center;
					width: 100%;
				}
				.footer-text {
					line-height: 0px;
				}
				#span-emp-reason {
					color: rgb(0, 0, 0);
					font-size: 13px;
					font-weight: 700;
				}
				#span-emp {
					color: rgb(0, 0, 0, 0.5);
					font-size: 13px;
					font-weight: 600;
				}
				#span-emp__req {
					color: #000;
					font-size: 13px;
					font-weight: 600;
				}

				@media screen and (min-width: 354px) and (max-width: 768px) {
					#span-emp {
						font-size: 10px;
					}
					#span-emp__req {
						font-size: 10px;
					}
					.greetings {
						padding: 0, 25px 0 25px;
						font-size: 18px;
					}
					.welcome-text {
						font-size: 13px;
						padding: 0 20px 0 20px;
					}
					.update-paragraph {
						font-size: 13px;
						padding: 0;
						margin-top: 20px;
					}
					.container {
						width: 100%;
						margin: 0;
						padding: 0;
					}
					.container-wrapper {
						width: 100%;
						margin: 0;
					}
					.container-wrapper__approvedservicereq {
						width: 100%;
						margin: 0;
						padding: 0;
					}
					.approvedservicereq--personalinformation__wrapper {
						text-align: left;
						padding: 0 50px 0 50px;
					}

				}
			</style>
		</head>

		<body
			style="
				font-family: 'Poppins', sans serif;
				margin: 0;
				padding: 0;
				text-decoration: none;
				color: #000;
			"
		>
			<div class="container">
				<div class="container-wrapper">
					<div class="container-wrapper__approvedservicereq">
						<h2 class="greetings">
							Greetings, ${client.firstName} ${client.lastName}!
						</h2>
						<p class="welcome-text">
						Your <span style="color: #000; font-weight: 700">Ticket No.: ${ticket.ticketNo}</span> in Service Helpdesk of the University of Santo
							Tomas - Office of the Registrar has been
							<span style="color: #000; font-weight: 700">RESOLVED</span> with the
							following details:
						</p>

						<div class="container-approvedservicereq__personalinformation">
							<div class="approvedservicereq--personalinformation__wrapper">
								<div class="personal-information__container">
									<div class="personalinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Your personal information:
										</span>
									</div>
									<div class="personaldetails--container__name">
										<div class="personalinformation-details__name">
											<span id="span-emp">Client Name:</span>
										</div>
										<div class="personalinformation-details__clientname">
											<span id="span-emp__req">
												${client.firstName} ${client.lastName}
											</span>
										</div>
									</div>
									<div class="personaldetails--container__unit">
										<div class="personalinformation-details__unit">
											<span id="span-emp">Client Unit:</span>
										</div>
										<div class="personalinformation-details__clientunit">
											<span id="span-emp__req"> ${client.unit} </span>
										</div>
									</div>
									<div class="personaldetails--container__course">
										<div class="personalinformation-details__course">
											<span id="span-emp">Client Course:</span>
										</div>
										<div class="personalinformation-details__clientcourse">
											<span id="span-emp__req"> ${client.course} </span>
										</div>
									</div>

									<div class="personaldetails--container__contact">
										<div class="personalinformation-details__contact">
											<span id="span-emp">Contact Number:</span>
										</div>
										<div class="personalinformation-details__clientcontact">
											<span id="span-emp__req"> ${client.contactNum} </span>
										</div>
									</div>
								</div>

								<div class="ticket-information__container">
									<div class="ticketinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Your ticket information:
										</span>
									</div>
									<div class="ticketdetails--container__ticketid">
										<div class="ticketinformation-details__ticketid">
											<span id="span-emp">Ticket No.:</span>
										</div>
										<div class="ticketinformation-details__clientticketid">
											<span id="span-emp__req"> ${ticket.ticketNo} </span>
										</div>
									</div>
									<div class="ticketdetails--container__category">
										<div class="ticketinformation-details__category">
											<span id="span-emp">Category:</span>
										</div>
										<div class="ticketinformation-details__ticketcategory">
											<span id="span-emp__req"> ${ticket.ticketCategory} </span>
										</div>
									</div>
									<div class="ticketdetails--container__subject">
										<div class="ticketinformation-details__subject">
											<span id="span-emp">Subject:</span>
										</div>
										<div class="ticketinformation-details__ticketsubject">
											<span id="span-emp__req"> ${ticket.ticketSubject} </span>
										</div>
									</div>
									<div class="ticketdetails--container__desc">
										<div class="ticketinformation-details__desc">
											<span id="span-emp">Description:</span>
										</div>
										<div class="ticketinformation-details__ticketdesc">
											<span id="span-emp__req"> ${ticket.ticketDescription} </span>
										</div>
									</div>
								</div>

								<div class="ticket-rejectreason__container">
									<div class="ticketrejectreason--container__rejectreason">
										<div class="ticketrejectreason-details__rejectreason">
											<span id="span-emp-reason">For the reason of:</span>
										</div>
										<div class="ticketrejectreason-details__rejectreason">
											<span id="span-emp-reason">
												${solution} - ${remarks}
											</span>
										</div>
									</div>
								</div>

								<div class="clerk-information__container">
									<div class="clerkinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Should you have any concern, please contact
											${clerkAssigned.firstName} ${clerkAssigned.lastName}.
										</span>
									</div>
									<div class="clerkdetails--container__email">
										<div class="clerkinformation-details__email">
											<span id="span-emp">Email Address.:</span>
										</div>
										<div class="clerkinformation-details__clerkemailadd">
											<span id="span-emp" style="font-weight: 700">
												${clerkAssigned.email}
											</span>
										</div>
									</div>
									<div class="clerkdetails--container__contactnum">
										<div class="clerkinformation-details__contactnum">
											<span id="span-emp">Contact Number:</span>
										</div>
										<div class="clerkinformation-details__clerkcontactnum">
											<span id="span-emp__req">
												${clerkAssigned.contactNum}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div>
							<p class="update-paragraph">Thank you!</p>
						</div>

						<hr class="divider" />

						<footer class="footer">
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

    const respondToken = await new RespondToken({
      clientId: client._id,
      token: crypto.randomBytes(16).toString("hex"),
    }).save();

    const likertMail = `<!DOCTYPE html>
		<html lang="en">
		
		<head>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link
				href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
				rel="stylesheet">
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
			<div style="
								width: 100%;
								height: 100%;
								background-color: rgb(254, 192, 15, 0.71);
								display: flex;
								justify-content: center;
								align-items: center;
							" class="container">
				<div style="
									display: flex;
									justify-content: center;
									align-items: center;
									width: 100%;
									height: 100%;
								" class="container-wrapper">
					<div style="
										width: 100%;
										height: 100%;
										border: 1px solid rgba(0, 0, 0, 0.255);
									" class="container-wrapper__createservicereq">
						<h1 style="
											font-size: 25px;
											font-weight: bold;
											color: #000;
											text-align: center;
											text-transform: uppercase;
											padding-top: 55px;
										" class="greetings">
										Greetings, ${client.firstName} ${client.lastName}!
						</h1>
						<p style="
											color: rgb(0, 0, 0, 0.5);
											font-size: 18px;
											font-weight: 700;
											text-align: center;
											padding: 0 55px 0 55px;
											padding-top: 25px;
											margin-bottom: 40px;
										" class="welcome-text">
										Your feedback is important to us.
		
						</p>
		
						<div style="text-align: center; " class="create-new-service">
							<a class="create-new-service__button"
								href=${process.env.SERVICEREQUEST_LINK}/likertscale/${client._id}/${respondToken.token}>
								Answer Survey
							</a>
						</div>
		
						<div style="
											color: rgb(0, 0, 0, 0.5);
											font-size: 18px;
											font-weight: 700;
											margin-top: 45px;
											text-align: center;
										" class="thankyou-text">
							<p>Thank you for your interest in our services.</p>
						</div>
		
						<hr style="
											background-color: rgba(0, 0, 0, 0.255);
											height: 1px;
											border: none;
										" class="divider" />
		
						<footer style="
											color: rgb(0, 0, 0, 0.5);
											font-size: 12px;
											text-align: center;
											padding: 2px;
										" class="footer">
							<h6 class="footer-text">
								Please answer the survey to help us improve our services.
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

    await Ticket.updateOne(
      { _id: ticket._id },
      {
        remarks,
        solution,
        resolvedAt: new Date(Date.now()),
      }
    );

    ticket.status = "Resolved";
    await ticket.save();

    const clerkresolvedTicket = await Ticket.find({
      assignTo: req.user.email,
      status: "Resolved",
    });

    const resolvedTicketLengthPerClerk = clerkresolvedTicket.length;

    await User.updateOne(
      { _id: clerkAssigned.id },
      { $inc: { resolvedTickets: 1 } }
    );

    const getTheTotalCreatedAt = clerkresolvedTicket.reduce((total, ticket) => {
      return total + ticket.createdAt.getTime();
    }, 0);
    const getTheTotalResolvedAt = clerkresolvedTicket.reduce(
      (total, ticket) => {
        return total + ticket.resolvedAt.getTime();
      },
      0
    );

    const totalResolutionTime = Math.floor(
      getTheTotalResolvedAt - getTheTotalCreatedAt
    );
    //calculate the average resolution time.
    const runningResolutionTime = Math.floor(
      totalResolutionTime / resolvedTicketLengthPerClerk / 1000
    );

    //convert running resolution time into days, hours, minutes, seconds.
    //running resolutiom time converted in days
    const runningResolutionTimeDays = Math.floor(runningResolutionTime / 86400);

    //convert running resolution time in hours
    const runningResolutionTimeHours =
      Math.floor(runningResolutionTime / 3600) % 24;

    //convert running resolution time in minutes
    const runningResolutionTimeMinutes =
      Math.floor(runningResolutionTime / 60) % 60;

    //convert running resolution time in seconds
    const runningResolutionTimeSeconds = Math.floor(runningResolutionTime % 60);

    const runningAverageResolutionTime =
      runningResolutionTimeDays +
      "d " +
      runningResolutionTimeHours +
      "h " +
      runningResolutionTimeMinutes +
      "m " +
      runningResolutionTimeSeconds +
      "s";

    clerkAssigned.averageResolutionTime = runningAverageResolutionTime;
    await clerkAssigned.save();

    //find the resolved ticket within the timeframe
    const resolvedTicketWithinTimeFrame = await Ticket.find({
      $and: [
        { isOverdue: false },
        { status: "Resolved" },
        { assignTo: ticket.assignTo },
      ],
    });

    const computeSLA =
      (resolvedTicketWithinTimeFrame.length / clerkresolvedTicket.length) * 100;

    //round off to 2 decimal places
    const slaComplianceRate = computeSLA.toFixed(2);

    clerkAssigned.rateSLA = slaComplianceRate;
    await clerkAssigned.save();

    await sendEmail(client.email, "Ticket Resolved", mail);

    //send likert survey to client
    res.status(200).send({
      success: true,
      message: "Ticket has been resolved.",
      ticket,
    });
    await sendEmail(client.email, "How'd it go?", likertMail);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

exports.likertScale = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id });

    if (!client) {
      return res.status(404).send({
        success: false,
        message: "Client not found.",
      });
    }

    const respondToken = await RespondToken.findOne({
      client: client._id,
      token: req.params.token,
    });

    if (!respondToken) {
      return res.status(404).send({
        success: false,
        message: "Respond token not found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Link is valid, you may now procceed to the survey.",
      client,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

exports.postLikertScale = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id });
    const { rating } = req.body;

    const respondToken = await RespondToken.findOne({
      client: client._id,
      token: req.params.token,
    });

    if (!respondToken) {
      return res.status(404).send({
        success: false,
        message: "Respond token not found.",
      });
    }

    if (!client) {
      return res.status(404).send({
        success: false,
        message: "Client not found.",
      });
    }

    if (!rating) {
      return res.status(400).send({
        success: false,
        message: "Please provide a rating.",
      });
    }

    const likert = await new Likert({
      clientId: client.id,
      rating: rating,
    }).save();

    res.status(200).send({
      success: true,
      message: "Thank you for your feedback!",
      likert,
    });

    await RespondToken.deleteOne({ _id: respondToken._id });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

exports.fetchLikertData = async (req, res) => {
  try {
    const likert = await Likert.find();

    if (!likert) {
      return res.status(404).send({
        success: false,
        message: "No data found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Likert data fetched successfully.",
      likert,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	FOR FILE UPLOAD
//@access:	SUPERADMIN ADMIN AND HELPDESK SUPPORT
exports.getUploadedFile = async (req, res) => {
  try {
    const attachment = await Service.findOne({ _id: req.params.id });
    const fileExtension = attachment.attachments.split(".").pop();
    //get the file extension

    fs.readFile(attachment.attachments, (error, data) => {
      if (error) {
        return res.status(404).send({
          success: false,
          message: "File not found.",
        });
      } else {
        if (fileExtension === "pdf") {
          res.writeHead(200, {
            "Content-Type": "application/pdf",
          });
          res.write(data);
          res.end();
        } else if (fileExtension === "jpg") {
          res.writeHead(200, {
            "Content-Type": "image/jpg",
          });
          res.write(data);
          res.end();
        } else if (fileExtension === "xls" || fileExtension === "xlsx") {
          res.writeHead(200, {
            "Content-Type": "application/vnd.ms-excel",
          });
          res.write(data);
          res.end();
        } else if (fileExtension === "csv") {
          res.writeHead(200, {
            "Content-Type": "text/csv",
          });
          res.write(data);
          res.end();
        }
      }
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

// ---------------------REPORTS--------------------- //

//@desc:	GENERATE REPORT
//@access:	SUPERADMIN AND ADMIN
exports.generateReportAllTickets = async (req, res) => {
  try {
    const ticket = await Ticket.find();
    const reportName = `report-alltickets-${moment(Date.now()).format(
      "YYYYMMDD"
    )}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "STATUS",
          property: "status",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...ticket.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            status: ticket.status,
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	GENERATE REPORT
//@access:	SUPERADMIN AND ADMIN
exports.generateReportOpenTickets = async (req, res) => {
  try {
    const ticket = await Ticket.find({ status: "Open" });
    const reportName = `report-opentickets-${moment(Date.now()).format(
      "YYYYMMDD"
    )}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...ticket.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	GENERATE REPORT
//@access:	SUPERADMIN AND ADMIN
exports.generateReportResolvedTickets = async (req, res) => {
  try {
    const ticket = await Ticket.find({ status: "Resolved" });
    const reportName = `report-resolvedtickets-${moment(Date.now()).format(
      "YYYYMMDD"
    )}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...ticket.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	GENERATE REPORT
//@access:	SUPERADMIN AND ADMIN
exports.generateReportOverdueTickets = async (req, res) => {
  try {
    const ticket = await Ticket.find({ status: "Overdue" });
    const reportName = `report-overduetickets-${moment(Date.now()).format(
      "YYYYMMDD"
    )}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...ticket.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	GENERATE REPORT
//@access:	SUPERADMIN AND ADMIN
exports.generateReportRejectedTickets = async (req, res) => {
  try {
    const ticket = await Ticket.find({ status: "Rejected" });
    const reportName = `report-overduetickets-${moment(Date.now()).format(
      "YYYYMMDD"
    )}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...ticket.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GENERATE REPORT
//@access:	SUPERADMIN AND ADMIN
exports.generateReportVoidedTickets = async (req, res) => {
  try {
    const ticket = await Ticket.find({ status: "Voided" });
    const reportName = `report-overduetickets-${moment(Date.now()).format(
      "YYYYMMDD"
    )}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...ticket.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GENERATE REPORT
//@access:	SUPERADMIN AND ADMIN
exports.generateReportReopenedTickets = async (req, res) => {
  try {
    const ticket = await Ticket.find({ status: "Reopened" });
    const reportName = `report-overduetickets-${moment(Date.now()).format(
      "YYYYMMDD"
    )}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...ticket.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

// --------------------- REPORTS FOR HELPDESKSUPPORT --------------------- //

//@desc: 	GENERATE REPORT FOR ALL TICKETS ASSIGNED TO HELPDESK SUPPORT
//@access:	CLEKRHELPDESK SUPPORT
exports.generateReportAllTicketsHelpdesk = async (req, res) => {
  try {
    const assignedTickets = await Ticket.find({ assignTo: req.user.email });
    const reportName = `Helpdesk-report-alltickets-${moment(Date.now()).format(
      "YYYYMMDD"
    )}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "STATUS",
          property: "status",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...assignedTickets.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            status: ticket.status,
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GENERATE REPORT FOR ALL OPEN TICKETS ASSIGNED TO HELPDESK SUPPORT
//@access:	CLEKRHELPDESK SUPPORT
exports.generateReportOpenTicketsHelpdesk = async (req, res) => {
  try {
    const assignedTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Open",
    });
    const reportName = `Helpdesk-report-opentickets-${moment(Date.now()).format(
      "YYYYMMDD"
    )}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...assignedTickets.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GENERATE REPORT FOR ALL RESOLVED TICKETS ASSIGNED TO HELPDESK SUPPORT
//@access:	CLEKRHELPDESK SUPPORT
exports.generateReportResolvedTicketsHelpdesk = async (req, res) => {
  try {
    const assignedTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Resolved",
    });
    const reportName = `Helpdesk-report-resolvedtickets-${moment(
      Date.now()
    ).format("YYYYMMDD")}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...assignedTickets.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GENERATE REPORT FOR ALL OVERDUE TICKETS ASSIGNED TO HELPDESK SUPPORT
//@access:	CLEKRHELPDESK SUPPORT
exports.generateReportOverdueTicketsHelpdesk = async (req, res) => {
  try {
    const assignedTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Overdue",
    });
    const reportName = `Helpdesk-report-overduetickets-${moment(
      Date.now()
    ).format("YYYYMMDD")}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...assignedTickets.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GENERATE REPORT FOR ALL REJECTED TICKETS ASSIGNED TO HELPDESK SUPPORT
//@access:	CLEKRHELPDESK SUPPORT
exports.generateReportRejectedTicketsHelpdesk = async (req, res) => {
  try {
    const assignedTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Rejected",
    });
    const reportName = `Helpdesk-report-rejectedtickets-${moment(
      Date.now()
    ).format("YYYYMMDD")}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...assignedTickets.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GENERATE REPORT FOR ALL REOPENED TICKETS ASSIGNED TO HELPDESK SUPPORT
//@access:	CLEKRHELPDESK SUPPORT
exports.generateReportRoepenedTicketsHelpdesk = async (req, res) => {
  try {
    const assignedTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Reopened",
    });
    const reportName = `Helpdesk-report-reopenedtickets-${moment(
      Date.now()
    ).format("YYYYMMDD")}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...assignedTickets.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

// --------------------- REPORTS FOR ITSUPPORT --------------------- //

//@desc: 	GENERATE REPORT FOR ALL TICKETS ASSIGNED TO IT SUPPORT
//@access:	IT SUPPORT
exports.generateReportAllTicketsItsupp = async (req, res) => {
  try {
    const assignedTickets = await Ticket.find({ assignTo: req.user.email });
    const reportName = `ITsupport-report-alltickets-${moment(Date.now()).format(
      "YYYYMMDD"
    )}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "STATUS",
          property: "status",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...assignedTickets.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            status: ticket.status,
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GENERATE REPORT FOR ALL OPEN TICKETS ASSIGNED TO IT SUPPORT
//@access:	IT SUPPORT
exports.generateReportOpenTicketsItsupp = async (req, res) => {
  try {
    const assignedTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Open",
    });
    const reportName = `ITsupport-report-alltickets-${moment(Date.now()).format(
      "YYYYMMDD"
    )}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...assignedTickets.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GENERATE REPORT FOR ALL RESOLVED TICKETS ASSIGNED TO IT SUPPORT
//@access:	IT SUPPORT
exports.generateReportResolvedTicketsItsupp = async (req, res) => {
  try {
    const assignedTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Resolved",
    });
    const reportName = `ITsupport-report-resolvedtickets-${moment(
      Date.now()
    ).format("YYYYMMDD")}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...assignedTickets.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GENERATE REPORT FOR ALL OVERDUE TICKETS ASSIGNED TO IT SUPPORT
//@access:	IT SUPPORT
exports.generateReportOverdueTicketsItsupp = async (req, res) => {
  try {
    const assignedTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Overdue",
    });
    const reportName = `ITsupport-report-overduetickets-${moment(
      Date.now()
    ).format("YYYYMMDD")}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...assignedTickets.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GENERATE REPORT FOR ALL VOIDED TICKETS ASSIGNED TO IT SUPPORT
//@access:	IT SUPPORT
exports.generateReportVoidedTicketsItsupp = async (req, res) => {
  try {
    const assignedTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Voided",
    });
    const reportName = `ITsupport-report-voidedtickets-${moment(
      Date.now()
    ).format("YYYYMMDD")}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...assignedTickets.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: 	GENERATE REPORT FOR ALL REOPENED TICKETS ASSIGNED TO IT SUPPORT
//@access:	IT SUPPORT
exports.generateReportReopenedTicketsItsupp = async (req, res) => {
  try {
    const assignedTickets = await Ticket.find({
      assignTo: req.user.email,
      status: "Reopened",
    });
    const reportName = `ITsupport-report-reopenedtickets-${moment(
      Date.now()
    ).format("YYYYMMDD")}.pdf`;
    const reportPath = path.join("reports", reportName);
    const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });

    const table = {
      headers: [
        {
          label: "TICKET NO.",
          property: "ticketNo",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "SUBJECT",
          property: "subject",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "REQUESTER",
          property: "requester",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "UNIT",
          property: "unit",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "DATE CREATED",
          property: "createdAt",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
        {
          label: "PRIORITY",
          property: "priority",
          align: "center",
          headerAlign: "center",
          padding: 10,
        },
      ],

      datas: [
        ...assignedTickets.map((ticket) => {
          const ticketCategory = ticket.ticketCategory;

          //get the initials of the ticket category
          const initials = ticketCategory
            .split(" ")
            .map((word) => word[0])
            .join("");

          return {
            ticketNo: `bold:${ticket.ticketNo} - ${initials.toUpperCase()}`,
            subject: ticket.ticketSubject,
            requester: ticket.requester,
            unit: ticket.clientUnit,
            createdAt: moment(ticket.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            priority: `bold:${ticket.priority.toUpperCase()}`,
          };
        }),
      ],
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${reportName}"`);

    pdfDoc.pipe(fs.createWriteStream(reportPath));
    await pdfDoc.table(table);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};
