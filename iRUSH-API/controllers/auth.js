const { User, validate } = require("../models/users");
const Client = require("../models/clients");
const ResetToken = require("../models/resetToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendMail = require("../utils/sendMail");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  const { firstName, lastName, email, password, contactNum, role } = req.body;

  try {
    const { error } = validate(req.body);

    if (error)
      return res.status(400).send({
        success: false,
        message: error.details[0].message,
      });

    const userEmail = await User.findOne({
      email: req.body.email,
    });

    if (userEmail)
      return res.status(409).send({
        success: false,
        message: "User with the given email already exists.",
      });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = await new User({ ...req.body, password: hashPassword }).save();

    return res.status(201).send({
      success: true,
      message: "Successfully created a user.",
      user: {
        name: `${firstName} ${lastName}`,
        email: email,
        contact: contactNum,
        role: role,
        token: generateAuthToken(user.id, user.role),
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

exports.addclient = async (req, res) => {
  try {
    const { firstName, lastName, email, contactNum, course, unit, verified } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !contactNum ||
      !course ||
      !unit ||
      !verified
    ) {
      return res.status(400).send({
        success: false,
        message: "Please provide all the required fields.",
      });
    }

    const client = await new Client({ ...req.body }).save();

    res.status(201).send({
      success: true,
      message: "Successfully created a client.",
      client: client,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email })
      .select("password")
      .select("role")
      .select("firstName")
      .select("lastName");

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide all the required fields.",
      });
    }

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Invalid email address or password",
      });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid Username or Password" });
    }

    return res
      .status(200)
      .cookie("irush/C", generateAuthToken(user._id, user.role), {
        expires: new Date(Date.now() + 86400000),
        httpOnly: true,
      })
      .send({
        success: true,
        message: "User logged in successfully",
        user: [
          {
            id: user.id,
            email: email,
            role: user.role,
            name: `${user.firstName} ${user.lastName}`,
          },
        ],
        token: generateAuthToken(user.id, user.role),
      });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server error.",
      error: error.message,
    });
  }
};

exports.forgotpassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email)
      return res.status(401).send({
        success: false,
        message: "Please fill all the required fields.",
      });

    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res.status(409).send({
        success: false,
        message: "Given Email does not exists!",
      });

    let tokenUser = await ResetToken.findOne({ userId: user._id });

    if (!tokenUser) {
      tokenUser = await new ResetToken({
        userId: user._id,
        token: crypto.randomBytes(16).toString("hex"),
      }).save();
    }

    const mail = `<!DOCTYPE html>
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
		
			<body style="font-family: 'Poppins', sans-serif; margin: 0; padding: 0; text-decoration: none;">
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
							If you have lost your password or wish to reset it,
							use this provided button to start resetting your password.
							</p>
		
							<div
								style="text-align: center; "
								class="create-new-service"
							>
								<a class="create-new-service__button" href=${process.env.BASE_URL}/resetpassword/${user.id}/verify/${tokenUser.token}>
									Reset Password Link
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
								<p>Thank you.</p>
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
		</html> `;

    await sendMail(user.email, "Password Reset", mail);

    res.status(200).send({
      success: true,
      message: "Password reset link was sent to your account.",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

exports.getresetpassword = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user)
      return res.status(400).send({
        success: false,
        message: "Link is invalid.",
      });

    const tokenUser = await ResetToken.findOne({
      userId: user._id,
      token: req.params.token,
    });

    if (!tokenUser)
      return res.status(400).send({
        success: false,
        message: "Link is invalid.",
      });

    res.status(200).send({
      success: true,
      message: "Link is valid. You may now proceed.",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

exports.resetpassword = async (req, res) => {
  try {
    const passwordSchema = Joi.object({
      password: passwordComplexity().required().label("Password"),
    });

    const { error } = passwordSchema.validate(req.body);

    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Link is invalid" });

    const tokenUser = await ResetToken.findOne({
      userId: user._id,
      token: req.params.token,
    });

    if (!tokenUser)
      return res.status(400).send({
        success: false,
        message: "Link is invalid.",
      });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashPassword;
    await user.save();
    await tokenUser.deleteOne({ _id: tokenUser._id });

    res.status(200).send({
      success: true,
      message: "Your password has been successfully changed.",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc: GENERATE AUTHENTICATION TOKEN USING JWT
const generateAuthToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};
