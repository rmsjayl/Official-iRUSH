const nodemailer = require("nodemailer");

module.exports = async (email, subject, html) => {
	try {
		const transporter = nodemailer.createTransport({
			host: process.env.HOST,
			service: process.env.SERVICE,
			port: process.env.MAIL_PORT,
			auth: {
				user: process.env.GMAIL_USER,
				pass: process.env.GMAIL_PASSWORD,
			},
		});

		await transporter.sendMail({
			from: process.env.GMAIL_USER,
			to: email,
			subject: subject,
			html: html,
		});
		console.log("Email successfully sent");
	} catch (error) {
		console.log("Email failed to sent");
		console.log(error);
		return error;
	}
};
