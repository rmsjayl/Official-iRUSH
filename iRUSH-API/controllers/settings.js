const { User } = require("../models/users");
const Category = require("../models/category");
const Solution = require("../models/solution");
const RejectReason = require("../models/rejectReasons");
const VoidReason = require("../models/voidReasons");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendMail");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

// FOR CREATING USERS
exports.getUsers = async (req, res) => {
	const users = await User.find({
		role: { $in: ["CLERK_ITSUPPORT", "CLERK_HELPDESKSUPPORT"] },
	});

	try {
		res.status(200).send(users);
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.fetchAllUsers = async (req, res) => {
	const irushusers = await User.find();

	try {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 8;
		const search = req.query.search || "";
		let role = req.query.role || "All";

		const roleOptions = [
			"CLERK_ITSUPPORT",
			"CLERK_HELPDESKSUPPORT",
			"USER_ADMIN",
			"USER_SUPERADMIN",
		];

		role === " " || role === "All"
			? (role = [...roleOptions])
			: (role = req.query.role.split(","));

		const filterIrushUsers = await User.find({
			$or: [
				{ firstName: { $regex: search, $options: "i" } },
				{ lastName: { $regex: search, $options: "i" } },
			],
			role: { $in: role },
		})
			.skip(page * limit)
			.limit(limit);

		const total = await User.countDocuments({
			$or: [
				{ firstName: { $regex: search, $options: "i" } },
				{ lastName: { $regex: search, $options: "i" } },
			],
			role: { $in: role },
		});

		res.status(200).send({
			success: true,
			message: "Successfully fetched all users.",
			irushusers,
			filterIrushUsers,
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

exports.createUser = async (req, res) => {
	const { firstName, lastName, email, role, contactNum } = req.body;

	try {
		if (!req.body) {
			return res.status(400).send({
				success: false,
				message: "Please fill in all the fields.",
			});
		}

		const userEmail = await User.findOne({ email: req.body.email });

		if (userEmail) {
			return res.status(400).send({
				success: false,
				message: "Email already exists.",
			});
		}

		//email validation
		const schema = Joi.object({
			firstName: Joi.string().required().label("First Name"),
			lastName: Joi.string().required().label("Last Name"),
			email: Joi.string().email().required().label("Email"),
			role: Joi.string().required().label("Role"),
			contactNum: Joi.string().required().label("Contact Number"),
		});

		const { error } = schema.validate({ ...req.body });

		if (error) {
			return res.status(400).send({
				success: false,
				message: error.details[0].message,
			});
		}

		//contact number should be 11 digits and not a string
		if (contactNum.length !== 11 || isNaN(contactNum)) {
			return res.status(400).send({
				success: false,
				message: "Contact Number should be a number containing 11 digits.",
			});
		}

		const generatePassword = crypto.randomBytes(4).toString("hex");

		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashedPassword = await bcrypt.hash(generatePassword, salt);

		const user = await new User({
			...req.body,
			password: hashedPassword,
		}).save();

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
							Greetings, ${user.firstName} ${user.lastName}!
						</h2>
						<p class="welcome-text">
						You are now an <span style="color: #000; font-weight: 700"> OFFICIAL </span>member of the University of Santo Tomas - Office of the Registrar's iRUSH Service Helpdesk. We are delighted to have you on board and look forward to working with you. <br />
						</p>

						<div class="container-approvedservicereq__personalinformation">
							<div class="approvedservicereq--personalinformation__wrapper">
								<div class="personal-information__container">
									<div class="personalinformation-header">
										<span style="font-weight: 700; font-size: 13px">
											Your account details:
										</span>
									</div>
									<div class="personaldetails--container__name">
										<div class="personalinformation-details__name">
											<span id="span-emp">User details:</span>
										</div>
										<div class="personalinformation-details__clientname">
											<span id="span-emp__req">
												${user.firstName} ${user.lastName}
											</span>
										</div>
									</div>
									<div class="personaldetails--container__unit">
										<div class="personalinformation-details__unit">
											<span id="span-emp">User Email:</span>
										</div>
										<div class="personalinformation-details__clientunit">
											<span id="span-emp__req"> ${user.email} </span>
										</div>
									</div>
									<div class="personaldetails--container__course">
										<div class="personalinformation-details__course">
											<span id="span-emp">Temporary Password:</span>
										</div>
										<div class="personalinformation-details__clientcourse">
											<span id="span-emp__req"> ${generatePassword} </span>
										</div>
									</div>

									<div class="personaldetails--container__contact">
										<div class="personalinformation-details__contact">
											<span id="span-emp">User Contact Number:</span>
										</div>
										<div class="personalinformation-details__clientcontact">
											<span id="span-emp__req"> ${user.contactNum} </span>
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
								Please change your password after logging in.
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

		res.status(200).send({
			success: true,
			message: "User successfully created.",
			user,
		});

		await sendEmail(user.email, "iRUSH Helpdesk System", mail);
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.getUserData = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).send({
				success: false,
				message: "User not found.",
			});
		}

		res.status(200).send({
			success: true,
			message: "User successfully retrieved.",
			user,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.patchUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		const { firstName, lastName, contactNum, role, email } = req.body;

		if (!user) {
			return res.status(404).send({
				success: false,
				message: "User not found.",
			});
		}

		if (
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.role ||
			!req.body.email
		) {
			return res.status(400).send({
				success: false,
				message: "Please fill in all fields.",
			});
		}

		//contact number validation
		if (contactNum.length !== 11) {
			return res.status(400).send({
				success: false,
				message: "Contact number must be a number containing 11 digits.",
			});
		}

		const schema = Joi.object({
			firstName: Joi.string().required().label("First Name"),
			lastName: Joi.string().required().label("Last Name"),
			email: Joi.string().email().required().label("Email"),
			role: Joi.string().required().label("Role"),
			contactNum: Joi.string().required().label("Contact Number"),
		});

		const { error } = schema.validate({ ...req.body });

		if (error) {
			return res.status(400).send({
				success: false,
				message: error.details[0].message,
			});
		}

		const emailExists = await User.findOne({ email: req.body.email });

		if (emailExists && emailExists._id != req.params.id) {
			return res.status(400).send({
				success: false,
				message: "Email already exists.",
			});
		}

		//if no changes applied to the user data
		if (
			user.firstName === firstName &&
			user.lastName === lastName &&
			user.contactNum === contactNum &&
			user.role === role &&
			user.email === email
		) {
			return res.status(400).send({
				success: false,
				message: "No changes applied.",
			});
		}

		await User.findByIdAndUpdate(
			req.params.id,
			{
				firstName,
				lastName,
				contactNum,
				email,
				role,
			},
			{
				new: true,
			}
		);

		res.status(200).send({
			success: true,
			message: "User successfully updated.",
			user,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.deleteUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).send({
				success: false,
				message: "User not found.",
			});
		}

		await user.remove();

		res.status(200).send({
			id: req.params.id,
			success: true,
			message: "Successfully deleted a user.",
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.getLoggedUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).send({
				success: false,
				message: "User not found.",
			});
		}

		res.status(200).send({
			success: true,
			message: "User successfully retrieved.",
			user,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.updateLoggedUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		const { firstName, lastName, contactNum, email } = req.body;

		if (!user) {
			return res.status(404).send({
				success: false,
				message: "User not found.",
			});
		}

		if (
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.email ||
			!req.body.contactNum
		) {
			return res.status(400).send({
				success: false,
				message: "Please fill in all fields.",
			});
		}

		//contact number validation
		if (contactNum.length !== 11) {
			return res.status(400).send({
				success: false,
				message: "Contact number must be a number containing 11 digits.",
			});
		}

		const schema = Joi.object({
			firstName: Joi.string().required().label("First Name"),
			lastName: Joi.string().required().label("Last Name"),
			email: Joi.string().email().required().label("Email"),
			contactNum: Joi.string().required().label("Contact Number"),
		});

		const { error } = schema.validate({ ...req.body });

		if (error) {
			return res.status(400).send({
				success: false,
				message: error.details[0].message,
			});
		}

		const emailExists = await User.findOne({ email: req.body.email });

		if (emailExists && emailExists._id != req.params.id) {
			return res.status(400).send({
				success: false,
				message: "Email already exists.",
			});
		}

		//if no changes applied to the user data
		if (
			user.firstName === firstName &&
			user.lastName === lastName &&
			user.contactNum === contactNum &&
			user.email === email
		) {
			return res.status(400).send({
				success: false,
				message: "No changes applied.",
			});
		}

		await User.findByIdAndUpdate(
			req.params.id,
			{
				firstName,
				lastName,
				contactNum,
				email,
			},
			{
				new: true,
			}
		);

		res.status(200).send({
			success: true,
			message: "User successfully updated.",
			user,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.updatePassword = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).send({
				success: false,
				message: "User not found.",
			});
		}

		if (user._id != req.params.id) {
			return res.status(401).send({
				success: false,
				message: "Unauthorized.",
			});
		}

		const { oldPassword, newPassword, confirmPassword } = req.body;

		if (!req.body.oldPassword || !req.body.newPassword) {
			return res.status(400).send({
				success: false,
				message: "Please fill in all fields.",
			});
		}

		const validPassword = await bcrypt.compare(oldPassword, user.password);

		if (!validPassword) {
			return res.status(400).send({
				success: false,
				message: "Current password do not match.",
			});
		}

		if (newPassword === oldPassword) {
			return res.status(400).send({
				success: false,
				message: "New password must be different from the old password.",
			});
		}

		const passwordSchema = Joi.object({
			password: passwordComplexity().required().label("Password"),
		});

		const { error } = passwordSchema.validate({ password: newPassword });

		if (error)
			return res.status(400).send({ message: error.details[0].message });

		if (newPassword !== confirmPassword) {
			return res.status(400).send({
				success: false,
				message: "Passwords do not match.",
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		await User.findByIdAndUpdate(
			req.params.id,
			{
				password: hashedPassword,
			},
			{
				new: true,
			}
		);

		res.status(200).send({
			success: true,
			message: "Password successfully updated.",
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

// FOR CATEGORIES
exports.getCategory = async (req, res) => {
	try {
		const category = await Category.find();

		res.status(200).send(category);
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.fetchCategoryData = async (req, res) => {
	try {
		const category = await Category.find();
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 8;
		const search = req.query.search || "";

		const filterCategoryData = await Category.find({
			categoryName: { $regex: search, $options: "i" },
		})

			.skip(page * limit)
			.limit(limit);

		const total = await Category.countDocuments({
			categoryName: { $regex: search, $options: "i" },
		});

		res.status(200).send({
			success: true,
			message: "Successfully fetched all categories.",
			category,
			filterCategoryData,
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

exports.getCategoryData = async (req, res) => {
	try {
		const category = await Category.findById(req.params.id);

		if (!category) {
			return res.status(400).send({
				success: false,
				message: "Category does not exist.",
			});
		}

		res.status(200).send({
			success: true,
			message: "Successfully fetched the category.",
			category,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.createCategory = async (req, res) => {
	try {
		const { categoryName, description } = req.body;

		if (!categoryName) {
			return res.status(400).send({
				success: false,
				message: "Please enter a solution name.",
			});
		}

		if (!description) {
			return res.status(400).send({
				success: false,
				message: "Please enter a description.",
			});
		}

		const categoryTitle = await Category.findOne({
			categoryName,
		});

		if (categoryTitle) {
			return res.status(409).send({
				success: false,
				message: "Category already exists.",
			});
		}

		const category = await Category.create({
			categoryName,
			description,
		});

		return res.status(200).send({
			success: true,
			message: "Category created successfully.",
			category,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.patchCategory = async (req, res) => {
	try {
		const category = await Category.findById(req.params.id);
		const { categoryName, description } = req.body;

		//throw error if category name exists

		const categoryTitle = await Category.findOne({
			categoryName,
		});

		// if the category name is not changed and the description is not changed
		if (
			categoryName == category.categoryName &&
			description == category.description
		) {
			return res.status(400).send({
				success: false,
				message: "No changes applied.",
			});
		}

		// check the category name if it exists in the database nad not the same as the current category name
		if (categoryTitle && categoryName !== category.categoryName) {
			return res.status(409).send({
				success: false,
				message: "Category already exists.",
			});
		}

		if (!category) {
			return res.status(400).send({
				success: false,
				message: "Category does not exist.",
			});
		}

		if (!req.body.categoryName || !req.body.description) {
			return res.status(400).send({
				success: false,
				message: "Please fill all the field",
			});
		}

		//update category
		await Category.findByIdAndUpdate(
			req.params.id,
			{
				categoryName,
				description,
			},
			{ new: true }
		);

		res.status(200).send({
			success: true,
			message: "Successfully updated the category.",
			category,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.deleteCategory = async (req, res) => {
	try {
		const category = await Category.findById(req.params.id);
		if (!category) {
			return res.status(400).send({
				success: false,
				message: "Category does not exist.",
			});
		}

		await category.remove();

		res.status(200).send({
			id: req.params.id,
			success: true,
			message: "Successfully deleted the category.",
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

//FOR SOLUTIONS

exports.getSolution = async (req, res) => {
	try {
		const solution = await Solution.find();
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 8;
		const search = req.query.search || "";

		const filterSolutionData = await Solution.find({
			solutionName: { $regex: search, $options: "i" },
		})
			.skip(page * limit)
			.limit(limit);

		const total = await Solution.countDocuments({
			solutionName: { $regex: search, $options: "i" },
		});

		res.status(200).send({
			success: true,
			message: "Successfully fetched all solutions.",
			solution,
			filterSolutionData,
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

exports.getSolutionData = async (req, res) => {
	try {
		const solution = await Solution.findById(req.params.id);
		if (!solution) {
			return res.status(400).send({
				success: false,
				message: "Solution does not exist.",
			});
		}

		res.status(200).send({
			success: true,
			message: "Successfully fetched the solution.",
			solution,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.createSolution = async (req, res) => {
	try {
		const { solutionName, description } = req.body;

		if (!solutionName) {
			return res.status(400).send({
				success: false,
				message: "Please enter a solution name.",
			});
		}

		if (!description) {
			return res.status(400).send({
				success: false,
				message: "Please enter a description.",
			});
		}

		const solutionTitle = await Solution.findOne({
			solutionName,
		});

		if (solutionTitle) {
			return res.status(409).send({
				success: false,
				message: "Solution already exists.",
			});
		}

		const solution = await Solution.create({
			solutionName,
			description,
		});

		return res.status(200).send({
			success: true,
			message: "Solution created successfully.",
			solution,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.patchSolution = async (req, res) => {
	try {
		const solution = await Solution.findById(req.params.id);
		const { solutionName, description } = req.body;

		if (!solution) {
			return res.status(400).send({
				success: false,
				message: "Solution does not exist.",
			});
		}

		//throw error if solution name exists

		const solutionTitle = await Solution.findOne({
			solutionName,
		});

		// if the solution name is not changed and the description is not changed
		if (
			solutionName == solution.solutionName &&
			description == solution.description
		) {
			return res.status(400).send({
				success: false,
				message: "No changes applied.",
			});
		}

		// check the solution name if it exists in the database nad not the same as the current category name
		if (solutionTitle && solutionName !== solution.solutionName) {
			return res.status(409).send({
				success: false,
				message: "Solution already exists.",
			});
		}

		if (!req.body.solutionName || !req.body.description) {
			return res.status(400).send({
				success: false,
				message: "Please fill all the field",
			});
		}

		//update solution
		await Solution.findByIdAndUpdate(
			req.params.id,
			{
				solutionName,
				description,
			},
			{ new: true }
		);

		res.status(200).send({
			success: true,
			message: "Successfully updated the solution.",
			solution,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.deleteSolution = async (req, res) => {
	try {
		const solution = await Solution.findById(req.params.id);
		if (!solution) {
			return res.status(400).send({
				success: false,
				message: "Solution does not exist.",
			});
		}

		await solution.remove();

		res.status(200).send({
			id: req.params.id,
			success: true,
			message: "Successfully deleted the solution.",
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

// FOR REJECT REASONS

exports.getRejectReason = async (req, res) => {
	try {
		const rejectReason = await RejectReason.find();
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 8;
		const search = req.query.search || "";

		const filterRejectReasonData = await RejectReason.find({
			rejectReasonName: { $regex: search, $options: "i" },
		})
			.skip(page * limit)
			.limit(limit);

		const total = await RejectReason.countDocuments({
			rejectReasonName: { $regex: search, $options: "i" },
		});

		res.status(200).send({
			success: true,
			message: "Successfully fetched all reject reasons.",
			rejectReason,
			filterRejectReasonData,
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

exports.createRejectReason = async (req, res) => {
	try {
		const { rejectReasonName, description } = req.body;

		if (!rejectReasonName) {
			return res.status(400).send({
				success: false,
				message: "Please enter a reject reason name.",
			});
		}

		if (!description) {
			return res.status(400).send({
				success: false,
				message: "Please enter a description.",
			});
		}

		const rejectReasonTitle = await RejectReason.findOne({
			rejectReasonName,
		});

		if (rejectReasonTitle) {
			return res.status(409).send({
				success: false,
				message: "Reject reason already exists.",
			});
		}

		const rejectReason = await RejectReason.create({
			rejectReasonName,
			description,
		});

		return res.status(200).send({
			success: true,
			message: "Reject reason created successfully.",
			rejectReason,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.getRejectReasonData = async (req, res) => {
	try {
		const rejectreason = await RejectReason.findById(req.params.id);

		if (!rejectreason) {
			return res.status(400).send({
				success: false,
				message: "Reject Reason does not exist.",
			});
		}

		res.status(200).send({
			success: true,
			message: "Successfully fetched the category.",
			rejectreason,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.patchRejectReason = async (req, res) => {
	try {
		const rejectReason = await RejectReason.findById(req.params.id);

		const { rejectReasonName, description } = req.body;

		if (!rejectReason) {
			return res.status(400).send({
				success: false,
				message: "Reject reason does not exist.",
			});
		}

		const rejectReasonTitle = await RejectReason.findOne({
			rejectReasonName,
		});

		// if the solution name is not changed and the description is not changed
		if (
			rejectReasonName == rejectReason.rejectReasonName &&
			description == rejectReason.description
		) {
			return res.status(400).send({
				success: false,
				message: "No changes applied.",
			});
		}

		if (rejectReasonTitle && rejectReasonTitle._id != req.params.id) {
			return res.status(409).send({
				success: false,
				message: "Reject reason already exists.",
			});
		}

		if (!req.body.rejectReasonName || !req.body.description) {
			return res.status(400).send({
				success: false,
				message: "Please fill all the field",
			});
		}

		//update the reject reason
		await RejectReason.findByIdAndUpdate(
			req.params.id,
			{
				rejectReasonName,
				description,
			},
			{ new: true }
		);

		res.status(200).send({
			success: true,
			message: "Successfully updated the reject reason.",
			rejectReason,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.deleteRejectReason = async (req, res) => {
	try {
		const rejectReason = await RejectReason.findById(req.params.id);

		if (!rejectReason) {
			return res.status(400).send({
				success: false,
				message: "Reject reason does not exist.",
			});
		}

		await rejectReason.remove();

		res.status(200).send({
			id: req.params.id,
			success: true,
			message: "Successfully deleted the reject reason.",
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

// FOR VOID REASONS

exports.getVoidReason = async (req, res) => {
	try {
		const voidReason = await VoidReason.find();
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 8;
		const search = req.query.search || "";

		const filterVoidReasonData = await VoidReason.find({
			voidReasonName: { $regex: search, $options: "i" },
		})
			.skip(page * limit)
			.limit(limit);

		const total = await VoidReason.countDocuments({
			voidReasonName: { $regex: search, $options: "i" },
		});

		res.status(200).send({
			success: true,
			message: "Successfully fetched all void reasons.",
			voidReason,
			filterVoidReasonData,
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

exports.getVoidReasonData = async (req, res) => {
	try {
		const voidreason = await VoidReason.findById(req.params.id);

		if (!voidreason) {
			return res.status(400).send({
				success: false,
				message: "Void Reason does not exist.",
			});
		}

		res.status(200).send({
			success: true,
			message: "Successfully fetched the category.",
			voidreason,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.createVoidReason = async (req, res) => {
	try {
		const { voidReasonName, description } = req.body;

		if (!voidReasonName) {
			return res.status(400).send({
				success: false,
				message: "Please enter a void reason name.",
			});
		}

		if (!description) {
			return res.status(400).send({
				success: false,
				message: "Please enter a description.",
			});
		}

		const voidReasonTitle = await VoidReason.findOne({
			voidReasonName,
		});

		if (voidReasonTitle) {
			return res.status(409).send({
				success: false,
				message: "Void reason already exists.",
			});
		}

		const voidReason = await VoidReason.create({
			voidReasonName,
			description,
		});

		return res.status(200).send({
			success: true,
			message: "Void reason created successfully.",
			voidReason,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.patchVoidReason = async (req, res) => {
	try {
		const voidReason = await VoidReason.findById(req.params.id);

		const { voidReasonName, description } = req.body;

		if (!voidReason) {
			return res.status(400).send({
				success: false,
				message: "Void reason does not exist.",
			});
		}

		const voidReasonTitle = await VoidReason.findOne({
			voidReasonName,
		});

		// if the solution name is not changed and the description is not changed
		if (
			voidReasonName == voidReason.voidReasonName &&
			description == voidReason.description
		) {
			return res.status(400).send({
				success: false,
				message: "No changes applied.",
			});
		}

		// check the solution name if it exists in the database nad not the same as the current category name
		if (voidReasonTitle && voidReasonName !== voidReason.voidReasonName) {
			return res.status(409).send({
				success: false,
				message: "Reject Reason already exists.",
			});
		}

		await VoidReason.findByIdAndUpdate(
			req.params.id,
			{
				voidReasonName,
				description,
			},
			{
				new: true,
			}
		);

		res.status(200).send({
			success: true,
			message: "Successfully updated the void reason.",
			voidReason,
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};

exports.deleteVoidReason = async (req, res) => {
	try {
		const voidReason = await VoidReason.findById(req.params.id);

		if (!voidReason) {
			return res.status(400).send({
				success: false,
				message: "Void reason does not exist.",
			});
		}

		await voidReason.remove();

		res.status(200).send({
			id: req.params.id,
			success: true,
			message: "Successfully deleted the void reason.",
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Internal Server Error.",
			error: error.message,
		});
	}
};
