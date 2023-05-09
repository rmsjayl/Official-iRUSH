const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClientSchema = new Schema(
	{
		firstName: {
			type: String,
			trim: true,
			required: [true, "First Name is required."],
		},
		lastName: {
			type: String,
			required: [true, "Last Name is required."],
		},
		contactNum: {
			type: String,
			required: [true, "Contact Num is required."],
		},
		unit: {
			type: String,
			required: true,
		},
		course: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: [true, "Email address is required."],
		},
		verified: {
			type: Boolean,
			required: [true, "Please verify the account."],
			default: false,
		},
		referenceNumber: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const Client = mongoose.model("client", ClientSchema);

module.exports = Client;
