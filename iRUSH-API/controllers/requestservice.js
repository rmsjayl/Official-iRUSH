//@desc:	IMPORT MODELS
const Client = require("../models/clients");
const Service = require("../models/services");
const RequestToken = require("../models/requestToken");
const Category = require("../models/category");
//@desc:	IMPORT CRYPTOJS FOR RANDOM STRING GENERATOR
const crypto = require("crypto");
//@desc:	IMPORT NODEMAILER FOR EMAIL SENDING
const sendEmail = require("../utils/sendMail");

//@desc:    Send email verification link.
exports.requestservice = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email address field is required.",
      });
    }

    const client = await Client.findOne({ email: req.body.email });

    if (!client) {
      return res.status(400).send({
        success: false,
        message: "Invalid email! Please enter a valid UST Email to proceed.",
      });
    }

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
								Thank you for waiting! I am pleased to announce that you may now
								REQUEST NEW SERVICE to University of Santo Tomas - Office of the
								Registrar: Service Helpdesk by clicking the provided button below.
							</p>
		
							<div
								style="text-align: center; "
								class="create-new-service"
							>
								<a class="create-new-service__button" href=${process.env.SERVICEREQUEST_LINK}/clientrequest/${client._id}/request/${requestToken.token}>
									Create New Service Request
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

    await sendEmail(client.email, "Request for a Service", mail);

    res.status(200).send({
      success: true,
      message:
        "An Email will be sent to your account to start requesting a new service.",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:    Very email link to start creating a ticket.
exports.getcreateticket = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id });
    const requestToken = await RequestToken.findOne({
      clientId: client._id,
      token: req.params.token,
    });

    if (!client)
      return res.status(400).send({
        success: false,
        message: "Link is Invalid",
      });

    if (!requestToken)
      return res.status(400).send({
        success: false,
        message: "Link is invalid! Please try again",
      });

    res.status(200).send({
      success: true,
      message: "Link is valid. Please check your mail inbox.",
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

//@desc:	Client may now create a ticket.
exports.postcreateticket = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id });
    const requestToken = await RequestToken.findOne({
      clientId: client._id,
      token: req.params.token,
    });

    const { category, subject, description } = req.body;

    if (!requestToken)
      return res.status(400).send({
        success: false,
        message: "Link is invalid! Please try again",
      });

    if (!category || !subject || !description) {
      return res.status(400).send({
        success: false,
        message: "Please fill all the fields",
      });
    }

    //creates a request number which finds the last request number and adds 1 to it.
    const lastRequestNumber = await Service.findOne({}).sort({
      _id: -1,
    });
    let requestNumber = lastRequestNumber
      ? parseInt(lastRequestNumber.requestNo) + 1
      : 1;

    //save the file attachments to the database

    const service = new Service({
      clientId: client.id,
      clientUnit: client.unit,
      requestNo: requestNumber,
      requester: `${client.lastName}, ${client.firstName}`,
      requesterEmail: client.email,
      clientContact: client.contactNum,
      category,
      subject,
      description,
    });

    if (req.file) {
      console.log(req.file);
      service.attachments = req.file.path;
    }

    await service.save();

    const findCategory = await Category.find();
    const categoryIndex = findCategory.findIndex(
      (category) => category.categoryName === service.category
    );

    //generate a reference number upon submitting the request.
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
      if (subject === "Submission of missing documents") {
        return `${1}`;
      } else if (subject === "Shifting/Transfer") {
        return `${2}`;
      } else if (subject === "Transcripts of Records") {
        return `${3}`;
      } else if (subject === "Updating Information") {
        return `${4}`;
      }
    }

    const clientReferenceNumber = `00${
      categoryIndex + 1
    }${subjectIndex()}${referenceDate}${requestNumber}`;

    //save reference number to the database
    service.referenceNo = clientReferenceNumber;
    await service.save();

    client.referenceNumber = clientReferenceNumber;
    await client.save();

    res.status(200).send({
      success: true,
      message: "Successfully created a new service request.",
      service,
    });

    //delete the request token made by the client
    await RequestToken.deleteOne({ _id: requestToken._id });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

exports.getClientRequest = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id });

    if (!client)
      return res.status(400).send({
        success: false,
        message: "Link is Invalid",
      });

    res.status(200).send({
      success: true,
      message: "Successfully retrieved client's request.",
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
